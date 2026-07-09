<script setup lang="ts">
    import Init from '~/components/bin/Init.vue';
    import Process from '~/components/bin/Process.vue';
    import GridLoader from '~/components/GridLoader.vue';
    import Header from '~/components/Header.vue';

    const toast = useToast();
    const route = useRoute();
    const lotNumber = route.params.lotNumber as string;
    const areaId = parseInt(route.params.areaId as string);
    const binNumber = route.params.binNumber as string;

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

    console.log('Data Laporan:', reportResponse.value?.data || []);

    const reportData = computed(() => (reportResponse.value?.data || []) as any[]);

</script>

<template>
    <div v-if="(!lotResponse?.data || !binResponse?.data) && lotNumber != 'start'" class="w-full h-screen flex justify-center items-center">
        <GridLoader />
    </div>
    <div v-else class="w-full max-w-full overflow-x-hidden min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header/>
        <main class="p-4 w-full max-w-full overflow-x-hidden">
            <Init v-if="lotNumber == 'start'" :areaId="areaId" :lotNumber="lotNumber" :binNumber="binNumber" />
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