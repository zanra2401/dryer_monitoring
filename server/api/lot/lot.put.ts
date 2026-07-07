import { prisma } from "~~/server/utils/prisma";
import { ZodError, z } from "zod";

const bodySchema = z.object({
    lot_id: z.coerce.number().int().positive(),
    lot_number: z.string().trim().min(1).optional(),
    hybrid: z.string().trim().min(1).optional().nullable(),
    quality: z.string().trim().min(1).optional().nullable(),
    net_to_bin: z.coerce.number().optional().nullable(),
    initial_mc: z.coerce.number().optional().nullable(),
    status: z.enum(["UPAIR", "DOWNAIR", "DRIED"]).optional(),
    bin_number: z.coerce.number().int().positive().optional(),
    area_id: z.coerce.number().int().positive().optional(),
    start_time: z.coerce.date().optional(),
    end_time: z.coerce.date().optional().nullable(),
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

        const nextBinNumber = body.bin_number ?? existingLot.binNumber;
        const nextAreaId = body.area_id ?? existingLot.areaId;
        const nextStatus = body.status ?? existingLot.status;
        const nextEndTime = body.end_time === undefined ? existingLot.endTime : body.end_time;

        const targetBin = await prisma.bin.findUnique({
            where: {
                binNumber_areaId: {
                    binNumber: nextBinNumber,
                    areaId: nextAreaId,
                },
            },
        });

        if (!targetBin) {
            setResponseStatus(event, 404);
            return { error: "Bin not found" };
        }

        if (body.lot_number !== undefined) {
            const sameLotNumber = await prisma.lot.findUnique({
                where: { lotNumber: body.lot_number },
            });

            if (sameLotNumber && sameLotNumber.lotId !== body.lot_id) {
                setResponseStatus(event, 409);
                return { error: "Lot number already exists" };
            }
        }

        const activeLotConflict = await prisma.lot.findFirst({
            where: {
                lotId: {
                    not: body.lot_id,
                },
                binNumber: nextBinNumber,
                areaId: nextAreaId,
                endTime: null,
                status: {
                    in: ["UPAIR", "DOWNAIR"],
                },
            },
        });

        if (activeLotConflict && nextEndTime === null) {
            setResponseStatus(event, 409);
            return { error: "Bin already has an active lot" };
        }

        const oldBinKey = {
            binNumber: existingLot.binNumber,
            areaId: existingLot.areaId,
        };
        const newBinKey = {
            binNumber: nextBinNumber,
            areaId: nextAreaId,
        };
        const isSameBin = oldBinKey.binNumber === newBinKey.binNumber && oldBinKey.areaId === newBinKey.areaId;
        const shouldOccupyBin = nextEndTime === null && ["UPAIR", "DOWNAIR", "DRIED"].includes(nextStatus);

        const result = await prisma.$transaction(async (tx) => {
            const updatedLot = await tx.lot.update({
                where: { lotId: body.lot_id },
                data: {
                    ...(body.lot_number !== undefined ? { lotNumber: body.lot_number } : {}),
                    ...(body.hybrid !== undefined ? { hybrid: body.hybrid } : {}),
                    ...(body.quality !== undefined ? { quality: body.quality } : {}),
                    ...(body.net_to_bin !== undefined ? { netToBin: body.net_to_bin } : {}),
                    ...(body.initial_mc !== undefined ? { initialMc: body.initial_mc } : {}),
                    ...(body.status !== undefined ? { status: body.status } : {}),
                    ...(body.bin_number !== undefined ? { binNumber: body.bin_number } : {}),
                    ...(body.area_id !== undefined ? { areaId: body.area_id } : {}),
                    ...(body.start_time !== undefined ? { startTime: body.start_time } : {}),
                    ...(body.end_time !== undefined ? { endTime: body.end_time } : {}),
                },
            });

            if (!isSameBin) {
                await tx.bin.update({
                    where: {
                        binNumber_areaId: oldBinKey,
                    },
                    data: {
                        occupiedBy: null,
                        binStatus: "EMPTY",
                    },
                });
            }

            await tx.bin.update({
                where: {
                    binNumber_areaId: newBinKey,
                },
                data: {
                    occupiedBy: shouldOccupyBin ? updatedLot.lotNumber : null,
                    binStatus: shouldOccupyBin ? nextStatus : "EMPTY",
                },
            });

            return updatedLot;
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
