import { prisma } from "~~/server/utils/prisma";
import { findStandaloneMcLog, resolveLinkedMcLog, toStandaloneMcLogId } from "~~/server/utils/lot-log";
import { ZodError, z } from "zod";

const querySchema = z.object({
    log_id: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
    try {
        const query = querySchema.parse(getQuery(event));

        const standaloneMcLog = await findStandaloneMcLog(query.log_id);
        const result = standaloneMcLog
            ? await (async () => {
                const lot = await prisma.lot.findUnique({
                    where: {
                        lotId: standaloneMcLog.lotId,
                    },
                    select: {
                        status: true,
                    },
                });

                return {
                    logId: toStandaloneMcLogId(standaloneMcLog.lotMcLogId),
                    lotId: standaloneMcLog.lotId,
                    isStandaloneMcLog: true,
                    timestampThingspeak: standaloneMcLog.createdAt,
                    statusBin: lot?.status ?? "UPAIR",
                    tempTop: null,
                    rhTop: null,
                    tempBottom: null,
                    rhBottom: null,
                    mc: standaloneMcLog.mc,
                    checkerName: standaloneMcLog.checkerName,
                    remark: standaloneMcLog.remark,
                };
            })()
            : await (async () => {
                const resolved = await resolveLinkedMcLog(query.log_id);

                if (!resolved?.binLog) {
                    return null;
                }

                return {
                    logId: resolved.binLog.binLogId,
                    lotId: resolved.lot?.lotId ?? 0,
                    isStandaloneMcLog: false,
                    timestampThingspeak: resolved.binLog.timestampThingspeak,
                    statusBin: resolved.binLog.statusBin,
                    tempTop: resolved.binLog.tempTop,
                    rhTop: resolved.binLog.rhTop,
                    tempBottom: resolved.binLog.tempBottom,
                    rhBottom: resolved.binLog.rhBottom,
                    mc: resolved.mcLog?.mc ?? null,
                    checkerName: resolved.mcLog?.checkerName ?? null,
                    remark: resolved.mcLog?.remark ?? resolved.binLog.remark,
                };
            })();

        if (!result) {
            setResponseStatus(event, 404);
            return { error: "Log not found" };
        }

        return { success: true, data: result };
    } catch (error) {
         
        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return { error: "Invalid query parameter" };
        }
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});
