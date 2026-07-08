import { BinStatus } from "~/generated/prisma/client";

export default defineEventHandler(async (event) => {    
    const body = await readBody(event);
    const { channel_id, area_id } = body;

    try {
        const result = await prisma.$transaction(async (prisma) => {
            const bins = await prisma.bin.findMany({
                where: {
                    channelId: channel_id,
                    areaId: area_id,
                    NOT: {
                        binStatus: BinStatus.EMPTY
                    }
                },
                select: {
                    binNumber: true,
                    binStatus: true,
                }
            });

            if (bins.length > 0) {
                throw createError({
                    statusCode: 400,
                    statusMessage: "Tidak bisa menghapus channel yang masih memiliki bin dengan status tidak kosong.",
                });
            }

            const binsCount = await prisma.bin.count({
                where: {
                    channelId: channel_id,
                    areaId: area_id
                }
            });

            const deletedChannel = await prisma.channel.delete({
                where: {
                    channelId: channel_id,
                    areaId: area_id
                }
            });


            return {
                deletedChannel,
                deletedBinsCount: binsCount
            };
        });

        return { success: true, data: result };
    } catch (error: unknown) {
        return error;
    }
});

