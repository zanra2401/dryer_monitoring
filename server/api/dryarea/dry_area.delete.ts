import { Prisma } from "~/generated/prisma/client";
import sqliteUtils from "~~/server/utils/sqlite";
import { FlagType } from "~/generated/sqlite/client";

export default defineEventHandler(async (event) => {
    try {
        const { area_id } = await readBody(event);

        const channel = await prisma.channel.findFirst({
            where: {
                areaId: area_id,
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
                areaId: area_id,
            },
        });

        const currentFlag = await sqliteUtils.getSystemFlag("dryCount");

        const dryCount = currentFlag
            ? Math.max(0, Number(currentFlag) - 1)
            : 0;

        await sqliteUtils.setSystemFlag(
            "dryCount",
            dryCount.toString(),
            FlagType.NUMBER
        );

        return {
            success: true,
            data: result,
        };
    } catch (err: any) {
        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2025"
        ) {
            throw createError({
                statusCode: 404,
                statusMessage: "Dryer area tidak ditemukan.",
            });
        }

        throw err;
    }
});