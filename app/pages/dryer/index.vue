<script setup lang="ts">
    import { useDryerList } from '~/composable/useDryerList';
    import Header from '~/components/Header.vue';
    import GridLoader from '~/components/GridLoader.vue';

    const { current_data, fetch_dryer_list } = useDryerList();
    fetch_dryer_list();
</script>

<template>
    <div v-if="current_data == null">
        <div class="w-full h-screen flex justify-center items-center">
            <GridLoader />
        </div>
    </div>
    <div v-else>
        <Header />
        <div class="grid min-h-screen grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 p-4">
            <NuxtLink :to="`/dryer/${dryer.areaId}`" v-for="dryer in current_data.data" :key="dryer.id">
                <div class="min-h-24 aspect-square cursor-pointer rounded-lg border border-slate-200 bg-white p-2.5 text-center transition-all hover:border-blue-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-500">
                     <div class="flex h-full flex-col items-start justify-start gap-1.5 py-1">
                        <div class="text-md font-semibold leading-tight text-slate-800 dark:text-slate-100">
                            {{ dryer.name }}
                        </div>
                    </div>
                </div>
            </NuxtLink>
        </div>
    </div>  
</template>
