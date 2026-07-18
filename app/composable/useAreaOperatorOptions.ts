type OperatorOptionResponse = {
    success: boolean;
    data: Array<{
        userId: number;
        username: string;
        fullName: string;
    }>;
};

export const useAreaOperatorOptions = () => {
    const options = ref<Array<{ label: string; value: number }>>([]);
    const loading = ref(false);

    const fetch_operator_options = async (areaId: number | null | undefined) => {
        if (!areaId) {
            options.value = [];
            return options.value;
        }

        loading.value = true;

        try {
            const response = await $fetch<OperatorOptionResponse>("/api/user/operator-options", {
                method: "GET",
                params: {
                    area_id: areaId,
                },
            });

            options.value = response.data.map((user) => ({
                label: user.fullName,
                value: user.userId,
            }));

            return options.value;
        } finally {
            loading.value = false;
        }
    };

    return {
        options,
        loading,
        fetch_operator_options,
    };
};
