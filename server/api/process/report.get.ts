import * as z from "zod";
import { prisma } from "~~/server/utils/prisma"; 
import { logger } from "~~/server/utils/pino"; 
import { requireAuthUser } from "~~/server/utils/auth";
import { isLimitedAreaRole } from "~~/server/utils/rbac";
import { getLotSnapshotLogTimeline } from "~~/server/utils/lot-log-snapshot";

const reportQuerySchema = z.object({
    lot_number: z.string().min(1, "Nomor Lot wajib diisi"),
});

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuthUser(event);
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

        if (isLimitedAreaRole(user.role) && !user.areaIds.includes(lot.areaId)) {
            throw createError({ statusCode: 403, statusMessage: "Izin tidak cukup untuk mengakses laporan lot di area ini." });
        }

        const timeline = await getLotSnapshotLogTimeline(lot.lotId);
        const report = timeline?.logs.map((log) => ({
            time: log.timestampThingspeak.toISOString(),
            tempTop: log.tempTop,
            rhTop: log.rhTop,
            tempBottom: log.tempBottom,
            rhBottom: log.rhBottom,
            mc: log.mc,
            statusBin: log.statusBin,
            dataPoints: log.dataPoints,
        })) ?? [];

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
