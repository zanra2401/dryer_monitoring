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
        fieldTempTop: number
        fieldTempBottom: number
        fieldRhTop: number
        fieldRhBottom: number
        binStatus: string
        occupiedBy: string | null
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
        accessorKey: 'fieldTempTop',
        header: 'Field Temp Top',
        cell: ({ row }) => {
        return row.getValue('fieldTempTop');
        }
    },
    {
        accessorKey: 'fieldTempBottom',
        header: 'Field Temp Bottom',
        cell: ({ row }) => {
        return row.getValue('fieldTempBottom');
        }
    },
    {
        accessorKey: 'fieldRhTop',
        header: 'Field Rh Top',
        cell: ({ row }) => {
        return row.getValue('fieldRhTop');
        }
    },
    {
        accessorKey: 'fieldRhBottom',
        header: 'Field Rh Bottom',
        cell: ({ row }) => {
        return row.getValue('fieldRhBottom');
        }
    },
    {
        accessorKey: 'binStatus',
        header: 'Bin Status',
        cell: ({ row }) => {
        return row.getValue('binStatus');
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

