import { Prisma } from "~/generated/prisma/client";


export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { name, area_id } = body;

        const result = await prisma.dryerArea.update({
            where: { areaId: area_id },
            data: {
                name: name
            },
        });

        return { success: true, data: result };

    } catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            switch (err.code) {
                case "P2025":
                    throw createError({
                        statusCode: 404,
                        statusMessage: "Data Dryer not found",
                    });

                case "P2002":
                    throw createError({
                        statusCode: 409,
                        statusMessage: "Duplicate data Dryer",
                    });
            }
        }

        throw createError({
            statusCode: 500,
            statusMessage: "Internal Server Error"
        });
    }
});