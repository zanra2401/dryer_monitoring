import { BinStatus } from "~/generated/prisma/client";

export default defineEventHandler(async (event) => {    
    const body = await readBody(event);
    const { channel_id, area_id } = body;

    try {
        const result = await prisma.$transaction(async (prisma) => {
            const bins = await prisma.bin.findMany({
                where: {
                    OR: [
                        { channelIdTop: channel_id },
                        { channelIdBottom: channel_id }
                    ],
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

            const deletedChannel = await prisma.channel.delete({
                where: {
                    channelId: channel_id,
                }
            });

            // Setelah channel dihapus, referensi di Bin akan diset NULL oleh onDelete: SetNull
            // Kita hapus bin yang sekarang yatim piatu (kehilangan kedua channelnya)
            const cleanupResult = await prisma.bin.deleteMany({
                where: {
                    areaId: area_id,
                    channelIdTop: null,
                    channelIdBottom: null
                }
            });

            return {
                deletedChannel,
                deletedBinsCount: cleanupResult.count
            };
        });

        return { success: true, data: result };
    } catch (error: unknown) {
        return error;
    }
});

