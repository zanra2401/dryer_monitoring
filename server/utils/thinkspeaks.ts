const thinkspeaks = {
    get: async function (channel_id: string, api_key: string) {
        const url = `https://api.thingspeak.com/channels/${channel_id}/feeds.json?api_key=${api_key}&timezone=Asia/Jakarta`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    },

    get_channel: async function (channel_id: string, api_key: string) { 
        try {
            return (await thinkspeaks.get(channel_id, api_key)).channel;  
        } catch (error) {
            console.error("Error fetching channel:", error);
            throw error; 
        }
    },

    get_feeds: async function (channel_id: string, api_key: string) {      
        try {
            return (await thinkspeaks.get(channel_id, api_key)).feeds;
        } catch (error) {
            console.error("Error fetching feeds:", error);
            throw error; 
        }
    },

    parse_bin: async function (bins: Record<string, any>, channel: any, area_id: number, channel_id: string) {
        try {
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
        } catch (error) {
            console.error("Error fetching bin data:", error);
            throw error; 
        }
    },

    fetch_channels: async function (channels: string[], api_keys: string[]) {
        try {
            const channelPromises = channels.map((channel_id: string, i: number) => 
                thinkspeaks.get_channel(channel_id, api_keys[i]!).catch(error => {
                    console.error(`Failed to fetch channel ${channel_id}:`, error);
                    return null; // Return null agar tidak menggagalkan seluruh Promise.all
                })
            );
            
            return await Promise.all(channelPromises);
        } catch (error) {
            console.error("Error fetching client data:", error);
            throw error; 
        }
    },

    get_feeds_by_time: async function (channel_id: string, api_key: string, time: any) {
        try {
            const url = `https://api.thingspeak.com/channels/${channel_id}/feeds.json?api_key=${api_key}&start=${time.start_time}&end=${time.end_time}&timezone=Asia/Jakarta`;
            console.info(`[thinkspeaks] url=${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw createError({
                    statusCode: response.status,
                    statusMessage: `Failed to fetch feeds for channel ${channel_id}`,
                });
            }
            const data = await response.json();
            
            return data;
        } catch (error) {
            throw error; 
        }
    }
}

export default thinkspeaks;
    