
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

        console.log(data.value)

        lot_log.value = data.value || null;
    }

    return {
        lot_log,
        fetch_lot_log,
        data,
    }
};
