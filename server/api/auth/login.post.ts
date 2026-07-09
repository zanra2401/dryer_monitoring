import { prisma } from "~~/server/utils/prisma";
import { verifyUserPassword } from "~~/server/utils/password";
import { toAuthUser } from "~~/server/utils/auth";
import { ZodError, z } from "zod";

const bodySchema = z.object({
    username: z.string().trim().min(1, "username is required"),
    password: z.string().min(1, "password is required"),
});

const userSelect = {
    userId: true,
    username: true,
    password: true,
    fullName: true,
    role: true,
    canAccess: {
        select: {
            areaId: true,
        },
        orderBy: {
            areaId: "asc" as const,
        },
    },
};

export default defineEventHandler(async (event) => {
    try {
        const body = bodySchema.parse(await readBody(event));

        const user = await prisma.user.findUnique({
            where: { username: body.username },
            select: userSelect,
        });

        if (!user || !(await verifyUserPassword(body.password, user.password))) {
            setResponseStatus(event, 401);
            return { error: "Invalid username or password" };
        }

        const authUser = toAuthUser(user);

        await setUserSession(event, {
            user: authUser,
            loggedInAt: Date.now(),
        });

        return { success: true, data: authUser };
    } catch (error) {
         
        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return { error: "Invalid request body" };
        }
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});
