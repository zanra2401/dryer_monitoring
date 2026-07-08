<script setup lang="ts">
    import { useBin } from '~/composable/dryer_page/useBin';
    import Header from '~/components/Header.vue';
    const route = useRoute();
    const toast = useToast();
    const areaId = parseInt(route.params.areaId as string);
    const { bins, fetch_bins } = useBin();  
    fetch_bins(areaId, toast);
</script>
<template>
    <div v-if="bins == null">
        LOADING
    </div>  
    <div v-else>
        <Header />
        <div class="grid min-h-screen p-2 grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
            <NuxtLink
                v-for="(data, idx) in bins.data"
                :key="data.binNummber"
                class="rounded-lg border p-2"
                :class="[
                    getCardClassByStatus(data),
                    'cursor-pointer transition-colors aspect-square hover:border-blue-300 dark:hover:border-blue-500' 
                ]"
                :to="`/dryer/${areaId}/bin/${data.binNumber}/${data.occupiedBy}`"
            >
                <div class="mb-1 text-xs font-bold">{{ data.binNumber || '-' }} <span class="font-medium">
                    {{ data.binStatus || '-' }}
                </span></div>

                <div class="mb-1 space-y-0.5 text-[11px]">
                    <div class="truncate font-medium">{{ data.occupiedBy || '-' }}</div>
                    <div class="flex items-center gap-1">
                        <span class="truncate">{{ data.hybrid || '-' }}</span>
                        <span class="truncate">{{ data.netToBin || '-' }}</span>
                    </div>
                </div>

                <div class="truncate text-[10px]">
                    {{ Math.floor((Date.now() - new Date(data.startTime).getTime()) / (1000 * 60 * 60)) }} Hrs                
                </div>
            </NuxtLink>
        </div>
    </div>
</template> 