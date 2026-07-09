import { prisma } from "~~/server/utils/prisma";
import { requireAuthRole } from "~~/server/utils/auth";
import { ROLES } from "~~/server/utils/rbac";
import { ZodError, z } from "zod";

const normalizeStringArray = (value: unknown) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    const values = Array.isArray(value) ? value : [value];

    return values
        .flatMap((item) => typeof item === "string" ? item.split(",") : [item])
        .filter((item): item is string => typeof item === "string" && item.length > 0);
};

const querySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
    role: z.enum(ROLES).optional(),
    roles: z.preprocess(normalizeStringArray, z.array(z.enum(ROLES)).optional()),
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
    await requireAuthRole(event, ["ADMIN"]);

    try {
        const query = querySchema.parse(getQuery(event));

        const limit = query.limit ?? 10;
        const offset = query.offset ?? 0;
        const roles = query.roles && query.roles.length > 0
            ? [...new Set(query.roles)]
            : undefined;
        const where = {
            ...(roles
                ? {
                    role: {
                        in: roles,
                    },
                }
                : query.role
                    ? { role: query.role }
                    : {}),
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
        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return { error: "Invalid query parameter" };
        }
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});
