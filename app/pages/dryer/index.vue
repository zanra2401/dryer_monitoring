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
        <br/>
        <div class="p-2">
            <NuxtLink :to="`/dryer/${dryer.areaId}`" class="w-full" v-for="dryer in current_data.data" :key="dryer.id">    
                <div class="w-full max-w-2xl mx-auto rounded-lg cursor-pointer border-2 border-slate-200 bg-white p-4 text-left transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-500 mb-3 flex items-center justify-between">
                     <div class="flex items-center gap-4">
                        <div class="p-3 rounded-none bg-blue-50 dark:bg-blue-900/30 stext-blue-600 dark:text-blue-400">
                            <UIcon name="i-lucide-factory" class="w-6 h-6" />
                        </div>
                        <div>
                            <div class="text-lg font-bold leading-tight text-slate-800 dark:text-slate-100">
                                {{ dryer.name }}
                            </div>
                            <div class="text-sm text-slate-500 mt-1 flex items-center gap-3">
                                <span><UIcon name="i-lucide-box" class="w-4 h-4 inline align-text-bottom mr-1"/>{{ dryer.totalBins || 0 }} Total Bins</span>
                                <span><UIcon name="i-lucide-activity" class="w-4 h-4 inline align-text-bottom mr-1 text-green-500"/>{{ dryer.activeBins || 0 }} Aktif</span>
                            </div>
                        </div>
                    </div>
                    <UIcon name="i-lucide-chevron-right" class="w-5 h-5 text-gray-400" />
                </div>
            </NuxtLink>
        </div>
    </div>  
</template>
