import { prisma } from "~~/server/utils/prisma"; 
import { requireAuthUser } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuthUser(event);

        // Only ADMIN should see this, or limit it to their areas, but system errors are usually admin-level
        if (user.role !== 'ADMIN') {
            throw createError({ statusCode: 403, statusMessage: "Forbidden" });
        }

        const unreadErrors = await prisma.fetchErrorMaster.findMany({
            where: {
                isRead: false
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100,
            include: {
                details: true
            }
        });

        return {
            success: true,
            data: unreadErrors
        };

    } catch (error: any) {
        if (error.statusCode) throw error;
        throw createError({ statusCode: 500, statusMessage: "Gagal memuat log error: " + error.message });
    }
});
