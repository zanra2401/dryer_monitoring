import { prisma } from "~~/server/utils/prisma";
import { normalizeLotStatusFromLog, syncLotStatusFromLog } from "~~/server/utils/lot-log-status-sync";
import { ZodError, z } from "zod";

const bodySchema = z.object({
    lot_id: z.coerce.number().int().positive(),
    timestamp_thingspeak: z.coerce.date(),
    status_bin: z.string().trim().min(1, "status_bin is required"),
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

        const existingLot = await prisma.lot.findUnique({
            where: {
                lotId: body.lot_id,
            },
            select: {
                lotId: true,
                binNumber: true,
                areaId: true,
                status: true,
                lotNumber: true,
            },
        });

        if (!existingLot) {
            setResponseStatus(event, 404);
            return { error: "Lot not found" };
        }

        const statusBin = normalizeLotStatusFromLog(body.status_bin);

        if (!statusBin) {
            setResponseStatus(event, 400);
            return { error: "Invalid status_bin" };
        }

        const result = await prisma.$transaction(async (tx) => {
            const binLog = await tx.binLog.create({
                data: {
                    binNumber: existingLot.binNumber,
                    areaId: existingLot.areaId,
                    timestampThingspeak: body.timestamp_thingspeak,
                    statusBin,
                    tempTop: body.temp_top ?? null,
                    rhTop: body.rh_top ?? null,
                    tempBottom: body.temp_bottom ?? null,
                    rhBottom: body.rh_bottom ?? null,
                    remark: body.remark ?? null,
                },
            });
            const mcLog = body.mc !== null && body.mc !== undefined
                ? await tx.lotMcLog.create({
                    data: {
                        lotId: body.lot_id,
                        mc: body.mc,
                        checkerName: body.checker_name ?? null,
                        remark: body.remark ?? null,
                        createdAt: body.timestamp_thingspeak,
                    },
                })
                : null;

            await syncLotStatusFromLog(tx, existingLot, statusBin, body.timestamp_thingspeak, body.mc);

            return {
                logId: binLog.binLogId,
                lotId: existingLot.lotId,
                isStandaloneMcLog: false,
                timestampThingspeak: binLog.timestampThingspeak,
                statusBin: binLog.statusBin,
                tempTop: binLog.tempTop,
                rhTop: binLog.rhTop,
                tempBottom: binLog.tempBottom,
                rhBottom: binLog.rhBottom,
                mc: mcLog?.mc ?? null,
                checkerName: mcLog?.checkerName ?? null,
                remark: mcLog?.remark ?? binLog.remark ?? null,
            };
        });

        setResponseStatus(event, 201);
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
