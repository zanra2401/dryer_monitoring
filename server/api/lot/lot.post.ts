import { prisma } from "~~/server/utils/prisma";
import { ZodError, z } from "zod";

const bodySchema = z.object({
    lot_number: z.string().trim().min(1, "lot_number is required"),
    hybrid: z.string().trim().min(1).optional().nullable(),
    quality: z.string().trim().min(1).optional().nullable(),
    net_to_bin: z.coerce.number().optional().nullable(),
    initial_mc: z.coerce.number().optional().nullable(),
    status: z.enum(["UPAIR", "DOWNAIR"]).optional(),
    created_by: z.coerce.number().int().positive(),
    bin_number: z.coerce.number().int().positive(),
    area_id: z.coerce.number().int().positive(),
    start_time: z.coerce.date().optional(),
    end_time: z.coerce.date().optional().nullable(),
});

export default defineEventHandler(async (event) => {
    try {
        const body = bodySchema.parse(await readBody(event));

        const [user, bin, activeLot] = await Promise.all([
            prisma.user.findUnique({
                where: { userId: body.created_by },
            }),
            prisma.bin.findUnique({
                where: {
                    binNumber_areaId: {
                        binNumber: body.bin_number,
                        areaId: body.area_id,
                    },
                },
            }),
            prisma.lot.findFirst({
                where: {
                    binNumber: body.bin_number,
                    areaId: body.area_id,
                    endTime: null,
                    status: {
                        in: ["UPAIR", "DOWNAIR"],
                    },
                },
            }),
        ]);

        if (!user) {
            setResponseStatus(event, 404);
            return { error: "User not found" };
        }

        if (!bin) {
            setResponseStatus(event, 404);
            return { error: "Bin not found" };
        }

        if (activeLot) {
            setResponseStatus(event, 409);
            return { error: "Bin already has an active lot" };
        }

        const lotStatus = body.status ?? "UPAIR";
        const isActiveLot = !body.end_time && ["UPAIR", "DOWNAIR"].includes(lotStatus);

        const result = await prisma.$transaction(async (tx) => {
            const createdLot = await tx.lot.create({
                data: {
                    lotNumber: body.lot_number,
                    hybrid: body.hybrid ?? null,
                    quality: body.quality ?? null,
                    netToBin: body.net_to_bin ?? null,
                    initialMc: body.initial_mc ?? null,
                    status: lotStatus,
                    createdBy: body.created_by,
                    binNumber: body.bin_number,
                    areaId: body.area_id,
                    startTime: body.start_time ?? new Date(),
                    endTime: body.end_time ?? null,
                },
            });

            await tx.bin.update({
                where: {
                    binNumber_areaId: {
                        binNumber: body.bin_number,
                        areaId: body.area_id,
                    },
                },
                data: {
                    occupiedBy: isActiveLot ? createdLot.lotId : null,
                    binStatus: isActiveLot ? lotStatus : "EMPTY",
                },
            });

            return createdLot;
        });

        setResponseStatus(event, 201);
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
