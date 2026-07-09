export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const { lot_number } = query;
    try {
        const lot_log = await prisma.$transaction(async (prisma) => {
            const lot = await prisma.lot.findUnique({
                where: {
                    lotNumber: lot_number as string,
                },
            });

            if (!lot) {
                throw createError({
                    statusCode: 404,
                    statusMessage: "Lot not found",
                });
            }

            return {
                lot: lot,
            };
        });

        return { success: true, data: lot_log };
    } catch (error) {
        return error;
    }
});