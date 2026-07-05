export const useDryerList = () => {
    const current_data = ref<any>(null);
    const error = ref<any>(null);
    
    const pagination_data = ref<any>({
        offset: 0,
        limit: 10,
    });
    
    const total_page = computed(() => {
        if (pagination_data.value.limit === 0) return 0;
        if (!current_data.value || !current_data.value.totalCount) return 0;
        return Math.ceil(current_data.value.totalCount / pagination_data.value.limit);
    });

    const hasNext = computed(() => {
        return pagination_data.value.offset + pagination_data.value.limit < current_data.value.totalCount;
    });

    const hasPrev = computed(() => {
        return pagination_data.value.offset - pagination_data.value.limit >= 0;
    });

    const fetch_dryer_list = async () => {
        current_data.value = null;
        try {
            const response = await $fetch('/api/dryarea/dry_areas', {
                method: 'GET',
                params: {
                    limit: pagination_data.value.limit,
                    offset: pagination_data.value.offset,
                },
            });

            current_data.value = response;
        } catch (err) {
            error.value = err;
        }
    }

    const next = () => {
        if (pagination_data.value.offset + pagination_data.value.limit < current_data.value.totalCount) {
            pagination_data.value.offset += pagination_data.value.limit;
            fetch_dryer_list();
        }
    }

    const prev = () => {
        if (pagination_data.value.offset - pagination_data.value.limit >= 0) {
            pagination_data.value.offset -= pagination_data.value.limit;
            fetch_dryer_list();
        }
    }

    return {
        current_data,
        error,
        pagination_data,
        fetch_dryer_list,
        next,
        prev,
        hasNext,
        hasPrev,
        total_page,
    }
};