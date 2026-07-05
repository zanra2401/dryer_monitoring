import { prisma } from "~~/server/utils/prisma";
import { ZodError, z } from "zod";

const bodySchema = z.object({
    lot_id: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
    try {
        const body = bodySchema.parse(await readBody(event));

        const existingLot = await prisma.lot.findUnique({
            where: { lotId: body.lot_id },
        });

        if (!existingLot) {
            setResponseStatus(event, 404);
            return { error: "Lot not found" };
        }

        const result = await prisma.$transaction(async (tx) => {
            await tx.log.deleteMany({
                where: {
                    lotId: body.lot_id,
                },
            });

            await tx.bin.updateMany({
                where: {
                    binNumber: existingLot.binNumber,
                    areaId: existingLot.areaId,
                    occupiedBy: body.lot_id,
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
        console.log(error);
        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return { error: "Invalid request body" };
        }
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});
