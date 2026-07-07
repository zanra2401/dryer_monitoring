export const useBin = () => {
    const bins = ref<Record<string, any>|null>(null);    

    const fetch_bins = async (area_id: number, toast: any) => {
        bins.value = null;
        const { data, error } = await useFetch('/api/bin/bins', {
            method: 'GET',
            query: {
                area_id: area_id,
            }
        });

        if (error.value) {
            toast.add({
                title: "Error fetching bins: " + error.value?.statusMessage || "Unknown error",
                color: "error" 
            });
            return null;
        }

        
        bins.value = data.value as Record<string, any>;
        return data.value;
    }


    return {
        bins,
        fetch_bins,
    }

}