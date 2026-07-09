export type LotReportLogRow = {
    date: string;
    hour: string;
    minute: string;
    tempTop: string;
    tempBottom: string;
    rhTop: string;
    rhBottom: string;
    mc: string;
    remarks: string;
};

export type LotReportData = {
    lotId: number;
    lotNumber: string;
    dryerAreaName: string;
    binNumber: number;
    hybrid: string;
    quality: string;
    status: string;
    netToBin: string;
    depthMeter: string;
    startTime: string;
    downTime: string;
    stopTime: string;
    mcStart: string;
    mcDown: string;
    mcEnd: string;
    totalDrying: string;
    dryDown: string;
    dryingRate: string;
    rows: LotReportLogRow[];
    totalLogCount: number;
    overflowLogCount: number;
};

type LotReportResponse = {
    success: boolean;
    data: LotReportData;
};

export const useLotReport = () => {
    const current_data = ref<LotReportData | null>(null);
    const loading = ref(false);
    const error = ref<unknown>(null);

    const fetch_lot_report = async (lotId: number) => {
        loading.value = true;
        error.value = null;

        try {
            const response = await $fetch<LotReportResponse>("/api/report/lot", {
                method: "GET",
                params: {
                    lot_id: lotId,
                },
            });

            current_data.value = response.data;
            return response.data;
        } catch (err) {
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        current_data,
        loading,
        error,
        fetch_lot_report,
    };
};
