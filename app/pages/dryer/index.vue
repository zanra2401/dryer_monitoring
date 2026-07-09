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
    <div class="min-h-screeen" v-else>
        <Header />
        <b class="ml-2 mt-2">Dryer: </b>
        <br/>
        <div class="p-2">
            <NuxtLink :to="`/dryer/${dryer.areaId}`" class="w-full" v-for="dryer in current_data.data" :key="dryer.id">    
                <div class="w-max-800px w-full  rounded-none cursor-pointer border-2 border-slate-200 bg-white p-2.5 text-center transition-all hover:border-blue-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-500">
                     <div class="flex flex-col items-start justify-start gap-1.5 py-1">
                        <div class="text-md font-semibold leading-tight text-slate-800 dark:text-slate-100">
                            {{ dryer.name }}
                        </div>
                    </div>
                </div>
            </NuxtLink>
        </div>
    </div>  
</template>
