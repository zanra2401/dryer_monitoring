export const LOT_STATUSES = ["UPAIR", "DOWNAIR", "DRIED"] as const;
export const LOT_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export type LotStatus = (typeof LOT_STATUSES)[number];
export type LotPageSize = (typeof LOT_PAGE_SIZE_OPTIONS)[number];
export type DecimalValue = number | string | null;

export type LotRow = {
    lotId: number;
    lotNumber: string;
    hybrid: string | null;
    quality: string | null;
    netToBin: DecimalValue;
    initialMc: DecimalValue;
    status: LotStatus;
    createdBy: number | null;
    binNumber: number;
    areaId: number;
    startTime: string;
    endTime: string | null;
};

type LotListResponse = {
    success: boolean;
    data: LotRow[];
    totalCount: number;
};

export const useLotList = () => {
    const current_data = ref<LotListResponse | null>(null);
    const error = ref<unknown>(null);
    const loading = ref(false);

    const pagination_data = ref({
        offset: 0,
        limit: 10,
    });

    const filter_data = ref<{
        area_ids: number[];
        statuses: LotStatus[];
        bin_numbers: number[];
        search: string;
    }>({
        area_ids: [],
        statuses: [],
        bin_numbers: [],
        search: "",
    });

    const total_page = computed(() => {
        if (pagination_data.value.limit === 0 || !current_data.value?.totalCount) {
            return 0;
        }

        return Math.ceil(current_data.value.totalCount / pagination_data.value.limit);
    });

    const page = computed(() => Math.floor(pagination_data.value.offset / pagination_data.value.limit) + 1);

    const hasNext = computed(() => {
        return Boolean(
            current_data.value &&
            pagination_data.value.offset + pagination_data.value.limit < current_data.value.totalCount,
        );
    });

    const hasPrev = computed(() => pagination_data.value.offset - pagination_data.value.limit >= 0);

    const fetch_lot_list = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await $fetch<LotListResponse>("/api/lot/lots", {
                method: "GET",
                params: {
                    limit: pagination_data.value.limit,
                    offset: pagination_data.value.offset,
                    area_ids: filter_data.value.area_ids.length > 0 ? filter_data.value.area_ids : undefined,
                    statuses: filter_data.value.statuses.length > 0 ? filter_data.value.statuses : undefined,
                    bin_numbers: filter_data.value.bin_numbers.length > 0 ? filter_data.value.bin_numbers : undefined,
                    search: filter_data.value.search || undefined,
                },
            });

            current_data.value = response;
            return response;
        } catch (err) {
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const reset_pagination = () => {
        pagination_data.value.offset = 0;
    };

    const next = async () => {
        if (!hasNext.value) {
            return;
        }

        pagination_data.value.offset += pagination_data.value.limit;
        await fetch_lot_list();
    };

    const prev = async () => {
        if (!hasPrev.value) {
            return;
        }

        pagination_data.value.offset -= pagination_data.value.limit;
        await fetch_lot_list();
    };

    const set_area_ids = async (areaIds: number[]) => {
        filter_data.value.area_ids = [...new Set(areaIds)];
        reset_pagination();
        await fetch_lot_list();
    };

    const set_statuses = async (statuses: LotStatus[]) => {
        filter_data.value.statuses = [...new Set(statuses)];
        reset_pagination();
        await fetch_lot_list();
    };

    const set_bin_numbers = async (binNumbers: number[]) => {
        filter_data.value.bin_numbers = [...new Set(binNumbers)];
        reset_pagination();
        await fetch_lot_list();
    };

    const set_search = async (search: string) => {
        filter_data.value.search = search;
        reset_pagination();
        await fetch_lot_list();
    };

    const set_limit = async (limit: LotPageSize) => {
        pagination_data.value.limit = limit;
        reset_pagination();
        await fetch_lot_list();
    };

    return {
        current_data,
        error,
        loading,
        pagination_data,
        filter_data,
        total_page,
        page,
        hasNext,
        hasPrev,
        fetch_lot_list,
        next,
        prev,
        reset_pagination,
        set_area_ids,
        set_statuses,
        set_bin_numbers,
        set_search,
        set_limit,
    };
};
