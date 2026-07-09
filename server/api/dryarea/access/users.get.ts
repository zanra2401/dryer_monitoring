import { prisma } from "~~/server/utils/prisma";
import { requireAuthRole } from "~~/server/utils/auth";
import { ROLES } from "~~/server/utils/rbac";
import { ZodError, z } from "zod";

const querySchema = z.object({
    area_id: z.coerce.number().int().positive(),
    search: z.string().trim().optional(),
    role: z.enum(ROLES).optional(),
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
        const search = query.search?.trim();

        const area = await prisma.dryerArea.findUnique({
            where: { areaId: query.area_id },
            select: {
                areaId: true,
                name: true,
            },
        });

        if (!area) {
            setResponseStatus(event, 404);
            return { error: "Dryer area not found" };
        }

        const assignedWhere = {
            canAccess: {
                some: {
                    areaId: query.area_id,
                },
            },
            ...(query.role ? { role: query.role } : {}),
            ...(search
                ? {
                    OR: [
                        { username: { contains: search } },
                        { fullName: { contains: search } },
                    ],
                }
                : {}),
        };

        const candidateWhere = {
            role: {
                in: ["OPERATOR", "CLIENT"],
            },
            canAccess: {
                none: {
                    areaId: query.area_id,
                },
            },
            ...(search
                ? {
                    OR: [
                        { username: { contains: search } },
                        { fullName: { contains: search } },
                    ],
                }
                : {}),
        };

        const [assignedUsers, candidateUsers] = await Promise.all([
            prisma.user.findMany({
                where: assignedWhere,
                select: userSelect,
                orderBy: [
                    { role: "asc" },
                    { fullName: "asc" },
                ],
            }),
            prisma.user.findMany({
                where: candidateWhere,
                select: userSelect,
                take: 100,
                orderBy: [
                    { role: "asc" },
                    { fullName: "asc" },
                ],
            }),
        ]);

        return {
            success: true,
            data: {
                area,
                assignedUsers,
                candidateUsers,
            },
        };
    } catch (error) {
         
        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return { error: "Invalid query parameter" };
        }
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});
