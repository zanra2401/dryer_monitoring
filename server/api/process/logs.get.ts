export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const { lot_number, offset } = query;
    try {
        const log = await prisma.$transaction(async (tx) => {
            const lot = await tx.lot.findUnique({
                where: {
                    lotNumber: lot_number as string,
                },
                select: {
                    lotId: true,
                },
            });

            const log = await tx.log.findMany({
                where: {
                    lotId: lot?.lotId,
                },
                orderBy: {
                    logId: 'desc',
                },
                skip: offset ? parseInt(offset as string) : 0,
                take: 15,
            });

            return log;
        });

        return {
            success: true,
            data: log,            
        }
    } catch (error) {
        return error;
    }
});