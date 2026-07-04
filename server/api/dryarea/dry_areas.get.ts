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
            setResponseStatus(event, 404);
            return { error: "Dryer area not found" };
        }

        return { success: true, data: result, totalCount: totalCount ? parseInt(totalCount as string) : 0 };

    } catch (error) {
        console.log(error);
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});