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

            const logs = await prisma.log.findMany({
                where: {
                    lotId: lot?.lotId,
                },
                orderBy: {
                    logId: 'desc',
                },
                take: 15
            });

            const countLog = await prisma.log.count({
                where: {
                    lotId: lot?.lotId,
                },
            });

            return {
                lot: lot,
                log: logs,
                countLog: countLog,
            };
        });

        return { success: true, data: lot_log };
    } catch (error) {
        return error;
    }
});