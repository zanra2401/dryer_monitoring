import { prisma } from "~~/server/utils/prisma";
import { findStandaloneMcLog, resolveLinkedMcLog, toStandaloneMcLogId } from "~~/server/utils/lot-log";
import { isSyntheticLogId, parseSyntheticLogId } from "~~/server/utils/lot-log-snapshot";
import { normalizeLotStatusFromLog, syncLotStatusFromLog } from "~~/server/utils/lot-log-status-sync";
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
                    lotNumber: true,
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
            const targetTimestamp = body.timestamp_thingspeak ?? timestamp;
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
                                ...(body.timestamp_thingspeak !== undefined ? { createdAt: targetTimestamp } : {}),
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
                        createdAt: targetTimestamp
                    }
                });
            }

            let latestBinLog = await prisma.binLog.findFirst({
                where: {
                    binNumber: lot.binNumber,
                    areaId: lot.areaId,
                    timestampThingspeak: {
                        gte: timestamp,
                        lt: new Date(nextMs)
                    }
                },
                orderBy: { timestampThingspeak: 'desc' }
            });

            const shouldWriteBinLog = body.timestamp_thingspeak !== undefined
                || body.status_bin !== undefined
                || body.temp_top !== undefined
                || body.rh_top !== undefined
                || body.temp_bottom !== undefined
                || body.rh_bottom !== undefined
                || body.remark !== undefined;

            if (shouldWriteBinLog) {
                const nextStatusBin = body.status_bin !== undefined
                    ? normalizeLotStatusFromLog(body.status_bin)
                    : normalizeLotStatusFromLog(latestBinLog?.statusBin ?? lot.status);

                if (!nextStatusBin) {
                    setResponseStatus(event, 400);
                    return { error: "Invalid status_bin" };
                }

                const binLogData = {
                    timestampThingspeak: targetTimestamp,
                    statusBin: nextStatusBin,
                    tempTop: body.temp_top !== undefined ? body.temp_top : latestBinLog?.tempTop ?? null,
                    rhTop: body.rh_top !== undefined ? body.rh_top : latestBinLog?.rhTop ?? null,
                    tempBottom: body.temp_bottom !== undefined ? body.temp_bottom : latestBinLog?.tempBottom ?? null,
                    rhBottom: body.rh_bottom !== undefined ? body.rh_bottom : latestBinLog?.rhBottom ?? null,
                    remark: body.remark !== undefined ? body.remark : latestBinLog?.remark ?? null,
                };

                latestBinLog = latestBinLog
                    ? await prisma.binLog.update({
                        where: { binLogId: latestBinLog.binLogId },
                        data: binLogData,
                    })
                    : await prisma.binLog.create({
                        data: {
                            binNumber: lot.binNumber,
                            areaId: lot.areaId,
                            ...binLogData,
                        },
                    });

                await prisma.$transaction((tx) => syncLotStatusFromLog(tx, lot, nextStatusBin, targetTimestamp, body.mc));
            }

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
                timestampThingspeak: targetTimestamp,
                statusBin: latestBinLog?.statusBin ?? statusBin,
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
                        lotNumber: true,
                        binNumber: true,
                        areaId: true,
                        status: true,
                    },
                });

                if (!standaloneLot) {
                    setResponseStatus(event, 404);
                    return { error: "Lot not found" };
                }

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

                let manualBinLog = await prisma.binLog.findFirst({
                    where: {
                        binNumber: standaloneLot.binNumber,
                        areaId: standaloneLot.areaId,
                        timestampThingspeak: updatedMcLog.createdAt,
                    },
                    orderBy: { binLogId: "desc" },
                });
                const shouldWriteBinLog = body.status_bin !== undefined
                    || body.temp_top !== undefined
                    || body.rh_top !== undefined
                    || body.temp_bottom !== undefined
                    || body.rh_bottom !== undefined
                    || body.remark !== undefined
                    || body.timestamp_thingspeak !== undefined;

                if (shouldWriteBinLog) {
                    const nextStatusBin = body.status_bin !== undefined
                        ? normalizeLotStatusFromLog(body.status_bin)
                        : normalizeLotStatusFromLog(manualBinLog?.statusBin ?? standaloneLot.status);

                    if (!nextStatusBin) {
                        setResponseStatus(event, 400);
                        return { error: "Invalid status_bin" };
                    }

                    const binLogData = {
                        timestampThingspeak: updatedMcLog.createdAt,
                        statusBin: nextStatusBin,
                        tempTop: body.temp_top !== undefined ? body.temp_top : manualBinLog?.tempTop ?? null,
                        rhTop: body.rh_top !== undefined ? body.rh_top : manualBinLog?.rhTop ?? null,
                        tempBottom: body.temp_bottom !== undefined ? body.temp_bottom : manualBinLog?.tempBottom ?? null,
                        rhBottom: body.rh_bottom !== undefined ? body.rh_bottom : manualBinLog?.rhBottom ?? null,
                        remark: body.remark !== undefined ? body.remark : manualBinLog?.remark ?? null,
                    };

                    manualBinLog = manualBinLog
                        ? await prisma.binLog.update({
                            where: { binLogId: manualBinLog.binLogId },
                            data: binLogData,
                        })
                        : await prisma.binLog.create({
                            data: {
                                binNumber: standaloneLot.binNumber,
                                areaId: standaloneLot.areaId,
                                ...binLogData,
                            },
                        });

                    await prisma.$transaction((tx) => syncLotStatusFromLog(tx, standaloneLot, nextStatusBin, updatedMcLog.createdAt, updatedMcLog.mc));
                }

                result = {
                    logId: toStandaloneMcLogId(updatedMcLog.lotMcLogId),
                    lotId: standaloneLot.lotId,
                    isStandaloneMcLog: true,
                    timestampThingspeak: updatedMcLog.createdAt,
                    statusBin: manualBinLog?.statusBin ?? standaloneLot.status,
                    tempTop: manualBinLog?.tempTop ?? null,
                    rhTop: manualBinLog?.rhTop ?? null,
                    tempBottom: manualBinLog?.tempBottom ?? null,
                    rhBottom: manualBinLog?.rhBottom ?? null,
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

                const targetTimestamp = body.timestamp_thingspeak ?? resolved.binLog.timestampThingspeak;
                const nextStatusBin = body.status_bin !== undefined
                    ? normalizeLotStatusFromLog(body.status_bin)
                    : normalizeLotStatusFromLog(resolved.binLog.statusBin);

                if (!nextStatusBin) {
                    setResponseStatus(event, 400);
                    return { error: "Invalid status_bin" };
                }

                const updatedBinLog = await prisma.binLog.update({
                    where: {
                        binLogId: resolved.binLog.binLogId,
                    },
                    data: {
                        ...(body.timestamp_thingspeak !== undefined ? { timestampThingspeak: targetTimestamp } : {}),
                        ...(body.status_bin !== undefined ? { statusBin: nextStatusBin } : {}),
                        ...(body.temp_top !== undefined ? { tempTop: body.temp_top } : {}),
                        ...(body.rh_top !== undefined ? { rhTop: body.rh_top } : {}),
                        ...(body.temp_bottom !== undefined ? { tempBottom: body.temp_bottom } : {}),
                        ...(body.rh_bottom !== undefined ? { rhBottom: body.rh_bottom } : {}),
                        ...(body.remark !== undefined ? { remark: body.remark } : {}),
                    },
                });

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
                                ...(body.timestamp_thingspeak !== undefined ? { createdAt: targetTimestamp } : {}),
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
                            createdAt: targetTimestamp,
                        },
                    });
                }

                await prisma.$transaction((tx) => syncLotStatusFromLog(tx, resolved.lot, nextStatusBin, targetTimestamp, body.mc));

                result = {
                    logId: updatedBinLog.binLogId,
                    lotId: resolved.lot.lotId,
                    isStandaloneMcLog: false,
                    timestampThingspeak: updatedBinLog.timestampThingspeak,
                    statusBin: updatedBinLog.statusBin,
                    tempTop: updatedBinLog.tempTop,
                    rhTop: updatedBinLog.rhTop,
                    tempBottom: updatedBinLog.tempBottom,
                    rhBottom: updatedBinLog.rhBottom,
                    mc: updatedMcLog?.mc ?? null,
                    checkerName: updatedMcLog?.checkerName ?? null,
                    remark: updatedMcLog?.remark ?? updatedBinLog.remark,
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
