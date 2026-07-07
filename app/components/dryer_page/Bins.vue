<script setup lang="ts">
    import { h, resolveComponent } from 'vue'
    import type { TableColumn } from '@nuxt/ui'
    import type { Row } from '@tanstack/vue-table'

    import { useBin } from '~/composable/dryer_page/useBin';
    const UButton = resolveComponent('UButton')
    const UDropdownMenu = resolveComponent('UDropdownMenu')
    const props = defineProps({
        areaId: {
            type: String,
            required: true
        }
    });

    const toast = useToast();

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
    return [                    
        {
            label: 'View',
            onSelect() {
                console.log("View");
            }
        },

    ]
    }

    const { bins, fetch_bins } = useBin();   
    fetch_bins(parseInt(props.areaId), toast);
</script>

<template>
    <UTable v-if="bins != null" :data="bins.data" :columns="columns" class="flex-1" />
</template>

