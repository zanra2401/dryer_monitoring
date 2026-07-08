import { prisma } from "~~/server/utils/prisma";
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
            },
        });

        if (!existingLot) {
            setResponseStatus(event, 404);
            return { error: "Lot not found" };
        }

        const result = await prisma.log.create({
            data: {
                lotId: body.lot_id,
                timestampThingspeak: body.timestamp_thingspeak,
                statusBin: body.status_bin,
                tempTop: body.temp_top ?? null,
                rhTop: body.rh_top ?? null,
                tempBottom: body.temp_bottom ?? null,
                rhBottom: body.rh_bottom ?? null,
                mc: body.mc ?? null,
                checkerName: body.checker_name ?? null,
                remark: body.remark ?? null,
            },
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
