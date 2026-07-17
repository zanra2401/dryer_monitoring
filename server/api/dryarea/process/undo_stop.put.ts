import { Prisma } from "~/generated/prisma/client";
import { BinStatus, LotStatus } from "~/generated/prisma/enums";
import { logger } from "~~/server/utils/pino";
import * as z from "zod";
import { requireAuthRole } from "~~/server/utils/auth";
import { prisma } from "~~/server/utils/prisma";

const schema = z.object({
    lot_id: z.number().int().positive("ID Lot harus bernilai positif"),
});

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuthRole(event, ["ADMIN", "OPERATOR"]);
        const body = await readBody(event);
        const { lot_id } = schema.parse(body);

        const existingLot = await prisma.lot.findUnique({
            where: { lotId: lot_id }
        });

        if (!existingLot) {
            throw createError({ statusCode: 404, statusMessage: "Lot tidak ditemukan." });
        }

        if (user.role === "OPERATOR" && !user.areaIds.includes(existingLot.areaId)) {
            throw createError({ statusCode: 403, statusMessage: "Izin tidak cukup untuk memodifikasi lot di area ini." });
        }
        
        if (existingLot.status !== LotStatus.COMPLETED) {
            throw createError({ statusCode: 400, statusMessage: "Undo Stop hanya bisa dilakukan jika status lot adalah COMPLETED." });
        }

        const result = await prisma.$transaction(async (tx) => {
            const updateLot = await tx.lot.update({
                where: {
                    lotId: lot_id,
                },
                data: {
                    status: LotStatus.DOWNAIR,
                    endTime: null,
                    endMC: null,
                },
                select: {
                    lotNumber: true,
                }
            });

            await tx.bin.updateMany({
                where: {
                    occupiedBy: updateLot.lotNumber,
                    binStatus: BinStatus.WAITING_TO_SHELLING,
                },
                data: {
                    binStatus: BinStatus.DOWNAIR,
                },
            });
        });

        return { success: true, data: result };
    }
    catch (error: unknown) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map(issue => `${issue.path.join('.')} - ${issue.message}`).join(', ');
            throw createError({ statusCode: 400, statusMessage: `Validasi gagal: ${errorMessages}` });
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2034") {
                throw createError({ statusCode: 409, statusMessage: "Konflik penulisan data (Deadlock). Silakan coba lagi." });
            } else if (error.code === "P2002") {
                throw createError({ statusCode: 409, statusMessage: "Duplikasi data: Pelanggaran kunci unik." });
            } else if (error.code === "P2003") {
                throw createError({ statusCode: 400, statusMessage: "Pelanggaran relasi basis data (Kunci Asing tidak valid)." });
            } else if (error.code === "P2025") {
                throw createError({ statusCode: 404, statusMessage: "Data yang dituju tidak ditemukan." });
            }
        }
        
        if ((error as any).statusCode) throw error;
        logger.error({ context: 'api', error }, "[api] Kegagalan sistemik yang tidak terprediksi pada undo_stop.");
        throw createError({ statusCode: 500, statusMessage: "Terjadi kesalahan komputasi internal pada peladen." });
    }
});
