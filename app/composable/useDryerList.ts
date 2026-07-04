export const useDryerList = () => {
    const current_data = ref<any>(null);
    const error = ref<any>(null);
    const pagination_data = ref<any>({
        offset: 0,
        limit: 10,
    });

    const fetch_dryer_list = async () => {
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



    return {
        current_data,
        error,
        pagination_data,
        fetch_dryer_list,
    }
};