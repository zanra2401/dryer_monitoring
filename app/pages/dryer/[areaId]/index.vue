<script setup lang="ts">
    import GridLoader from '~/components/GridLoader.vue';
    import Header from '~/components/Header.vue';
    import { useDryerAuth } from '~/composable/useDryerAuth';
    
    const route = useRoute();
    const toast = useToast();
    const { user: sessionUser } = useDryerAuth();
    const areaId = parseInt(route.params.areaId as string);

    const isLimited = sessionUser.value?.role === 'OPERATOR' || sessionUser.value?.role === 'CLIENT';
    if (isLimited && sessionUser.value?.areaIds && !sessionUser.value.areaIds.includes(areaId)) {
        navigateTo('/dryer');
    }

    // Kueri Pembacaan (GET) menggunakan useFetch di top-level untuk SSR Hydration
    const { data: bins, error } = await useFetch('/api/bin/bins', {
        key: `bins-area-${areaId}`, // Kunci khusus untuk Auto-Refresh Nuxt
        method: 'GET',
        query: { area_id: areaId }
    });

    if (error.value) {
        toast.add({
            title: "Gagal memuat data: " + (error.value?.statusMessage || "Unknown error"),
            color: "error" 
        });
    }
</script>
<template>
    <div v-if="bins == null" class="w-full h-screen flex justify-center items-center">
        <GridLoader />
    </div>  
    <div v-else>
        <Header />
        <div class="flex items-center justify-between p-2">
            <div class="flex items-center">
                <NuxtLink class="p-2 flex items-center" to="/dryer">
                    <UIcon name="i-lucide-move-left" class="w-4 h-4 mr-1" />
                </NuxtLink>
                <b>
                    {{ bins.dryerArea?.name || 'Unknown Area' }}
                </b>
            </div>
            <NuxtLink :to="`/dryer/${areaId}/COMPLETED`">
                <UButton 
                    color="neutral" 
                    variant="subtle" 
                    class="rounded-none text-xs"
                >
                    <UIcon name="i-lucide-archive" class="w-3.5 h-3.5 mr-1" />
                    Riwayat COMPLETED
                </UButton>
            </NuxtLink>
        </div>
        <div v-if="bins.data && bins.data.length > 0" class="grid content-start p-2 sm:p-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <NuxtLink
            v-for="(data, idx) in bins.data"
            :key="data.binNumber"
            :to="`/dryer/${areaId}/bin/${data.binNumber}/${data.occupiedBy ?? 'start'}`"
            class="flex flex-col border p-0 cursor-pointer transition-colors rounded-sm   aspect-square hover:shadow-md shadow-sm"
            :class="[
                data.isAlertTemperature ? 'border-red-500 bg-red-200 text-red-950 dark:border-red-600 dark:bg-red-900/40 dark:text-red-100' : getCardClassByStatus(data.binStatus) 
            ]"
        >
            <div class="p-1.5 border-b flex items-center justify-between text-xs font-bold bg-white/80 dark:bg-gray-900/80">
                <div class="flex-1 text-blue-600 dark:text-blue-400 flex justify-center border-r border-inherit">
                    {{ data.latestLog?.tempTop?.toFixed(2) ?? '-' }} C
                </div>
                <div class="flex-1 text-green-600 dark:text-green-400 flex justify-center"> 
                    {{ data.latestLog?.rhTop?.toFixed(2) ?? '-' }} %
                </div>
            </div>

            <div class="p-1.5 flex-1 flex flex-col justify-center">
                <div class="mb-1 text-xs font-bold flex justify-between items-center">
                    <span>{{ data.binNumber || '-' }}</span>
                    <span class="flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold px-1.5 py-0.5 border rounded-none bg-white/80 dark:bg-gray-800">
                        <UIcon v-if="data.binStatus === 'UPAIR'" name="i-lucide-arrow-up" class="w-3 h-3 text-green-600 dark:text-green-400" />
                        <UIcon v-else-if="data.binStatus === 'DOWNAIR'" name="i-lucide-arrow-down" class="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <UIcon v-else-if="data.binStatus === 'DRIER'" name="i-lucide-flame" class="w-3 h-3 text-red-600 dark:text-red-400" />
                        <UIcon v-else-if="data.binStatus === 'WAITING_TO_SHELLING'" name="i-lucide-check-circle" class="w-3 h-3 text-green-600 dark:text-green-400" />
                        <UIcon v-else name="i-lucide-circle" class="w-3 h-3 text-gray-500 dark:text-gray-400" />
                        {{ data.binStatus === 'WAITING_TO_SHELLING' ? 'WTS' : (data.binStatus || 'IDLE') }}
                    </span>
                </div>
    
                <div class="mb-1 space-y-0.5 text-xs">
                    <div class="truncate font-medium">{{ data.occupiedBy || '-' }}</div>
                    <div class="flex items-center gap-1 opacity-90">
                        <span class="truncate">{{ data.hybrid || '-' }}</span>
                        <span>•</span>
                        <span class="truncate">{{ data.netToBin || '-' }} kg</span>
                    </div>
                </div>
    
                <div class="truncate text-[11px] font-mono mt-auto pt-1 border-t border-inherit/30">
                    {{ data.startTime ? Math.floor((Date.now() - new Date(data.startTime).getTime()) / (1000 * 60 * 60)) + ' Hrs' : '-' }}                
                </div>
            </div>

            <div class="p-1.5 border-t flex items-center justify-between text-xs font-bold bg-white/80 dark:bg-gray-900/80">
                <div class="flex-1 text-blue-600 dark:text-blue-400 flex justify-center border-r border-inherit">
                    {{ data.latestLog?.tempBottom?.toFixed(2) ?? '-' }} C
                </div>
                <div class="flex-1 text-green-600 dark:text-green-400 flex justify-center"> 
                    {{ data.latestLog?.rhBottom?.toFixed(2) ?? '-' }} %
                </div>
            </div>
        </NuxtLink>
        </div>
        
        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center h-[70vh] px-4 text-center">
            <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <UIcon name="i-lucide-boxes" class="w-12 h-12 text-gray-400" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Belum Ada Bin Aktif</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm">Area pengeringan ini belum memiliki bin yang terdaftar atau aktif. Hubungi administrator untuk menambahkan konfigurasi bin baru.</p>
        </div>
    </div>
</template> 