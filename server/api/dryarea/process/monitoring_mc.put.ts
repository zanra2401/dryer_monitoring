import * as z from "zod";
import { Prisma } from "~/generated/prisma/client";
import { prisma } from "~~/server/utils/prisma";
import { logger } from "~~/server/utils/pino";
import { requireAuthRole } from "~~/server/utils/auth";

const mcUpdateSchema = z.object({
    lot_id: z.number().int().positive("ID Lot harus bernilai positif"),
    target_time: z.string().datetime("Format waktu harus ISO-8601"),
    mc: z.number().positive("Kadar air (MC) harus bernilai positif"),
    remark: z.string().optional()
});

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuthRole(event, ["ADMIN", "OPERATOR", "MANAGER"]);
        const body = await readBody(event);
        const { lot_id, target_time, mc, remark } = mcUpdateSchema.parse(body);

        // Pastikan Lot eksis
        const lot = await prisma.lot.findUnique({
            where: { lotId: lot_id }
        });

        if (!lot) {
            throw createError({ statusCode: 404, statusMessage: "Data Lot tidak ditemukan." });
        }

        if (user.role === "OPERATOR" && !user.areaIds.includes(lot.areaId)) {
            throw createError({ statusCode: 403, statusMessage: "Izin tidak cukup untuk memodifikasi lot di area ini." });
        }

        // Normalisasi waktu: potong sampai level menit (buang detik & milidetik)
        const targetDate = new Date(target_time);
        const windowStart = new Date(targetDate);
        windowStart.setSeconds(0, 0); // Set detik dan ms ke 0
        const windowEnd = new Date(windowStart);
        windowEnd.setMinutes(windowStart.getMinutes() + 1); // +1 menit sebagai batas atas

        // Cari LotMcLog yang createdAt-nya berada dalam window 1 menit tersebut
        const existingLog = await prisma.lotMcLog.findFirst({
            where: {
                lotId: lot_id,
                createdAt: {
                    gte: windowStart,
                    lt: windowEnd
                }
            }
        });

        if (!existingLog) {
            throw createError({
                statusCode: 404,
                statusMessage: "Data MC pada interval waktu tersebut tidak ditemukan. Gunakan POST untuk membuat data baru."
            });
        }

        // Perbarui data MC yang sudah ada
        const updatedLog = await prisma.lotMcLog.update({
            where: { lotMcLogId: existingLog.lotMcLogId },
            data: {
                mc: mc,
                remark: remark
            }
        });

        logger.info({ context: 'api', lotId: lot_id }, `[api] Berhasil memperbarui MC (${mc}%) untuk Lot ${lot_id} pada interval ${windowStart.toISOString()}`);

        return {
            success: true,
            data: updatedLog
        };

    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map(issue => `${issue.path.join('.')} - ${issue.message}`).join(', ');
            logger.warn({ context: 'api', error: errorMessages }, "[api] Validasi pembaruan MC gagal.");
            throw createError({ statusCode: 400, statusMessage: `Validasi gagal: ${errorMessages}` });
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2034") {
                throw createError({ statusCode: 409, statusMessage: "Konflik penulisan data (Deadlock). Silakan coba lagi." });
            } else if (error.code === "P2025") {
                throw createError({ statusCode: 404, statusMessage: "Data yang dituju tidak ditemukan." });
            }
        }
        if ((error as any).statusCode) throw error;
        logger.error({ context: 'api', error }, "[api] Kegagalan sistemik pada pembaruan MC.");
        throw createError({ statusCode: 500, statusMessage: "Terjadi kesalahan komputasi internal pada peladen." });
    }
});
