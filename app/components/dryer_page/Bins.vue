<script setup lang="ts">
    import { h, resolveComponent } from 'vue'
    import type { TableColumn } from '@nuxt/ui'
    import type { Row } from '@tanstack/vue-table'
    import { useBin } from '~/composable/dryer_page/useBin';
    import BinProcessViewer from './BinProcessViewer.vue';

    const UButton = resolveComponent('UButton')
    const UDropdownMenu = resolveComponent('UDropdownMenu')
    const props = defineProps({
        areaId: {
            type: String,
            required: true
        }
    });

    const toast = useToast();

    // State untuk View Process
    const isViewerOpen = ref(false);
    const viewerLot = ref('');
    const viewerBin = ref('');

    type Bin = {
        binNumber: string
        channelIdTop: string | null
        channelIdBottom: string | null
        areaId: string
        fieldTempTop: string | null
        fieldTempBottom: string | null
        fieldRhTop: string | null
        fieldRhBottom: string | null
        binStatus: string
        occupiedBy: string | null
        isAlertTemperature?: boolean
        latestLog?: {
            tempTop: number | null
            rhTop: number | null
            tempBottom: number | null
            rhBottom: number | null
            timestamp: string
        } | null
    }

    const columns: TableColumn<Bin>[] = [
    {
        accessorKey: 'binNumber',
        header: 'Bin Number',
        cell: ({ row }) => {
            return row.getValue('binNumber');
        }
    },
    {
        accessorKey: 'channels',
        header: 'Channels',
        cell: ({ row }) => {
            const top = row.original.channelIdTop;
            const bottom = row.original.channelIdBottom;
            
            const badges = [];
            if (top) badges.push(h('span', { class: 'inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mr-1' }, `Top: ${top}`));
            if (bottom) badges.push(h('span', { class: 'inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20' }, `Bot: ${bottom}`));
            
            return h('div', { class: 'flex' }, badges.length ? badges : h('span', { class: 'text-gray-400' }, '-'));
        }
    },
    {
        id: 'tempTop',
        header: 'Suhu Atas',
        cell: ({ row }) => {
            const log = row.original.latestLog;
            if (!log) return h('span', { class: 'text-gray-400' }, '-');
            const isAlert = row.original.isAlertTemperature && row.original.binStatus === 'DOWNAIR';
            return h('div', { class: 'flex flex-col' }, [
                h('span', { class: `font-medium ${isAlert ? 'text-red-500 font-bold' : ''}` }, log.tempTop !== null ? `${log.tempTop}°C` : '-'),
                h('span', { class: 'text-xs text-gray-500' }, log.rhTop !== null ? `RH: ${log.rhTop}%` : 'RH: -')
            ]);
        }
    },
    {
        id: 'tempBottom',
        header: 'Suhu Bawah',
        cell: ({ row }) => {
            const log = row.original.latestLog;
            if (!log) return h('span', { class: 'text-gray-400' }, '-');
            const isAlert = row.original.isAlertTemperature && row.original.binStatus === 'UPAIR';
            return h('div', { class: 'flex flex-col' }, [
                h('span', { class: `font-medium ${isAlert ? 'text-red-500 font-bold' : ''}` }, log.tempBottom !== null ? `${log.tempBottom}°C` : '-'),
                h('span', { class: 'text-xs text-gray-500' }, log.rhBottom !== null ? `RH: ${log.rhBottom}%` : 'RH: -')
            ]);
        }
    },
    {
        accessorKey: 'binStatus',
        header: 'Bin Status',
        cell: ({ row }) => {
            const status = row.getValue('binStatus') as string;
            const displayStatus = status === 'WAITING_TO_SHELLING' ? 'WTS' : status;
            const isAlert = row.original.isAlertTemperature;
            
            if (isAlert) {
                return h('span', { class: 'text-red-600 font-bold flex items-center gap-1' }, [
                    h('span', { class: 'i-lucide-triangle-alert w-4 h-4' }),
                    displayStatus
                ]);
            }
            return displayStatus;
        }
    },
    {
        accessorKey: 'occupiedBy',
        header: 'Occupied By',
        cell: ({ row }) => {
        return row.getValue('occupiedBy');
        }
    },
    {
        id: 'actions',
        meta: {
        class: {
            td: 'text-right'
        }
        },
        cell: ({ row }) => {
        return h(
            UDropdownMenu,
            {
            content: {
                align: 'end'
            },
            items: getRowItems(row),
            'aria-label': 'Actions dropdown'
            },
            () =>
            h(UButton, {
                icon: 'i-lucide-ellipsis-vertical',
                color: 'neutral',
                variant: 'ghost',
                'aria-label': 'Actions dropdown'
            })
        )
        }
    }
    ]

    function getRowItems(row: Row<Bin>) {
        const items = [];
        
        items.push({
            label: 'Field Konfigurasi',
            type: 'label'
        });
        
        items.push({
            label: `Top: ${row.original.fieldTempTop || '-'} / ${row.original.fieldRhTop || '-'}`,
            icon: 'i-lucide-info'
        });
        
        items.push({
            label: `Bot: ${row.original.fieldTempBottom || '-'} / ${row.original.fieldRhBottom || '-'}`,
            icon: 'i-lucide-info'
        });

        items.push({ type: 'separator' });
        
        if (row.getValue('binStatus') !== 'IDLE' && row.getValue('occupiedBy')) {
            items.push({
                label: 'View Process',
                icon: 'i-lucide-activity',
                onSelect() {
                    viewerLot.value = row.getValue('occupiedBy') as string;
                    viewerBin.value = row.getValue('binNumber') as string;
                    isViewerOpen.value = true;
                }
            });
        } else {
            items.push({
                label: 'Tidak ada proses aktif',
                disabled: true
            });
        }
        
        return items;
    }

    const { bins, fetch_bins } = useBin();   
    fetch_bins(parseInt(props.areaId), toast);
</script>

<template>
    <div class="space-y-4">
        <div class="rounded-lg border border-default bg-default">
            <div class="overflow-x-auto">
                <UTable v-if="bins != null" :data="bins.data" :columns="columns" class="min-w-[520px]">
                    <template #empty-state>
                        <div class="flex flex-col items-center justify-center py-12">
                            <UIcon name="i-lucide-box" class="w-12 h-12 text-gray-400 mb-3" />
                            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Belum Ada Bin</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Bin akan muncul otomatis setelah Anda menambahkan Channel telemetri.</p>
                        </div>
                    </template>
                </UTable>
            </div>
        </div>
    </div>

    <!-- Modal Fullscreen Viewer -->
    <UModal v-model:open="isViewerOpen" fullscreen>
        <template #content>
            <BinProcessViewer 
                v-if="isViewerOpen"
                :areaId="props.areaId"
                :binNumber="viewerBin"
                :lotNumber="viewerLot"
                @close="isViewerOpen = false"
            />
        </template>
    </UModal>
</template>

