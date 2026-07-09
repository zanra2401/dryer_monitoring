import { Prisma } from "~/generated/prisma/client";
import { prisma } from "~~/server/utils/prisma";
import { requireAuthRole } from "~~/server/utils/auth";
import { isGlobalRole, isRole } from "~~/server/utils/rbac";
import { ZodError, z } from "zod";

const bodySchema = z.object({
    area_id: z.coerce.number().int().positive(),
    user_id: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
    await requireAuthRole(event, ["ADMIN"]);

    try {
        const body = bodySchema.parse(await readBody(event));

        const [area, user] = await Promise.all([
            prisma.dryerArea.findUnique({
                where: { areaId: body.area_id },
                select: { areaId: true },
            }),
            prisma.user.findUnique({
                where: { userId: body.user_id },
                select: {
                    userId: true,
                    role: true,
                },
            }),
        ]);

        if (!area) {
            setResponseStatus(event, 404);
            return { error: "Dryer area not found" };
        }

        if (!user) {
            setResponseStatus(event, 404);
            return { error: "User not found" };
        }

        if (!isRole(user.role)) {
            setResponseStatus(event, 409);
            return { error: "User role is invalid" };
        }

        if (isGlobalRole(user.role)) {
            setResponseStatus(event, 400);
            return { error: `${user.role} already has global dryer access` };
        }

        await prisma.daccess.create({
            data: {
                areaId: body.area_id,
                userId: body.user_id,
            },
        });

        return { success: true };
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
            return { error: "User already has access to this dryer area" };
        }
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});
