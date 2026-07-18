export const LOG_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export type LogPageSize = (typeof LOG_PAGE_SIZE_OPTIONS)[number];
export type LogDecimalValue = number | string | null;

export type LogRow = {
    logId: number;
    lotId: number;
    isStandaloneMcLog: boolean;
    timestampThingspeak: string;
    statusBin: string;
    tempTop: LogDecimalValue;
    rhTop: LogDecimalValue;
    tempBottom: LogDecimalValue;
    rhBottom: LogDecimalValue;
    mc: LogDecimalValue;
    checkerName: string | null;
    remark: string | null;
};

type LogListResponse = {
    success: boolean;
    data: LogRow[];
    totalCount: number;
    nextLogTimestamp?: string;
};

export const useLogList = () => {
    const current_data = ref<LogListResponse | null>(null);
    const error = ref<unknown>(null);
    const loading = ref(false);
    const lot_id = ref<number | null>(null);

    const pagination_data = ref({
        offset: 0,
        limit: 10,
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

    const fetch_log_list = async (lotId?: number) => {
        if (lotId !== undefined) {
            lot_id.value = lotId;
        }

        if (!lot_id.value) {
            current_data.value = {
                success: true,
                data: [],
                totalCount: 0,
            };
            return current_data.value;
        }

        loading.value = true;
        error.value = null;

        try {
            const response = await $fetch<LogListResponse>("/api/log/logs", {
                method: "GET",
                params: {
                    lot_id: lot_id.value,
                    limit: pagination_data.value.limit,
                    offset: pagination_data.value.offset,
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
        await fetch_log_list();
    };

    const prev = async () => {
        if (!hasPrev.value) {
            return;
        }

        pagination_data.value.offset -= pagination_data.value.limit;
        await fetch_log_list();
    };

    const set_limit = async (limit: LogPageSize) => {
        pagination_data.value.limit = limit;
        reset_pagination();
        await fetch_log_list();
    };

    return {
        current_data,
        error,
        loading,
        lot_id,
        pagination_data,
        total_page,
        page,
        hasNext,
        hasPrev,
        fetch_log_list,
        next,
        prev,
        reset_pagination,
        set_limit,
    };
};
