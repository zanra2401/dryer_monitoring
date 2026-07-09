export type DryerAreaOption = {
    label: string;
    value: number;
    name: string;
};

type DryerAreaResponse = {
    success: boolean;
    data: {
        areaId: number;
        name: string;
    }[];
};

export const useDryerAreaOptions = () => {
    const options = ref<DryerAreaOption[]>([]);
    const loading = ref(false);
    const error = ref<unknown>(null);

    const areaMap = computed(() => {
        return new Map(
            options.value.map((option) => [
                option.value,
                option,
            ]),
        );
    });

    const fetch_dryer_area_options = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await $fetch<DryerAreaResponse>("/api/dryarea/dry_areas", {
                method: "GET",
                params: {
                    limit: 100,
                    offset: 0,
                },
            });

            options.value = response.data
                .map((area) => ({
                    label: `${area.name} (#${area.areaId})`,
                    value: area.areaId,
                    name: area.name,
                }))
                .sort((left, right) => left.value - right.value);

            return options.value;
        } catch (err) {
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        options,
        loading,
        error,
        areaMap,
        fetch_dryer_area_options,
    };
};
