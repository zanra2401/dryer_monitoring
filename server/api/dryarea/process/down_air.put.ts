import { BinStatus } from "~/generated/prisma/enums";
import { LotStatus } from "~/generated/prisma/enums";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { time, lot_id } = body;
        console.log("time", new Date(time));
        const result = await prisma.$transaction(async (prisma) => {
            const log = await prisma.log.updateMany({
                where: {
                    lotId: lot_id,
                    timestampThingspeak: {
                        gte: new Date(time),
                    }
                },
                data: {
                    statusBin: BinStatus.DOWNAIR,
                }
            });

            const updateLot = await prisma.lot.update({
                where: {
                    lotId: lot_id,
                },
                data: {
                    status: LotStatus.DOWNAIR,
                    downAirAt: new Date(time),
                },
                select: {
                    lotNumber: true,
                }
            }); 

            const updateBin = await prisma.bin.updateMany({
                where: {
                    occupiedBy: updateLot.lotNumber,
                    binStatus: BinStatus.UPAIR, 
                },
                data: {
                    binStatus: BinStatus.DOWNAIR,
                },
            });
        });

        return { success: true, data: result };
    } catch (error: unknown) {
        return error;
    }
});