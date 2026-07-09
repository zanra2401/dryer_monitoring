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
        channelId: string
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
        accessorKey: 'channelId',
        header: 'Channel ID',
        cell: ({ row }) => {
        return row.getValue('channelId');
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
    <UTable v-if="bins != null" :data="bins.data" :columns="columns" class="flex-1">
        <template #empty-state>
            <div class="flex flex-col items-center justify-center py-12">
                <UIcon name="i-lucide-box" class="w-12 h-12 text-gray-400 mb-3" />
                <h3 class="text-base font-semibold text-gray-900 dark:text-white">Belum Ada Bin</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Bin akan muncul otomatis setelah Anda menambahkan Channel telemetri.</p>
            </div>
        </template>
    </UTable>

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

