import { prisma } from "~~/server/utils/prisma";
import { isLogInsideLotRange } from "~~/server/utils/lot-log";
import { ZodError, z } from "zod";
import { requireAuthRole } from "~~/server/utils/auth";

const bodySchema = z.object({
    lot_id: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
    try {
        await requireAuthRole(event, ["ADMIN"]);
        const body = bodySchema.parse(await readBody(event));

        const existingLot = await prisma.lot.findUnique({
            where: { lotId: body.lot_id },
        });

        if (!existingLot) {
            setResponseStatus(event, 404);
            return { error: "Lot not found" };
        }

        const result = await prisma.$transaction(async (tx) => {
            const relatedBinLogs = await tx.binLog.findMany({
                where: {
                    binNumber: existingLot.binNumber,
                    areaId: existingLot.areaId,
                    timestampThingspeak: existingLot.endTime
                        ? {
                            gte: existingLot.startTime,
                            lte: existingLot.endTime,
                        }
                        : {
                            gte: existingLot.startTime,
                        },
                },
                select: {
                    binLogId: true,
                    timestampThingspeak: true,
                },
            });

            await tx.lotMcLog.deleteMany({
                where: {
                    lotId: body.lot_id,
                },
            });

            const binLogIdsToDelete = relatedBinLogs
                .filter((binLog) => isLogInsideLotRange(binLog.timestampThingspeak, existingLot))
                .map((binLog) => binLog.binLogId);

            if (binLogIdsToDelete.length > 0) {
                await tx.binLog.deleteMany({
                    where: {
                        binLogId: {
                            in: binLogIdsToDelete,
                        },
                    },
                });
            }

            await tx.bin.updateMany({
                where: {
                    binNumber: existingLot.binNumber,
                    areaId: existingLot.areaId,
                    occupiedBy: existingLot.lotNumber,
                },
                data: {
                    occupiedBy: null,
                    binStatus: "EMPTY",
                },
            });

            const deletedLot = await tx.lot.delete({
                where: { lotId: body.lot_id },
            });

            return deletedLot;
        });

        return { success: true, data: result };
    } catch (error) {
         
        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return { error: "Invalid request body" };
        }
        if ((error as any).statusCode) throw error;
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});
