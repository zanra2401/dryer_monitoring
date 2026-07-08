import { Prisma } from "~/generated/prisma/client";

const log = {
    initLog: async (mc: number, channel_id: string, area_id: string) => {
        
    },
    to_valid_date: (dateTime: string | Date) => {
        const date = typeof dateTime === "string" ? new Date(dateTime) : dateTime;

        if (Number.isNaN(date.getTime())) {
            throw new Error("Invalid date time value");
        }
        console.log(date);
        return date;
    },
    is_future_date: (dateTime: string | Date) => {
        const date = log.to_valid_date(dateTime);
        return date.getTime() > Date.now();
    },
    format_thingspeak_datetime: (dateTime: string | Date) => {
        const date = log.to_valid_date(dateTime);

        const normalized = date.toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta",
            hour12: false,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).replace(",", "");

        const [datePart = "", timePart = ""] = normalized.split(" ");
        const [day = "", month = "", year = ""] = datePart.split("/");

        return `${year}-${month}-${day}%20${timePart.replaceAll(".", ":")}`;
    },
    make_range_date: (dateTime: Date) => {
        const searchWindowMs = 3 * 60 * 1000; // 2 menit untuk testing agar feed terdekat tidak kelewat
        const baseTime = dateTime.getTime();

        return {
            start_time: log.format_thingspeak_datetime(new Date(baseTime - searchWindowMs)),
            end_time: log.format_thingspeak_datetime(new Date(baseTime + searchWindowMs))
        };
    },
    find_nearest_feed: (feeds: Array<Record<string, any>>, targetDate: string | Date) => {
        const target = log.to_valid_date(targetDate).getTime();

        let nearestFeed: Record<string, any> | null = null;
        let nearestDistance = Number.POSITIVE_INFINITY;

        for (const feed of feeds) {
            const rawTimestamp = feed.created_at ?? feed.createdAt;
            if (!rawTimestamp) {
                continue;
            }

            const timestamp = new Date(rawTimestamp).getTime();
            if (Number.isNaN(timestamp)) {
                continue;
            }

            const distance = Math.abs(timestamp - target);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestFeed = feed;
            }
        }

        return nearestFeed;
    },
    build_start_log_data: (params: {
        lotId: number;
        feed: Record<string, any>;
        bin: {
            fieldTempTop: string;
            fieldRhTop: string;
            fieldTempBottom: string;
            fieldRhBottom: string;
        };
        initialMc: number | null;
        binStatus: string | null | undefined;
    }) => {

        const getDecimalValue = (fieldName: string) => {
            const value = params.feed[fieldName];
            if (value === undefined || value === null || value === "") {
                return null;
            }

            return new Prisma.Decimal(value);
        };
        console.log("----------------------");
        console.log(params.bin.fieldTempTop);
        console.log(Number(params.bin.fieldTempTop));
        return {
            lotId: params.lotId,
            timestampThingspeak: log.to_valid_date(params.feed.created_at ?? params.feed.createdAt),
            statusBin: params.binStatus ?? "UPAIR",
            tempTop: Number(params.feed[params.bin.fieldTempTop]),
            rhTop: Number(params.feed[params.bin.fieldRhTop]),
            tempBottom: Number(params.feed[params.bin.fieldTempBottom]),
            rhBottom: Number(params.feed[params.bin.fieldRhBottom]),
            mc: params.initialMc ? Number(params.initialMc) : null,
            checkerName: null,
        };
    },
    
}

export default log; 