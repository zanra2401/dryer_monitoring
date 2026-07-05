<script setup lang="ts">
    import { useDryerList } from '~/composable/useDryerList';

    const { current_data, fetch_dryer_list } = useDryerList();
    fetch_dryer_list();
</script>

<template>
    <div v-if="current_data == null">
        LOADING
    </div>
    <div v-else>
        <div v-for="dryer in current_data.data" :key="dryer.id">
            <NuxtLink :to="`/dryer/${dryer.areaId}`">
                {{ dryer.name }}
            </NuxtLink>
        </div>
    </div>  
</template>
