import sqliteUtils from "~~/server/utils/sqlite";

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);

        const limit = query.limit ? parseInt(query.limit as string) : 10;
        const offset = query.offset ? parseInt(query.offset as string) : 0;

        const result = await prisma.dryerArea.findMany({
            skip: offset,
            take: limit,
        });
        const totalCount = await sqliteUtils.getSystemFlag("dryCount");

        if (!result) {
            throw createError({
                statusCode: 404,
                statusMessage: "Dry areas not found",
            });
        }

        return { success: true, data: result, totalCount: totalCount ? parseInt(totalCount as string) : 0 };
    } catch (error) {
        return error;
    }
});