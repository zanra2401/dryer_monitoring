import { Prisma } from "~/generated/prisma/client";
import { BinStatus } from "~/generated/prisma/enums";
import { logger } from "~~/server/utils/pino";
import * as z from "zod";

const schema = z.object({
    lot_id: z.number().int().positive("ID Lot harus bernilai positif"),
});

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { lot_id } = schema.parse(body);

        const result = await prisma.$transaction(async (prisma) => {
            const updateLot = await prisma.lot.update({
                where: {
                    lotId: lot_id,
                },
                data: {
                    status: BinStatus.UPAIR,
                    downAirAt: null,
                },
                select: {
                    lotNumber: true,
                }
            });

            const updateBin = await prisma.bin.updateMany({
                where: {
                    occupiedBy: updateLot.lotNumber,
                    binStatus: BinStatus.DOWNAIR,
                },
                data: {
                    binStatus: BinStatus.UPAIR,
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
        logger.error({ context: 'api', error }, "[api] Kegagalan sistemik yang tidak terprediksi pada undo_downair.");
        throw createError({ statusCode: 500, statusMessage: "Terjadi kesalahan komputasi internal pada peladen." });
    }
});
