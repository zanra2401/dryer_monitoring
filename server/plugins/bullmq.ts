import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import { defineNitroPlugin } from 'nitropack/dist/runtime/plugin';
import { logger } from '../utils/pino';
import log from '../utils/log';
import thinkspeaks from '../utils/thinkspeaks';

export default defineNitroPlugin((nitroApp) => {
    // 1. Deklarasi Tipe Persilangan Global
    const globalScope = globalThis as typeof globalThis & {
        __SensorQueue?: Queue;
        __SensorWorker?: Worker;
        __QueueEvents?: QueueEvents; 
    };

    if (globalScope.__SensorQueue) {
        return;
    }

    logger.info({ context: 'bullmq' }, "[bullmq] Menginisialisasi infrastruktur antrean...");

    const redisConnectionOptions = {
        host: '127.0.0.1', 
        port: 6379,
        maxRetriesPerRequest: null, 
    };

    // 2. Inisialisasi Antrean Utama
    const sensorQueue = new Queue('SensorFetchQueue', {
        connection: redisConnectionOptions,
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'fixed', delay: 5 * 60 * 1000 },
            removeOnComplete: true,
        }
    });
    globalScope.__SensorQueue = sensorQueue;

    // 3. Inisialisasi Pekerja (Worker)
    const sensorWorker = new Worker('SensorFetchQueue', async (job) => {
        const { lotId, binId, targetExecuteTime, intervalMinutes } = job.data;
        const targetTime = new Date(targetExecuteTime);
        const currentIntervalMinutes = intervalMinutes || 30; 

        const lot = await prisma.lot.findUnique({ where: { lotId } });
        const lot_bin = await prisma.bin.findUnique({
            where: { binNumber_areaId: { binNumber: binId, areaId: lot?.areaId ?? 0 } },
            include: { channel: true }
        });
           
        if (!lot || !lot_bin) {
            throw new Error(`Data Lot atau Bin tidak ditemukan di pangkalan data.`);
        }

        console.log(targetExecuteTime);
        console.log(targetTime);
        const dateRange = log.make_range_date(targetTime);
        const feedResponse = await thinkspeaks.get_feeds_by_time(Number(lot_bin.channelId), lot_bin.channel.apiKey, dateRange);
        const feeds = Array.isArray(feedResponse?.feeds) ? feedResponse.feeds : [];
        const nearestFeed = log.find_nearest_feed(feeds, targetTime);

        if (!nearestFeed) {
            throw new Error("ThinkSpeak API Timeout atau data sensor tidak tersedia.");
        }

        await prisma.log.create({ 
            data: log.build_start_log_data({
                lotId: lot.lotId, feed: nearestFeed,
                bin: {
                    fieldTempTop: lot_bin.fieldTempTop, fieldRhTop: lot_bin.fieldRhTop,
                    fieldTempBottom: lot_bin.fieldTempBottom, fieldRhBottom: lot_bin.fieldRhBottom,
                },
                initialMc: null,
                binStatus: lot_bin.binStatus ?? "UPAIR"
            }) 
        });

        // Logika Throttle Siklus Berantai
        const nextTargetTime = new Date(targetTime.getTime() + (currentIntervalMinutes * 60 * 1000));
        const delayMs = nextTargetTime.getTime() - Date.now();
        const safeDelayMs = delayMs > 0 ? delayMs : 2000;

        await globalScope.__SensorQueue?.add('fetch-thinkspeak', {
            lotId, binId, targetExecuteTime: nextTargetTime.toISOString(), intervalMinutes: currentIntervalMinutes
        }, { 
            delay: safeDelayMs,
            jobId: `drying-${lotId}-${binId}-${nextTargetTime.getTime()}` 
        });

        return "Siklus terjadwal.";        
    }, { connection: redisConnectionOptions });

    globalScope.__SensorWorker = sensorWorker;

    // 4. Inisialisasi Pemantau Peristiwa
    if (!globalScope.__QueueEvents) {
        const queueEvents = new QueueEvents('SensorFetchQueue', { connection: redisConnectionOptions });
        
        queueEvents.on('failed', async ({ jobId, failedReason }) => {
            try {
                const queue = globalScope.__SensorQueue;
                if (!queue) return;

                const job = await Job.fromId(queue, jobId);
                if (!job) return;

                const maxAttempts = job.opts.attempts || 3;
                
                if (job.attemptsMade >= maxAttempts) {
                    const { lotId, binId, targetExecuteTime } = job.data;
                    const targetTime = new Date(targetExecuteTime);

                    const lot = await prisma.lot.findUnique({ where: { lotId } });

                    await prisma.log.create({
                        data: {
                            lotId: lotId, timestampThingspeak: targetTime, statusBin: "ERROR_NO_DATA",
                            remark: `SYSTEM AUTO-FAIL: ${failedReason.substring(0, 100)}`, 
                            tempTop: null, rhTop: null, tempBottom: null, rhBottom: null,
                            status: lot?.status ?? "ERROR_NO_DATA"
                        }
                    });

                    // Logika Throttle Injeksi Tombstone
                    const nextTargetTime = new Date(targetTime.getTime() + (30 * 60 * 1000));
                    const delayMs = nextTargetTime.getTime() - Date.now();
                    const safeDelayMs = delayMs > 0 ? delayMs : 2000;

                    await queue.add('fetch-thinkspeak', {
                        lotId, binId, targetExecuteTime: nextTargetTime.toISOString(), intervalMinutes: 30
                    }, {
                        delay: safeDelayMs,
                        jobId: `drying-${lotId}-${binId}-${nextTargetTime.getTime()}` 
                    });
                }
            } catch (error) {
                logger.fatal({ context: 'events', error }, "[events] GALAT FATAL injeksi Tombstone.");
            }
        });
        globalScope.__QueueEvents = queueEvents;
    }

    // 5. Injeksi Graceful Shutdown (Koreksi dengan pemutusan Prisma)
    nitroApp.hooks.hook('close', async () => {
        logger.info({ context: 'system' }, "[system] Menerima sinyal terminasi. Mengamankan sumber daya...");
        try {
            if (globalScope.__QueueEvents) await globalScope.__QueueEvents.close();
            if (globalScope.__SensorWorker) await globalScope.__SensorWorker.close();
            if (globalScope.__SensorQueue) await globalScope.__SensorQueue.close();
            
            // [KOREKSI] Mengamankan berkas SQLite sebelum memori dikosongkan
            await prisma.$disconnect();
            logger.info({ context: 'system' }, "[system] Seluruh koneksi eksternal dan basis data berhasil ditutup.");
        } catch (error) {
            logger.fatal({ context: 'system', error }, "[system] Kegagalan sistemik saat proses terminasi.");
        }
    });
});