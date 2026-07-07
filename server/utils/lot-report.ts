import { prisma } from "~~/server/utils/prisma";

export const REPORT_MAX_LOG_ROWS = 39;

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

type DecimalLike = number | string | { toString(): string } | null | undefined;

const pad = (value: number) => `${value}`.padStart(2, "0");

const asDate = (value: Date | string | null | undefined) => {
    if (!value) {
        return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value: Date | string | null | undefined) => {
    const date = asDate(value);

    if (!date) {
        return "";
    }

    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

const formatHour = (value: Date | string | null | undefined) => {
    const date = asDate(value);
    return date ? pad(date.getHours()) : "";
};

const formatMinute = (value: Date | string | null | undefined) => {
    const date = asDate(value);
    return date ? pad(date.getMinutes()) : "";
};

const formatDateTime = (value: Date | string | null | undefined) => {
    const date = asDate(value);

    if (!date) {
        return "";
    }

    return `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toNumber = (value: DecimalLike) => {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const formatDecimal = (value: DecimalLike) => {
    const parsed = toNumber(value);

    if (parsed === null) {
        return "";
    }

    return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(parsed);
};

const formatDuration = (startValue: Date | string | null | undefined, endValue: Date | string | null | undefined) => {
    const start = asDate(startValue);
    const end = asDate(endValue);

    if (!start || !end) {
        return "";
    }

    const totalMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);

    if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
        return "";
    }

    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    const parts: string[] = [];

    if (days > 0) {
        parts.push(`${days}d`);
    }

    if (hours > 0 || days > 0) {
        parts.push(`${hours}h`);
    }

    parts.push(`${minutes}m`);

    return parts.join(" ");
};

const formatDryDown = (startMc: DecimalLike, endMc: DecimalLike) => {
    const start = toNumber(startMc);
    const end = toNumber(endMc);

    if (start === null || end === null) {
        return "";
    }

    return formatDecimal(start - end);
};

const formatDryingRate = (
    startValue: Date | string | null | undefined,
    endValue: Date | string | null | undefined,
    startMc: DecimalLike,
    endMc: DecimalLike,
) => {
    const start = asDate(startValue);
    const end = asDate(endValue);
    const initial = toNumber(startMc);
    const final = toNumber(endMc);

    if (!start || !end || initial === null || final === null) {
        return "";
    }

    const durationHours = (end.getTime() - start.getTime()) / 3600000;
    const dryDown = initial - final;

    if (!Number.isFinite(durationHours) || durationHours <= 0 || !Number.isFinite(dryDown) || dryDown <= 0) {
        return "";
    }

    return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(durationHours / dryDown);
};

export const getLotReportData = async (lotId: number): Promise<LotReportData | null> => {
    const lot = await prisma.lot.findUnique({
        where: {
            lotId,
        },
        include: {
            logs: {
                orderBy: [
                    {
                        timestampThingspeak: "asc",
                    },
                    {
                        logId: "asc",
                    },
                ],
            },
        },
    });

    if (!lot) {
        return null;
    }

    const dryerArea = await prisma.dryerArea.findUnique({
        where: {
            areaId: lot.areaId,
        },
        select: {
            name: true,
        },
    });

    const latestMcLog = [...lot.logs].reverse().find((log) => log.mc !== null);
    const visibleLogs = lot.logs.slice(0, REPORT_MAX_LOG_ROWS);

    return {
        lotId: lot.lotId,
        lotNumber: lot.lotNumber,
        dryerAreaName: dryerArea?.name ?? "",
        binNumber: lot.binNumber,
        hybrid: lot.hybrid ?? "",
        quality: lot.quality ?? "",
        status: lot.status,
        netToBin: formatDecimal(lot.netToBin),
        depthMeter: "",
        startTime: formatDateTime(lot.startTime),
        downTime: "",
        stopTime: formatDateTime(lot.endTime),
        mcStart: formatDecimal(lot.initialMc),
        mcDown: "",
        mcEnd: formatDecimal(latestMcLog?.mc ?? null),
        totalDrying: formatDuration(lot.startTime, lot.endTime),
        dryDown: formatDryDown(lot.initialMc, latestMcLog?.mc ?? null),
        dryingRate: formatDryingRate(lot.startTime, lot.endTime, lot.initialMc, latestMcLog?.mc ?? null),
        rows: visibleLogs.map((log) => ({
            date: formatDate(log.timestampThingspeak),
            hour: formatHour(log.timestampThingspeak),
            minute: formatMinute(log.timestampThingspeak),
            tempTop: formatDecimal(log.tempTop),
            tempBottom: formatDecimal(log.tempBottom),
            rhTop: formatDecimal(log.rhTop),
            rhBottom: formatDecimal(log.rhBottom),
            mc: formatDecimal(log.mc),
            remarks: log.checkerName ?? "",
        })),
        totalLogCount: lot.logs.length,
        overflowLogCount: Math.max(lot.logs.length - REPORT_MAX_LOG_ROWS, 0),
    };
};
