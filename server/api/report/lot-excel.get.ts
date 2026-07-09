import path from "node:path";
import ExcelJS from "exceljs";
import { z, ZodError } from "zod";
import { getLotReportData, REPORT_MAX_LOG_ROWS } from "~~/server/utils/lot-report";

import { prisma } from "~~/server/utils/prisma";
import { requireAuthUser } from "~~/server/utils/auth";
import { isLimitedAreaRole } from "~~/server/utils/rbac";

const querySchema = z.object({
    lot_id: z.coerce.number().int().positive(),
});

const sanitizeFilename = (value: string) => value.replace(/[<>:"/\\|?*]+/g, "-").trim() || "lot-report";

const BODY_ROW_START = 13;

const setCellValue = (worksheet: ExcelJS.Worksheet, cell: string, value: string) => {
    worksheet.getCell(cell).value = value || "";
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

        setCellValue(worksheet, "C6", `: ${report.binNumber}`);
        setCellValue(worksheet, "C7", `: ${report.lotNumber}`);
        setCellValue(worksheet, "C8", `: ${report.hybrid || ""}`);
        setCellValue(worksheet, "E6", `: ${report.quality || ""}`);
        setCellValue(worksheet, "E7", `: ${report.netToBin || ""}`);
        setCellValue(worksheet, "E8", `: ${report.depthMeter || ""}`);
        setCellValue(worksheet, "G6", `: ${report.startTime || ""}`);
        setCellValue(worksheet, "G7", `: ${report.downTime || ""}`);
        setCellValue(worksheet, "G8", `: ${report.stopTime || ""}`);
        setCellValue(worksheet, "I6", `: ${report.mcStart || ""}`);
        setCellValue(worksheet, "I7", `: ${report.mcDown || ""}`);
        setCellValue(worksheet, "I8", `: ${report.mcEnd || ""}`);
        setCellValue(worksheet, "K6", `: ${report.totalDrying || ""}`);
        setCellValue(worksheet, "K7", `: ${report.dryDown || ""}`);
        setCellValue(worksheet, "K8", `: ${report.dryingRate || ""}`);

        for (let index = 0; index < REPORT_MAX_LOG_ROWS; index += 1) {
            const rowNumber = BODY_ROW_START + index;
            const row = report.rows[index];

            setCellValue(worksheet, `B${rowNumber}`, row?.date ?? "");
            setCellValue(worksheet, `C${rowNumber}`, row?.hour ?? "");
            setCellValue(worksheet, `D${rowNumber}`, row?.minute ?? "");
            setCellValue(worksheet, `E${rowNumber}`, row?.tempTop ?? "");
            setCellValue(worksheet, `F${rowNumber}`, row?.tempBottom ?? "");
            setCellValue(worksheet, `G${rowNumber}`, row?.rhTop ?? "");
            setCellValue(worksheet, `H${rowNumber}`, row?.rhBottom ?? "");
            setCellValue(worksheet, `I${rowNumber}`, row?.mc ?? "");
            setCellValue(worksheet, `J${rowNumber}`, row?.remarks ?? "");
        }

        const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
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
