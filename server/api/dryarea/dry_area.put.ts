import * as z from "zod";
import { Prisma } from "~/generated/prisma/client";
import { prisma } from "~~/server/utils/prisma";
import { logger } from "~~/server/utils/pino";

const schema = z.object({
    area_id: z.number().int().positive("area_id harus bernilai integer positif"),
    name: z.string().min(1, "Name is required"),
});

export default defineEventHandler(async (event) => {
    try {
        const body = schema.parse(await readBody(event));

        const result = await prisma.dryerArea.update({
            where: { areaId: body.area_id },
            data: {
                name: body.name
            },
        });

        return { success: true, data: result };

    } catch (err: any) {
        if (err instanceof z.ZodError) {
            const errorMessages = err.issues.map(issue => `${issue.path.join('.')} - ${issue.message}`).join(', ');
            logger.warn({ context: 'api', error: errorMessages }, "[api] Validasi dry_area.put gagal.");
            throw createError({
                statusCode: 400,
                statusMessage: `Validasi gagal: ${errorMessages}`,
            });
        }

        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            switch (err.code) {
                case "P2025":
                    throw createError({
                        statusCode: 404,
                        statusMessage: "Dryer area tidak ditemukan.",
                    });

                case "P2002":
                    throw createError({
                        statusCode: 409,
                        statusMessage: "Konflik penulisan data: Nama dryer area sudah terdaftar.",
                    });
            }
        }

        if (err.statusCode) throw err;

        logger.error({ context: 'api', error: err }, "[api] Kesalahan internal pada dry_area.put.");
        throw createError({
            statusCode: 500,
            statusMessage: "Terjadi kesalahan komputasi internal pada peladen.",
        });
    }
});