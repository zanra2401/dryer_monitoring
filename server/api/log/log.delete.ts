import { prisma } from "~~/server/utils/prisma";
import { ZodError, z } from "zod";

const bodySchema = z.object({
    log_id: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
    try {
        const body = bodySchema.parse(await readBody(event));

        const existingLog = await prisma.log.findUnique({
            where: {
                logId: body.log_id,
            },
        });

        if (!existingLog) {
            setResponseStatus(event, 404);
            return { error: "Log not found" };
        }

        const result = await prisma.log.delete({
            where: {
                logId: body.log_id,
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
