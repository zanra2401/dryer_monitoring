import * as z from "zod";

const createChannelSchema = z.object({
    area_id: z.number().int().positive("Area ID must be a positive integer"),
    channels: z.array(z.string().min(1, "Channel name is required")).min(1, "At least one channel name is required"),
    api_keys: z.array(z.string().min(1, "API key is required")).min(1, "At least one API key is required"),
});

export const useCRUDChannel = () => {
    const channels = ref<string|null>(null);
    const api_keys = ref<string|null>(null);
    const edit_state = ref<boolean>(false);

    const edit_data = ref<any>({
        channel_id: null,
        api_key: null,
    });

    const channel_arr = computed(() => {
        if (!channels.value) return [];
        return channels.value.split(',').map(channel => channel.trim());
    });

    const api_key_arr = computed(() => {
        if (!api_keys.value) return [];
        return api_keys.value.split(',').map(api_key => api_key.trim());
    });


    const post_channels = async (area_id: number) => {
        const data_to_validate = {
            area_id: area_id,
            channels: channel_arr.value,
            api_keys: api_key_arr.value,
        };

        try {
            createChannelSchema.parse(data_to_validate);
            console.log("valid");
        } catch (err: unknown) {
            console.log("test");
            if (err instanceof z.ZodError) {
                alert("Validation error: " + err.issues.map(issue => issue.message).join(", "));
                return null;
            }
            alert("Error creating channels: " + err || "Unknown error");
            return null;
        }

        const { data, error } = await useFetch('/api/channel/channels', {
            method: 'POST',
            body: data_to_validate,
        });

        console.log("Response data:", data_to_validate);

        if (error.value) {
            alert("Error creating channels: " + error.value?.statusMessage || "Unknown error");
            return null;
        }

        return data;
    };    


    const refresh_channels = async (area_id: number, channel_id: string) => {
        const { data, error } = await useFetch('/api/channel/refresh_channel', {
            method: 'POST',
            body: { area_id, channel_id },
        });

        if (error.value) {
            alert("Error refreshing channels: " + error.value?.statusMessage || "Unknown error");
            return null;
        }

        alert("Channel refreshed successfully");
        return data;
    };

    const delete_channel = async (area_id: number, channel_id: string) => {
        const { data, error } = await useFetch('/api/channel/channel', {
            method: 'DELETE',
            body: { area_id, channel_id },
        });

        if (error.value) {
            alert("Error deleting channel: " + error.value?.statusMessage || "Unknown error");
            return null;
        }

        alert("Channel deleted successfully");
        return data;
    }


    const change_edit_state = (state: boolean, channel_id: string|null = null, api_key: string|null = null) => {
        edit_state.value = state;
        edit_data.value.channel_id = channel_id;
        edit_data.value.api_key = api_key;
    }

    const update_channel = async (area_id: number) => {
        const { data, error } = await useFetch('/api/channel/channel', {
            method: 'PUT',
            body: {
                area_id: area_id,
                channel_id: edit_data.value.channel_id,
                api_key: edit_data.value.api_key,
            },
        });

        if (error.value) {
            alert("Error updating channel: " + error.value?.statusMessage || "Unknown error");
            return null;
        }
        alert("Channel updated successfully");
        return data;
    }

    return {
        channels,
        api_keys,
        post_channels,
        refresh_channels,
        delete_channel,
        change_edit_state,
        edit_state,
        edit_data,
        update_channel,
    }
}