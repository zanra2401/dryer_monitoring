import path from "node:path";
import { readFile } from "node:fs/promises";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { z, ZodError } from "zod";
import { getLotReportData, type LotReportLogRow } from "~~/server/utils/lot-report";

import { prisma } from "~~/server/utils/prisma";
import { requireAuthUser } from "~~/server/utils/auth";
import { isLimitedAreaRole } from "~~/server/utils/rbac";

const querySchema = z.object({
    lot_id: z.coerce.number().int().positive(),
});

const sanitizeFilename = (value: string) => value.replace(/[<>:"/\\|?*]+/g, "-").trim() || "lot-report";

const BODY_ROW_START = 13;
const MIN_BODY_ROWS = 39;
const BODY_TEMPLATE_LAST_ROW = BODY_ROW_START + MIN_BODY_ROWS - 1;
const TEMP_THRESHOLD_MIN = 38;
const TEMP_THRESHOLD_MAX = 43;

const setCellValue = (worksheet: ExcelJS.Worksheet, cell: string, value: string | number | null | undefined) => {
    worksheet.getCell(cell).value = value ?? "";
};

const normalizeStatus = (status: string | null | undefined) => {
    return String(status ?? "").replace(/[\s_-]+/g, "").toUpperCase();
};

const isOutOfThreshold = (value: number | null | undefined) => {
    return typeof value === "number" && Number.isFinite(value) && (value < TEMP_THRESHOLD_MIN || value > TEMP_THRESHOLD_MAX);
};

const shouldMarkTempTop = (row: LotReportLogRow) => {
    return normalizeStatus(row.status) === "DOWNAIR" && isOutOfThreshold(row.tempTopValue);
};

const shouldMarkTempBottom = (row: LotReportLogRow) => {
    return normalizeStatus(row.status) === "UPAIR" && isOutOfThreshold(row.tempBottomValue);
};

const cloneStyle = (source: ExcelJS.Cell, target: ExcelJS.Cell) => {
    target.style = JSON.parse(JSON.stringify(source.style || {}));
};

const copyRowStyle = (worksheet: ExcelJS.Worksheet, sourceRowNumber: number, targetRowNumber: number) => {
    const sourceRow = worksheet.getRow(sourceRowNumber);
    const targetRow = worksheet.getRow(targetRowNumber);
    targetRow.height = sourceRow.height;

    for (let column = 1; column <= worksheet.columnCount; column += 1) {
        cloneStyle(sourceRow.getCell(column), targetRow.getCell(column));
    }
};

const setRedFont = (cell: ExcelJS.Cell) => {
    cell.font = {
        ...(cell.font || {}),
        color: { argb: "FFFF0000" },
    };
};

const setBlackFont = (cell: ExcelJS.Cell) => {
    cell.font = {
        ...(cell.font || {}),
        color: { argb: "FF000000" },
    };
};

const isolateCellStyle = (cell: ExcelJS.Cell) => {
    cell.style = JSON.parse(JSON.stringify(cell.style || {}));
};

const safeMerge = (worksheet: ExcelJS.Worksheet, range: string) => {
    try {
        worksheet.mergeCells(range);
    } catch {
        // Template may already contain the merge range.
    }
};

const getWorksheetPath = async (zip: JSZip, sheetName: string) => {
    const workbookXml = await zip.file("xl/workbook.xml")?.async("string");
    const workbookRelsXml = await zip.file("xl/_rels/workbook.xml.rels")?.async("string");

    if (!workbookXml || !workbookRelsXml) {
        throw new Error("Workbook XML is incomplete");
    }

    const sheetTag = [...workbookXml.matchAll(/<sheet\b[^>]*>/g)]
        .map((match) => match[0])
        .find((tag) => tag.includes(`name="${sheetName}"`));
    const relationId = sheetTag?.match(/\br:id="([^"]+)"/)?.[1];

    if (!relationId) {
        throw new Error(`${sheetName} worksheet relation not found`);
    }

    const relationTag = [...workbookRelsXml.matchAll(/<Relationship\b[^>]*>/g)]
        .map((match) => match[0])
        .find((tag) => tag.includes(`Id="${relationId}"`));
    const target = relationTag?.match(/\bTarget="([^"]+)"/)?.[1];

    if (!target) {
        throw new Error(`${sheetName} worksheet target not found`);
    }

    return `xl/${target.replace(/^\/?xl\//, "")}`;
};

const getWorksheetRelsPath = (worksheetPath: string) => {
    const parts = worksheetPath.split("/");
    const filename = parts.pop();
    return `${parts.join("/")}/_rels/${filename}.rels`;
};

