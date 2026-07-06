import { Prisma } from "~/generated/prisma/client";
import { prisma } from "~~/server/utils/prisma";
import { hashPassword } from "~~/server/utils/password";
import { getRoleAccessAreaIds, ROLES, validateRoleAreaAccess } from "~~/server/utils/rbac";
import { ZodError, z } from "zod";

const bodySchema = z.object({
    username: z.string().trim().min(1, "username is required"),
    password: z.string().trim().min(1, "password is required"),
    full_name: z.string().trim().min(1, "full_name is required"),
    role: z.enum(ROLES),
    area_ids: z.array(z.coerce.number().int().positive()).optional().default([]),
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
        const body = bodySchema.parse(await readBody(event));

        const roleAccessError = validateRoleAreaAccess(body.role, body.area_ids);
        if (roleAccessError) {
            setResponseStatus(event, 400);
            return { error: roleAccessError };
        }

        const accessAreaIds = getRoleAccessAreaIds(body.role, body.area_ids);
        const sameUsername = await prisma.user.findUnique({
            where: { username: body.username },
        });

        if (sameUsername) {
            setResponseStatus(event, 409);
            return { error: "Username already exists" };
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
            const createdUser = await tx.user.create({
                data: {
                    username: body.username,
                    password: hashPassword(body.password),
                    fullName: body.full_name,
                    role: body.role,
                },
            });

            if (accessAreaIds.length > 0) {
                await tx.daccess.createMany({
                    data: accessAreaIds.map((areaId) => ({
                        userId: createdUser.userId,
                        areaId,
                    })),
                });
            }

            return tx.user.findUnique({
                where: { userId: createdUser.userId },
                select: userSelect,
            });
        });

        setResponseStatus(event, 201);
        return { success: true, data: result };
    } catch (error) {
        console.log(error);
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
