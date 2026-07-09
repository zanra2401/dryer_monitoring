import * as z from "zod";
import type { LogRow } from "~/composable/useLogList";

type LogFormData = {
    log_id?: number | null;
    lot_id: number | null;
    is_standalone_mc_log: boolean;
    timestamp_thingspeak: string;
    status_bin: string;
    temp_top: number | null;
    rh_top: number | null;
    temp_bottom: number | null;
    rh_bottom: number | null;
    mc: number | null;
    checker_name: string;
    remark: string;
};

const logFormSchema = z.object({
    lot_id: z.number().int().positive("Lot is required").nullable(),
    is_standalone_mc_log: z.boolean(),
    timestamp_thingspeak: z.string().trim().min(1, "Timestamp is required"),
    status_bin: z.string().trim().min(1, "Status bin is required"),
    temp_top: z.number().nullable(),
    rh_top: z.number().nullable(),
    temp_bottom: z.number().nullable(),
    rh_bottom: z.number().nullable(),
    mc: z.number().nullable(),
    checker_name: z.string(),
    remark: z.string(),
});

const getApiErrorMessage = (error: unknown) => {
    if (typeof error === "object" && error !== null) {
        const maybeError = error as {
            data?: { error?: string; message?: string };
            statusMessage?: string;
            message?: string;
        };

        return maybeError.data?.error || maybeError.data?.message || maybeError.statusMessage || maybeError.message || "Unknown error";
    }

    return "Unknown error";
};

const normalizeOptionalText = (value: string) => {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
};

const toDateTimeLocal = (value: string | Date | null | undefined) => {
    if (!value) {
        return "";
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    const hours = `${date.getHours()}`.padStart(2, "0");
    const minutes = `${date.getMinutes()}`.padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toApiDate = (value: string) => {
    return new Date(value).toISOString();
};

const makeEmptyForm = (): LogFormData => ({
    log_id: null,
    lot_id: null,
    is_standalone_mc_log: true,
    timestamp_thingspeak: "",
    status_bin: "",
    temp_top: null,
    rh_top: null,
    temp_bottom: null,
    rh_bottom: null,
    mc: null,
    checker_name: "",
    remark: "",
});

export const useLogCRUD = (refreshLogData: () => Promise<unknown> = async () => null) => {
    const create_data = ref<LogFormData>(makeEmptyForm());
    const update_data = ref<LogFormData>(makeEmptyForm());
    const error = ref<unknown>(null);
    const loading = ref(false);

    const reset_create_data = (lotId?: number | null) => {
        create_data.value = {
            ...makeEmptyForm(),
            lot_id: lotId ?? null,
        };
    };

    const reset_update_data = () => {
        update_data.value = makeEmptyForm();
    };

    const prepare_update_log = (log: LogRow) => {
        update_data.value = {
            log_id: log.logId,
            lot_id: log.lotId,
            is_standalone_mc_log: log.isStandaloneMcLog,
            timestamp_thingspeak: toDateTimeLocal(log.timestampThingspeak),
            status_bin: log.statusBin,
            temp_top: log.tempTop === null ? null : Number(log.tempTop),
            rh_top: log.rhTop === null ? null : Number(log.rhTop),
            temp_bottom: log.tempBottom === null ? null : Number(log.tempBottom),
            rh_bottom: log.rhBottom === null ? null : Number(log.rhBottom),
            mc: log.mc === null ? null : Number(log.mc),
            checker_name: log.checkerName ?? "",
            remark: log.remark ?? "",
        };
    };

    const create_log = async () => {
        loading.value = true;
        error.value = null;

        try {
            const parsed = logFormSchema.parse(create_data.value);

            if (!parsed.lot_id) {
                throw new Error("Lot is required");
            }

            if (parsed.mc === null) {
                throw new Error("MC is required");
            }

            const result = await $fetch("/api/log/log", {
                method: "POST",
                body: {
                    lot_id: parsed.lot_id,
                    timestamp_thingspeak: toApiDate(parsed.timestamp_thingspeak),
                    status_bin: parsed.status_bin.trim(),
                    mc: parsed.mc,
                    checker_name: normalizeOptionalText(parsed.checker_name),
                    remark: normalizeOptionalText(parsed.remark),
                },
            });

            reset_create_data(parsed.lot_id);
            await refreshLogData();
            return result;
        } catch (err) {
            error.value = err;
            throw new Error(getApiErrorMessage(err));
        } finally {
            loading.value = false;
        }
    };

    const update_log = async () => {
        loading.value = true;
        error.value = null;

        try {
            const parsed = logFormSchema.parse(update_data.value);
            const logId = update_data.value.log_id;

            if (!logId) {
                throw new Error("Log ID is required");
            }

            const result = await $fetch("/api/log/log", {
                method: "PUT",
                body: {
                    log_id: logId,
                    timestamp_thingspeak: toApiDate(parsed.timestamp_thingspeak),
                    status_bin: parsed.status_bin.trim(),
                    mc: parsed.mc,
                    checker_name: normalizeOptionalText(parsed.checker_name),
                    remark: normalizeOptionalText(parsed.remark),
                },
            });

            await refreshLogData();
            return result;
        } catch (err) {
            error.value = err;
            throw new Error(getApiErrorMessage(err));
        } finally {
            loading.value = false;
        }
    };

    const delete_log = async (logId: number) => {
        loading.value = true;
        error.value = null;

        try {
            const result = await $fetch("/api/log/log", {
                method: "DELETE",
                body: {
                    log_id: logId,
                },
            });

            await refreshLogData();
            return result;
        } catch (err) {
            error.value = err;
            throw new Error(getApiErrorMessage(err));
        } finally {
            loading.value = false;
        }
    };

    return {
        create_data,
        update_data,
        error,
        loading,
        create_log,
        update_log,
        delete_log,
        prepare_update_log,
        reset_create_data,
        reset_update_data,
    };
};
