import { prisma } from "~~/server/utils/prisma";
import { requireAuthUser } from "~~/server/utils/auth";
import { isLimitedAreaRole } from "~~/server/utils/rbac";
import { ZodError, z } from "zod";

const querySchema = z.object({
    area_id: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
    try {
        const sessionUser = await requireAuthUser(event);
        const query = querySchema.parse(getQuery(event));

        if (isLimitedAreaRole(sessionUser.role) && !sessionUser.areaIds.includes(query.area_id)) {
            setResponseStatus(event, 403);
            return { error: "Insufficient permission for this dryer area" };
        }

        const users = await prisma.user.findMany({
            where: {
                role: "OPERATOR",
                canAccess: {
                    some: {
                        areaId: query.area_id,
                    },
                },
            },
            select: {
                userId: true,
                username: true,
                fullName: true,
            },
            orderBy: [
                { fullName: "asc" },
                { username: "asc" },
            ],
        });

        return { success: true, data: users };
    } catch (error) {
        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return { error: "Invalid query parameter" };
        }
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});
