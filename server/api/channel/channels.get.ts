export default defineEventHandler(async (event) => {
    try {
        const area_id = parseInt(getQuery(event).area_id as string);
        const result = await prisma.channel.findMany({
            where: { areaId: area_id },
        });

        if (result.length < 1) {
            throw createError({
                statusCode: 404,
                statusMessage: "Channel not found",
            });
        }

        return { success: true, data: result };

    } catch (err) {
         
        setResponseStatus(event, 500);
        throw err;
    }
});