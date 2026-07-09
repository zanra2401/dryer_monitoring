<script setup lang="ts">
    import { useChannelList } from '~/composable/dryer_page/useChannelList';
    import { useCRUDChannel } from '~/composable/dryer_page/useCRUDChannel';
    import { useDryerAuth } from '~/composable/useDryerAuth';
    const { channel_list, error, fetch_channel_list } = useChannelList();

    import { h, resolveComponent } from 'vue'
    import type { TableColumn } from '@nuxt/ui'
    import type { Row } from '@tanstack/vue-table'
    import { useRoute, useRouter } from 'vue-router';


    const route = useRoute();
    const router = useRouter();
    const toast = useToast();

    const UButton = resolveComponent('UButton')
    const UDropdownMenu = resolveComponent('UDropdownMenu')

    const props = defineProps({
        areaId: {
            type: String,
            required: true
        },
    });

    const { refresh_channels, delete_channel, edit_state, edit_data, change_edit_state, update_channel } = useCRUDChannel();
    const { user: sessionUser } = useDryerAuth();
    const isReadOnly = computed(() => sessionUser.value?.role !== 'ADMIN');

    const visibleColumns = computed(() => {
        if (isReadOnly.value) {
            return columns.filter((col) => col.id !== 'actions');
        }
        return columns;
    });

    type Channel = {
        channelId: string
        areaId: string
        apiKey: string
        nummberOfBin: number
    }

    const columns: TableColumn<Channel>[] = [
        {
            accessorKey: 'channelId',
            header: 'Channel ID',
            cell: ({ row }) => {
            return row.getValue('channelId');
            }
        },
        {
            accessorKey: 'areaId',
            header: 'Area ID',
            cell: ({ row }) => {
            return row.getValue('areaId');
            }
        },
        {
            accessorKey: 'apiKey',
            header: 'Api Key',
            cell: ({ row }) => {
            return row.getValue('apiKey');
            }
        },
        {
            accessorKey: 'nummberOfBin',
            header: 'Number of Bins',
            cell: ({ row }) => {
            return row.getValue('nummberOfBin');
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

        function getRowItems(row: Row<Channel>) {
        return [                    
            {
                label: 'Refresh',
                onSelect() {
                    refresh_channels(parseInt(props.areaId), row.getValue('channelId'), toast);
                }
            },
            {
            label: "Edit",
                meta: {
                    class: {
                    th: 'text-right',
                    td: 'text-right font-medium'
                    }
                },
                onSelect() {
                    change_edit_state(true, row.getValue('channelId'), row.getValue('apiKey'));
                }
            },
            {
                label: 'Hapus',
                icon: 'i-lucide-trash-2',
                onSelect() {
                    if (window.confirm(`Apakah Anda yakin ingin menghapus channel ID: ${row.getValue('channelId')}? Semua bin yang terhubung akan ikut terpengaruh.`)) {
                        delete_channel(parseInt(props.areaId), row.getValue('channelId'), toast);
                    }
                }
            },
        ]
        }

    await fetch_channel_list(parseInt(props.areaId), toast);
</script>

<template>
    <div class="space-y-4">
        <div class="rounded-lg border border-default bg-default">
            <div class="overflow-x-auto">
                <UTable :data="channel_list.data" :columns="visibleColumns" class="min-w-[520px]" />
            </div>
        </div>
    </div>

    <UModal v-model:open="edit_state" title="Edit Channel" @close="change_edit_state(false)" @confirm="update_channel(parseInt(props.areaId), toast)">
        <template #body>
            <div>
                <UFormField label="Channel ID">
                    <UInput v-model="edit_data.channel_id" class="flex" disabled/>
                </UFormField>
                <UFormField label="API Key">
                    <UInput v-model="edit_data.api_key" class="flex" />
                </UFormField>
            </div>
        </template>
        <template #footer>
            <UButton color="primary" @click="update_channel(parseInt(props.areaId), toast)">Save</UButton>
        </template>
    </UModal>
</template>