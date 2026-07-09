<script setup lang="ts">
    import Init from '~/components/bin/Init.vue';
    import Process from '~/components/bin/Process.vue';
    import GridLoader from '~/components/GridLoader.vue';
    import Header from '~/components/Header.vue';
    import { useDryerAuth } from '~/composable/useDryerAuth';

    const router = useRouter();
    const { user: sessionUser } = useDryerAuth();

    const toast = useToast();
    const route = useRoute();
    const lotNumber = route.params.lotNumber as string;
    const areaId = parseInt(route.params.areaId as string);
    const binNumber = route.params.binNumber as string;

    const isLimited = sessionUser.value?.role === 'OPERATOR' || sessionUser.value?.role === 'CLIENT';
    if (isLimited && sessionUser.value?.areaIds && !sessionUser.value.areaIds.includes(areaId)) {
        navigateTo('/dryer');
    }

    // Kueri Pembacaan (GET) menggunakan useFetch di top-level untuk SSR Hydration
    // Karena kita tidak dapat memanggil composable di dalam aksi, kita letakkan ini di top-level
    // dengan parameter 'key' yang kuat agar kita dapat menggunakan refreshNuxtData
    
    // Kueri Bin
    const { data: binResponse } = await useFetch<any>('/api/bin/bin', {
        method: 'GET',
        query: { area_id: areaId, bin_number: binNumber },
        key: `bin-${binNumber}`
    });

    // Kueri Lot
    const { data: lotResponse } = await useFetch<any>('/api/process/lot', {
        method: 'GET',
        query: { lot_number: lotNumber },
        key: `lot-${lotNumber}`
    });

    // Kueri Laporan Interval 30-Menit (Dinamis O(M))
    const { data: reportResponse } = await useFetch<any>('/api/process/report', {
        method: 'GET',
        query: { lot_number: lotNumber },
        key: `report-${lotNumber}`
    });

     

    const reportData = computed(() => (reportResponse.value?.data || []) as any[]);

</script>

<template>
    <div v-if="(!lotResponse?.data || !binResponse?.data) && lotNumber != 'start'" class="w-full h-screen flex justify-center items-center">
        <GridLoader />
    </div>
    <div v-else class="w-full max-w-full overflow-x-hidden min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header/>
        <main class="p-4 w-full max-w-full overflow-x-hidden">
            <div v-if="lotNumber == 'start' && sessionUser?.role === 'CLIENT'" class="p-8 text-center text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-none">
                <UIcon name="i-lucide-lock-keyhole" class="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p class="text-sm font-medium">Bin ini kosong.</p>
                <p class="text-xs text-gray-400 mt-1 mb-4">Client tidak memiliki izin untuk memulai pengeringan.</p>
                <UButton color="neutral" variant="subtle" class="rounded-none text-xs" @click="router.back()">Kembali</UButton>
            </div>
            <Init v-else-if="lotNumber == 'start'" :areaId="areaId" :lotNumber="lotNumber" :binNumber="binNumber" />
            <div v-else class="w-full max-w-full overflow-x-hidden">
                <div v-if="!reportData">Memuat Visualisasi Data...</div>
                <ClientOnly v-else>
                    <Process 
                        :areaId="areaId" 
                        :lotNumber="lotNumber" 
                        :binNumber="binNumber" 
                        :reportData="reportData" 
                        :lot="lotResponse.data.lot" 
                        :countLog="reportData.length" 
                    />
                </ClientOnly>
            </div>
        </main>
    </div>
</template>