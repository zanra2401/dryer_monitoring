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
                throw new Error("Cannot delete channel with non-empty bins");
            }

            const deletedChannel = await prisma.channel.delete({
                where: {
                    channelId: channel_id,
                    areaId: area_id
                }
            });

            return deletedChannel;
        });

        return { success: true, data: result };
    } catch (error) {
        console.log(error);
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});

