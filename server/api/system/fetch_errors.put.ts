import { prisma } from "~~/server/utils/prisma"; 
import { requireAuthUser } from "~~/server/utils/auth";
import * as z from "zod";

const markReadSchema = z.object({
    errorId: z.number().int().positive("Error ID tidak valid"),
});

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuthUser(event);

        if (user.role !== 'ADMIN') {
            throw createError({ statusCode: 403, statusMessage: "Forbidden" });
        }

        const body = await readBody(event);
        const { errorId } = markReadSchema.parse(body);

        const updated = await prisma.fetchErrorMaster.update({
            where: { errorId },
            data: { isRead: true }
        });

        return {
            success: true,
            data: updated
        };

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            throw createError({ statusCode: 400, statusMessage: "Validasi parameter gagal." });
        }
        if (error.statusCode) throw error;
        throw createError({ statusCode: 500, statusMessage: "Gagal memperbarui status log error: " + error.message });
    }
});
