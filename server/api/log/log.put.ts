import { prisma } from "~~/server/utils/prisma";
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
});

export default defineEventHandler(async (event) => {
    try {
        const body = bodySchema.parse(await readBody(event));

        const existingLog = await prisma.log.findUnique({
            where: {
                logId: body.log_id,
            },
            select: {
                logId: true,
            },
        });

        if (!existingLog) {
            setResponseStatus(event, 404);
            return { error: "Log not found" };
        }

        const result = await prisma.log.update({
            where: {
                logId: body.log_id,
            },
            data: {
                ...(body.timestamp_thingspeak !== undefined ? { timestampThingspeak: body.timestamp_thingspeak } : {}),
                ...(body.status_bin !== undefined ? { statusBin: body.status_bin } : {}),
                ...(body.temp_top !== undefined ? { tempTop: body.temp_top } : {}),
                ...(body.rh_top !== undefined ? { rhTop: body.rh_top } : {}),
                ...(body.temp_bottom !== undefined ? { tempBottom: body.temp_bottom } : {}),
                ...(body.rh_bottom !== undefined ? { rhBottom: body.rh_bottom } : {}),
                ...(body.mc !== undefined ? { mc: body.mc } : {}),
                ...(body.checker_name !== undefined ? { checkerName: body.checker_name } : {}),
            },
        });

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
