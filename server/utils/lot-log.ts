import { prisma } from "~~/server/utils/prisma";

export type LotLogView = {
    logId: number;
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
};

type LotWithScope = {
    lotId: number;
    binNumber: number;
    areaId: number;
    status: string;
    startTime: Date;
    endTime: Date | null;
};

const STANDALONE_MC_OFFSET = 1_000_000_000;

const inLotRange = (timestamp: Date, lot: LotWithScope) => {
    if (timestamp.getTime() < lot.startTime.getTime()) {
        return false;
    }

    if (lot.endTime && timestamp.getTime() > lot.endTime.getTime()) {
        return false;
    }

    return true;
};

export const toStandaloneMcLogId = (lotMcLogId: number) => STANDALONE_MC_OFFSET + lotMcLogId;
export const isStandaloneMcLogId = (logId: number) => logId >= STANDALONE_MC_OFFSET;
export const fromStandaloneMcLogId = (logId: number) => logId - STANDALONE_MC_OFFSET;

export const findLotForBinLog = async (binNumber: number, areaId: number, timestamp: Date) => {
    return prisma.lot.findFirst({
        where: {
            binNumber,
            areaId,
            startTime: {
                lte: timestamp,
            },
            OR: [
                {
                    endTime: null,
                },
                {
                    endTime: {
                        gte: timestamp,
                    },
                },
            ],
        },
        orderBy: {
            startTime: "desc",
        },
    });
};

export const getLotLogTimeline = async (lotId: number) => {
    const lot = await prisma.lot.findUnique({
        where: { lotId },
        select: {
            lotId: true,
            binNumber: true,
            areaId: true,
            status: true,
            startTime: true,
            endTime: true,
        },
    });

    if (!lot) {
        return null;
    }

    const [binLogs, mcLogs] = await Promise.all([
        prisma.binLog.findMany({
            where: {
                binNumber: lot.binNumber,
                areaId: lot.areaId,
                timestampThingspeak: lot.endTime
                    ? {
                        gte: lot.startTime,
                        lte: lot.endTime,
                    }
                    : {
                        gte: lot.startTime,
                    },
            },
            orderBy: [
                {
                    timestampThingspeak: "desc",
                },
                {
                    binLogId: "desc",
                },
            ],
        }),
        prisma.lotMcLog.findMany({
            where: {
                lotId,
                createdAt: lot.endTime
                    ? {
                        gte: lot.startTime,
                        lte: lot.endTime,
                    }
                    : {
                        gte: lot.startTime,
                    },
            },
            orderBy: [
                {
                    createdAt: "desc",
                },
                {
                    lotMcLogId: "desc",
                },
            ],
        }),
    ]);

    const mcLogMap = new Map(mcLogs.map((mcLog) => [mcLog.createdAt.getTime(), mcLog]));
    const consumedMcLogIds = new Set<number>();

    const logs: LotLogView[] = binLogs.map((binLog) => {
        const matchedMcLog = mcLogMap.get(binLog.timestampThingspeak.getTime()) ?? null;

        if (matchedMcLog) {
            consumedMcLogIds.add(matchedMcLog.lotMcLogId);
        }

        return {
            logId: binLog.binLogId,
            lotId,
            isStandaloneMcLog: false,
            timestampThingspeak: binLog.timestampThingspeak,
            statusBin: binLog.statusBin,
            tempTop: binLog.tempTop,
            rhTop: binLog.rhTop,
            tempBottom: binLog.tempBottom,
            rhBottom: binLog.rhBottom,
            mc: matchedMcLog?.mc ?? null,
            checkerName: matchedMcLog?.checkerName ?? null,
            remark: matchedMcLog?.remark ?? binLog.remark ?? null,
        };
    });

    for (const mcLog of mcLogs) {
        if (consumedMcLogIds.has(mcLog.lotMcLogId)) {
            continue;
        }

        logs.push({
            logId: toStandaloneMcLogId(mcLog.lotMcLogId),
            lotId,
            isStandaloneMcLog: true,
            timestampThingspeak: mcLog.createdAt,
            statusBin: lot.status,
            tempTop: null,
            rhTop: null,
            tempBottom: null,
            rhBottom: null,
            mc: mcLog.mc,
            checkerName: mcLog.checkerName ?? null,
            remark: mcLog.remark ?? null,
        });
    }

    logs.sort((left, right) => {
        const timeDiff = right.timestampThingspeak.getTime() - left.timestampThingspeak.getTime();
        if (timeDiff !== 0) {
            return timeDiff;
        }

        return right.logId - left.logId;
    });

    return {
        lot,
        logs,
    };
};

export const findStandaloneMcLog = async (logId: number) => {
    if (!isStandaloneMcLogId(logId)) {
        return null;
    }

    return prisma.lotMcLog.findUnique({
        where: {
            lotMcLogId: fromStandaloneMcLogId(logId),
        },
    });
};

export const resolveLinkedMcLog = async (binLogId: number) => {
    const binLog = await prisma.binLog.findUnique({
        where: { binLogId },
    });

    if (!binLog) {
        return null;
    }

    const lot = await findLotForBinLog(binLog.binNumber, binLog.areaId, binLog.timestampThingspeak);

    if (!lot) {
        return { binLog, lot: null, mcLog: null };
    }

    const mcLog = await prisma.lotMcLog.findFirst({
        where: {
            lotId: lot.lotId,
            createdAt: binLog.timestampThingspeak,
        },
    });

    return { binLog, lot, mcLog };
};

export const isLogInsideLotRange = inLotRange;
