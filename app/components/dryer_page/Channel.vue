<script setup lang="ts">
    import { useChannelList } from '~/composable/dryer_page/useChannelList';
    import { useCRUDChannel } from '~/composable/dryer_page/useCRUDChannel';
    const { channel_list, error, fetch_channel_list } = useChannelList();
    
    const props = defineProps({
        areaId: {
            type: String,
            required: true
        }
    });

    fetch_channel_list(parseInt(props.areaId));
    const { refresh_channels, delete_channel, edit_state, edit_data, change_edit_state, update_channel } = useCRUDChannel();

</script>

<template>
    Channel Page
    <div v-if="channel_list == null">
        LOADING
    </div>
    <div v-else>
        <div v-if="edit_state">
            <input :style="{
                marginRight: '20px'
            }" type="text" v-model="edit_data.channel_id" placeholder="Enter channel name" disabled />
            <input type="text" v-model="edit_data.api_key" placeholder="Enter API key" />
            <button @click="update_channel(parseInt(props.areaId))">Update</button>
            <button @click="change_edit_state(false)">Cancel</button>
        </div>
        <div v-for="channel in channel_list.data" :key="channel.id">
            {{ channel.channelId }}
            </br>
            {{ channel.apiKey }}
            </br>
            {{ channel.nummberOfBin }}

            <button @click="refresh_channels(parseInt(props.areaId), channel.channelId)" >Refresh</button>
            <button @click="change_edit_state(!edit_state, channel.channelId, channel.apiKey)">
                {{ edit_state && edit_data.channel_id == channel.channelId ? 'Cancel' : 'Edit' }}
            </button>
            <button @click="delete_channel(parseInt(props.areaId), channel.channelId)">Delete</button>
        </div>
    </div>
</template>