<script setup lang="ts">
    import { useBin } from '~/composable/dryer_page/useBin';
    import GridLoader from '~/components/GridLoader.vue';
    import Header from '~/components/Header.vue';
    const route = useRoute();
    const toast = useToast();
    const areaId = parseInt(route.params.areaId as string);
    const { bins, fetch_bins } = useBin();  
    fetch_bins(areaId, toast);
</script>
<template>
    <div v-if="bins == null" class="w-full h-screen flex justify-center items-center">
        <GridLoader />
    </div>  
    <div v-else>
        <Header />
        <div class="flex items-center">
            <a class="p-2 flex items-center" href="/dryer">
                <UIcon name="i-lucide-move-left" class="w-4 h-4 mr-1" />
            </a>
            <b>
                {{ bins.dryerArea.name || 'Unknown Area' }}
            </b>
        </div>
        <div class="grid min-h-screen p-2 grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
        <NuxtLink
            v-for="(data, idx) in bins.data"
            :key="data.binNumber"
            :to="`/dryer/${areaId}/bin/${data.binNumber}/${data.occupiedBy ?? 'start'}`"
            class="flex flex-col border p-0 cursor-pointer transition-colors rounded-sm   aspect-square hover:shadow-md shadow-sm"
            :class="[
                // Perbaikan Fatal 1: Mengakses properti status, bukan seluruh objek
                getCardClassByStatus(data.binStatus) 
            ]"
        >
            <div class="p-1 border-b flex items-center justify-between text-[10px] font-bold bg-white/50 dark:bg-black/20">
                <div class="flex-1 text-blue-600 dark:text-blue-400 flex justify-center border-r border-inherit">
                    {{ data.latestLog?.tempTop ?? '-' }} C
                </div>
                <div class="flex-1 text-green-600 dark:text-green-400 flex justify-center"> 
                    {{ data.latestLog?.rhTop ?? '-' }} %
                </div>
            </div>

            <div class="p-1.5 flex-1 flex flex-col justify-center">
                <div class="mb-1 text-xs font-bold flex justify-between items-center">
                    <span>{{ data.binNumber || '-' }}</span>
                    <span class="text-[9px] uppercase tracking-wider font-bold px-1 py-0.5 border rounded-none bg-white/60 dark:bg-black/30">
                        {{ data.binStatus || 'IDLE' }}
                    </span>
                </div>
    
                <div class="mb-1 space-y-0.5 text-[11px]">
                    <div class="truncate font-medium">{{ data.occupiedBy || '-' }}</div>
                    <div class="flex items-center gap-1 opacity-90">
                        <span class="truncate">{{ data.hybrid || '-' }}</span>
                        <span>•</span>
                        <span class="truncate">{{ data.netToBin || '-' }} kg</span>
                    </div>
                </div>
    
                <div class="truncate text-[10px] font-mono mt-auto pt-1 border-t border-inherit/30">
                    {{ data.startTime ? Math.floor((Date.now() - new Date(data.startTime).getTime()) / (1000 * 60 * 60)) + ' Hrs' : '-' }}                
                </div>
            </div>

            <div class="p-1 border-t flex items-center justify-between text-[10px] font-bold bg-white/50 dark:bg-black/20">
                <div class="flex-1 text-blue-600 dark:text-blue-400 flex justify-center border-r border-inherit">
                    {{ data.latestLog?.tempBottom ?? '-' }} C
                </div>
                <div class="flex-1 text-green-600 dark:text-green-400 flex justify-center"> 
                    {{ data.latestLog?.rhBottom ?? '-' }} %
                </div>
            </div>
        </NuxtLink>
    </div>
    </div>
</template> 