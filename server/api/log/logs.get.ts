import { prisma } from "~~/server/utils/prisma";
import { getLotSnapshotLogTimeline } from "~~/server/utils/lot-log-snapshot";
import { ZodError, z } from "zod";
import { requireAuthUser } from "~~/server/utils/auth";
import { isLimitedAreaRole } from "~~/server/utils/rbac";

const querySchema = z.object({
    lot_id: z.coerce.number().int().positive(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
});

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuthUser(event);
        const query = querySchema.parse(getQuery(event));

        const timeline = await getLotSnapshotLogTimeline(query.lot_id);

        if (!timeline) {
            setResponseStatus(event, 404);
            return { error: "Lot not found" };
        }

        if (isLimitedAreaRole(user.role) && !user.areaIds.includes(timeline.lot.areaId)) {
            setResponseStatus(event, 403);
            return { error: "Insufficient permission to access logs for this lot" };
        }

        const limit = query.limit ?? 10;
        const offset = query.offset ?? 0;
        const totalCount = timeline.logs.length;
        const result = timeline.logs.slice(offset, offset + limit);

        return { success: true, data: result, totalCount };
    } catch (error) {
        console.log(error);
        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return { error: "Invalid query parameter" };
        }
        if ((error as any).statusCode) throw error;
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});
