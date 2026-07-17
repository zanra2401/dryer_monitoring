import { Prisma } from "~/generated/prisma/client";
import { BinStatus, LotStatus } from "~/generated/prisma/enums";
import * as z from "zod";
import { prisma } from "~~/server/utils/prisma"; 
import { logger } from "~~/server/utils/pino"; 
import { requireAuthRole } from "~~/server/utils/auth";

// 1. Deklarasi Skema Keamanan
const endDryingSchema = z.object({
    lot_id: z.number().min(1, "ID Lot tidak valid"),
    time: z.string().min(1, "Waktu selesai wajib diisi"),
});

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuthRole(event, ["ADMIN", "OPERATOR", "MANAGER"]);
        const rawBody = await readBody(event);
        const { lot_id, time } = endDryingSchema.parse(rawBody);
        const endTimeStr = new Date(time).toISOString();

        const result = await prisma.$transaction(async (tx) => {
            const lot = await tx.lot.findUnique({ where: { lotId: lot_id } });

            if (!lot) {
                throw createError({ statusCode: 404, statusMessage: "Data Lot tidak ditemukan." });
            }

            if (user.role === "OPERATOR" && !user.areaIds.includes(lot.areaId)) {
                throw createError({ statusCode: 403, statusMessage: "Izin tidak cukup untuk menyelesaikan pengeringan di area ini." });
            }

            // Guard Clause: Tolak jika masih UPAIR
            if (lot.status === 'UPAIR') {
                throw createError({ 
                    statusCode: 403, 
                    statusMessage: "Operasi ditolak: Proses harus melalui tahap Set DownAir sebelum dapat di-Stop." 
                });
            }

            const mcLog = await tx.lotMcLog.findFirst({
                where: { lotId: lot_id, createdAt: { lte: endTimeStr } },
                select: { mc: true },
                orderBy: { createdAt: 'desc' },
                take: 1,
            });
            const updateLot = await tx.lot.update({
                where: { lotId: lot_id },
                data: {
                    status: LotStatus.COMPLETED,
                    endTime: endTimeStr,
                    endMC: mcLog?.mc ?? null,
                },
                // [KOREKSI] Tarik binNumber dari pangkalan data untuk presisi penghapusan
                select: { 
                    lotNumber: true,
                    binNumber: true 
                },
            });

            const updateBin = await tx.bin.updateMany({
                where: {
                    occupiedBy: updateLot.lotNumber,
                    NOT: { binStatus: BinStatus.EMPTY },
                },
                data: { binStatus: BinStatus.EMPTY, occupiedBy: null, },
            });

            return updateLot; // Sekarang objek ini memuat binNumber
        });

        return { success: true, data: result };

    } catch (error: unknown) {
        // 4. [KOREKSI] Standardisasi Respons Galat
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map(issue => `${issue.path.join('.')} - ${issue.message}`).join(', ');
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
        logger.error({ context: 'api', error }, `[api] Kegagalan sistemik yang tidak terprediksi pada saat mengakhiri Lot.`);
        throw createError({ statusCode: 500, statusMessage: "Terjadi kesalahan komputasi internal pada peladen." });
    }
});
