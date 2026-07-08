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
            orientation: "landscape",
            unit: "mm",
            format: "a4",
            compress: true,
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const marginX = 5;
        const marginY = 5;
        const designWidth = 282;
        const designHeight = 200;
        const scale = Math.min((pageWidth - marginX * 2) / designWidth, (pageHeight - marginY * 2) / designHeight);
        const originX = (pageWidth - designWidth * scale) / 2;
        const originY = (pageHeight - designHeight * scale) / 2;
        const x = (value: number) => originX + value * scale;
        const y = (value: number) => originY + value * scale;
        const w = (value: number) => value * scale;

        const tableCols: number[] = [26, 16, 16, 22, 22, 21, 21, 18, 29, 29];
        const tableX = 0;
        const tableY = 55;
        const headerHeight = 12;
        const rowHeight = 3.25;
        const tableWidth = tableCols.reduce((total, value) => total + value, 0);

        const colWidth = (index: number) => tableCols[index] ?? 0;
        const colLeft = (index: number) => tableX + tableCols.slice(0, index).reduce((total, value) => total + value, 0);
        const cellText = (text: string, left: number, top: number, width: number, height: number, options: {
            align?: "left" | "center" | "right";
            fontSize?: number;
            bold?: boolean;
            color?: [number, number, number];
            maxLines?: number;
        } = {}) => {
            const fontSize = options.fontSize ?? 7.5;
            pdf.setFont("helvetica", options.bold ? "bold" : "normal");
            pdf.setFontSize(fontSize * scale);
            pdf.setTextColor(...(options.color ?? [0, 0, 0]));

            const lines = pdf.splitTextToSize(text, w(width - 1.2)).slice(0, options.maxLines ?? 2);
            const lineHeight = fontSize * 0.36 * scale;
            const baseY = y(top) + (w(height) - lineHeight * (lines.length - 1)) / 2 + lineHeight * 0.35;
            const textX = options.align === "center"
                ? x(left + width / 2)
                : options.align === "right"
                    ? x(left + width - 0.8)
                    : x(left + 0.8);

            pdf.text(lines, textX, baseY, {
                align: options.align ?? "left",
                baseline: "middle",
            });
        };

        const strokeRect = (left: number, top: number, width: number, height: number, fill?: [number, number, number]) => {
            if (fill) {
                pdf.setFillColor(...fill);
            }

            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.18 * scale);
            pdf.rect(x(left), y(top), w(width), w(height), fill ? "FD" : "S");
        };

        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");
        pdf.setLineWidth(0.2 * scale);

        strokeRect(17, 0, 26, 5);
        cellText("DOWNLOAD", 17, 0, 26, 5, { align: "center", fontSize: 6.2 });
        strokeRect(159, 0, 26, 5);
        cellText("PRINT PDF", 159, 0, 26, 5, { align: "center", fontSize: 6.2 });

        cellText("DRYING MONITORING REPORT", 0, 14, 220, 10, {
            align: "center",
            fontSize: 13.5,
            bold: true,
            maxLines: 1,
        });

        const summaryRows = [
            ["Bin No", report.binNumber ? String(report.binNumber) : "", "Status Quality", report.quality, "Date/Time Start", report.startTime, "MC Start", report.mcStart, "Total Drying", report.totalDrying],
            ["Lot No", report.lotNumber, "Net To Bin (Kg)", report.netToBin, "Date/Time Down", report.downTime, "MC Down", report.mcDown, "Dry down", report.dryDown],
            ["Varietas", report.hybrid, "Depth (Meter)", report.depthMeter, "Date/Time Stop", report.stopTime, "MC End", report.mcEnd, "Drying Rate", report.dryingRate],
        ];
        const summaryY = 30;
        const summaryPairs: Array<[number, number, number]> = [
            [0, 16, 36],
            [42, 27, 28],
            [82, 31, 34],
            [150, 14, 15],
            [188, 27, 29],
        ];

        summaryRows.forEach((row, rowIndex) => {
            summaryPairs.forEach(([left, labelWidth, valueWidth], pairIndex) => {
                const label = row[pairIndex * 2] ?? "";
                const value = row[pairIndex * 2 + 1] ?? "";
                const isDateTimeValue = label.startsWith("Date/Time");
                cellText(label, left, summaryY + rowIndex * 6.6, labelWidth, 5, { fontSize: 5.8, maxLines: 1 });
                cellText(`: ${value}`, left + labelWidth, summaryY + rowIndex * 6.6, valueWidth, 5, {
                    fontSize: isDateTimeValue ? 4.6 : 5.8,
                    maxLines: 1,
                });
            });
        });

        const formulas: Array<[string, string]> = [
            ["Total Drying", "=Date/Time Stop-Date/Time Start"],
            ["Dry down", "=MC End-MC Start"],
            ["Drying Rate", "= Total Drying/Dry Down"],
        ];

        formulas.forEach(([label, formula], index) => {
            cellText(label, 244, summaryY + index * 6.6, 18, 5, { fontSize: 5.3, color: [255, 0, 0], maxLines: 1 });
            cellText(formula, 262, summaryY + index * 6.6, 20, 5, { fontSize: 4.3, color: [255, 0, 0], maxLines: 2 });
        });

        strokeRect(tableX, tableY, colWidth(0), headerHeight, [192, 192, 192]);
        strokeRect(colLeft(1), tableY, colWidth(1), headerHeight, [192, 192, 192]);
        strokeRect(colLeft(2), tableY, colWidth(2), headerHeight, [192, 192, 192]);
        strokeRect(colLeft(3), tableY, colWidth(3) + colWidth(4), headerHeight / 2, [192, 192, 192]);
        strokeRect(colLeft(5), tableY, colWidth(5) + colWidth(6), headerHeight / 2, [192, 192, 192]);
        strokeRect(colLeft(7), tableY, colWidth(7), headerHeight, [192, 192, 192]);
        strokeRect(colLeft(8), tableY, colWidth(8) + colWidth(9), headerHeight, [192, 192, 192]);

        for (let index = 3; index <= 6; index += 1) {
            strokeRect(colLeft(index), tableY + headerHeight / 2, colWidth(index), headerHeight / 2, [191, 191, 191]);
        }

        cellText("Date/Time", tableX, tableY, colWidth(0), headerHeight, { align: "center", bold: true, fontSize: 5.2, maxLines: 1 });
        cellText("Hour", colLeft(1), tableY, colWidth(1), headerHeight, { align: "center", bold: true, fontSize: 5.2, maxLines: 1 });
        cellText("Minute", colLeft(2), tableY, colWidth(2), headerHeight, { align: "center", bold: true, fontSize: 5.2, maxLines: 1 });
        cellText("Suhu (C)", colLeft(3), tableY, colWidth(3) + colWidth(4), headerHeight / 2, { align: "center", bold: true, fontSize: 5, maxLines: 1 });
        cellText("RH (%)", colLeft(5), tableY, colWidth(5) + colWidth(6), headerHeight / 2, { align: "center", bold: true, fontSize: 5, maxLines: 1 });
        cellText("MC (%)", colLeft(7), tableY, colWidth(7), headerHeight, { align: "center", bold: true, fontSize: 5.2, maxLines: 1 });
        cellText("Remarks", colLeft(8), tableY, colWidth(8) + colWidth(9), headerHeight, { align: "center", bold: true, fontSize: 5.2, maxLines: 1 });
        ["Top", "Down", "Top", "Down"].forEach((label, index) => {
            cellText(label, colLeft(index + 3), tableY + headerHeight / 2, colWidth(index + 3), headerHeight / 2, {
                align: "center",
                bold: true,
                fontSize: 5.4,
                maxLines: 1,
            });
        });

        const rows = ensureRows(report.rows);
        rows.forEach((row, rowIndex) => {
            const top = tableY + headerHeight + rowIndex * rowHeight;
            const values: string[] = [
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
                if (index === 9) {
                    return;
                }

                const left = colLeft(index);
                const mergedWidth = index === 8 ? colWidth(8) + colWidth(9) : width;
                strokeRect(left, top, mergedWidth, rowHeight);
                cellText(values[index] ?? "", left, top, mergedWidth, rowHeight, {
                    align: index === 0 ? "left" : "center",
                    fontSize: index === 0 ? 4.6 : index === 8 ? 4.8 : 5,
                    maxLines: 1,
                });
            });
        });

        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.35 * scale);
        pdf.rect(x(tableX), y(tableY), w(tableWidth), w(headerHeight + rows.length * rowHeight), "S");
        pdf.save(`${sanitizeFilename(filename)}.pdf`);
    };

    return {
        export_excel,
        export_pdf,
        buildExcelReportUrl,
    };
};
