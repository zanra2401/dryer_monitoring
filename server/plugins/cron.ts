import cron from 'node-cron';
import { defineNitroPlugin } from 'nitropack/dist/runtime/plugin';
import { prisma } from '~~/server/utils/prisma';
import { logger } from '~~/server/utils/pino';
import thinkspeaks from '~~/server/utils/thinkspeaks';
import log from '~~/server/utils/log';

// === KONFIGURASI ===
const INTERVAL_MS = 5 * 60 * 1000; // 10 menit dalam milidetik
const MAX_RECOVERY_MS = 24 * 60 * 60 * 1000; // Batas recovery maksimal: 24 jam
const THINGSPEAK_DELAY_MS = 1500; // Delay antar-request ThingSpeak (rate limit protection)

// === UTILITAS ===
const parseNumber = (val: any): number | null => {
    if (val === undefined || val === null || val === "") return null;
    const num = Number(val);
    return Number.isNaN(num) ? null : num;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface FeedEntry {
    created_at?: string;
    createdAt?: string;
    [key: string]: any;
}

interface BinWithChannel {
    binNumber: number;
    areaId: number;
    channelIdTop: string | null;
    channelIdBottom: string | null;
    binStatus: string;
    fieldTempTop: string | null;
    fieldRhTop: string | null;
    fieldTempBottom: string | null;
    fieldRhBottom: string | null;
    channelTop: {
        apiKey: string;
        [key: string]: any;
    } | null;
    channelBottom: {
        apiKey: string;
        [key: string]: any;
    } | null;
}

/**
 * Memotong array feed menjadi interval-interval 10 menit
 * berdasarkan timestamp created_at dari setiap feed.
 */
function sliceFeedsIntoIntervals(
    feeds: FeedEntry[],
    startMs: number,
    endMs: number,
    intervalMs: number
): { intervalStart: Date; intervalEnd: Date; feeds: FeedEntry[] }[] {
    const intervals: { intervalStart: Date; intervalEnd: Date; feeds: FeedEntry[] }[] = [];

    for (let t = startMs; t < endMs; t += intervalMs) {
        const iStart = t;
        const iEnd = t + intervalMs;

        const intervalFeeds = feeds.filter(feed => {
            const rawTs = feed.created_at ?? feed.createdAt;
            if (!rawTs) return false;
            const feedMs = new Date(rawTs).getTime();
            return feedMs >= iStart && feedMs < iEnd;
        });

        intervals.push({
            intervalStart: new Date(iStart),
            intervalEnd: new Date(iEnd),
            feeds: intervalFeeds
        });
    }

    return intervals;
}

/**
 * Menghitung rata-rata sensor dari array feed untuk satu interval.
 * Memakai filter ambang batas (threshold) agar data noise terbuang.
 */
function averageFeeds(
    feeds: FeedEntry[],
    bin: BinWithChannel
): { tempTop: number | null; rhTop: number | null; tempBottom: number | null; rhBottom: number | null } {
    let sumTempTop = 0, countTempTop = 0;
    let sumRhTop = 0, countRhTop = 0;
    let sumTempBottom = 0, countTempBottom = 0;
    let sumRhBottom = 0, countRhBottom = 0;

    for (const feed of feeds) {
        const tTop = parseNumber(feed[bin.fieldTempTop]);
        if (tTop !== null && tTop >= 15 && tTop <= 70) { sumTempTop += tTop; countTempTop++; }

        const rTop = parseNumber(feed[bin.fieldRhTop]);
        if (rTop !== null && rTop >= 10 && rTop <= 99) { sumRhTop += rTop; countRhTop++; }

        const tBot = parseNumber(feed[bin.fieldTempBottom]);
        if (tBot !== null && tBot >= 15 && tBot <= 70) { sumTempBottom += tBot; countTempBottom++; }

        const rBot = parseNumber(feed[bin.fieldRhBottom]);
        if (rBot !== null && rBot >= 10 && rBot <= 99) { sumRhBottom += rBot; countRhBottom++; }
    }

    return {
        tempTop: countTempTop > 0 ? Number((sumTempTop / countTempTop).toFixed(2)) : null,
        rhTop: countRhTop > 0 ? Number((sumRhTop / countRhTop).toFixed(2)) : null,
        tempBottom: countTempBottom > 0 ? Number((sumTempBottom / countTempBottom).toFixed(2)) : null,
        rhBottom: countRhBottom > 0 ? Number((sumRhBottom / countRhBottom).toFixed(2)) : null,
    };
}

// === PLUGIN UTAMA ===
export default defineNitroPlugin((nitroApp) => {
    logger.info({ context: 'cron' }, "[cron] Menginisialisasi cron job telemetri Bin (Smart Gap Recovery)...");

    // Jalankan setiap 10 menit
    const task = cron.schedule('*/5 * * * *', async () => {
        logger.info({ context: 'cron' }, "[cron] Menjalankan penarikan telemetri ThingSpeak...");
        let currentErrorMasterId: number | null = null;

        try {
            // 1. Kueri seluruh Bin beserta channel-nya
            const allBins = await prisma.bin.findMany({
                include: { channelTop: true, channelBottom: true }
            });

            logger.info({ context: 'cron' }, `[cron] Ditemukan ${allBins.length} bin untuk dipantau.`);

            const now = new Date();
            const nowMs = now.getTime();

            for (const bin of allBins) {
                try {
                    if (!bin.channelTop && !bin.channelBottom) {
                        logger.warn({ context: 'cron', binNumber: bin.binNumber, areaId: bin.areaId },
                            `[cron] Bin ${bin.binNumber} Area ${bin.areaId} tidak memiliki konfigurasi channel sama sekali.`);
                        continue;
                    }

                    // 2. Kueri log terakhir dari database untuk bin ini
                    const lastLog = await prisma.binLog.findFirst({
                        where: { binNumber: bin.binNumber, areaId: bin.areaId },
                        orderBy: { timestampThingspeak: 'desc' },
                        select: { timestampThingspeak: true }
                    });

                    // 3. Tentukan titik awal pengambilan data
                    let fetchStartMs: number;
                    let isRecoveryMode = false;

                    if (lastLog) {
                        const lastLogMs = new Date(lastLog.timestampThingspeak).getTime();
                        const gapMs = nowMs - lastLogMs;

                        if (gapMs > INTERVAL_MS * 1.5) {
                            // Gap lebih dari 15 menit → mode recovery
                            isRecoveryMode = true;
                            // Batasi recovery maksimal 24 jam agar tidak overload
                            fetchStartMs = Math.max(lastLogMs, nowMs - MAX_RECOVERY_MS);
                            logger.info({ context: 'cron', binNumber: bin.binNumber, areaId: bin.areaId },
                                `[cron] MODE RECOVERY: Gap ${Math.round(gapMs / 60000)} menit terdeteksi. Mengambil data dari ${new Date(fetchStartMs).toISOString()}.`);
                        } else {
                            // Gap normal → ambil 10 menit terakhir
                            fetchStartMs = nowMs - INTERVAL_MS;
                        }
                    } else {
                        // Belum ada log sama sekali → ambil 10 menit terakhir saja
                        fetchStartMs = nowMs - INTERVAL_MS;
                    }

                    // 4. Ambil data dari ThingSpeak
                    const startTimeFormatted = log.format_thingspeak_datetime(new Date(fetchStartMs));
                    const endTimeFormatted = log.format_thingspeak_datetime(now);

                    const feeds: FeedEntry[] = [];
                    const channelIdsToFetch = new Set<string>();
                    if (bin.channelIdTop) channelIdsToFetch.add(bin.channelIdTop);
                    if (bin.channelIdBottom) channelIdsToFetch.add(bin.channelIdBottom);

                    for (const cid of channelIdsToFetch) {
                        const channelObj = bin.channelTop?.channelId === cid ? bin.channelTop : bin.channelBottom;
                        if (!channelObj) continue;

                        const feedResponse = await thinkspeaks.get_feeds_by_time(
                            Number(cid),
                            channelObj.apiKey,
                            { start_time: startTimeFormatted, end_time: endTimeFormatted }
                        );
                        
                        if (Array.isArray(feedResponse?.feeds)) {
                            feeds.push(...feedResponse.feeds);
                        }
                        
                        // Rate limit protection antar channel jika ada lebih dari 1
                        if (channelIdsToFetch.size > 1) {
                            await delay(THINGSPEAK_DELAY_MS);
                        }
                    }

                    // is_ephemeral: false saat recovery (kita tidak tahu status drier saat server mati)
                    const currentIsEphemeral = bin.binStatus === 'EMPTY';

                    if (feeds.length === 0) {
                        logger.warn({ context: 'cron', binNumber: bin.binNumber, areaId: bin.areaId },
                            `[cron] Telemetri tidak ditemukan dari ThingSpeak untuk Bin ${bin.binNumber} Area ${bin.areaId}`);

                        // Log error to notification system
                        if (!currentErrorMasterId) {
                            const newMaster = await prisma.fetchErrorMaster.create({ data: { isRead: false } });
                            currentErrorMasterId = newMaster.errorId;
                        }
                        await prisma.fetchErrorDetail.create({
                            data: {
                                errorId: currentErrorMasterId,
                                binNumber: bin.binNumber,
                                areaId: bin.areaId,
                                message: "ThingSpeak timeout atau tidak ada data dalam rentang waktu."
                            }
                        });

                        // Hanya buat entry kosong jika bukan recovery mode (recovery kosong = skip)
                        if (!isRecoveryMode) {
                            await prisma.binLog.create({
                                data: {
                                    binNumber: bin.binNumber,
                                    areaId: bin.areaId,
                                    timestampThingspeak: now,
                                    statusBin: bin.binStatus,
                                    isEphemeral: currentIsEphemeral,
                                    tempTop: null,
                                    rhTop: null,
                                    tempBottom: null,
                                    rhBottom: null,
                                    remark: "SYSTEM AUTO-FAIL: ThingSpeak data not available in 10 minutes window."
                                }
                            });
                        }
                        continue;
                    }

                    // 5. Potong data ke dalam interval 10 menit
                    const intervals = sliceFeedsIntoIntervals(feeds, fetchStartMs, nowMs, INTERVAL_MS);

                    let savedCount = 0;

                    for (const interval of intervals) {
                        if (interval.feeds.length === 0) {
                            // Tidak ada data di interval ini, skip (jangan buat entry kosong saat recovery)
                            continue;
                        }

                        const avg = averageFeeds(interval.feeds, bin as any);

                        // Jika semua data adalah noise, skip interval ini
                        if (avg.tempTop === null && avg.rhTop === null && avg.tempBottom === null && avg.rhBottom === null) {
                            continue;
                        }

                        // Tentukan isEphemeral: saat recovery selalu false, saat normal berdasarkan status bin
                        const isEphemeral = isRecoveryMode ? false : currentIsEphemeral;

                        // Tentukan remark
                        const remark = isRecoveryMode
                            ? `SYSTEM RECOVERY: Data diambil secara retroaktif. Interval ${interval.feeds.length} feed.`
                            : `Perekaman data telemetri otomatis (Rata-rata ${interval.feeds.length} feed dalam 10 menit).`;

                        await prisma.binLog.create({
                            data: {
                                binNumber: bin.binNumber,
                                areaId: bin.areaId,
                                timestampThingspeak: interval.intervalEnd,
                                statusBin: isRecoveryMode ? 'UNKNOWN' : bin.binStatus,
                                isEphemeral,
                                tempTop: avg.tempTop,
                                rhTop: avg.rhTop,
                                tempBottom: avg.tempBottom,
                                rhBottom: avg.rhBottom,
                                remark
                            }
                        });

                        savedCount++;
                    }

                    if (isRecoveryMode) {
                        logger.info({ context: 'cron', binNumber: bin.binNumber, areaId: bin.areaId },
                            `[cron] RECOVERY SELESAI: ${savedCount} interval berhasil disimpan untuk Bin ${bin.binNumber} Area ${bin.areaId}.`);
                    } else {
                        logger.info({ context: 'cron', binNumber: bin.binNumber, areaId: bin.areaId },
                            `[cron] Berhasil merekam telemetri untuk Bin ${bin.binNumber} Area ${bin.areaId}`);
                    }

                    // Rate limit protection: delay sebelum mengambil bin berikutnya
                    await delay(THINGSPEAK_DELAY_MS);

                } catch (binError: any) {
                    logger.error({ context: 'cron', binNumber: bin.binNumber, areaId: bin.areaId, error: binError.message },
                        `[cron] Gagal memproses telemetri untuk Bin ${bin.binNumber} Area ${bin.areaId}`);

                    // Log internal error to notification system
                    if (!currentErrorMasterId) {
                        const newMaster = await prisma.fetchErrorMaster.create({ data: { isRead: false } });
                        currentErrorMasterId = newMaster.errorId;
                    }
                    await prisma.fetchErrorDetail.create({
                        data: {
                            errorId: currentErrorMasterId,
                            binNumber: bin.binNumber,
                            areaId: bin.areaId,
                            message: `Sistem Error: ${binError.message}`
                        }
                    });
                }
            }
        } catch (error: any) {
            logger.error({ context: 'cron', error: error.message }, "[cron] Kegagalan sistemik saat menjalankan cron job.");
        }
    });

    // Garbage Collector untuk BinLog Ephemeral (dijalankan setiap tengah malam 00:00)
    const gcTask = cron.schedule('0 0 * * *', async () => {
        logger.info({ context: 'cron' }, "[cron] Menjalankan Garbage Collector untuk data ephemeral...");
        try {
            // Batas usang: 1 jam yang lalu (menjaga data berjalan agar tidak terhapus)
            const threshold = new Date(Date.now() - 1 * 60 * 60 * 1000);

            const result = await prisma.binLog.deleteMany({
                where: {
                    isEphemeral: true,
                    timestampThingspeak: {
                        lt: threshold
                    }
                }
            });

            logger.info({ context: 'cron', deletedCount: result.count }, `[cron] Garbage Collector berhasil menghapus ${result.count} data ephemeral yang usang (lebih dari 1 jam).`);
        } catch (error: any) {
            logger.error({ context: 'cron', error: error.message }, "[cron] Kegagalan sistemik saat menjalankan Garbage Collector.");
        }
    });

    // Registrasi graceful shutdown
    nitroApp.hooks.hook('close', async () => {
        logger.info({ context: 'cron' }, "[cron] Menerima sinyal terminasi. Menghentikan task cron...");
        task.stop();
        gcTask.stop();
        try {
            await prisma.$disconnect();
            logger.info({ context: 'cron' }, "[cron] Koneksi basis data berhasil ditutup.");
        } catch (error: any) {
            logger.error({ context: 'cron', error: error.message }, "[cron] Kegagalan menutup koneksi basis data.");
        }
    });
});
