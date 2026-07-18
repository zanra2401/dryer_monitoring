import { prisma } from "~~/server/utils/prisma";

export type LotSnapshotLogRow = {
  logId: number; // synthetic ID
  lotId: number;
  isStandaloneMcLog: boolean;
  timestampThingspeak: Date;
  statusBin: string;
  tempTop: number | null;
  rhTop: number | null;
  tempBottom: number | null;
  rhBottom: number | null;
  mc: number | null;
  checkerName: string | null;
  remark: string | null;
  sourceBinLogId: number | null;
  sourceTimestampThingspeak: Date | null;
  dataPoints: number;
};

export const SYNTHETIC_PREFIX_MULTIPLIER = 10_000_000_000_000;

export const toSyntheticLogId = (lotId: number, timestampMs: number) => {
    return lotId * SYNTHETIC_PREFIX_MULTIPLIER + timestampMs;
};

export const isSyntheticLogId = (logId: number) => {
    return logId >= SYNTHETIC_PREFIX_MULTIPLIER;
};

export const parseSyntheticLogId = (logId: number) => {
    const lotId = Math.floor(logId / SYNTHETIC_PREFIX_MULTIPLIER);
    const timestampMs = logId % SYNTHETIC_PREFIX_MULTIPLIER;
    return { lotId, timestampMs, timestamp: new Date(timestampMs) };
};

const average = (values: Array<number | null>) => {
    const validValues = values.filter((value): value is number => value !== null);

    if (validValues.length === 0) {
        return null;
    }

    const total = validValues.reduce((sum, value) => sum + value, 0);
    return Number((total / validValues.length).toFixed(2));
};

export async function getLotSnapshotLogTimeline(lotId: number) {
    const lot = await prisma.lot.findUnique({
        where: { lotId },
        select: {
            lotId: true,
            binNumber: true,
            areaId: true,
            status: true,
            startTime: true,
            endTime: true,
            downAirAt: true,
            initialMc: true,
            downMC: true,
            endMC: true,
            hybrid: true,
            quality: true,
            lotNumber: true,
            netToBin: true,
            depth: true
        },
    });

    if (!lot) {
        return null;
    }

    const startTime = new Date(lot.startTime);
    const endTime = lot.endTime ? new Date(lot.endTime) : new Date();

    const [binLogs, mcLogs] = await Promise.all([
        prisma.binLog.findMany({
            where: {
                binNumber: lot.binNumber,
                areaId: lot.areaId,
                timestampThingspeak: {
                    gte: startTime,
                    lte: endTime,
                },
            },
            orderBy: {
                timestampThingspeak: "asc",
            },
        }),
        prisma.lotMcLog.findMany({
            where: {
                lotId,
                createdAt: {
                    gte: startTime,
                    lte: endTime,
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        }),
    ]);

    const INTERVAL_MS = 30 * 60 * 1000; // 30 mins
    const startMs = startTime.getTime();
    const endMs = endTime.getTime();
    const getIntervalKey = (timestamp: Date) => {
        const ts = timestamp.getTime();

        if (ts < startMs) {
            return null;
        }

        const diff = ts - startMs;
        const index = Math.floor(diff / INTERVAL_MS);
        return startMs + (index * INTERVAL_MS);
    };

    const binLogMap = new Map<number, typeof binLogs>();
    for (const log of binLogs) {
        const key = getIntervalKey(log.timestampThingspeak);

        if (key === null) {
            continue;
        }

        if (!binLogMap.has(key)) {
            binLogMap.set(key, []);
        }

        binLogMap.get(key)!.push(log);
    }

    const mcLogMap = new Map<number, typeof mcLogs[number]>();
    for (const log of mcLogs) {
        const key = getIntervalKey(log.createdAt);

        if (key !== null) {
            mcLogMap.set(key, log);
        }
    }

    const logs: LotSnapshotLogRow[] = [];
    let currentMs = startMs;
    const latestBinLog = binLogs[binLogs.length - 1] ?? null;
    const latestMcLog = mcLogs[mcLogs.length - 1] ?? null;
    const latestActualMs = Math.max(
        latestBinLog?.timestampThingspeak.getTime() ?? Number.NEGATIVE_INFINITY,
        latestMcLog?.createdAt.getTime() ?? Number.NEGATIVE_INFINITY,
    );
    const latestIntervalKey = Number.isFinite(latestActualMs) ? getIntervalKey(new Date(latestActualMs)) : null;
    const nextLogTimestamp = new Date(latestIntervalKey === null ? startMs : latestIntervalKey + INTERVAL_MS);

    while (currentMs <= endMs) {
        const slotBinLogs = binLogMap.get(currentMs) ?? [];
        const latestBinLog = slotBinLogs[slotBinLogs.length - 1] ?? null;
        const latestMcLog = mcLogMap.get(currentMs) ?? null;

        let statusBin = latestBinLog?.statusBin ?? "UPAIR";
        if (!latestBinLog && lot.status === "COMPLETED" && lot.endTime && currentMs >= new Date(lot.endTime).getTime()) {
            statusBin = "COMPLETED";
        } else if (!latestBinLog && lot.downAirAt) {
            const downAirMs = new Date(lot.downAirAt).getTime();
            statusBin = currentMs >= downAirMs ? "DOWNAIR" : "UPAIR";
        }

        logs.push({
            logId: toSyntheticLogId(lotId, currentMs),
            lotId,
            isStandaloneMcLog: false,
            timestampThingspeak: new Date(currentMs),
            statusBin,
            tempTop: average(slotBinLogs.map((log) => log.tempTop)),
            rhTop: average(slotBinLogs.map((log) => log.rhTop)),
            tempBottom: average(slotBinLogs.map((log) => log.tempBottom)),
            rhBottom: average(slotBinLogs.map((log) => log.rhBottom)),
            mc: latestMcLog?.mc ?? null,
            checkerName: latestMcLog?.checkerName ?? null,
            remark: latestMcLog?.remark ?? latestBinLog?.remark ?? null,
            sourceBinLogId: latestBinLog?.binLogId ?? null,
            sourceTimestampThingspeak: latestBinLog?.timestampThingspeak ?? null,
            dataPoints: slotBinLogs.length,
        });

        currentMs += INTERVAL_MS;
    }

    // Sort descending (latest first)
    logs.reverse();

    return {
        lot,
        logs,
        nextLogTimestamp,
    };
}
