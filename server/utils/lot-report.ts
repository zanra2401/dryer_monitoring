import { prisma } from "~~/server/utils/prisma";
import { getLotSnapshotLogTimeline } from "~~/server/utils/lot-log-snapshot";

export type LotReportLogRow = {
    date: string;
    hour: string;
    minute: string;
    tempTop: string;
    tempBottom: string;
    rhTop: string;
    rhBottom: string;
    mc: string;
    status: string;
    tempTopValue: number | null;
    tempBottomValue: number | null;
    rhTopValue: number | null;
    rhBottomValue: number | null;
    mcValue: number | null;
    hourValue: number | null;
    minuteValue: number | null;
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
    hour: string;
    dryDown: string;
    dryingRate: string;
    rows: LotReportLogRow[];
    totalLogCount: number;
};

type DecimalLike = number | string | { toString(): string } | null | undefined;

const pad = (value: number) => `${value}`.padStart(2, "0");
const REPORT_TIME_ZONE = "Asia/Jakarta";

const asDate = (value: Date | string | null | undefined) => {
    if (!value) {
        return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const getElapsedParts = (
    startValue: Date | string | null | undefined,
    currentValue: Date | string | null | undefined,
) => {
    const start = asDate(startValue);
    const current = asDate(currentValue);

    if (!start || !current) {
        return null;
    }

    const totalMinutes = Math.floor((current.getTime() - start.getTime()) / 60000);

    if (!Number.isFinite(totalMinutes) || totalMinutes < 0) {
        return null;
    }

    return {
        hour: Math.floor(totalMinutes / 60),
        minute: totalMinutes % 60,
    };
};

const formatElapsedHour = (
    startValue: Date | string | null | undefined,
    currentValue: Date | string | null | undefined,
) => {
    const parts = getElapsedParts(startValue, currentValue);
    return parts ? pad(parts.hour) : "";
};

const formatElapsedMinute = (
    startValue: Date | string | null | undefined,
    currentValue: Date | string | null | undefined,
) => {
    const parts = getElapsedParts(startValue, currentValue);
    return parts ? pad(parts.minute) : "";
};

const formatDateTime = (value: Date | string | null | undefined) => {
    const date = asDate(value);

    if (!date) {
        return "";
    }

    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: REPORT_TIME_ZONE,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(date);
    const day = parts.find((part) => part.type === "day")?.value ?? "";
    const month = parts.find((part) => part.type === "month")?.value ?? "";
    const year = parts.find((part) => part.type === "year")?.value ?? "";
    const hour = parts.find((part) => part.type === "hour")?.value ?? "";
    const minute = parts.find((part) => part.type === "minute")?.value ?? "";

    return `${day}/${month}/${year} ${hour}:${minute}`;
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

    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(parsed);
};

const getRoundedHour = (startValue: Date | string | null | undefined, endValue: Date | string | null | undefined) => {
    const start = asDate(startValue);
    const end = asDate(endValue);

    if (!start || !end) {
        return null;
    }

    const totalMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);

    if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
        return null;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const rounded = hours + (minutes >= 31 ? 1 : 0);

    return Math.max(rounded, 1);
};

const formatRoundedHour = (startValue: Date | string | null | undefined, endValue: Date | string | null | undefined) => {
    const roundedHour = getRoundedHour(startValue, endValue);
    return roundedHour === null ? "" : `${roundedHour} Hour`;
};

const getDryDown = (startMc: DecimalLike, endMc: DecimalLike) => {
    const start = toNumber(startMc);
    const end = toNumber(endMc);

    if (start === null || end === null) {
        return null;
    }

    return Math.abs(start - end);
};

const formatDryDown = (startMc: DecimalLike, endMc: DecimalLike) => {
    const dryDown = getDryDown(startMc, endMc);
    return dryDown === null ? "" : formatDecimal(dryDown);
};

const formatDryingRate = (
    startValue: Date | string | null | undefined,
    endValue: Date | string | null | undefined,
    startMc: DecimalLike,
    endMc: DecimalLike,
) => {
    const roundedHour = getRoundedHour(startValue, endValue);
    const dryDown = getDryDown(startMc, endMc);

    if (roundedHour === null || dryDown === null) {
        return "";
    }

    if (!Number.isFinite(roundedHour) || roundedHour <= 0 || !Number.isFinite(dryDown) || dryDown === 0) {
        return "";
    }

    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(roundedHour / dryDown);
};

const formatStatus = (status: string | null | undefined) => {
    const normalized = String(status ?? "").replace(/[\s_-]+/g, "").toUpperCase();

    if (normalized === "UPAIR") {
        return "Up Air";
    }

    if (normalized === "DOWNAIR" || normalized === "DOWNAIR") {
        return "Down Air";
    }

    return status ?? "";
};

export const getLotReportData = async (lotId: number): Promise<LotReportData | null> => {
    const lot = await prisma.lot.findUnique({
        where: {
            lotId,
        },
    });

    if (!lot) {
        return null;
    }

    const timeline = await getLotSnapshotLogTimeline(lotId);
    const allLogs = timeline ? [...timeline.logs].sort((a, b) => {
        return a.timestampThingspeak.getTime() - b.timestampThingspeak.getTime();
    }) : [];

    const dryerArea = await prisma.dryerArea.findUnique({
        where: {
            areaId: lot.areaId,
        },
        select: {
            name: true,
        },
    });

    const latestMcLog = [...allLogs].reverse().find((log) => log.mc !== null);
    const resolvedEndMc = lot.endMC ?? latestMcLog?.mc ?? null;

    return {
        lotId: lot.lotId,
        lotNumber: lot.lotNumber,
        dryerAreaName: dryerArea?.name ?? "",
        binNumber: lot.binNumber,
        hybrid: lot.hybrid ?? "",
        quality: lot.quality ?? "",
        status: lot.status,
        netToBin: formatDecimal(lot.netToBin),
        depthMeter: formatDecimal(lot.depth),
        startTime: formatDateTime(lot.startTime),
        downTime: formatDateTime(lot.downAirAt),
        stopTime: formatDateTime(lot.endTime),
        mcStart: formatDecimal(lot.initialMc),
        mcDown: formatDecimal(lot.downMC),
        mcEnd: formatDecimal(resolvedEndMc),
        hour: formatRoundedHour(lot.startTime, lot.endTime),
        dryDown: formatDryDown(lot.initialMc, resolvedEndMc),
        dryingRate: formatDryingRate(lot.startTime, lot.endTime, lot.initialMc, resolvedEndMc),
        rows: allLogs.map((log) => {
            const elapsed = getElapsedParts(lot.startTime, log.timestampThingspeak);

            return {
                date: formatDateTime(log.timestampThingspeak),
                hour: formatElapsedHour(lot.startTime, log.timestampThingspeak),
                minute: formatElapsedMinute(lot.startTime, log.timestampThingspeak),
                tempTop: formatDecimal(log.tempTop),
                tempBottom: formatDecimal(log.tempBottom),
                rhTop: formatDecimal(log.rhTop),
                rhBottom: formatDecimal(log.rhBottom),
                mc: formatDecimal(log.mc),
                status: formatStatus(log.statusBin),
                tempTopValue: toNumber(log.tempTop),
                tempBottomValue: toNumber(log.tempBottom),
                rhTopValue: toNumber(log.rhTop),
                rhBottomValue: toNumber(log.rhBottom),
                mcValue: toNumber(log.mc),
                hourValue: elapsed?.hour ?? null,
                minuteValue: elapsed?.minute ?? null,
            };
        }),
        totalLogCount: allLogs.length,
    };
};
