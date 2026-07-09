import { prisma } from "~~/server/utils/prisma";
import { findStandaloneMcLog, resolveLinkedMcLog, toStandaloneMcLogId } from "~~/server/utils/lot-log";
import { isSyntheticLogId, parseSyntheticLogId } from "~~/server/utils/lot-log-snapshot";
import { ZodError, z } from "zod";

const bodySchema = z.object({
    log_id: z.coerce.number().int().positive(),
    timestamp_thingspeak: z.coerce.date().optional(),
    status_bin: z.string().trim().min(1).optional(),
    temp_top: z.coerce.number().optional().nullable(),
    rh_top: z.coerce.number().optional().nullable(),
    temp_bottom: z.coerce.number().optional().nullable(),
    rh_bottom: z.coerce.number().optional().nullable(),
    mc: z.coerce.number().optional().nullable(),
    checker_name: z.string().trim().optional().nullable(),
    remark: z.string().trim().optional().nullable(),
});

export default defineEventHandler(async (event) => {
    try {
        const body = bodySchema.parse(await readBody(event));

        let result: Record<string, any> | null = null;

        if (isSyntheticLogId(body.log_id)) {
            const { lotId, timestamp } = parseSyntheticLogId(body.log_id);
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

            if (!lot) {
                setResponseStatus(event, 404);
                return { error: "Lot not found" };
            }

            const nextMs = timestamp.getTime() + 30 * 60 * 1000;
            let mcLog = await prisma.lotMcLog.findFirst({
                where: {
                    lotId,
                    createdAt: {
                        gte: timestamp,
                        lt: new Date(nextMs)
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            if (mcLog) {
                if (body.mc === null) {
                    await prisma.lotMcLog.delete({
                        where: { lotMcLogId: mcLog.lotMcLogId }
                    });
                    mcLog = null;
                } else {
                    mcLog = await prisma.lotMcLog.update({
                        where: { lotMcLogId: mcLog.lotMcLogId },
                        data: {
                            ...(body.mc !== undefined ? { mc: body.mc } : {}),
                            ...(body.checker_name !== undefined ? { checkerName: body.checker_name } : {}),
                            ...(body.remark !== undefined ? { remark: body.remark } : {}),
                        }
                    });
                }
            } else if (body.mc !== undefined && body.mc !== null) {
                mcLog = await prisma.lotMcLog.create({
                    data: {
                        lotId,
                        mc: body.mc,
                        checkerName: body.checker_name ?? null,
                        remark: body.remark ?? null,
                        createdAt: timestamp
                    }
                });
            }

            const [latestBinLog] = await Promise.all([
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
                logId: body.log_id,
                lotId,
                isStandaloneMcLog: false,
                timestampThingspeak: timestamp,
                statusBin,
                tempTop: latestBinLog?.tempTop ?? null,
                rhTop: latestBinLog?.rhTop ?? null,
                tempBottom: latestBinLog?.tempBottom ?? null,
                rhBottom: latestBinLog?.rhBottom ?? null,
                mc: mcLog?.mc ?? null,
                checkerName: mcLog?.checkerName ?? null,
                remark: mcLog?.remark ?? latestBinLog?.remark ?? null,
            };
        } else {
            const standaloneMcLog = await findStandaloneMcLog(body.log_id);

            if (standaloneMcLog) {
                const standaloneLot = await prisma.lot.findUnique({
                    where: {
                        lotId: standaloneMcLog.lotId,
                    },
                    select: {
                        lotId: true,
                        status: true,
                    },
                });

                const updatedMcLog = await prisma.lotMcLog.update({
                    where: {
                        lotMcLogId: standaloneMcLog.lotMcLogId,
                    },
                    data: {
                        ...(body.timestamp_thingspeak !== undefined ? { createdAt: body.timestamp_thingspeak } : {}),
                        ...(body.mc !== undefined ? { mc: body.mc ?? 0 } : {}),
                        ...(body.checker_name !== undefined ? { checkerName: body.checker_name } : {}),
                        ...(body.remark !== undefined ? { remark: body.remark } : {}),
                    },
                });

                result = {
                    logId: toStandaloneMcLogId(updatedMcLog.lotMcLogId),
                    lotId: standaloneLot?.lotId ?? standaloneMcLog.lotId,
                    isStandaloneMcLog: true,
                    timestampThingspeak: updatedMcLog.createdAt,
                    statusBin: standaloneLot?.status ?? "UPAIR",
                    tempTop: null,
                    rhTop: null,
                    tempBottom: null,
                    rhBottom: null,
                    mc: updatedMcLog.mc,
                    checkerName: updatedMcLog.checkerName,
                    remark: updatedMcLog.remark,
                };
            } else {
                const resolved = await resolveLinkedMcLog(body.log_id);

                if (!resolved?.binLog) {
                    setResponseStatus(event, 404);
                    return { error: "Log not found" };
                }

                if (!resolved.lot) {
                    setResponseStatus(event, 409);
                    return { error: "This telemetry log is outside the current lot scope" };
                }

                if (
                    body.timestamp_thingspeak !== undefined
                    || body.status_bin !== undefined
                    || body.temp_top !== undefined
                    || body.rh_top !== undefined
                    || body.temp_bottom !== undefined
                    || body.rh_bottom !== undefined
                ) {
                    setResponseStatus(event, 400);
                    return { error: "Telemetry fields cannot be edited manually" };
                }

                let updatedMcLog = resolved.mcLog;
                if (updatedMcLog) {
                    if (body.mc === null) {
                        await prisma.lotMcLog.delete({
                            where: {
                                lotMcLogId: updatedMcLog.lotMcLogId,
                            },
                        });
                        updatedMcLog = null;
                    } else {
                        updatedMcLog = await prisma.lotMcLog.update({
                            where: {
                                lotMcLogId: updatedMcLog.lotMcLogId,
                            },
                            data: {
                                ...(body.mc !== undefined ? { mc: body.mc } : {}),
                                ...(body.checker_name !== undefined ? { checkerName: body.checker_name } : {}),
                                ...(body.remark !== undefined ? { remark: body.remark } : {}),
                            },
                        });
                    }
                } else if (body.mc !== undefined && body.mc !== null) {
                    updatedMcLog = await prisma.lotMcLog.create({
                        data: {
                            lotId: resolved.lot.lotId,
                            mc: body.mc,
                            checkerName: body.checker_name ?? null,
                            remark: body.remark ?? null,
                            createdAt: resolved.binLog.timestampThingspeak,
                        },
                    });
                }

                result = {
                    logId: resolved.binLog.binLogId,
                    lotId: resolved.lot.lotId,
                    isStandaloneMcLog: false,
                    timestampThingspeak: resolved.binLog.timestampThingspeak,
                    statusBin: resolved.binLog.statusBin,
                    tempTop: resolved.binLog.tempTop,
                    rhTop: resolved.binLog.rhTop,
                    tempBottom: resolved.binLog.tempBottom,
                    rhBottom: resolved.binLog.rhBottom,
                    mc: updatedMcLog?.mc ?? null,
                    checkerName: updatedMcLog?.checkerName ?? null,
                    remark: updatedMcLog?.remark ?? resolved.binLog.remark,
                };
            }
        }

        return { success: true, data: result };
    } catch (error) {
         
        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return { error: "Invalid request body" };
        }
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});
