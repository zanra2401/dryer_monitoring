

import * as z from "zod";
import { Prisma } from "~/generated/prisma/client";
import { prisma } from "~~/server/utils/prisma";
import { logger } from "~~/server/utils/pino";

const getQuerySchema = z.object({
    area_id: z.coerce.number().int().positive("area_id harus bernilai integer positif"),
});

export default defineEventHandler(async (event) => {
    try {
        const query = getQuerySchema.parse(getQuery(event));

        const result = await prisma.dryerArea.findUnique({
            where: { areaId: query.area_id },
        });

        if (!result) {
            throw createError({
                statusCode: 404,
                statusMessage: "Dryer area tidak ditemukan.",
            });
        }

        return { success: true, data: result };
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map(issue => `${issue.path.join('.')} - ${issue.message}`).join(', ');
            logger.warn({ context: 'api', error: errorMessages }, "[api] Validasi query parameter dry_area.get gagal.");
            throw createError({ statusCode: 400, statusMessage: `Validasi gagal: ${errorMessages}` });
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                throw createError({ statusCode: 404, statusMessage: "Dryer area tidak ditemukan." });
            }
        }

        if (error.statusCode) throw error;

        logger.error({ context: 'api', error }, "[api] Kesalahan tak terduga pada dry_area.get.");
        throw createError({
            statusCode: 500,
            statusMessage: "Terjadi kesalahan komputasi internal pada peladen.",
        });
    }
});
