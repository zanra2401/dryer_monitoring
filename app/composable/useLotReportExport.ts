const buildExcelReportUrl = (lotId: number) => `/api/report/lot-excel?lot_id=${lotId}`;
const buildPdfReportUrl = (lotId: number) => `/dryercfg/lot/${lotId}/report?print=1`;

const openInNewTab = (url: string) => {
    if (!import.meta.client) {
        return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
};

export const useLotReportExport = () => {
    const export_excel = (lotId: number) => {
        openInNewTab(buildExcelReportUrl(lotId));
    };

    const export_pdf = (lotId: number) => {
        openInNewTab(buildPdfReportUrl(lotId));
    };

    return {
        export_excel,
        export_pdf,
        buildExcelReportUrl,
        buildPdfReportUrl,
    };
};
