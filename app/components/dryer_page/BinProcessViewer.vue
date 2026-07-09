<script setup lang="ts">
import { computed } from 'vue';
import Process from '~/components/bin/Process.vue';
import GridLoader from '~/components/GridLoader.vue';

const props = defineProps<{
    areaId: string
    binNumber: string
    lotNumber: string
}>()

// Fetch lot data
const { data: lotResponse, pending: pendingLot } = await useFetch<any>('/api/process/lot', {
    method: 'GET',
    query: { lot_number: props.lotNumber },
    key: `admin-lot-${props.lotNumber}`
});

// Fetch report data
const { data: reportResponse, pending: pendingReport } = await useFetch<any>('/api/process/report', {
    method: 'GET',
    query: { lot_number: props.lotNumber },
    key: `admin-report-${props.lotNumber}`
});

const reportData = computed(() => (reportResponse.value?.data || []) as any[]);
const isPending = computed(() => pendingLot.value || pendingReport.value);

</script>

<template>
    <div class="h-full w-full max-w-full flex flex-col bg-gray-50 dark:bg-gray-950 overflow-hidden">
        <!-- Header View -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 shrink-0">
            <h2 class="text-xl font-bold">Process View (Admin)</h2>
            <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="$emit('close')" />
        </div>
        
        <!-- Content -->
        <div class="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 min-w-0">
            <div v-if="isPending" class="w-full h-64 flex justify-center items-center">
                <GridLoader />
            </div>
            <div v-else-if="!lotResponse?.data">
                <UAlert color="red" variant="soft" title="Error" description="Gagal memuat data Lot." />
            </div>
            <ClientOnly v-else>
                <Process 
                    :areaId="parseInt(props.areaId)" 
                    :lotNumber="props.lotNumber" 
                    :binNumber="props.binNumber" 
                    :reportData="reportData" 
                    :lot="lotResponse.data.lot" 
                    :countLog="reportData.length" 
                />
            </ClientOnly>
        </div>
    </div>
</template>
