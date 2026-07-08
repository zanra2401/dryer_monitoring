import * as z from "zod";
import { Prisma } from "~/generated/prisma/client";
import { prisma } from "~~/server/utils/prisma";
import { logger } from "~~/server/utils/pino";

const deleteSchema = z.object({
    area_id: z.number().int().positive("area_id harus bernilai integer positif"),
});

export default defineEventHandler(async (event) => {
    try {
        const body = deleteSchema.parse(await readBody(event));

        const channel = await prisma.channel.findFirst({
            where: {
                areaId: body.area_id,
            },
        });

        if (channel) {
            throw createError({
                statusCode: 400,
                statusMessage: "Tidak bisa menghapus dryer area yang masih memiliki channel.",
            });
        }

        const result = await prisma.dryerArea.delete({
            where: {
                areaId: body.area_id,
            },
        });

        return {
            success: true,
            data: result,
        };
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            const errorMessages = err.issues.map(issue => `${issue.path.join('.')} - ${issue.message}`).join(', ');
            logger.warn({ context: 'api', error: errorMessages }, "[api] Validasi parameter dry_area.delete gagal.");
            throw createError({ statusCode: 400, statusMessage: `Validasi gagal: ${errorMessages}` });
        }

        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025") {
                throw createError({
                    statusCode: 404,
                    statusMessage: "Dryer area tidak ditemukan.",
                });
            }
        }

        if (err.statusCode) throw err;

        logger.error({ context: 'api', error: err }, "[api] Kesalahan internal pada dry_area.delete.");
        throw createError({
            statusCode: 500,
            statusMessage: "Terjadi kesalahan komputasi internal pada peladen.",
        });
    }
});