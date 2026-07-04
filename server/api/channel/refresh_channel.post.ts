import  { prisma } from "~~/server/utils/prisma";
import thinkspeaks from "~~/server/utils/thinkspeaks";
import sqliteUtils from "~~/server/utils/sqlite";
import { FlagType } from "~/generated/sqlite/client";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { channel_id, area_id } = body;
        
        const channel = await prisma.channel.findFirst({
            where: {
                channelId: channel_id,
                areaId: area_id
            }
        });

        if (!channel) {
            setResponseStatus(event, 404);
            return { error: "Channel tidak ditemukan" };
        }

        const bins = (await prisma.bin.findMany({
            where: {
                channelId: channel_id,
                areaId: area_id
            },
            select: {
              binNumber: true,
            }  
        })).map(bin => bin.binNumber);

        const fetchedChannel = await thinkspeaks.get_channel(channel_id, channel.apiKey);
        if (!fetchedChannel) {
            setResponseStatus(event, 404);
            return { error: "Failed to fetch channel data from ThingSpeak" };
        }

        let fetched_bins: Record<string, any> = {};
        thinkspeaks.parse_bin(fetched_bins, fetchedChannel, area_id, channel_id);
        const will_be_deleted_bins = bins.filter(bin => !Object.keys(fetched_bins).includes(bin.toString()));
        const will_be_created_bins = Object.values(fetched_bins).filter(bin => !bins.includes(bin.binNumber));
       
        const result = await prisma.$transaction(async (prisma) => {
            if (will_be_deleted_bins.length > 0) {
                await prisma.bin.deleteMany({
                    where: {
                        areaId: area_id,
                        channelId: channel_id,
                        binNumber: {
                            in: will_be_deleted_bins
                        }
                    }
                });
            }

            if (will_be_created_bins.length > 0) {
                await prisma.bin.createMany({
                    data: will_be_created_bins,
                    skipDuplicates: true,
                });
            }

            await prisma.channel.update({
                where: {
                    channelId: channel_id,
                    areaId: area_id
                },
                data: {
                    nummberOfBin: Object.keys(fetched_bins).length
                }
            });
        });

        const binCount = (await sqliteUtils.getSystemFlag("binCount")) ? parseInt(await sqliteUtils.getSystemFlag("binCount") as string) - will_be_deleted_bins.length + will_be_created_bins.length : 0;
        await sqliteUtils.setSystemFlag("binCount", binCount.toString(), FlagType.NUMBER);

        return { success: true, data: [will_be_deleted_bins, will_be_created_bins] };
    } catch (error) {
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});