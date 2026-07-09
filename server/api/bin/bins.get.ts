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
        const [area, bins, activeLots] = await prisma.$transaction([
            prisma.dryerArea.findUnique({
                where: { areaId: area_id }
            }),
            prisma.bin.findMany({
                where: { areaId: area_id },
                include: {
                    dryerArea: true,
                    binLogs: {
                        where: { tempTop: { not: null } },
                        orderBy: { timestampThingspeak: 'desc' },
                        take: 1
                    }
                },
            }),
            prisma.lot.findMany({
                where: { areaId: area_id, status: { not: LotStatus.DRIED } },
                include: {
                    mcLogs: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                }
            })
        ]);

        if (!area) {
            throw createError({
                statusCode: 404,
                statusMessage: "Area Dryer tidak ditemukan.",
            });
        }

        // 4. Pemetaan Objek Presisi Tinggi
        const binWithLot = bins.map((bin) => {
            const occupiedLot = activeLots.find((lot) => lot.binNumber === bin.binNumber);
            
            // Ekstrak log terakhir dari relasi array
            const latestLog = bin.binLogs?.[0] || null;
            const latestMcLog = occupiedLot?.mcLogs?.[0] || null;

            // Pastikan binLogs tidak ikut terekspos berlebihan di level root object
            const { binLogs, ...binData } = bin;

            return {
                ...binData,
                // Menggunakan Optional Chaining dan Nullish Coalescing (??) untuk efisiensi sintaks
                occupiedBy: occupiedLot?.lotNumber ?? null,
                netToBin: occupiedLot?.netToBin ?? null,
                initialMc: occupiedLot?.initialMc ?? null,
                hybrid: occupiedLot?.hybrid ?? null,
                quality: occupiedLot?.quality ?? null,
                startTime: occupiedLot?.startTime ?? null,
                
                // Menyematkan data sensor terakhir langsung ke dalam respons Bin
                latestLog: latestLog ? {
                    logId: latestLog.binLogId,
                    timestamp: latestLog.timestampThingspeak,
                    status: latestLog.statusBin,
                    tempTop: latestLog.tempTop,
                    rhTop: latestLog.rhTop,
                    tempBottom: latestLog.tempBottom,
                    rhBottom: latestLog.rhBottom,   
                    mc: latestMcLog?.mc ?? null
                } : null,
            };
        });

        return { success: true, data: binWithLot, dryerArea: area };

    } catch (error: unknown) {
        // 5. Standardisasi Respons Galat (Mencegah Kebocoran)
        if (error instanceof z.ZodError) {
            throw createError({ statusCode: 400, statusMessage: "Parameter HTTP tidak lengkap atau salah tipe data." });
        }

        logger.error({ context: 'api', error }, "[api] Gagal memuat matriks Bin dan Lot.");
        throw createError({ statusCode: 500, statusMessage: "Terjadi kesalahan komputasi pada peladen." });
    }
});