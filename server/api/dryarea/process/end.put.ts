import { BinStatus, LotStatus } from "~/generated/prisma/enums";
import { Queue } from "bullmq";
import * as z from "zod";
import { prisma } from "~~/server/utils/prisma"; 
import { logger } from "~~/server/utils/pino"; 

// 1. Deklarasi Skema Keamanan
const endDryingSchema = z.object({
    lot_id: z.number().min(1, "ID Lot tidak valid"),
    time: z.string().min(1, "Waktu selesai wajib diisi"),
});

export default defineEventHandler(async (event) => {
    try {
        const rawBody = await readBody(event);
        const { lot_id, time } = endDryingSchema.parse(rawBody);
        const endTimeStr = new Date(time).toISOString();

        // 2. [KOREKSI] Injeksi Await pada Transaksi
        const result = await prisma.$transaction(async (tx) => {
            const log = await tx.log.findFirst({
                where: { lotId: lot_id, timestampThingspeak: { lte: endTimeStr } },
                select: { mc: true },
                orderBy: { timestampThingspeak: 'desc' },
                take: 1,
            });


            const updateLot = await tx.lot.update({
                where: { lotId: lot_id },
                data: {
                    status: LotStatus.DRIED,
                    endTime: endTimeStr,
                    endMC: log?.mc ?? null,
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

        // 3. Logika Penghapusan Pekerjaan Presisi Tinggi
        const globalScope = globalThis as typeof globalThis & {
            __SensorQueue?: Queue;
        };
        const queue = globalScope.__SensorQueue;

        if (queue) {
            const pendingJobs = await queue.getJobs(['delayed', 'waiting', 'active']);
            
            // [KOREKSI] Konstruksi kunci pencarian absolut: drying-{lot_id}-{bin_number}-
            const targetPrefix = `drying-${lot_id}-${result.binNumber}-`;
            
            const jobsToDelete = pendingJobs.filter(job => job.id && job.id.startsWith(targetPrefix));

            for (const job of jobsToDelete) {
                await job.remove();
                logger.info({ 
                    context: 'bullmq', jobId: job.id 
                }, `[bullmq] Pekerjaan ${job.id} dihapus. Siklus Lot ${lot_id} pada Bin ${result.binNumber} dihentikan.`);
            }
        } else {
            logger.warn({ context: 'api' }, "[api] Antrean BullMQ tidak terdeteksi.");
        }

        return { success: true, data: result };

    } catch (error: unknown) {
        // 4. [KOREKSI] Standardisasi Respons Galat
        if (error instanceof z.ZodError) {
            throw createError({ statusCode: 400, statusMessage: "Validasi muatan data gagal." });
        }
        
        logger.error({ context: 'api', error }, `[api] Kegagalan sistemik saat mengakhiri Lot.`);
        throw createError({ statusCode: 500, statusMessage: "Terjadi kesalahan internal peladen." });
    }
});