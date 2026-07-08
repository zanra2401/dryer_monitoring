
const data = (logs: any[]) => {
    const data = ref<any[]>([]);
    const tempTop = ref<any[]>([]);
    const tempBottom = ref<any[]>([]);
    const rhTop = ref<any[]>([]);
    const rhBottom = ref<any[]>([]);
    const mc = ref<any[]>([]);
    const status = ref<any[]>([]);
    const time = ref<any[]>([]);

    for (const log of logs) {
        data.value?.push(log);
        tempTop.value?.push(Number(log.tempTop));
        tempBottom.value?.push(Number(log.tempBottom));
        rhTop.value?.push(Number(log.rhTop));
        rhBottom.value?.push(Number(log.rhBottom));
        mc.value?.push(Number(log.mc));
        status.value?.push(Number(log.statusBin));
        time.value?.push(log.timestampThingspeak);
    }

    return {
        data,
        tempTop,
        tempBottom,
        rhTop,
        rhBottom,
        mc,
        status,
        time
    }
    
}

export const useLot = () => {
    const lot_log = ref<any| null>(null);
    
    const fetch_lot_log = async (lot_number: string, toast: any) => {
        const {data,error} = await useFetch('/api/process/lot', {
            method: 'GET',
            query: { lot_number }
        });

        if (error.value) {
            toast.add({
                title: 'Error' + error.value.statusMessage,
                color: 'error',
            })
        }


        lot_log.value = data.value || null;
    }

    const change_log_page = async (page: number, lot_number: string, toast: any) => {
        try {
            // KOREKSI FATAL: Menggunakan $fetch natif untuk interaksi asinkron sisi klien
            const response = await $fetch('/api/process/logs', {
                method: 'GET',
                query: { 
                    offset: (page - 1) * 15, 
                    lot_number: lot_number 
                }
            });
            // Mengembalikan data mentah dari API
            return response.data || null;

        } catch (error: any) {
            // Ekstraksi pesan galat yang lebih presisi
            const errorMessage = error.data?.message || error.statusMessage || error.message || 'Terjadi kegagalan komunikasi dengan peladen.';
            
            // Pemanggilan modul Toast dengan parameter warna yang valid
            toast.add({
                title: 'Transmisi Gagal',
                description: errorMessage,
                color: 'error',
                icon: 'i-heroicons-x-circle'
            });

            return null;
        }
    }

    return {
        lot_log,
        fetch_lot_log,
        data,
        change_log_page
    }
};
