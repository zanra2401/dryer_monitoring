import thinkspeaks from "~~/server/utils/thinkspeaks";
import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { channels, api_keys, area_id } = body;
        if (!channels || !api_keys || channels.length !== api_keys.length) {
            throw createError({
                statusCode: 400,
                statusMessage: "Channels and API keys must be provided and have the same length",
            });
        }

        const result = await prisma.$transaction(async (prisma) => {
            const fetchedChannels = await thinkspeaks.fetch_channels(channels, api_keys);


            const bins: Record<string, any> = {};
            
            for (let i = 0; i < fetchedChannels.length; i++) {
                const channel = fetchedChannels[i];
                const channel_id = channels[i];



                thinkspeaks.parse_bin(bins, channel, area_id, channel_id);

                const channel_created = await prisma.channel.create({
                    data: {
                        channelId: channel_id,
                        areaId: area_id,
                        apiKey: api_keys[i],
                        nummberOfBin: Object.keys(bins).length,
                    }
                });


                if (!channel) {
                    throw createError({
                        statusCode: 404,
                        statusMessage: `Channel ${channel_id} not found in Thinkspeaks`,
                    });
                } 
            }
    
            let updatedCount = 0;
            for (const bin of Object.values(bins) as any[]) {
                await prisma.bin.upsert({
                    where: {
                        binNumber_areaId: {
                            binNumber: bin.binNumber,
                            areaId: bin.areaId
                        }
                    },
                    update: {
                        ...(bin.channelIdTop ? { channelIdTop: bin.channelIdTop } : {}),
                        ...(bin.channelIdBottom ? { channelIdBottom: bin.channelIdBottom } : {}),
                        ...(bin.fieldTempTop ? { fieldTempTop: bin.fieldTempTop } : {}),
                        ...(bin.fieldRhTop ? { fieldRhTop: bin.fieldRhTop } : {}),
                        ...(bin.fieldTempBottom ? { fieldTempBottom: bin.fieldTempBottom } : {}),
                        ...(bin.fieldRhBottom ? { fieldRhBottom: bin.fieldRhBottom } : {}),
                    },
                    create: bin
                });
                updatedCount++;
            }

            return updatedCount;
        });

        return { success: true, data: `${result} bins successfully saved to database` };

    } catch (error: unknown) {
        return error;
    }
});