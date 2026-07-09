export type BinOption = {
    label: string;
    value: number;
    areaId: number;
    binNumber: number;
    binStatus: string;
    occupiedBy: string | null;
};

type BinResponse = {
    success: boolean;
    data: {
        areaId: number;
        binNumber: number;
        binStatus: string;
        occupiedBy: string | null;
    }[];
};

const toOption = (bin: BinResponse["data"][number]): BinOption => ({
    label: `Bin ${bin.binNumber}`,
    value: bin.binNumber,
    areaId: bin.areaId,
    binNumber: bin.binNumber,
    binStatus: bin.binStatus,
    occupiedBy: bin.occupiedBy,
});

export const useBinOptions = () => {
    const options = ref<BinOption[]>([]);
    const loading = ref(false);
    const error = ref<unknown>(null);

    const fetch_bin_options = async (areaIds: number[], dedupeByBinNumber = false) => {
        loading.value = true;
        error.value = null;

        try {
            const uniqueAreaIds = [...new Set(areaIds)].filter((areaId) => Number.isInteger(areaId) && areaId > 0);

            if (uniqueAreaIds.length === 0) {
                options.value = [];
                return options.value;
            }

            const results = await Promise.allSettled(
                uniqueAreaIds.map((areaId) => $fetch<BinResponse>("/api/bin/bins", {
                    method: "GET",
                    params: {
                        area_id: areaId,
                    },
                })),
            );

            const mergedOptions = results
                .filter((result): result is PromiseFulfilledResult<BinResponse> => result.status === "fulfilled")
                .flatMap((result) => result.value.data.map(toOption))
                .sort((left, right) => {
                    if (left.binNumber !== right.binNumber) {
                        return left.binNumber - right.binNumber;
                    }

                    return left.areaId - right.areaId;
                });

            options.value = dedupeByBinNumber
                ? Array.from(
                    mergedOptions.reduce((map, option) => {
                        if (!map.has(option.binNumber)) {
                            map.set(option.binNumber, {
                                ...option,
                                label: `Bin ${option.binNumber}`,
                                value: option.binNumber,
                            });
                        }

                        return map;
                    }, new Map<number, BinOption>()).values(),
                )
                : mergedOptions;

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
        fetch_bin_options,
    };
};
