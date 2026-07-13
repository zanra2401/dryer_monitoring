import cron from 'node-cron';
import { defineNitroPlugin } from 'nitropack/dist/runtime/plugin';
import { prisma } from '~~/server/utils/prisma';
import { logger } from '~~/server/utils/pino';
import { runTelemetryFetch } from '~~/server/utils/telemetry';

// === PLUGIN UTAMA ===
export default defineNitroPlugin((nitroApp) => {
    logger.info({ context: 'cron' }, "[cron] Menginisialisasi cron job telemetri Bin (Smart Gap Recovery)...");

    // Jalankan setiap 10 menit (tapi karena interval 5m, task jadwalnya */5)
    const task = cron.schedule('*/5 * * * *', async () => {
        await runTelemetryFetch(false);
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
