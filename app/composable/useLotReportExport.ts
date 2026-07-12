import type { LotReportData, LotReportLogRow } from "~/composable/useLotReport";

const buildExcelReportUrl = (lotId: number) => `/api/report/lot-excel?lot_id=${lotId}`;

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

const ensureRows = (rows: LotReportLogRow[]) => {
    const filledRows = rows.slice(0, 39);

    while (filledRows.length < 39) {
        filledRows.push({
            date: "",
            hour: "",
            minute: "",
            tempTop: "",
            tempBottom: "",
            rhTop: "",
            rhBottom: "",
            mc: "",
            remarks: "",
        });
    }

    return filledRows;
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
        const tableX = 6;
        const tableY = 52;
        const tableCols = [20, 14, 14, 20, 20, 20, 20, 16, 54];
        const tableWidth = tableCols.reduce((total, value) => total + value, 0);
        const rowHeight = 4.35;
        const headerTopHeight = 6.2;
        const headerSubHeight = 4.4;
        const headerHeight = headerTopHeight + headerSubHeight;
        const rows = ensureRows(report.rows);

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
            } = {},
        ) => {
            const text = textValue === null || textValue === undefined ? "" : String(textValue);
            const padding = options.padding ?? 1;
            const align = options.align ?? "left";
            const startSize = options.fontSize ?? 6;
            setFont(startSize, options.bold);
            const finalSize = fitFontSize(text, Math.max(width - padding * 2, 1), startSize, options.minFontSize ?? 3.2);
            setFont(finalSize, options.bold);

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

        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), "F");

        setFont(13, true);
        pdf.text("DRYING MONITORING REPORT", pageWidth / 2, 25, {
            align: "center",
            baseline: "middle",
        });

        const summaryRows = [
            ["Bin No", report.binNumber, "Status Quality", report.quality, "Date/Time Start", report.startTime, "MC Start", report.mcStart, "Total Drying", report.totalDrying],
            ["Lot No", report.lotNumber, "Net To Bin (Kg)", report.netToBin, "Date/Time Down", report.downTime, "MC Down", report.mcDown, "Dry down", report.dryDown],
            ["Varietas", report.hybrid, "Depth (Meter)", report.depthMeter, "Date/Time Stop", report.stopTime, "MC End", report.mcEnd, "Drying Rate", report.dryingRate],
        ];
        const summaryY = 34;
        const summaryGapY = 6.3;
        const summaryPairs: Array<[number, number, number]> = [
            [6, 13, 27],
            [45, 24, 25],
            [82, 27, 34],
            [126, 18, 23],
            [158, 25, 25],
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
                    fontSize: label.startsWith("Date/Time") ? 4.5 : 5.2,
                    minFontSize: 3.4,
                    padding: 0,
                });
            });
        });

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
        drawText("Remarks", colLeft(8), tableY, colWidth(8), headerHeight, { align: "center", bold: true, fontSize: 4.8, padding: 0.5 });

        ["Top", "Down", "Top", "Down"].forEach((label, index) => {
            drawText(label, colLeft(index + 3), tableY + headerTopHeight, colWidth(index + 3), headerSubHeight, {
                align: "center",
                bold: true,
                fontSize: 4.7,
                padding: 0.5,
            });
        });

        rows.forEach((row, rowIndex) => {
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
                row.remarks,
            ];

            tableCols.forEach((width, index) => {
                const left = colLeft(index);
                drawCell(left, top, width, rowHeight);
                drawText(values[index], left, top, width, rowHeight, {
                    align: index === 0 ? "left" : "center",
                    fontSize: index === 0 ? 4 : index === 8 ? 4.2 : 5.1,
                    minFontSize: index === 8 ? 2.8 : 3,
                    padding: index === 8 ? 0.6 : 0.8,
                });
            });
        });

        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.32);
        pdf.rect(tableX, tableY, tableWidth, headerHeight + rows.length * rowHeight, "S");
        pdf.save(`${sanitizeFilename(filename)}.pdf`);
    };

    return {
        export_excel,
        export_pdf,
        buildExcelReportUrl,
    };
};
