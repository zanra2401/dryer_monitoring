import { Prisma } from "~/generated/prisma/client";
import { BinStatus } from "~/generated/prisma/enums";
import * as z from "zod";
import { prisma } from "~~/server/utils/prisma"; 
import { logger } from "~~/server/utils/pino"; 
import { requireAuthRole } from "~~/server/utils/auth";

const emptyBinSchema = z.object({
    bin_number: z.number().min(1, "Nomor Bin tidak valid"),
    area_id: z.number().min(1, "ID Area tidak valid"),
    lot_number: z.string().min(1, "Nomor Lot tidak valid"),
});

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuthRole(event, ["ADMIN", "OPERATOR"]);
        const rawBody = await readBody(event);
        const { bin_number, area_id, lot_number } = emptyBinSchema.parse(rawBody);

        if (user.role === "OPERATOR" && !user.areaIds.includes(area_id)) {
            throw createError({ statusCode: 403, statusMessage: "Izin tidak cukup untuk mengosongkan bin di area ini." });
        }

        const result = await prisma.$transaction(async (tx) => {
            const bin = await tx.bin.findUnique({
                where: { binNumber_areaId: { binNumber: bin_number, areaId: area_id } }
            });

            if (!bin) {
                throw createError({ statusCode: 404, statusMessage: "Bin tidak ditemukan." });
            }

            if (bin.binStatus !== BinStatus.WAITING_TO_SHELLING) {
                throw createError({ 
                    statusCode: 400, 
                    statusMessage: "Bin hanya bisa dikosongkan jika statusnya WAITING_TO_SHELLING." 
                });
            }
            
            if (bin.occupiedBy !== lot_number) {
                throw createError({ 
                    statusCode: 400, 
                    statusMessage: "Lot yang dipilih tidak sesuai dengan lot yang sedang mengisi bin." 
                });
            }

            const updatedBin = await tx.bin.update({
                where: { binNumber_areaId: { binNumber: bin_number, areaId: area_id } },
                data: {
                    binStatus: BinStatus.EMPTY,
                    occupiedBy: null,
                }
            });

            return updatedBin;
        });

        return { success: true, data: result };

    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map(issue => `${issue.path.join('.')} - ${issue.message}`).join(', ');
            throw createError({ statusCode: 400, statusMessage: `Validasi gagal: ${errorMessages}` });
        }
        
        if ((error as any).statusCode) throw error;
        logger.error({ context: 'api', error }, `[api] Kegagalan sistemik saat mengosongkan Bin.`);
        throw createError({ statusCode: 500, statusMessage: "Terjadi kesalahan komputasi internal pada peladen." });
    }
});
