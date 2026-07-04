import { BinStatus } from "~/generated/prisma/client";
import sqliteUtils from "~~/server/utils/sqlite";
import { FlagType } from "~/generated/sqlite/client";

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

        const binCount = (await sqliteUtils.getSystemFlag("binCount")) ? parseInt(await sqliteUtils.getSystemFlag("binCount") as string) - result.deletedBinsCount : 0 - result.deletedBinsCount;
        await sqliteUtils.setSystemFlag("binCount", binCount.toString(), FlagType.NUMBER);

        return { success: true, data: result };
    } catch (error) {
        console.log(error);
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});

