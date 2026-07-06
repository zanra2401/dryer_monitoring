import { prisma } from "~~/server/utils/prisma";
import { ZodError, z } from "zod";

const bodySchema = z.object({
    user_id: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
    try {
        const body = bodySchema.parse(await readBody(event));

        const existingUser = await prisma.user.findUnique({
            where: { userId: body.user_id },
            select: {
                userId: true,
                username: true,
                fullName: true,
                role: true,
            },
        });

        if (!existingUser) {
            setResponseStatus(event, 404);
            return { error: "User not found" };
        }

        const lotCount = await prisma.lot.count({
            where: { createdBy: body.user_id },
        });

        if (lotCount > 0) {
            setResponseStatus(event, 409);
            return { error: "User has created lots and cannot be deleted" };
        }

        await prisma.$transaction(async (tx) => {
            await tx.daccess.deleteMany({
                where: { userId: body.user_id },
            });

            await tx.user.delete({
                where: { userId: body.user_id },
            });
        });

        return { success: true, data: existingUser };
    } catch (error) {
        console.log(error);
        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return { error: "Invalid request body" };
        }
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});
