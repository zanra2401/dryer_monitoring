import { prisma } from "~~/server/utils/prisma";
import { ZodError, z } from "zod";

const querySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
    area_id: z.coerce.number().int().positive().optional(),
    bin_number: z.coerce.number().int().positive().optional(),
    status: z.enum(["UPAIR", "DOWNAIR"]).optional(),
});

export default defineEventHandler(async (event) => {
    try {
        const query = querySchema.parse(getQuery(event));

        const limit = query.limit ?? 10;
        const offset = query.offset ?? 0;

        const where = {
            ...(query.area_id ? { areaId: query.area_id } : {}),
            ...(query.bin_number ? { binNumber: query.bin_number } : {}),
            ...(query.status ? { status: query.status } : {}),
        };

        const [result, totalCount] = await Promise.all([
            prisma.lot.findMany({
                where,
                skip: offset,
                take: limit,
                orderBy: {
                    startTime: "desc",
                },
            }),
            prisma.lot.count({ where }),
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
