import { BinStatus } from "~/generated/prisma/enums";
import { Prisma } from "~/generated/prisma/client";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event); 
        const { lot_id } = body;

        const result = await prisma.$transaction(async (prisma) => {
            const updateLot = await prisma.lot.delete({
                where: {
                    lotId: lot_id,
                },
                select: {
                    lotNumber: true,
                    areaId: true,
                    binNumber: true,
                }
            });

            const updateBin = await prisma.bin.update({
                where: {
                    binNumber_areaId: {
                        binNumber: updateLot.binNumber,
                        areaId: updateLot.areaId, // Assuming areaId is not needed for deletion
                    },
                    occupiedBy: updateLot.lotNumber,
                },
                data: {
                    binStatus: BinStatus.EMPTY,
                    occupiedBy: null,
                },
            });
        });

        return { success: true, data: result };
    } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                throw createError({
                    statusCode: 404,
                    statusMessage: "Lot not found",
                });
            }
        }
        throw error; 
    }
});