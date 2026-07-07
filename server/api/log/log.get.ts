import { prisma } from "~~/server/utils/prisma";
import { ZodError, z } from "zod";

const querySchema = z.object({
    log_id: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
    try {
        const query = querySchema.parse(getQuery(event));

        const result = await prisma.log.findUnique({
            where: {
                logId: query.log_id,
            },
        });

        if (!result) {
            setResponseStatus(event, 404);
            return { error: "Log not found" };
        }

        return { success: true, data: result };
    } catch (error) {
        console.log(error);
        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return { error: "Invalid query parameter" };
        }
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});
