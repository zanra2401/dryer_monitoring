import { z, ZodError } from "zod";
import { getLotReportData } from "~~/server/utils/lot-report";

import { prisma } from "~~/server/utils/prisma";
import { requireAuthUser } from "~~/server/utils/auth";
import { isLimitedAreaRole } from "~~/server/utils/rbac";

const querySchema = z.object({
    lot_id: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuthUser(event);
        const query = querySchema.parse(getQuery(event));

        const lot = await prisma.lot.findUnique({
            where: { lotId: query.lot_id },
            select: { areaId: true }
        });

        if (!lot) {
            setResponseStatus(event, 404);
            return {
                error: "Lot not found",
            };
        }

        if (isLimitedAreaRole(user.role) && !user.areaIds.includes(lot.areaId)) {
            setResponseStatus(event, 403);
            return {
                error: "Insufficient permission for this area",
            };
        }

        const data = await getLotReportData(query.lot_id);

        return {
            success: true,
            data,
        };
    } catch (error) {
         

        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return {
                error: "Invalid query parameter",
            };
        }

        setResponseStatus(event, 500);
        return {
            error: "Internal Server Error",
        };
    }
});
