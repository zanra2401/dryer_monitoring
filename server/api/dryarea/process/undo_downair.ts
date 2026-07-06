import { BinStatus } from "~/generated/prisma/enums";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { lot_id } = body;
        const result = await prisma.$transaction(async (prisma) => {
            const log = await prisma.log.updateMany({
                where: {
                    lotId: lot_id,
                    statusBin: BinStatus.DOWNAIR,
                },
                data: {
                    statusBin: BinStatus.UPAIR,
                }
            });

            const updateLot = await prisma.lot.update({
                where: {
                    lotId: lot_id,
                },
                data: {
                    status: BinStatus.UPAIR,
                },
                select: {
                    lotNumber: true,
                }
            });

            const updateBin = await prisma.bin.updateMany({
                where: {
                    occupiedBy: updateLot.lotNumber,
                    binStatus: BinStatus.DOWNAIR,
                },
                data: {
                    binStatus: BinStatus.UPAIR,
                },
            });
        });

        
        return { success: true, data: result };
    }
    catch (error: unknown) {
        return error;
    }
});
