import { prisma } from "~~/server/utils/prisma";
import { ZodError, z } from "zod";

const bodySchema = z.object({
    lot_id: z.coerce.number().int().positive(),
    timestamp_thingspeak: z.coerce.date(),
    status_bin: z.string().trim().min(1, "status_bin is required").optional(),
    temp_top: z.coerce.number().optional().nullable(),
    rh_top: z.coerce.number().optional().nullable(),
    temp_bottom: z.coerce.number().optional().nullable(),
    rh_bottom: z.coerce.number().optional().nullable(),
    mc: z.coerce.number().nullable(),
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
            },
        });

        if (!existingLot) {
            setResponseStatus(event, 404);
            return { error: "Lot not found" };
        }

        if (body.mc === null) {
            setResponseStatus(event, 400);
            return { error: "MC is required" };
        }

        const mcValue = body.mc;

        const result = await prisma.$transaction(async (tx) => {
            const mcLog = await tx.lotMcLog.create({
                data: {
                    lotId: body.lot_id,
                    mc: mcValue,
                    checkerName: body.checker_name ?? null,
                    remark: body.remark ?? null,
                    createdAt: body.timestamp_thingspeak,
                },
            });

            return {
                logId: mcLog.lotMcLogId + 1_000_000_000,
                lotId: existingLot.lotId,
                isStandaloneMcLog: true,
                timestampThingspeak: mcLog.createdAt,
                statusBin: existingLot.status,
                tempTop: null,
                rhTop: null,
                tempBottom: null,
                rhBottom: null,
                mc: mcLog.mc,
                checkerName: mcLog.checkerName ?? null,
                remark: mcLog.remark ?? null,
            };
        });

        setResponseStatus(event, 201);
        return { success: true, data: result };
    } catch (error) {
        console.log(error);
        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return { error: "Invalid request body" };
        }
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});
