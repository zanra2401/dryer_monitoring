import { prisma } from "~~/server/utils/prisma";
import { findStandaloneMcLog, resolveLinkedMcLog } from "~~/server/utils/lot-log";
import { ZodError, z } from "zod";

const bodySchema = z.object({
    log_id: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
    try {
        const body = bodySchema.parse(await readBody(event));

        const standaloneMcLog = await findStandaloneMcLog(body.log_id);
        let result: Record<string, any> | null = null;

        if (standaloneMcLog) {
            result = await prisma.lotMcLog.delete({
                where: {
                    lotMcLogId: standaloneMcLog.lotMcLogId,
                },
            });
        } else {
            const resolved = await resolveLinkedMcLog(body.log_id);

            if (!resolved?.binLog) {
                setResponseStatus(event, 404);
                return { error: "Log not found" };
            }

            if (!resolved.mcLog) {
                setResponseStatus(event, 409);
                return { error: "Telemetry logs cannot be deleted manually" };
            }

            result = await prisma.lotMcLog.delete({
                where: {
                    lotMcLogId: resolved.mcLog.lotMcLogId,
                },
            });
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
