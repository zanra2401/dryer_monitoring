import { prisma } from "~~/server/utils/prisma";
import { findStandaloneMcLog, resolveLinkedMcLog, toStandaloneMcLogId } from "~~/server/utils/lot-log";
import { isSyntheticLogId, parseSyntheticLogId } from "~~/server/utils/lot-log-snapshot";
import { ZodError, z } from "zod";

const querySchema = z.object({
    log_id: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
    try {
        const query = querySchema.parse(getQuery(event));

        let result: any = null;

        if (isSyntheticLogId(query.log_id)) {
            const { lotId, timestamp } = parseSyntheticLogId(query.log_id);
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
                }
            });

            if (lot) {
                const nextMs = timestamp.getTime() + 30 * 60 * 1000;
                const [latestBinLog, latestMcLog] = await Promise.all([
                    prisma.binLog.findFirst({
                        where: {
                            binNumber: lot.binNumber,
                            areaId: lot.areaId,
                            timestampThingspeak: {
                                gte: timestamp,
                                lt: new Date(nextMs)
                            }
                        },
                        orderBy: { timestampThingspeak: 'desc' }
                    }),
                    prisma.lotMcLog.findFirst({
                        where: {
                            lotId,
                            createdAt: {
                                gte: timestamp,
                                lt: new Date(nextMs)
                            }
                        },
                        orderBy: { createdAt: 'desc' }
                    })
                ]);

                let statusBin = "UPAIR";
                if (lot.status === "DRIED" && lot.endTime && timestamp.getTime() >= new Date(lot.endTime).getTime()) {
                    statusBin = "DRIED";
                } else if (lot.downAirAt) {
                    const downAirMs = new Date(lot.downAirAt).getTime();
                    statusBin = timestamp.getTime() >= downAirMs ? "DOWNAIR" : "UPAIR";
                }

                result = {
                    logId: query.log_id,
                    lotId,
                    isStandaloneMcLog: false,
                    timestampThingspeak: timestamp,
                    statusBin,
                    tempTop: latestBinLog?.tempTop ?? null,
                    rhTop: latestBinLog?.rhTop ?? null,
                    tempBottom: latestBinLog?.tempBottom ?? null,
                    rhBottom: latestBinLog?.rhBottom ?? null,
                    mc: latestMcLog?.mc ?? null,
                    checkerName: latestMcLog?.checkerName ?? null,
                    remark: latestMcLog?.remark ?? latestBinLog?.remark ?? null,
                };
            }
        } else {
            const standaloneMcLog = await findStandaloneMcLog(query.log_id);
            result = standaloneMcLog
                ? await (async () => {
                    const lot = await prisma.lot.findUnique({
                        where: {
                            lotId: standaloneMcLog.lotId,
                        },
                        select: {
                            status: true,
                        },
                    });

                    return {
                        logId: toStandaloneMcLogId(standaloneMcLog.lotMcLogId),
                        lotId: standaloneMcLog.lotId,
                        isStandaloneMcLog: true,
                        timestampThingspeak: standaloneMcLog.createdAt,
                        statusBin: lot?.status ?? "UPAIR",
                        tempTop: null,
                        rhTop: null,
                        tempBottom: null,
                        rhBottom: null,
                        mc: standaloneMcLog.mc,
                        checkerName: standaloneMcLog.checkerName,
                        remark: standaloneMcLog.remark,
                    };
                })()
                : await (async () => {
                    const resolved = await resolveLinkedMcLog(query.log_id);

                    if (!resolved?.binLog) {
                        return null;
                    }

                    return {
                        logId: resolved.binLog.binLogId,
                        lotId: resolved.lot?.lotId ?? 0,
                        isStandaloneMcLog: false,
                        timestampThingspeak: resolved.binLog.timestampThingspeak,
                        statusBin: resolved.binLog.statusBin,
                        tempTop: resolved.binLog.tempTop,
                        rhTop: resolved.binLog.rhTop,
                        tempBottom: resolved.binLog.tempBottom,
                        rhBottom: resolved.binLog.rhBottom,
                        mc: resolved.mcLog?.mc ?? null,
                        checkerName: resolved.mcLog?.checkerName ?? null,
                        remark: resolved.mcLog?.remark ?? resolved.binLog.remark,
                    };
                })();
        }

        if (!result) {
            setResponseStatus(event, 404);
            return { error: "Log not found" };
        }

        return { success: true, data: result };
    } catch (error) {
         
        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return { error: "Invalid query parameter" };
        }
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});
