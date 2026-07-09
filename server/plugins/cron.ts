import cron from 'node-cron';
import { defineNitroPlugin } from 'nitropack/dist/runtime/plugin';
import { prisma } from '~~/server/utils/prisma';
import { logger } from '~~/server/utils/pino';
import thinkspeaks from '~~/server/utils/thinkspeaks';
import log from '~~/server/utils/log';

export default defineNitroPlugin((nitroApp) => {
    logger.info({ context: 'cron' }, "[cron] Menginisialisasi cron job telemetri Bin...");

    // Jalankan setiap 10 menit
    const task = cron.schedule('*/10 * * * *', async () => {
        logger.info({ context: 'cron' }, "[cron] Menjalankan penarikan telemetri ThingSpeak...");
        try {
            // 1. Kueri seluruh Bin yang ada di pangkalan data
            const allBins = await prisma.bin.findMany({
                include: {
                    channel: true
                }
            });

            logger.info({ context: 'cron' }, `[cron] Ditemukan ${allBins.length} bin untuk dipantau.`);

            const now = new Date();
            // Jendela pencarian 10 menit ke belakang
            const start_time = log.format_thingspeak_datetime(new Date(now.getTime() - 10 * 60 * 1000));
            const end_time = log.format_thingspeak_datetime(now);
            const dateRange = { start_time, end_time };

            const parseNumber = (val: any) => {
                if (val === undefined || val === null || val === "") return null;
                const num = Number(val);
                return Number.isNaN(num) ? null : num;
            };

            for (const bin of allBins) {
                try {
                    if (!bin.channel) {
                        logger.warn({ context: 'cron', binNumber: bin.binNumber, areaId: bin.areaId }, 
                            `[cron] Bin ${bin.binNumber} Area ${bin.areaId} tidak memiliki konfigurasi channel.`);
                        continue;
                    }

                    // Tarik data dari ThingSpeak
                    const feedResponse = await thinkspeaks.get_feeds_by_time(
                        Number(bin.channelId),
                        bin.channel.apiKey,
                        dateRange
                    );
                    const feeds = Array.isArray(feedResponse?.feeds) ? feedResponse.feeds : [];

                    const isEphemeral = bin.binStatus === 'EMPTY' || bin.binStatus === 'DRIED';

                    if (feeds.length === 0) {
                        logger.warn({ context: 'cron', binNumber: bin.binNumber, areaId: bin.areaId }, 
                            `[cron] Telemetri tidak ditemukan dari ThingSpeak untuk Bin ${bin.binNumber} Area ${bin.areaId}`);
                        
                        await prisma.binLog.create({
                            data: {
                                binNumber: bin.binNumber,
                                areaId: bin.areaId,
                                timestampThingspeak: now,
                                statusBin: bin.binStatus,
                                isEphemeral,
                                tempTop: null,
                                rhTop: null,
                                tempBottom: null,
                                rhBottom: null,
                                remark: "SYSTEM AUTO-FAIL: ThingSpeak data not available in 10 minutes window."
                            }
                        });
                        continue;
                    }

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

                    const tempTop = countTempTop > 0 ? Number((sumTempTop / countTempTop).toFixed(2)) : null;
                    const rhTop = countRhTop > 0 ? Number((sumRhTop / countRhTop).toFixed(2)) : null;
                    const tempBottom = countTempBottom > 0 ? Number((sumTempBottom / countTempBottom).toFixed(2)) : null;
                    const rhBottom = countRhBottom > 0 ? Number((sumRhBottom / countRhBottom).toFixed(2)) : null;

                    if (tempTop === null && rhTop === null && tempBottom === null && rhBottom === null) {
                        logger.warn({ context: 'cron', binNumber: bin.binNumber, areaId: bin.areaId }, 
                            `[cron] Semua data sensor adalah noise (out of threshold) untuk Bin ${bin.binNumber} Area ${bin.areaId}`);
                        
                        await prisma.binLog.create({
                            data: {
                                binNumber: bin.binNumber,
                                areaId: bin.areaId,
                                timestampThingspeak: now,
                                statusBin: bin.binStatus,
                                isEphemeral,
                                tempTop: null,
                                rhTop: null,
                                tempBottom: null,
                                rhBottom: null,
                                remark: "SYSTEM AUTO-FAIL: Seluruh data ThingSpeak merupakan noise."
                            }
                        });
                        continue;
                    }

                    await prisma.binLog.create({
                        data: {
                            binNumber: bin.binNumber,
                            areaId: bin.areaId,
                            timestampThingspeak: now,
                            statusBin: bin.binStatus,
                            isEphemeral,
                            tempTop,
                            rhTop,
                            tempBottom,
                            rhBottom,
                            remark: "Perekaman data telemetri otomatis (Rata-rata 10 menit)."
                        }
                    });

                    logger.info({ context: 'cron', binNumber: bin.binNumber, areaId: bin.areaId }, 
                        `[cron] Berhasil merekam telemetri untuk Bin ${bin.binNumber} Area ${bin.areaId}`);

                } catch (binError: any) {
                    logger.error({ context: 'cron', binNumber: bin.binNumber, areaId: bin.areaId, error: binError.message },
                        `[cron] Gagal memproses telemetri untuk Bin ${bin.binNumber} Area ${bin.areaId}`);
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
