import * as z from "zod";
import { Prisma } from "~/generated/prisma/client"; 
import { prisma } from "~~/server/utils/prisma";
import { logger } from "~~/server/utils/pino";

const schema = z.object({
    name: z.string().min(1, "Name is required"),
});

export default defineEventHandler(async (event) => {
    try {
        const body = schema.parse(await readBody(event));

        const dryArea = await prisma.dryerArea.create({
            data: {
                name: body.name,
            },
        });

        setResponseStatus(event, 201);
        return dryArea;
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            const errorMessages = err.issues.map(issue => `${issue.path.join('.')} - ${issue.message}`).join(', ');
            logger.warn({ context: 'api', error: errorMessages }, "[api] Validasi dry_area.post gagal.");
            throw createError({
                statusCode: 400,
                statusMessage: `Validasi gagal: ${errorMessages}`,
            });
        }

        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2002") {
                throw createError({
                    statusCode: 409,
                    statusMessage: "Konflik penulisan data: Dryer area sudah terdaftar.",
                });
            }
        }

        if (err.statusCode) throw err;

        logger.error({ context: 'api', error: err }, "[api] Kesalahan internal pada dry_area.post.");
        throw createError({
            statusCode: 500,
            statusMessage: "Terjadi kesalahan komputasi internal pada peladen.",
        });
    }
});