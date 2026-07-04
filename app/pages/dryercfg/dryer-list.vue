<script setup>
    import { useDryerList } from "~/composable/useDryerList";

    const route = useRoute();
    const { fetch_dryer_list, current_data } = useDryerList();
    fetch_dryer_list();
</script>

<template>
    <div v-if="current_data == null">
        LOADING
    </div>
    <div v-else>
        <div v-for="dryer in current_data.data" :key="dryer.id">
            <NuxtLink :to="`/dryercfg/dryer/${dryer.id}`">
                {{ dryer.name }}
            </NuxtLink>

            <NuxtLink :to="`/dryercfg/dryer/${dryer.id}/edit`">
                Edit
            </NuxtLink>
        </div>
    </div>
</template>