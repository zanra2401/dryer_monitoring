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

        const user = await prisma.user.findUnique({
            where: { userId: body.user_id },
            select: {
                userId: true,
                role: true,
                canAccess: {
                    select: {
                        areaId: true,
                    },
                },
            },
        });

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
            return { error: `${user.role} uses global dryer access` };
        }

        const hasAccess = user.canAccess.some((access) => access.areaId === body.area_id);
        if (!hasAccess) {
            setResponseStatus(event, 404);
            return { error: "Dryer access not found" };
        }

        if (user.canAccess.length <= 1) {
            setResponseStatus(event, 400);
            return { error: `${user.role} must have at least one dryer area` };
        }

        await prisma.daccess.delete({
            where: {
                areaId_userId: {
                    areaId: body.area_id,
                    userId: body.user_id,
                },
            },
        });

        return { success: true };
    } catch (error) {
         
        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return { error: "Invalid request body" };
        }
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});
