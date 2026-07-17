import type { LotReportData, LotReportLogRow } from "~/composable/useLotReport";

const buildExcelReportUrl = (lotId: number) => `/api/report/lot-excel?lot_id=${lotId}`;
const REPORT_LOGO_URL = "/templates/dryer-report-logo.png";

const sanitizeFilename = (value: string) => value.replace(/[<>:"/\\|?*]+/g, "-").trim() || "lot-report";

const getFilenameFromDisposition = (value: string | null, fallback: string) => {
    if (!value) {
        return fallback;
    }

    const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i);

    if (utf8Match?.[1]) {
        return decodeURIComponent(utf8Match[1]);
    }

    const filenameMatch = value.match(/filename="?([^"]+)"?/i);
    return filenameMatch?.[1] ?? fallback;
};

const triggerBlobDownload = (blob: Blob, filename: string) => {
    if (!import.meta.client) {
        return;
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

const MIN_REPORT_ROWS = 39;
const TEMP_THRESHOLD_MIN = 38;
const TEMP_THRESHOLD_MAX = 43;

const ensureRows = (rows: LotReportLogRow[]) => {
    const filledRows = [...rows];

    while (filledRows.length < MIN_REPORT_ROWS) {
        filledRows.push({
            date: "",
            hour: "",
            minute: "",
            tempTop: "",
            tempBottom: "",
            rhTop: "",
            rhBottom: "",
            mc: "",
            status: "",
            tempTopValue: null,
            tempBottomValue: null,
            rhTopValue: null,
            rhBottomValue: null,
            mcValue: null,
            hourValue: null,
            minuteValue: null,
        });
    }

    return filledRows;
};

const normalizeStatus = (status: string | null | undefined) => String(status ?? "").replace(/[\s_-]+/g, "").toUpperCase();

const isOutOfThreshold = (value: number | null | undefined) => {
    return typeof value === "number" && Number.isFinite(value) && (value < TEMP_THRESHOLD_MIN || value > TEMP_THRESHOLD_MAX);
};

const shouldMarkTempTop = (row: LotReportLogRow) => {
    return normalizeStatus(row.status) === "DOWNAIR" && isOutOfThreshold(row.tempTopValue);
};

const shouldMarkTempBottom = (row: LotReportLogRow) => {
    return normalizeStatus(row.status) === "UPAIR" && isOutOfThreshold(row.tempBottomValue);
};

const loadImageElement = (src: string) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        if (!import.meta.client) {
            reject(new Error("Image loading is only available on client"));
            return;
        }

        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Failed to load report logo"));
        image.src = src;
    });
};

