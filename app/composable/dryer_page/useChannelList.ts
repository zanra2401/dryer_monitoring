export const useChannelList = () => {
    const channel_list = ref<any>(null);
    const error = ref<Record<string, any>|null>(null);

    const fetch_channel_list = async (area_id: number, toast: any) => {
        channel_list.value = [];
        try {
            const { data, error } = await useFetch('/api/channel/channels', {
                method: 'GET',
                query: {
                    area_id: area_id,
                }
            });

            
            if (error.value) {
                throw new Error(error.value.statusMessage || "Unknown error");
            }

            channel_list.value = data.value;
        } catch (err: any) {
            toast.add({
                title: "Error fetching channel list: " + err.message || "Unknown error",
                color: "error" 
            });
            error.value = err;
        }
    }

    return {
        channel_list,
        error,
        fetch_channel_list,
    };
};