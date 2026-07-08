import { Prisma } from "~/generated/prisma/client";
import { Queue } from "bullmq";
import * as z from "zod";
import { BinStatus } from "~/generated/prisma/client";
import thinkspeaks from "~~/server/utils/thinkspeaks";
import log from "~~/server/utils/log";
import { prisma } from "~~/server/utils/prisma"; 
import { logger } from "~~/server/utils/pino";

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
        const rawBody = await readBody(event);
        
        // Eksekusi Validasi Zod (Akan otomatis melempar galat ke blok catch jika format salah)
        const body = startDryingSchema.parse(rawBody);
        
        const startDate = log.to_valid_date(body.start_time);
        if (log.is_future_date(startDate)) {
            throw createError({ statusCode: 400, statusMessage: "Waktu mulai tidak boleh berada di masa depan." });
        }

        const INTERVAL_MINUTES = 30; // Konstanta durasi penjadwalan

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

        // 3. Eksekusi Jaringan (Network I/O) Terisolasi
        const dateRange = log.make_range_date(startDate);
        let nearestFeed = null;
        let statusBin = BinStatus.UPAIR; // Default status jika sensor merespons normal
        let remarkMsg = "Sistem pemantauan dimulai.";

        try {
            const feedResponse = await thinkspeaks.get_feeds_by_time(Number(binConfig.channelId), binConfig.channel.apiKey, dateRange);
            const feeds = Array.isArray(feedResponse?.feeds) ? feedResponse.feeds : [];
            nearestFeed = log.find_nearest_feed(feeds, startDate);
        } catch (apiError) {
            logger.warn({
                context: 'api',
                lotNumber: body.lot_number,
                binNumber: body.bin_number,
                error: apiError,
            }, `[api] Gangguan jaringan ke ThinkSpeak untuk Lot ${body.lot_number}`);
        }

        // Resolusi Sensor Mati: Sistem tidak berhenti, melainkan menyiapkan Tombstone Log
        if (!nearestFeed) {
            statusBin = BinStatus.UPAIR; // Tetap UPAIR, tetapi data sensor akan null
            remarkMsg = "ThinkSpeak API tidak merespons saat inisialisasi. Data sensor direkam sebagai null.";
            logger.warn({
                context: 'api',
                lotNumber: body.lot_number,
                binNumber: body.bin_number,
            }, `[api] Data sensor tidak tersedia untuk Lot ${body.lot_number}. Tombstone log akan dibuat.`);
        }

        // 4. Transaksi Basis Data Berkinerja Tinggi (Hanya I/O Lokal)
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
                    // Berdasarkan perbaikan sebelumnya, occupiedBy seharusnya dihapus. 
                    // Jika Anda masih mempertahankannya sementara, baris ini dieksekusi:
                    occupiedBy: body.lot_number, 
                    binStatus: BinStatus.UPAIR,
                }
            });

            // Pembuatan Initial Log (Menit ke-0)
            const startLogData = nearestFeed ? log.build_start_log_data({
                lotId: lotData.lotId,
                feed: nearestFeed,
                bin: {
                    fieldTempTop: binConfig.fieldTempTop,
                    fieldRhTop: binConfig.fieldRhTop,
                    fieldTempBottom: binConfig.fieldTempBottom,
                    fieldRhBottom: binConfig.fieldRhBottom,
                },
                initialMc: body.initial_mc, 
                binStatus: null
            }) : {
                // Injeksi Tombstone jika sensor mati
                lotId: lotData.lotId,
                timestampThingspeak: startDate,
                statusBin: statusBin,
                remark: remarkMsg,
                tempTop: null,
                rhTop: null,
                tempBottom: null,
                rhBottom: null,
                mc: body.initial_mc, // MC tetap diinisialisasi meskipun sensor mati
            };


            const createdLog = await tx.log.create({
                data: startLogData,
            });

            return { lotId: lotData.lotId, log: createdLog };
        });

        // 5. Pendelegasian ke BullMQ (Menggantikan SQLite JobTracker)
        const globalScope = globalThis as typeof globalThis & {
            __SensorQueue?: Queue;
        };
        const queue = globalScope.__SensorQueue;

        if (queue) {
            // Kalkulasi jadwal eksekusi berikutnya berdasarkan start_time asli
            const nextExecuteTime = new Date(startDate.getTime() + (INTERVAL_MINUTES * 60 * 1000));
            const delayMs = nextExecuteTime.getTime() - Date.now();
            
            // Pencegahan delay negatif jika start_time yang dikirim berada di masa lalu (misal 5 menit lalu)
            const safeDelayMs = delayMs > 0 ? delayMs : 2000;

            await queue.add('fetch-thinkspeak', {
                lotId: result.lotId,
                binId: body.bin_number,
                targetExecuteTime: nextExecuteTime.toISOString(),
                intervalMinutes: INTERVAL_MINUTES
            }, {
                delay: safeDelayMs,
                jobId: `drying-${result.lotId}-${body.bin_number}-${nextExecuteTime.getTime()}`});
            
        } else {
            // Log ke konsol server sebagai peringatan operasional (logger terstruktur disarankan)
            logger.error("[api] FATAL: Antrean BullMQ tidak terdeteksi di memori global. Pastikan plugin BullMQ telah diinisialisasi sebelum API ini dipanggil.");
        }

        return { success: true, data: result };

    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            throw createError({
                statusCode: 400,
                statusMessage: "Validasi data gagal: " + error.issues.map(issue => {
                    // Menggunakan .join('.') akan memetakan array [ 'user', 'age' ] menjadi string "user.age" secara aman
                    const errorPath = issue.path.length > 0 ? issue.path.join('.') : 'root';
                    return `${errorPath} - ${issue.message}`;
                }).join(", "),
            });
        }

        // Penambahan pada blok penanganan galat Prisma
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw createError({ statusCode: 409, statusMessage: "Duplikasi data: Nomor Lot sudah eksis." });
            } else if (error.code === "P2003") {
                throw createError({ statusCode: 400, statusMessage: "Pelanggaran relasi basis data (Area/Bin tidak valid)." });
            } else if (error.code === "P2034") {
                // [KOREKSI] Tangani kebuntuan transaksi InnoDB
                logger.warn({ context: 'database', error }, "[database] Terjadi Deadlock pada MySQL. Merespons dengan HTTP 409 agar klien dapat melakukan retri.");
                throw createError({ statusCode: 409, statusMessage: "Konflik penulisan data (Deadlock). Silakan coba lagi dalam beberapa detik." });
            }
        }
        
        logger.error({ context: 'api', error }, "[api] Kegagalan level atas pada proses inisialisasi.");
        throw error; 
    }
});