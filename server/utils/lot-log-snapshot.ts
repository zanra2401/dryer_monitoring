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

    const logs: LotSnapshotLogRow[] = [];
    let currentMs = startMs;

    while (currentMs <= endMs) {
        const nextMs = currentMs + INTERVAL_MS;

        // Filter bin logs in this [currentMs, nextMs) slot
        const slotBinLogs = binLogs.filter(
            (log) => log.timestampThingspeak.getTime() >= currentMs && log.timestampThingspeak.getTime() < nextMs
        );
        const latestBinLog = slotBinLogs[slotBinLogs.length - 1] ?? null;

        // Filter MC logs in this [currentMs, nextMs) slot
        const slotMcLogs = mcLogs.filter(
            (log) => log.createdAt.getTime() >= currentMs && log.createdAt.getTime() < nextMs
        );
        const latestMcLog = slotMcLogs[slotMcLogs.length - 1] ?? null;

        let statusBin = "UPAIR";
        if (lot.status === "DRIED" && lot.endTime && currentMs >= new Date(lot.endTime).getTime()) {
            statusBin = "DRIED";
        } else if (lot.downAirAt) {
            const downAirMs = new Date(lot.downAirAt).getTime();
            statusBin = currentMs >= downAirMs ? "DOWNAIR" : "UPAIR";
        }

        logs.push({
            logId: toSyntheticLogId(lotId, currentMs),
            lotId,
            isStandaloneMcLog: false,
            timestampThingspeak: new Date(currentMs),
            statusBin,
            tempTop: latestBinLog?.tempTop ?? null,
            rhTop: latestBinLog?.rhTop ?? null,
            tempBottom: latestBinLog?.tempBottom ?? null,
            rhBottom: latestBinLog?.rhBottom ?? null,
            mc: latestMcLog?.mc ?? null,
            checkerName: latestMcLog?.checkerName ?? null,
            remark: latestMcLog?.remark ?? latestBinLog?.remark ?? null,
            sourceBinLogId: latestBinLog?.binLogId ?? null,
            sourceTimestampThingspeak: latestBinLog?.timestampThingspeak ?? null,
        });

        currentMs += INTERVAL_MS;
    }

    // Sort descending (latest first)
    logs.reverse();

    return {
        lot,
        logs,
    };
}
