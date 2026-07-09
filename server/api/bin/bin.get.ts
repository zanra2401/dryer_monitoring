import { prisma } from "~~/server/utils/prisma";
import { requireAuthUser } from "~~/server/utils/auth";
import { isLimitedAreaRole } from "~~/server/utils/rbac";

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuthUser(event);
        const area_id = parseInt(getQuery(event).area_id as string);
        const bin_number = parseInt(getQuery(event).bin_number as string);

        if (isLimitedAreaRole(user.role) && !user.areaIds.includes(area_id)) {
            throw createError({
                statusCode: 403,
                statusMessage: "Anda tidak memiliki hak akses untuk area ini.",
            });
        }

        const result = await prisma.bin.findFirst({
            where: {
                areaId: area_id,
                binNumber: bin_number,
            }
        });

        if (!result) {
            throw createError({
                statusCode: 404,
                statusMessage: "Bin not found",
            });
        }
        return { success: true, data: result };
    } catch (error: unknown) {
        if ((error as any).statusCode) throw error;
        return error;
    }
});