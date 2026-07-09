import { Prisma } from "~/generated/prisma/client";
import { prisma } from "~~/server/utils/prisma";
import { requireAuthRole } from "~~/server/utils/auth";
import { hashUserPassword } from "~~/server/utils/password";
import { getRoleAccessAreaIds, isRole, ROLES, validateRoleAreaAccess } from "~~/server/utils/rbac";
import { ZodError, z } from "zod";

const bodySchema = z.object({
    user_id: z.coerce.number().int().positive(),
    username: z.string().trim().min(1).optional(),
    password: z.string().trim().min(1).optional(),
    full_name: z.string().trim().min(1).optional(),
    role: z.enum(ROLES).optional(),
    area_ids: z.array(z.coerce.number().int().positive()).optional(),
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
        const body = bodySchema.parse(await readBody(event));

        const existingUser = await prisma.user.findUnique({
            where: { userId: body.user_id },
            select: {
                userId: true,
                username: true,
                role: true,
                canAccess: {
                    select: {
                        areaId: true,
                    },
                },
            },
        });

        if (!existingUser) {
            setResponseStatus(event, 404);
            return { error: "User not found" };
        }

        const nextRole = body.role ?? existingUser.role;
        if (!isRole(nextRole)) {
            setResponseStatus(event, 409);
            return { error: "Current user role is invalid" };
        }

        const requestedAreaIds = body.area_ids ?? existingUser.canAccess.map((access) => access.areaId);
        const roleAccessError = validateRoleAreaAccess(nextRole, requestedAreaIds);
        if (roleAccessError) {
            setResponseStatus(event, 400);
            return { error: roleAccessError };
        }

        const accessAreaIds = getRoleAccessAreaIds(nextRole, requestedAreaIds);

        if (body.username && body.username !== existingUser.username) {
            const sameUsername = await prisma.user.findUnique({
                where: { username: body.username },
            });

            if (sameUsername) {
                setResponseStatus(event, 409);
                return { error: "Username already exists" };
            }
        }

        if (accessAreaIds.length > 0) {
            const areaCount = await prisma.dryerArea.count({
                where: {
                    areaId: {
                        in: accessAreaIds,
                    },
                },
            });

            if (areaCount !== accessAreaIds.length) {
                setResponseStatus(event, 404);
                return { error: "Dryer area not found" };
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { userId: body.user_id },
                data: {
                    ...(body.username !== undefined ? { username: body.username } : {}),
                    ...(body.password !== undefined ? { password: await hashUserPassword(body.password) } : {}),
                    ...(body.full_name !== undefined ? { fullName: body.full_name } : {}),
                    ...(body.role !== undefined ? { role: body.role } : {}),
                },
            });

            await tx.daccess.deleteMany({
                where: { userId: body.user_id },
            });

            if (accessAreaIds.length > 0) {
                await tx.daccess.createMany({
                    data: accessAreaIds.map((areaId) => ({
                        userId: body.user_id,
                        areaId,
                    })),
                });
            }

            return tx.user.findUnique({
                where: { userId: body.user_id },
                select: userSelect,
            });
        });

        return { success: true, data: result };
    } catch (error) {
        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return { error: "Invalid request body" };
        }
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            setResponseStatus(event, 409);
            return { error: "Username already exists" };
        }
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});
