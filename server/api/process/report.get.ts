import * as z from "zod";
import { prisma } from "~~/server/utils/prisma"; 
import { logger } from "~~/server/utils/pino"; 

const reportQuerySchema = z.object({
    lot_number: z.string().min(1, "Nomor Lot wajib diisi"),
});

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const { lot_number } = reportQuerySchema.parse(query);

        // 1. O(1) Database Query: Fetch Lot metadata
        const lot = await prisma.lot.findUnique({
            where: { lotNumber: lot_number },
            select: { 
                lotId: true, 
                startTime: true, 
                endTime: true, 
                downAirAt: true,
                binNumber: true, 
                areaId: true,
                status: true
            }
        });

        if (!lot) {
            throw createError({ statusCode: 404, statusMessage: "Data Lot tidak ditemukan." });
        }

        const startTime = new Date(lot.startTime);
        const endTime = lot.endTime ? new Date(lot.endTime) : new Date();

        // 2. O(1) Database Query: Fetch range data
        const [binLogs, mcLogs] = await Promise.all([
            prisma.binLog.findMany({
                where: {
                    binNumber: lot.binNumber,
                    areaId: lot.areaId,
                    timestampThingspeak: { gte: startTime, lte: endTime }
                },
                orderBy: { timestampThingspeak: 'asc' }
            }),
            prisma.lotMcLog.findMany({
                where: {
                    lotId: lot.lotId,
                    createdAt: { gte: startTime, lte: endTime }
                },
                orderBy: { createdAt: 'asc' }
            })
        ]);

        // 3. O(N) In-Memory Hash Map Setup
        const INTERVAL_MS = 30 * 60 * 1000; // 30 Menit
        const startMs = startTime.getTime();

        const getIntervalKey = (timestamp: Date) => {
            const ts = timestamp.getTime();
            if (ts < startMs) return null;
            const diff = ts - startMs;
            const index = Math.floor(diff / INTERVAL_MS);
            return startMs + (index * INTERVAL_MS);
        };

        const binLogMap = new Map<number, typeof binLogs>();
        for (const log of binLogs) {
            const key = getIntervalKey(log.timestampThingspeak);
            if (key !== null) {
                if (!binLogMap.has(key)) binLogMap.set(key, []);
                binLogMap.get(key)!.push(log);
            }
        }

        const mcLogMap = new Map<number, number>();
        for (const log of mcLogs) {
            const key = getIntervalKey(log.createdAt);
            if (key !== null) {
                mcLogMap.set(key, log.mc); // Will overwrite to keep the latest MC in that 30-min window
            }
        }

        // 4. O(M) Report Generation
        const report = [];
        let currentMs = startMs;
        const endMs = endTime.getTime();

        while (currentMs <= endMs) {
            const logs = binLogMap.get(currentMs) || [];
            
            let sumTempTop = 0, countTempTop = 0;
            let sumRhTop = 0, countRhTop = 0;
            let sumTempBottom = 0, countTempBottom = 0;
            let sumRhBottom = 0, countRhBottom = 0;

            for (const log of logs) {
                if (log.tempTop !== null) { sumTempTop += log.tempTop; countTempTop++; }
                if (log.rhTop !== null) { sumRhTop += log.rhTop; countRhTop++; }
                if (log.tempBottom !== null) { sumTempBottom += log.tempBottom; countTempBottom++; }
                if (log.rhBottom !== null) { sumRhBottom += log.rhBottom; countRhBottom++; }
            }

            let statusBin = 'UPAIR';
            if (lot.downAirAt) {
                const downAirMs = lot.downAirAt.getTime();
                statusBin = currentMs >= downAirMs ? 'DOWNAIR' : 'UPAIR';
            }

            report.push({
                time: new Date(currentMs).toISOString(),
                tempTop: countTempTop > 0 ? Number((sumTempTop / countTempTop).toFixed(2)) : null,
                rhTop: countRhTop > 0 ? Number((sumRhTop / countRhTop).toFixed(2)) : null,
                tempBottom: countTempBottom > 0 ? Number((sumTempBottom / countTempBottom).toFixed(2)) : null,
                rhBottom: countRhBottom > 0 ? Number((sumRhBottom / countRhBottom).toFixed(2)) : null,
                mc: mcLogMap.get(currentMs) ?? null,
                statusBin: statusBin,
                dataPoints: logs.length
            });

            currentMs += INTERVAL_MS;
        }

        return { 
            success: true, 
            data: report 
        };

    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            throw createError({ statusCode: 400, statusMessage: "Validasi parameter gagal." });
        }
        
        logger.error({ context: 'api', error }, "[api] Gagal memuat laporan dinamis Lot.");
        // Re-throw if it's already an HttpError (created via createError)
        if ((error as any).statusCode) throw error;
        throw createError({ statusCode: 500, statusMessage: "Terjadi kesalahan internal peladen." });
    }
});
