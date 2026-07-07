import { prisma } from "~~/server/utils/prisma";
import { ZodError, z } from "zod";

const querySchema = z.object({
    lot_id: z.coerce.number().int().positive(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
});

export default defineEventHandler(async (event) => {
    try {
        const query = querySchema.parse(getQuery(event));

        const existingLot = await prisma.lot.findUnique({
            where: {
                lotId: query.lot_id,
            },
            select: {
                lotId: true,
            },
        });

        if (!existingLot) {
            setResponseStatus(event, 404);
            return { error: "Lot not found" };
        }

        const limit = query.limit ?? 10;
        const offset = query.offset ?? 0;
        const where = {
            lotId: query.lot_id,
        };

        const [result, totalCount] = await Promise.all([
            prisma.log.findMany({
                where,
                skip: offset,
                take: limit,
                orderBy: [
                    {
                        timestampThingspeak: "desc",
                    },
                    {
                        logId: "desc",
                    },
                ],
            }),
            prisma.log.count({ where }),
        ]);

        return { success: true, data: result, totalCount };
    } catch (error) {
        console.log(error);
        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return { error: "Invalid query parameter" };
        }
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});
