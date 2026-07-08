export default defineEventHandler(async (event) => {
    try {
        const area_id = parseInt(getQuery(event).area_id as string);
        const bin_number = parseInt(getQuery(event).bin_number as string);

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
        return error;
    }

});