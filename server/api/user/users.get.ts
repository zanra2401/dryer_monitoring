import { prisma } from "~~/server/utils/prisma";
import { ROLES } from "~~/server/utils/rbac";
import { ZodError, z } from "zod";

const querySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
    role: z.enum(ROLES).optional(),
    search: z.string().trim().min(1).optional(),
});

const userSelect = {
    userId: true,
    username: true,
    fullName: true,
    role: true,
    canAccess: {
        select: {
            userId: true,
            areaId: true,
            dryer: {
                select: {
                    areaId: true,
                    name: true,
                },
            },
        },
        orderBy: {
            areaId: "asc" as const,
        },
    },
};

export default defineEventHandler(async (event) => {
    try {
        const query = querySchema.parse(getQuery(event));

        const limit = query.limit ?? 10;
        const offset = query.offset ?? 0;
        const where = {
            ...(query.role ? { role: query.role } : {}),
            ...(query.search
                ? {
                    OR: [
                        { username: { contains: query.search } },
                        { fullName: { contains: query.search } },
                    ],
                }
                : {}),
        };

        const [result, totalCount] = await Promise.all([
            prisma.user.findMany({
                where,
                select: userSelect,
                skip: offset,
                take: limit,
                orderBy: {
                    userId: "desc",
                },
            }),
            prisma.user.count({ where }),
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
