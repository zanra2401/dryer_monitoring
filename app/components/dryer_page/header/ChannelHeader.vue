<script setup lang="ts">
import { useCRUDChannel } from '~/composable/dryer_page/useCRUDChannel';
    const props = defineProps({
        areaId: {
            type: String,
            required: true
        }
    });

    const { api_keys, post_channels, channels } = useCRUDChannel();
</script>

<template>
    Channel Header
    <div>
        Area ID: {{ props.areaId }}
    </div>
    <div>
        <input :style="{
            marginRight: '20px'
        }" type="text" v-model="channels" placeholder="Enter channel name" />
        <input type="text" v-model="api_keys" placeholder="Enter API key" />
        <button :style="{
            marginLeft: '20px'
        }" @click="post_channels(parseInt(props.areaId))"  >add</button>
    </div>
</template>