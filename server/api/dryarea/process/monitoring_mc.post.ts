import * as z from "zod";
import { Prisma } from "~/generated/prisma/client";
import { prisma } from "~~/server/utils/prisma";
import { logger } from "~~/server/utils/pino";
import { requireAuthRole } from "~~/server/utils/auth";

// Skema validasi Zod
const mcSchema = z.object({
    lot_id: z.number().int().positive("ID Lot harus bernilai positif"),
    target_time: z.string().datetime("Format waktu harus ISO-8601"),
    mc: z.number().positive("Kadar air (MC) harus bernilai positif"),
    remark: z.string().optional()
});

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuthRole(event, ["ADMIN", "OPERATOR"]);
        const body = await readBody(event);
        
        // Validasi payload
        const { lot_id, target_time, mc, remark } = mcSchema.parse(body);

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

        // Buat log MC baru (Append-Only)
        const mcLog = await prisma.lotMcLog.create({
            data: {
                lotId: lot_id,
                mc: mc,
                createdAt: new Date(target_time), // Menimpa @default(now())
                remark: remark
            }
        });

        logger.info({ context: 'api', lotId: lot_id }, `[api] Berhasil mencatat MC (${mc}%) untuk Lot ${lot_id}`);

        return { 
            success: true, 
            data: mcLog 
        };

    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map(issue => `${issue.path.join('.')} - ${issue.message}`).join(', ');
            logger.warn({ context: 'api', error: errorMessages }, "[api] Validasi pencatatan MC gagal.");
            throw createError({ statusCode: 400, statusMessage: `Validasi gagal: ${errorMessages}` });
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2034") {
                logger.warn({ context: 'database', error }, "[database] Terjadi Deadlock pada MySQL. Merespons dengan HTTP 409.");
                throw createError({ statusCode: 409, statusMessage: "Konflik penulisan data (Deadlock). Silakan coba lagi." });
            } else if (error.code === "P2002") {
                throw createError({ statusCode: 409, statusMessage: "Duplikasi data: Pelanggaran kunci unik." });
            } else if (error.code === "P2003") {
                throw createError({ statusCode: 400, statusMessage: "Pelanggaran relasi basis data (Kunci Asing tidak valid)." });
            } else if (error.code === "P2025") {
                throw createError({ statusCode: 404, statusMessage: "Data yang dituju tidak ditemukan." });
            }
        }
        if ((error as any).statusCode) throw error;
        logger.error({ context: 'api', error }, "[api] Kegagalan sistemik yang tidak terprediksi pada pencatatan MC.");
        throw createError({ statusCode: 500, statusMessage: "Terjadi kesalahan komputasi internal pada peladen." });
    }
});
