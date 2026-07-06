export const useSingleBin = () => {
    const bin = ref<Record<string, any>|null>(null);

    const fetch_bin = async (area_id: number, bin_number: number) => {
        bin.value = null;
        const { data, error } = await useFetch('/api/bin/bin', {
            method: 'GET',
            query: {
                area_id: area_id,
                bin_number: bin_number,
            }
        });

        if (error.value) {
            alert("Error fetching bin: " + error.value?.statusMessage || "Unknown error");
            return null;
        }
        bin.value = data.value as Record<string, any>;
        return data.value;
    }

    return {
        bin,
        fetch_bin,
    }
}