const ensureContentTypeOverride = (
    contentTypesXml: string,
    partName: string,
    contentType: string,
) => {
    if (contentTypesXml.includes(`PartName="${partName}"`)) {
        return contentTypesXml;
    }

    return contentTypesXml.replace(
        "</Types>",
        `<Override PartName="${partName}" ContentType="${contentType}"/></Types>`,
    );
};

const updateChartFormulaLastRow = (xml: string, lastRow: number) => {
    return xml.replace(
        /Report!\$([A-Z]+)\$13:\$([A-Z]+)\$\d+/g,
        (_match, startCol: string, endCol: string) => `Report!$${startCol}$13:$${endCol}$${lastRow}`,
    );
};

const injectNativeChartSheet = async (
    workbookBuffer: Buffer,
    chartSourcePath: string,
    rowCount: number,
) => {
    const [targetZip, sourceZip] = await Promise.all([
        JSZip.loadAsync(workbookBuffer),
        JSZip.loadAsync(await readFile(chartSourcePath)),
    ]);
    const targetGrafikPath = await getWorksheetPath(targetZip, "Grafik");
    const sourceGrafikPath = await getWorksheetPath(sourceZip, "Grafik");
    const targetGrafikRelsPath = getWorksheetRelsPath(targetGrafikPath);
    const sourceGrafikRelsPath = getWorksheetRelsPath(sourceGrafikPath);
    const sourceGrafikXml = await sourceZip.file(sourceGrafikPath)?.async("string");
    const sourceGrafikRelsXml = await sourceZip.file(sourceGrafikRelsPath)?.async("string");

    if (!sourceGrafikXml || !sourceGrafikRelsXml) {
        throw new Error("Native Grafik worksheet source is incomplete");
    }

    targetZip.file(targetGrafikPath, sourceGrafikXml);
    targetZip.file(targetGrafikRelsPath, sourceGrafikRelsXml);

    const filesToCopy = [
        "xl/drawings/drawing2.xml",
        "xl/drawings/_rels/drawing2.xml.rels",
        "xl/charts/chart1.xml",
        "xl/charts/chart2.xml",
        "xl/charts/style1.xml",
        "xl/charts/style2.xml",
        "xl/charts/colors1.xml",
        "xl/charts/colors2.xml",
        "xl/charts/_rels/chart1.xml.rels",
        "xl/charts/_rels/chart2.xml.rels",
    ];

    for (const filePath of filesToCopy) {
        const sourceFile = sourceZip.file(filePath);

        if (!sourceFile) {
            continue;
        }

        const content = await sourceFile.async("string");
        const chartLastRow = BODY_ROW_START + Math.max(rowCount, 1) - 1;
        const patchedContent = filePath.startsWith("xl/charts/chart")
            ? updateChartFormulaLastRow(content, chartLastRow)
            : content;

        targetZip.file(filePath, patchedContent);
    }

    let contentTypesXml = await targetZip.file("[Content_Types].xml")?.async("string");

    if (!contentTypesXml) {
        throw new Error("Content types XML is missing");
    }

    const overrides = [
        ["/xl/drawings/drawing2.xml", "application/vnd.openxmlformats-officedocument.drawing+xml"],
        ["/xl/charts/chart1.xml", "application/vnd.openxmlformats-officedocument.drawingml.chart+xml"],
        ["/xl/charts/chart2.xml", "application/vnd.openxmlformats-officedocument.drawingml.chart+xml"],
        ["/xl/charts/style1.xml", "application/vnd.ms-office.chartstyle+xml"],
        ["/xl/charts/style2.xml", "application/vnd.ms-office.chartstyle+xml"],
        ["/xl/charts/colors1.xml", "application/vnd.ms-office.chartcolorstyle+xml"],
        ["/xl/charts/colors2.xml", "application/vnd.ms-office.chartcolorstyle+xml"],
    ] as const;

    for (const [partName, contentType] of overrides) {
        contentTypesXml = ensureContentTypeOverride(contentTypesXml, partName, contentType);
    }

    targetZip.file("[Content_Types].xml", contentTypesXml);

    return targetZip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
    });
};

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuthUser(event);
        const query = querySchema.parse(getQuery(event));

        const lot = await prisma.lot.findUnique({
            where: { lotId: query.lot_id },
            select: { areaId: true }
        });

        if (!lot) {
            setResponseStatus(event, 404);
            return {
                error: "Lot not found",
            };
        }

        if (isLimitedAreaRole(user.role) && !user.areaIds.includes(lot.areaId)) {
            setResponseStatus(event, 403);
            return {
                error: "Insufficient permission for this area",
            };
        }

        const report = await getLotReportData(query.lot_id);

        if (!report) {
            setResponseStatus(event, 404);
            return {
                error: "Lot not found",
            };
        }

        const templatePath = path.resolve(process.cwd(), "public", "templates", "dryer-report-template.xlsx");
        const workbook = new ExcelJS.Workbook();

        await workbook.xlsx.readFile(templatePath);

        const worksheet = workbook.getWorksheet("Report");

        if (!worksheet) {
            throw new Error("Report worksheet not found in template");
        }

        safeMerge(worksheet, "B5:L5");
        const dryerTitleCell = worksheet.getCell("B5");
        dryerTitleCell.value = report.dryerAreaName || "";
        dryerTitleCell.alignment = { horizontal: "center", vertical: "middle" };
        dryerTitleCell.font = { ...(dryerTitleCell.font || {}), bold: true, size: 11 };

        setCellValue(worksheet, "C6", `: ${report.binNumber}`);
        setCellValue(worksheet, "C7", `: ${report.lotNumber}`);
        setCellValue(worksheet, "C8", `: ${report.hybrid || ""}`);
        setCellValue(worksheet, "E6", `: ${report.quality || ""}`);
        setCellValue(worksheet, "E7", `: ${report.netToBin || ""}`);
        setCellValue(worksheet, "E8", `: ${report.depthMeter || ""}`);
        setCellValue(worksheet, "G6", `: ${report.startTime || ""}`);
        setCellValue(worksheet, "G7", `: ${report.downTime || ""}`);
        setCellValue(worksheet, "G8", `: ${report.stopTime || ""}`);
        setCellValue(worksheet, "J6", `: ${report.mcStart || ""}`);
        setCellValue(worksheet, "J7", `: ${report.mcDown || ""}`);
        setCellValue(worksheet, "J8", `: ${report.mcEnd || ""}`);
        setCellValue(worksheet, "K6", "Hour");
        setCellValue(worksheet, "L6", `: ${report.hour || ""}`);
        setCellValue(worksheet, "L7", `: ${report.dryDown || ""}`);
        setCellValue(worksheet, "L8", `: ${report.dryingRate || ""}`);

        safeMerge(worksheet, "J10:J11");
        cloneStyle(worksheet.getCell("I10"), worksheet.getCell("J10"));
        worksheet.getColumn(10).width = Math.max(worksheet.getColumn(10).width ?? 0, 11.5);
        setCellValue(worksheet, "J10", "Status");

        const rowsToRender = Math.max(report.rows.length, MIN_BODY_ROWS);

        for (let index = MIN_BODY_ROWS; index < rowsToRender; index += 1) {
            copyRowStyle(worksheet, BODY_TEMPLATE_LAST_ROW, BODY_ROW_START + index);
        }

        for (let index = 0; index < rowsToRender; index += 1) {
            const rowNumber = BODY_ROW_START + index;
            const row = report.rows[index];
            cloneStyle(worksheet.getCell(`I${rowNumber}`), worksheet.getCell(`J${rowNumber}`));

            const rowCells: Array<[string, string | number, string | undefined]> = [
                ["B", row?.date ?? "", undefined],
                ["C", row?.hourValue ?? "", "00"],
                ["D", row?.minuteValue ?? "", "00"],
                ["E", row?.tempTopValue ?? "", "0.00"],
                ["F", row?.tempBottomValue ?? "", "0.00"],
                ["G", row?.rhTopValue ?? "", "0.00"],
                ["H", row?.rhBottomValue ?? "", "0.00"],
                ["I", row?.mcValue ?? "", "0.00"],
                ["J", row?.status ?? "", undefined],
            ];

            for (const [column, value, numFmt] of rowCells) {
                const cell = worksheet.getCell(`${column}${rowNumber}`);
                isolateCellStyle(cell);
                setBlackFont(cell);
                cell.value = value;

                if (numFmt) {
                    cell.numFmt = numFmt;
                }
            }

            if (row && shouldMarkTempTop(row)) {
                setRedFont(worksheet.getCell(`E${rowNumber}`));
            }

            if (row && shouldMarkTempBottom(row)) {
                setRedFont(worksheet.getCell(`F${rowNumber}`));
            }
        }

        const generatedBuffer = Buffer.from(await workbook.xlsx.writeBuffer());
        const buffer = await injectNativeChartSheet(generatedBuffer, templatePath, report.rows.length);
        const filename = `lot-report-${sanitizeFilename(report.lotNumber)}.xlsx`;

        setHeader(event, "Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        setHeader(event, "Content-Disposition", `attachment; filename="${filename}"`);

        return buffer;
    } catch (error) {
         

        if (error instanceof ZodError) {
            setResponseStatus(event, 400);
            return {
                error: "Invalid query parameter",
            };
        }

        setResponseStatus(event, 500);
        return {
            error: "Internal Server Error",
        };
    }
});
