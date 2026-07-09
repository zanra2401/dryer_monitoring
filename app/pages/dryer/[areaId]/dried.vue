<script setup lang="ts">
    import { ref, h, computed, resolveComponent } from 'vue'
    import GridLoader from '~/components/GridLoader.vue';
    import Header from '~/components/Header.vue';

    import { useDryerAuth } from '~/composable/useDryerAuth';

    const route = useRoute();
    const router = useRouter();
    const { user: sessionUser } = useDryerAuth();
    const areaId = parseInt(route.params.areaId as string);
    const UButton = resolveComponent('UButton')
    const UIcon = resolveComponent('UIcon')

    const isLimited = sessionUser.value?.role === 'OPERATOR' || sessionUser.value?.role === 'CLIENT';
    if (isLimited && sessionUser.value?.areaIds && !sessionUser.value.areaIds.includes(areaId)) {
        navigateTo('/dryer');
    }

    const page = ref(1);
    const itemsPerPage = 15;

    const limit = itemsPerPage;
    const offset = computed(() => (page.value - 1) * itemsPerPage);

    const { data: lotsResponse, error } = await useFetch<any>('/api/lot/lots', {
        key: `dried-lots-area-${areaId}`,
        method: 'GET',
        query: { 
            area_id: areaId, 
            status: 'DRIED',
            limit: limit,
            offset: offset 
        },
        watch: [page]
    });

    const toast = useToast();
    if (error.value) {
        toast.add({
            title: "Gagal memuat data lot: " + (error.value?.statusMessage || "Unknown error"),
            color: "error"
        });
    }

    const lots = computed(() => lotsResponse.value?.data || []);

    const formatDateTime = (isoString?: string | null) => {
        if (!isoString) return '-';
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return '-';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = String(d.getFullYear()).slice(-2);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const calcDryingHours = (start?: string | null, end?: string | null) => {
        if (!start || !end) return '-';
        const diff = new Date(end).getTime() - new Date(start).getTime();
        if (isNaN(diff) || diff <= 0) return '-';
        return Math.round(diff / 3600000) + ' Hrs';
    };

    const columns = [
        {
            accessorKey: 'lotNumber',
            header: 'Lot Number',
            cell: ({ row }: any) => h('span', { class: 'font-mono font-medium text-sm' }, row.getValue('lotNumber'))
        },
        {
            accessorKey: 'binNumber',
            header: 'Bin',
            cell: ({ row }: any) => h('span', { class: 'text-sm' }, row.getValue('binNumber'))
        },
        {
            accessorKey: 'hybrid',
            header: 'Hybrid',
            cell: ({ row }: any) => h('span', { class: 'text-sm' }, row.getValue('hybrid') || '-')
        },
        {
            accessorKey: 'netToBin',
            header: 'Net (kg)',
            cell: ({ row }: any) => h('span', { class: 'font-mono text-sm' }, row.getValue('netToBin') ?? '-')
        },
        {
            id: 'mcRange',
            header: 'MC (Start/End)',
            cell: ({ row }: any) => {
                const start = row.original.initialMc
                const end = row.original.endMC
                return h('span', { class: 'font-mono text-sm' }, `${start ?? '-'}% / ${end ?? '-'}%`)
            }
        },
        {
            accessorKey: 'startTime',
            header: 'Start',
            cell: ({ row }: any) => h('span', { class: 'font-mono text-xs' }, formatDateTime(row.getValue('startTime')))
        },
        {
            accessorKey: 'endTime',
            header: 'End',
            cell: ({ row }: any) => h('span', { class: 'font-mono text-xs' }, formatDateTime(row.getValue('endTime')))
        },
        {
            id: 'durasi',
            header: 'Durasi',
            cell: ({ row }: any) => h('span', { class: 'font-mono text-xs' }, calcDryingHours(row.original.startTime, row.original.endTime))
        },
        {
            id: 'aksi',
            header: '',
            cell: ({ row }: any) => {
                return h(UButton, {
                    size: 'xs',
                    color: 'neutral',
                    variant: 'subtle',
                    class: 'rounded-none',
                    onClick: () => router.push(`/dryer/${areaId}/bin/${row.original.binNumber}/${row.original.lotNumber}`)
                }, () => [
                    h(UIcon, { name: 'i-lucide-eye', class: 'w-3 h-3 mr-1' }),
                    'Lihat'
                ])
            }
        }
    ]
</script>

<template>
    <div v-if="lotsResponse == null" class="w-full h-screen flex justify-center items-center">
        <GridLoader />
    </div>
    <div v-else>
        <Header />
        <div class="flex items-center justify-between p-2">
            <div class="flex items-center">
                <NuxtLink :to="`/dryer/${areaId}`" class="p-2 flex items-center">
                    <UIcon name="i-lucide-move-left" class="w-4 h-4 mr-1" />
                </NuxtLink>
                <b>Riwayat Lot Selesai (Dried)</b>
            </div>
            <UBadge color="neutral" variant="subtle" class="rounded-none">
                Total: {{ lotsResponse?.totalCount || 0 }}
            </UBadge>
        </div>

        <div v-if="!lots || lots.length === 0" class="p-8 text-center text-gray-400">
            <UIcon name="i-lucide-archive" class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p class="text-sm">Belum ada lot yang selesai dikeringkan di area ini.</p>
        </div>

        <div v-else class="p-2">
            <UCard class="rounded-none">
                <UTable 
                    :data="lots" 
                    :columns="columns"
                />
            </UCard>

            <div class="w-full flex justify-center items-center mt-4 mb-6">
                <UPagination v-model="page" :total="lotsResponse?.totalCount || 0" :items-per-page="itemsPerPage" />
            </div>
        </div>
    </div>
</template>
