import { LotStatus } from "~/generated/prisma/enums";

export default defineEventHandler(async (event) => {
    try {
        const area_id = parseInt(getQuery(event).area_id as string);
        const result = await prisma.$transaction(async (prisma) => {
            const bin = await prisma.bin.findMany({
               where: { areaId: area_id },
            });

            const lot = await prisma.lot.findMany({
                where: { areaId: area_id, status: { not: LotStatus.DRIED }},
            });

            const binWithLot = bin.map((b) => {
                const occupiedLot = lot.find((l) => l.binNumber === b.binNumber);
                return {
                    ...b,
                    occupiedBy: occupiedLot ? occupiedLot.lotNumber : null,
                    netToBin: occupiedLot ? occupiedLot.netToBin : null,
                    initialMc: occupiedLot ? occupiedLot.initialMc : null,
                    hybrid: occupiedLot ? occupiedLot.hybrid : null,
                    quality: occupiedLot ? occupiedLot.quality : null,
                    startTime: occupiedLot ? occupiedLot.startTime : null,  
                };
            });

            return binWithLot;
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