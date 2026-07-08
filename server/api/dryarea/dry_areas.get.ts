import { requireAuthUser } from "~~/server/utils/auth";
import sqliteUtils from "~~/server/utils/sqlite";

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuthUser(event);
        const query = getQuery(event);

        const limit = query.limit ? parseInt(query.limit as string) : 10;
        const offset = query.offset ? parseInt(query.offset as string) : 0;
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
            : await sqliteUtils.getSystemFlag("dryCount");

        if (!result) {
            throw createError({
                statusCode: 404,
                statusMessage: "Dry areas not found",
            });
        }

        const normalizedTotalCount = typeof totalCount === "number"
            ? totalCount
            : totalCount
                ? parseInt(String(totalCount))
                : 0;

        return { success: true, data: result, totalCount: normalizedTotalCount };
    } catch (error) {
        return error;
    }
});
