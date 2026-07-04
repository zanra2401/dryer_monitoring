const thinkspeaks = {
    get: async function (channel_id: string, api_key: string) {
        const url = `https://api.thingspeak.com/channels/${channel_id}/feeds.json?api_key=${api_key}`;
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
    } 

}

export default thinkspeaks;
    