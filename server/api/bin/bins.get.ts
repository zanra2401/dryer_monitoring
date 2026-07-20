import { LotStatus } from "~/generated/prisma/enums";
import * as z from "zod";
import { prisma } from "~~/server/utils/prisma";
import { logger } from "~~/server/utils/pino";
import { requireAuthUser } from "~~/server/utils/auth";
import { isLimitedAreaRole } from "~~/server/utils/rbac";

const LOWER_TEMP_THRESHOLD = 38;
const UPPER_TEMP_THRESHOLD = 43;
const INTERVAL_MS = 30 * 60 * 1000;

const getIntervalKey = (timestamp: Date, startTime: Date) => {
    const startMs = startTime.getTime();
    const timestampMs = timestamp.getTime();

    if (timestampMs < startMs) {
        return null;
    }

    return startMs + Math.floor((timestampMs - startMs) / INTERVAL_MS) * INTERVAL_MS;
};

// 1. Validasi Input Keamanan Tinggi
const querySchema = z.object({
    area_id: z.coerce.number().min(1, "Parameter area_id tidak valid"),
});

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuthUser(event);
        const rawQuery = getQuery(event);
        const { area_id } = querySchema.parse(rawQuery);

        if (isLimitedAreaRole(user.role) && !user.areaIds.includes(area_id)) {
            throw createError({
                statusCode: 403,
                statusMessage: "Anda tidak memiliki hak akses untuk area pengeringan ini.",
            });
        }

        // 2. Eksekusi Pembacaan Paralel Tersinkronisasi
        const [area, bins] = await prisma.$transaction([
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
            })
        ]);

        if (!area) {
            throw createError({
                statusCode: 404,
                statusMessage: "Area Dryer tidak ditemukan.",
            });
        }

        const occupiedLotNumbers = bins.map(b => b.occupiedBy).filter(Boolean) as string[];
        
        const activeLots = occupiedLotNumbers.length > 0 ? await prisma.lot.findMany({
            where: { lotNumber: { in: occupiedLotNumbers } },
            include: {
                mcLogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        }) : [];

        // 4. Pemetaan Objek Presisi Tinggi
        const binWithLot = bins.map((bin) => {
            const occupiedLot = activeLots.find((lot) => lot.lotNumber === bin.occupiedBy);
            
            // Ekstrak log terakhir dari relasi array
            const latestLog = bin.binLogs?.[0] || null;
            const latestMcLog = occupiedLot?.mcLogs?.[0] || null;
            const startTime = occupiedLot?.startTime ? new Date(occupiedLot.startTime) : null;
            const latestSensorSlot = latestLog && startTime ? getIntervalKey(latestLog.timestampThingspeak, startTime) : null;
            const latestMcSlot = latestMcLog && startTime ? getIntervalKey(latestMcLog.createdAt, startTime) : null;
            
            // Mengambil MC terakhir dari data lot, tanpa bergantung pada sinkronisasi dengan log sensor terakhir.
            const displayMc = latestMcLog ? latestMcLog.mc : null;

            // Pastikan binLogs tidak ikut terekspos berlebihan di level root object
            const { binLogs, ...binData } = bin;

            let isAlertTemperature = false;
            if (latestLog) {
                if (binData.binStatus === 'UPAIR' && latestLog.tempBottom !== null) {
                    if (latestLog.tempBottom < LOWER_TEMP_THRESHOLD || latestLog.tempBottom > UPPER_TEMP_THRESHOLD) {
                        isAlertTemperature = true;
                    }
                } else if (binData.binStatus === 'DOWNAIR' && latestLog.tempTop !== null) {
                    if (latestLog.tempTop < LOWER_TEMP_THRESHOLD || latestLog.tempTop > UPPER_TEMP_THRESHOLD) {
                        isAlertTemperature = true;
                    }
                }
            }

            return {
                ...binData,
                isAlertTemperature,
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
                    mc: displayMc
                } : null,
                displayMc,
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