export const useLotReportExport = () => {
    const export_excel = async (lotId: number) => {
        const response = await fetch(buildExcelReportUrl(lotId), {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(`Failed to export Excel (${response.status})`);
        }

        const blob = await response.blob();
        const filename = getFilenameFromDisposition(
            response.headers.get("content-disposition"),
            `lot-report-${lotId}.xlsx`,
        );

        triggerBlobDownload(blob, filename);
    };

    const export_pdf = async (report: LotReportData, filename: string) => {
        const { jsPDF } = await import("jspdf");

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            compress: true,
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const tableX = 6;
        const firstTableY = 56;
        const continuationTableY = 20;
        const tableCols = [22, 14, 14, 20, 20, 20, 20, 16, 24];
        const tableWidth = tableCols.reduce((total, value) => total + value, 0);
        const rowHeight = 4.35;
        const headerTopHeight = 6.2;
        const headerSubHeight = 4.4;
        const headerHeight = headerTopHeight + headerSubHeight;
        const rows = ensureRows(report.rows);
        const bottomMargin = 10;
        const logoImage = await loadImageElement(REPORT_LOGO_URL).catch(() => null);

        const colLeft = (index: number) => tableX + tableCols.slice(0, index).reduce((total, value) => total + value, 0);
        const colWidth = (index: number) => tableCols[index] ?? 0;

        const setFont = (size: number, bold = false) => {
            pdf.setFont("helvetica", bold ? "bold" : "normal");
            pdf.setFontSize(size);
            pdf.setTextColor(0, 0, 0);
        };

        const fitFontSize = (text: string, maxWidth: number, startSize: number, minSize = 3.2) => {
            let size = startSize;

            while (size > minSize) {
                pdf.setFontSize(size);
                if (pdf.getTextWidth(text) <= maxWidth) {
                    return size;
                }

                size -= 0.2;
            }

            return minSize;
        };

        const drawText = (
            textValue: string | number | null | undefined,
            left: number,
            top: number,
            width: number,
            height: number,
            options: {
                align?: "left" | "center" | "right";
                fontSize?: number;
                minFontSize?: number;
                bold?: boolean;
                padding?: number;
                color?: [number, number, number];
            } = {},
        ) => {
            const text = textValue === null || textValue === undefined ? "" : String(textValue);
            const padding = options.padding ?? 1;
            const align = options.align ?? "left";
            const startSize = options.fontSize ?? 6;
            setFont(startSize, options.bold);
            const finalSize = fitFontSize(text, Math.max(width - padding * 2, 1), startSize, options.minFontSize ?? 3.2);
            setFont(finalSize, options.bold);
            if (options.color) {
                pdf.setTextColor(...options.color);
            }

            const x = align === "center"
                ? left + width / 2
                : align === "right"
                    ? left + width - padding
                    : left + padding;
            const y = top + height / 2 + finalSize * 0.13;

            pdf.text(text, x, y, {
                align,
                baseline: "middle",
            });
        };

        const drawCell = (
            left: number,
            top: number,
            width: number,
            height: number,
            fill?: [number, number, number],
        ) => {
            if (fill) {
                pdf.setFillColor(...fill);
            }

            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.18);
            pdf.rect(left, top, width, height, fill ? "FD" : "S");
        };

        const drawLogo = () => {
            if (!logoImage) {
                return;
            }

            const maxWidth = 22;
            const maxHeight = 11;
            const ratio = Math.min(maxWidth / logoImage.width, maxHeight / logoImage.height);
            pdf.addImage(logoImage, "PNG", 7, 17, logoImage.width * ratio, logoImage.height * ratio);
        };

        const drawTableHeader = (tableY: number) => {
            drawCell(tableX, tableY, colWidth(0), headerHeight, [192, 192, 192]);
            drawCell(colLeft(1), tableY, colWidth(1), headerHeight, [192, 192, 192]);
            drawCell(colLeft(2), tableY, colWidth(2), headerHeight, [192, 192, 192]);
            drawCell(colLeft(3), tableY, colWidth(3) + colWidth(4), headerTopHeight, [192, 192, 192]);
            drawCell(colLeft(5), tableY, colWidth(5) + colWidth(6), headerTopHeight, [192, 192, 192]);
            drawCell(colLeft(7), tableY, colWidth(7), headerHeight, [192, 192, 192]);
            drawCell(colLeft(8), tableY, colWidth(8), headerHeight, [192, 192, 192]);

            for (let index = 3; index <= 6; index += 1) {
                drawCell(colLeft(index), tableY + headerTopHeight, colWidth(index), headerSubHeight, [191, 191, 191]);
            }

            drawText("Date/Time", tableX, tableY, colWidth(0), headerHeight, { align: "center", bold: true, fontSize: 4.8, padding: 0.5 });
            drawText("Hour", colLeft(1), tableY, colWidth(1), headerHeight, { align: "center", bold: true, fontSize: 4.8, padding: 0.5 });
            drawText("Minute", colLeft(2), tableY, colWidth(2), headerHeight, { align: "center", bold: true, fontSize: 4.8, padding: 0.5 });
            drawText("Suhu (C)", colLeft(3), tableY, colWidth(3) + colWidth(4), headerTopHeight, { align: "center", bold: true, fontSize: 4.8, padding: 0.5 });
            drawText("RH (%)", colLeft(5), tableY, colWidth(5) + colWidth(6), headerTopHeight, { align: "center", bold: true, fontSize: 4.8, padding: 0.5 });
            drawText("MC (%)", colLeft(7), tableY, colWidth(7), headerHeight, { align: "center", bold: true, fontSize: 4.8, padding: 0.5 });
            drawText("Status", colLeft(8), tableY, colWidth(8), headerHeight, { align: "center", bold: true, fontSize: 4.8, padding: 0.5 });

            ["Top", "Down", "Top", "Down"].forEach((label, index) => {
                drawText(label, colLeft(index + 3), tableY + headerTopHeight, colWidth(index + 3), headerSubHeight, {
                    align: "center",
                    bold: true,
                    fontSize: 4.7,
                    padding: 0.5,
                });
            });
        };

        const drawReportRow = (row: LotReportLogRow, tableY: number, rowIndex: number) => {
            const top = tableY + headerHeight + rowIndex * rowHeight;
            const values = [
                row.date,
                row.hour,
                row.minute,
                row.tempTop,
                row.tempBottom,
                row.rhTop,
                row.rhBottom,
                row.mc,
                row.status,
            ];

            tableCols.forEach((width, index) => {
                const left = colLeft(index);
                drawCell(left, top, width, rowHeight);
                drawText(values[index], left, top, width, rowHeight, {
                    align: index === 0 ? "left" : "center",
                    fontSize: index === 0 ? 3.8 : index === 8 ? 4.5 : 5.1,
                    minFontSize: index === 0 ? 2.8 : 3,
                    padding: 0.7,
                    color: index === 3 && shouldMarkTempTop(row)
                        ? [220, 38, 38]
                        : index === 4 && shouldMarkTempBottom(row)
                            ? [220, 38, 38]
                            : undefined,
                });
            });
        };

        const fillPage = () => {
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, pageWidth, pageHeight, "F");
        };

        const drawTitleAndSummary = () => {
            fillPage();
            drawLogo();
            setFont(13, true);
            pdf.text("DRYING MONITORING REPORT", pageWidth / 2, 23, {
                align: "center",
                baseline: "middle",
            });

            if (report.dryerAreaName) {
                setFont(7.5, true);
                pdf.text(report.dryerAreaName, pageWidth / 2, 30, {
                    align: "center",
                    baseline: "middle",
                });
            }

            const summaryRows = [
                ["Bin No", report.binNumber, "Status Quality", report.quality, "Date/Time Start", report.startTime, "MC Start", report.mcStart, "Hour", report.hour],
                ["Lot No", report.lotNumber, "Net To Bin (Kg)", report.netToBin, "Date/Time Down", report.downTime, "MC Down", report.mcDown, "Dry down", report.dryDown],
                ["Varietas", report.hybrid, "Depth (Meter)", report.depthMeter, "Date/Time Stop", report.stopTime, "MC End", report.mcEnd, "Drying Rate", report.dryingRate],
            ];
            const summaryY = 37;
            const summaryGapY = 6.1;
            const summaryPairs: Array<[number, number, number]> = [
                [6, 13, 27],
                [45, 24, 25],
                [82, 27, 34],
                [126, 18, 23],
                [158, 20, 24],
            ];

            summaryRows.forEach((row, rowIndex) => {
                summaryPairs.forEach(([left, labelWidth, valueWidth], pairIndex) => {
                    const label = String(row[pairIndex * 2] ?? "");
                    const value = String(row[pairIndex * 2 + 1] ?? "");
                    const top = summaryY + rowIndex * summaryGapY;
                    drawText(label, left, top, labelWidth, 4.5, {
                        fontSize: 5.2,
                        minFontSize: 4.2,
                        padding: 0,
                    });
                    drawText(`: ${value}`, left + labelWidth, top, valueWidth, 4.5, {
                        fontSize: label.startsWith("Date/Time") ? 4.4 : 5.2,
                        minFontSize: 3.3,
                        padding: 0,
                    });
                });
            });
        };

        const drawTablePage = (pageRows: LotReportLogRow[], tableY: number) => {
            drawTableHeader(tableY);
            pageRows.forEach((row, rowIndex) => drawReportRow(row, tableY, rowIndex));
            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.32);
            pdf.rect(tableX, tableY, tableWidth, headerHeight + pageRows.length * rowHeight, "S");
        };

        const firstPageCapacity = Math.max(1, Math.floor((pageHeight - firstTableY - headerHeight - bottomMargin) / rowHeight));
        const continuationCapacity = Math.max(1, Math.floor((pageHeight - continuationTableY - headerHeight - bottomMargin) / rowHeight));
        let cursor = 0;

        drawTitleAndSummary();
        const firstRows = rows.slice(cursor, cursor + firstPageCapacity);
        drawTablePage(firstRows, firstTableY);
        cursor += firstRows.length;

        while (cursor < rows.length) {
            pdf.addPage();
            fillPage();
            const pageRows = rows.slice(cursor, cursor + continuationCapacity);
            drawTablePage(pageRows, continuationTableY);
            cursor += pageRows.length;
        }

        const drawLineChart = (
            title: string,
            top: number,
            height: number,
            series: Array<{ label: string; color: [number, number, number]; getValue: (row: LotReportLogRow) => number | null }>,
            axis: { min: number; max: number; majorUnit: number; decimals: number },
        ) => {
            const chartX = 18;
            const chartY = top;
            const chartWidth = pageWidth - chartX * 2;
            const chartHeight = height;
            const plotLeft = chartX + 20;
            const plotRight = chartX + chartWidth - 8;
            const plotTop = chartY + 14;
            const plotBottom = chartY + chartHeight - 22;
            const plotWidth = plotRight - plotLeft;
            const plotHeight = plotBottom - plotTop;
            const chartRows = report.rows;
            const values = chartRows
                .flatMap((row) => series.map((item) => item.getValue(row)))
                .filter((value): value is number => value !== null && Number.isFinite(value));

            if (values.length === 0) {
                return;
            }

            const lower = axis.min;
            const upper = axis.max;
            const getX = (index: number) => plotLeft + (chartRows.length <= 1 ? plotWidth / 2 : (index / (chartRows.length - 1)) * plotWidth);
            const getY = (value: number) => plotTop + ((upper - value) / (upper - lower)) * plotHeight;

            drawText(title, chartX, chartY, chartWidth, 8, {
                align: "center",
                bold: true,
                fontSize: 10,
                padding: 0,
            });

            pdf.setDrawColor(20, 20, 20);
            pdf.setLineWidth(0.2);
            pdf.rect(chartX, chartY + 9, chartWidth, chartHeight - 9, "S");

            for (let value = axis.min; value <= axis.max; value += axis.majorUnit) {
                const y = getY(value);
                pdf.setDrawColor(215, 222, 232);
                pdf.setLineWidth(0.12);
                pdf.line(plotLeft, y, plotRight, y);
                drawText(value.toFixed(axis.decimals), chartX + 1, y - 2, 15, 4, {
                    align: "right",
                    fontSize: 4.5,
                    padding: 0,
                });
            }

            pdf.setDrawColor(20, 20, 20);
            pdf.setLineWidth(0.25);
            pdf.line(plotLeft, plotTop, plotLeft, plotBottom);
            pdf.line(plotLeft, plotBottom, plotRight, plotBottom);

            series.forEach((item) => {
                let previousPoint: { x: number; y: number } | null = null;
                pdf.setDrawColor(...item.color);
                pdf.setLineWidth(0.55);

                for (let index = 0; index < chartRows.length; index += 1) {
                    const value = item.getValue(chartRows[index]);

                    if (value === null || !Number.isFinite(value)) {
                        previousPoint = null;
                        continue;
                    }

                    const point = { x: getX(index), y: getY(value) };

                    if (previousPoint) {
                        pdf.line(previousPoint.x, previousPoint.y, point.x, point.y);
                    }

                    previousPoint = point;
                }
            });

            const labelStep = Math.max(1, Math.ceil(chartRows.length / 12));
            chartRows.forEach((row, index) => {
                if (index % labelStep !== 0 && index !== chartRows.length - 1) {
                    return;
                }

                setFont(4);
                pdf.text(row.hour || "", getX(index), plotBottom + 8, {
                    align: "right",
                    angle: -60,
                    baseline: "middle",
                } as any);
            });

            series.forEach((item, index) => {
                const left = plotLeft + index * 36;
                const y = chartY + chartHeight - 9;
                pdf.setFillColor(...item.color);
                pdf.rect(left, y, 5, 1.5, "F");
                drawText(item.label, left + 6, y - 1.5, 28, 5, {
                    fontSize: 4.6,
                    padding: 0,
                });
            });
        };

        pdf.addPage();
        fillPage();
        drawLineChart("Temperature", 18, 116, [
            { label: "Top", color: [237, 125, 49], getValue: (row) => row.tempTopValue },
            { label: "Down", color: [165, 165, 165], getValue: (row) => row.tempBottomValue },
        ], { min: 20, max: 45, majorUnit: 2, decimals: 1 });
        drawLineChart("RH", 152, 116, [
            { label: "Top", color: [237, 125, 49], getValue: (row) => row.rhTopValue },
            { label: "Down", color: [165, 165, 165], getValue: (row) => row.rhBottomValue },
        ], { min: 20, max: 100, majorUnit: 5, decimals: 0 });
        pdf.save(`${sanitizeFilename(filename)}.pdf`);
    };

    return {
        export_excel,
        export_pdf,
        buildExcelReportUrl,
    };
};
