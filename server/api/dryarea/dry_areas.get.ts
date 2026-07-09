import { requireAuthUser } from "~~/server/utils/auth";
import * as z from "zod";
import { prisma } from "~~/server/utils/prisma";
import { logger } from "~~/server/utils/pino";

const listQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
});

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuthUser(event);
        const query = listQuerySchema.parse(getQuery(event));

        const limit = query.limit ?? 10;
        const offset = query.offset ?? 0;
        const areaFilter = user.role === "OPERATOR" || user.role === "CLIENT"
            ? {
                areaId: {
                    in: user.areaIds,
                },
            }
            : undefined;

        const result = await prisma.dryerArea.findMany({
            where: areaFilter,
            skip: offset,
            take: limit,
            orderBy: {
                areaId: "asc",
            },
        });
        const totalCount = areaFilter
            ? await prisma.dryerArea.count({ where: areaFilter })
            : await prisma.dryerArea.count();

        if (!result) {
            throw createError({
                statusCode: 404,
                statusMessage: "Dry areas not found",
            });
        }

        return { success: true, data: result, totalCount: totalCount };
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map(issue => `${issue.path.join('.')} - ${issue.message}`).join(', ');
            logger.warn({ context: 'api', error: errorMessages }, "[api] Validasi query parameter dry_areas.get gagal.");
            throw createError({ statusCode: 400, statusMessage: `Validasi gagal: ${errorMessages}` });
        }

        if (error.statusCode) throw error;

        logger.error({ context: 'api', error }, "[api] Kesalahan internal pada dry_areas.get.");
        throw createError({
            statusCode: 500,
            statusMessage: "Terjadi kesalahan komputasi internal pada peladen.",
        });
    }
});
