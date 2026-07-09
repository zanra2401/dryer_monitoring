import { Prisma } from "~/generated/prisma/client";
import * as z from "zod";
import { BinStatus } from "~/generated/prisma/client";
import log from "~~/server/utils/log";
import { prisma } from "~~/server/utils/prisma"; 
import { logger } from "~~/server/utils/pino";
import { requireAuthRole } from "~~/server/utils/auth";

// 1. Deklarasi Skema Zod yang Absolut
const startDryingSchema = z.object({
    lot_number: z.string().min(1, "Nomor Lot wajib diisi"),
    hybrid: z.string().min(1, "Varietas wajib diisi"),
    quality: z.string().min(1, "Kualitas wajib diisi"),
    net_to_bin: z.number().min(0, "Berat bersih ke Bin wajib diisi"),
    initial_mc: z.number().min(0, "Kadar air awal wajib diisi"),
    start_time: z.string().min(1, "Waktu mulai wajib diisi"),
    area_id: z.number().min(1, "ID Area wajib diisi"),
    depth: z.number().min(1, "Kedalaman wajib diisi"),
    bin_number: z.number().min(1, "Nomor Bin wajib diisi"),
});

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuthRole(event, ["ADMIN", "OPERATOR"]);
        const rawBody = await readBody(event);
        
        // Eksekusi Validasi Zod (Akan otomatis melempar galat ke blok catch jika format salah)
        const body = startDryingSchema.parse(rawBody);
        
        if (user.role === "OPERATOR" && !user.areaIds.includes(body.area_id)) {
            throw createError({ statusCode: 403, statusMessage: "Izin tidak cukup untuk memulai pengeringan di area ini." });
        }
        
        const startDate = log.to_valid_date(body.start_time);
        if (log.is_future_date(startDate)) {
            throw createError({ statusCode: 400, statusMessage: "Waktu mulai tidak boleh berada di masa depan." });
        }

        // 2. Tarik Konfigurasi Bin SEBELUM membuka transaksi basis data
        const binConfig = await prisma.bin.findUnique({
            where: { binNumber_areaId: { areaId: body.area_id, binNumber: body.bin_number } },
            include: { channel: true }
        });

        if (!binConfig) {
            throw createError({ statusCode: 404, statusMessage: "Konfigurasi Bin tidak ditemukan." });
        }

        if (!binConfig.fieldTempTop || !binConfig.fieldRhTop || !binConfig.fieldTempBottom || !binConfig.fieldRhBottom) {
            throw createError({ statusCode: 500, statusMessage: "Pemetaan field sensor pada Bin belum dikonfigurasi." });
        }

        // 3. Transaksi Basis Data Berkinerja Tinggi (Hanya I/O Lokal)
        const result = await prisma.$transaction(async (tx) => {
            const lotData = await tx.lot.create({
                data: {
                    lotNumber: body.lot_number,
                    hybrid: body.hybrid,
                    quality: body.quality,
                    netToBin: body.net_to_bin,
                    initialMc: body.initial_mc,
                    startTime: startDate,
                    areaId: body.area_id,
                    binNumber: body.bin_number,
                    status: "UPAIR"
                },
                select: { lotId: true },
            });  
    
            await tx.bin.update({
                where: { binNumber_areaId: { areaId: body.area_id, binNumber: body.bin_number } },
                data: {
                    occupiedBy: body.lot_number, 
                    binStatus: BinStatus.UPAIR,
                }
            });

            // Pembuatan Initial MC Log (Menit ke-0)
            const createdMcLog = await tx.lotMcLog.create({
                data: {
                    lotId: lotData.lotId,
                    mc: body.initial_mc,
                    remark: "Kadar air awal (inisialisasi)",
                    createdAt: startDate,
                }
            });

            return { lotId: lotData.lotId, mcLog: createdMcLog };
        });

        return { success: true, data: result };

    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map(issue => `${issue.path.join('.')} - ${issue.message}`).join(', ');
            throw createError({ statusCode: 400, statusMessage: `Validasi gagal: ${errorMessages}` });
        }

        // Penambahan pada blok penanganan galat Prisma
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
        logger.error({ context: 'api', error }, "[api] Kegagalan sistemik yang tidak terprediksi pada proses inisialisasi Lot.");
        throw createError({ statusCode: 500, statusMessage: "Terjadi kesalahan komputasi internal pada peladen." });
    }
});