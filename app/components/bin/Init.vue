<script setup lang="ts">

const props = defineProps({
    areaId: {
        type: Number,
        required: true
    },
    binNumber: {
        type: Number,
        required: true
    }
});

const date = new Date("2026-07-01T04:12:20Z");

const lot_data = ref({
    lot_number: '1212',
    hybrid: '12',
    quality: '12',
    net_to_bin: 200,
    initial_mc: 20,
    start_time: date.toISOString(),
    area_id: props.areaId,
    bin_number: props.binNumber
});

const startDrying = async () => {
        const normalizedStartTime = new Date(lot_data.value.start_time).toISOString();

        console.log(lot_data.value);
        const { data, error } = await useFetch('/api/dryarea/process/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                ...lot_data.value,
                start_time: normalizedStartTime,
            }
        });

        if (error.value) {
            console.error('Error starting drying process:', error.value);
        } else {
            console.log('Drying process started successfully:', data.value);
        }
};

</script>

<template>
    <input v-model="lot_data.lot_number" placeholder="Lot Number"/>
    <input v-model="lot_data.hybrid" placeholder="Hybrid" />
    <input v-model="lot_data.quality" placeholder="quality" />
    <input v-model="lot_data.net_to_bin" placeholder="net_to_bin" />
    <input v-model="lot_data.initial_mc" placeholder="initial mc" />
    <input v-model="lot_data.start_time" placeholder="start time" />
    <button @click="startDrying">Mulai</button>
</template>