import thinkspeaks from "~~/server/utils/thinkspeaks";
import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { channels, apikeys, area_id } = body;

        if (!channels || !apikeys || channels.length !== apikeys.length) {
            setResponseStatus(event, 400);
            return { error: "Invalid request body" };
        }

        const result = await prisma.$transaction(async (prisma) => {
            const bins: Record<string, any> = {};
    
            const channelPromises = channels.map((channel_id: string, i: number) => 
                thinkspeaks.get_channel(channel_id, apikeys[i]).catch(error => {
                    console.error(`Failed to fetch channel ${channel_id}:`, error);
                    return null; // Return null agar tidak menggagalkan seluruh Promise.all
                })
            );
    
            const fetchedChannels = await Promise.all(channelPromises);
    
            for (let i = 0; i < fetchedChannels.length; i++) {
                const channel = fetchedChannels[i];
                const channel_id = channels[i];
                const channel_created = await prisma.channel.create({
                    data: {
                        channelId: channel_id,
                        areaId: area_id,
                        apiKey: apikeys[i]
                    }
                });
    
                if (!channel) {
                    setResponseStatus(event, 404);
                    return { error: `Channel not found or API Key invalid for channel_id: ${channel_id}` };
                }
    
                Object.keys(channel)
                    .filter(key => key.startsWith("field") && channel[key]) // Pastikan field tidak kosong
                    .forEach((key) => {
                        const field_label = channel[key] as string;
                        const field_data = field_label.split('-'); 
                        if (field_data.length != 2) {
                            return;
                        }
                        
                        const bin_group_key = field_data[0]!.trim(); 
                        const metadata = field_data[1] ? field_data[1].trim() : key;
    
                        if (!bins[bin_group_key]) {
                            bins[bin_group_key] = {
                                "binNumber": parseInt(bin_group_key),
                                "areaId": area_id,
                                "channelId": channel_id,
                            }
                        }
    
                        bins[bin_group_key]["field" + field_data[1]?.split("_").map(data => {
                            return data.charAt(0).toUpperCase() + data.slice(1).toLowerCase();
                        }).join("")] = key;
                    });
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