import { LotStatus } from "~/generated/prisma/enums";
import * as z from "zod";
import { prisma } from "~~/server/utils/prisma";
import { logger } from "~~/server/utils/pino";

// 1. Validasi Input Keamanan Tinggi
const querySchema = z.object({
    area_id: z.coerce.number().min(1, "Parameter area_id tidak valid"),
});

export default defineEventHandler(async (event) => {
    try {
        const rawQuery = getQuery(event);
        const { area_id } = querySchema.parse(rawQuery);

        // 2. Eksekusi Pembacaan Paralel Tersinkronisasi (Concurrent Reads)
        // Array transaction jauh lebih efisien untuk operasi baca daripada interactive callback
        const [bins, activeLots] = await prisma.$transaction([
            prisma.bin.findMany({
                where: { areaId: area_id },
                include: {
                    dryerArea: true,
                },
            }),
            prisma.lot.findMany({
                where: { areaId: area_id, status: { not: LotStatus.DRIED } },
                // 3. Injeksi Pengambilan Log Terakhir (Top 1 Relational Query)
                include: {
                    logs: { // Sesuaikan nama relasi ini dengan skema schema.prisma Anda (misal: 'Log' atau 'logs')
                        orderBy: { timestampThingspeak: 'desc' },
                        take: 1, // Hanya ambil baris teratas (log terbaru)
                    }
                }
            })
        ]);

        if (!bins || bins.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: "Data Bin tidak ditemukan pada area tersebut.",
            });
        }

        // 4. Pemetaan Objek Presisi Tinggi
        const binWithLot = bins.map((bin) => {
            const occupiedLot = activeLots.find((lot) => lot.binNumber === bin.binNumber);
            
            // Ekstrak log terakhir dari relasi array
            const latestLog = occupiedLot?.logs?.[0] || null;

            return {
                ...bin,
                // Menggunakan Optional Chaining dan Nullish Coalescing (??) untuk efisiensi sintaks
                occupiedBy: occupiedLot?.lotNumber ?? null,
                netToBin: occupiedLot?.netToBin ?? null,
                initialMc: occupiedLot?.initialMc ?? null,
                hybrid: occupiedLot?.hybrid ?? null,
                quality: occupiedLot?.quality ?? null,
                startTime: occupiedLot?.startTime ?? null,
                
                // Menyematkan data sensor terakhir langsung ke dalam respons Bin
                latestLog: latestLog ? {
                    logId: latestLog.logId,
                    timestamp: latestLog.timestampThingspeak,
                    status: latestLog.statusBin,
                    tempTop: latestLog.tempTop,
                    rhTop: latestLog.rhTop,
                    tempBottom: latestLog.tempBottom,
                    rhBottom: latestLog.rhBottom,   
                    mc: latestLog.mc
                } : null,
            };
        });

        return { success: true, data: binWithLot, dryerArea: bins[0]?.dryerArea ?? null };

    } catch (error: unknown) {
        // 5. Standardisasi Respons Galat (Mencegah Kebocoran)
        if (error instanceof z.ZodError) {
            throw createError({ statusCode: 400, statusMessage: "Parameter HTTP tidak lengkap atau salah tipe data." });
        }

        logger.error({ context: 'api', error }, "[api] Gagal memuat matriks Bin dan Lot.");
        throw createError({ statusCode: 500, statusMessage: "Terjadi kesalahan komputasi pada peladen." });
    }
});