import thinkspeaks from "~~/server/utils/thinkspeaks";
import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { channels, api_keys, area_id } = body;
        if (!channels || !api_keys || channels.length !== api_keys.length) {
            setResponseStatus(event, 400);
            return { error: "Invalid request body" };
        }

        const result = await prisma.$transaction(async (prisma) => {
            
            const fetchedChannels = await thinkspeaks.fetch_channels(channels, api_keys);


            const bins: Record<string, any> = {};
            
            for (let i = 0; i < fetchedChannels.length; i++) {
                const channel = fetchedChannels[i];
                const channel_id = channels[i];


                const channel_created = await prisma.channel.create({
                    data: {
                        channelId: channel_id,
                        areaId: area_id,
                        apiKey: api_keys[i]
                    }
                });

                thinkspeaks.parse_bin(bins, channel, area_id, channel_id);

                if (!channel) {
                    setResponseStatus(event, 404);
                    return { error: `Channel not found or API Key invalid for channel_id: ${channel_id}` };
                }

                
                
            }
    
            const result = await prisma.bin.createMany({
                data: Object.values(bins),
                skipDuplicates: true,
            });

            return result.count;
        });

        return { success: true, data: `${result} bins successfully saved to database` };

    } catch (error) {
        setResponseStatus(event, 500);
        return { error: "Internal Server Error" };
    }
});