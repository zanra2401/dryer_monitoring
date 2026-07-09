import { prisma } from "~~/server/utils/prisma";
import { findStandaloneMcLog, resolveLinkedMcLog } from "~~/server/utils/lot-log";
import { isSyntheticLogId, parseSyntheticLogId } from "~~/server/utils/lot-log-snapshot";
import { ZodError, z } from "zod";

const bodySchema = z.object({
    log_id: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
    try {
        const body = bodySchema.parse(await readBody(event));

        let result: Record<string, any> | null = null;

        if (isSyntheticLogId(body.log_id)) {
            const { lotId, timestamp } = parseSyntheticLogId(body.log_id);
            const nextMs = timestamp.getTime() + 30 * 60 * 1000;
            const mcLog = await prisma.lotMcLog.findFirst({
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
                result = await prisma.lotMcLog.delete({
                    where: {
                        lotMcLogId: mcLog.lotMcLogId,
                    },
                });
            } else {
                setResponseStatus(event, 404);
                return { error: "No MC log found in this slot to delete" };
            }
        } else {
            const standaloneMcLog = await findStandaloneMcLog(body.log_id);

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
