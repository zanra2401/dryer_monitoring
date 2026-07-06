import { LotStatus } from "~/generated/prisma/enums";
export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { lot_id } = body;

        const result = prisma.$transaction(async (prisma) => {
            const updateLot = await prisma.lot.update({
                where: {
                    lotId: lot_id,
                },
                data: {
                    status: LotStatus.DRIED,
                },
                select: {
                    lotNumber: true,
                }
            });

            const updateBin = await prisma.bin.updateMany({
                where: {
                    occupiedBy: updateLot.lotNumber,
                    binStatus: {
                        not: LotStatus.DRIED,
                    },
                },
                data: {
                    binStatus: LotStatus.DRIED,
                },
            });
        });

        return { success: true, data: result };
    } catch (error: unknown) {
        return error;
    }
});