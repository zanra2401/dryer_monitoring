import * as z from "zod";
import { LOT_STATUSES, type LotRow, type LotStatus } from "~/composable/useLotList";

type LotFormData = {
    lot_id?: number | null;
    lot_number: string;
    hybrid: string;
    quality: string;
    net_to_bin: number | null;
    initial_mc: number | null;
    status: LotStatus;
    down_air_at: string;
    down_mc: number | null;
    area_id: number | null;
    bin_number: number | null;
    start_time: string;
    end_time: string;
    end_mc: number | null;
    depth: number | null;
};

type LotDetailResponse = {
    success: boolean;
    data: LotRow;
};

const lotFormSchema = z.object({
    lot_number: z.string().trim().min(1, "Lot number is required"),
    hybrid: z.string(),
    quality: z.string(),
    net_to_bin: z.number().nullable(),
    initial_mc: z.number().nullable(),
    status: z.enum(LOT_STATUSES),
    down_air_at: z.string(),
    down_mc: z.number().nullable(),
    area_id: z.number().int().positive("Dryer area is required").nullable(),
    bin_number: z.number().int().positive("Bin is required").nullable(),
    start_time: z.string().trim().min(1, "Start time is required"),
    end_time: z.string(),
    end_mc: z.number().nullable(),
    depth: z.number().nullable(),
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

const makeEmptyForm = (): LotFormData => ({
    lot_id: null,
    lot_number: "",
    hybrid: "",
    quality: "",
    net_to_bin: null,
    initial_mc: null,
    status: "UPAIR",
    down_air_at: "",
    down_mc: null,
    area_id: null,
    bin_number: null,
    start_time: "",
    end_time: "",
    end_mc: null,
    depth: null,
});

export const useLotCRUD = (refreshLotData: () => Promise<unknown> = async () => null) => {
    const create_data = ref<LotFormData>(makeEmptyForm());
    const update_data = ref<LotFormData>(makeEmptyForm());
    const error = ref<unknown>(null);
    const loading = ref(false);

    const reset_create_data = () => {
        create_data.value = makeEmptyForm();
    };

    const reset_update_data = () => {
        update_data.value = makeEmptyForm();
    };

    const prepare_update_lot = (lot: LotRow) => {
        update_data.value = {
            lot_id: lot.lotId,
            lot_number: lot.lotNumber,
            hybrid: lot.hybrid ?? "",
            quality: lot.quality ?? "",
            net_to_bin: lot.netToBin === null ? null : Number(lot.netToBin),
            initial_mc: lot.initialMc === null ? null : Number(lot.initialMc),
            status: lot.status,
            down_air_at: toDateTimeLocal(lot.downAirAt),
            down_mc: lot.downMC === null ? null : Number(lot.downMC),
            area_id: lot.areaId,
            bin_number: lot.binNumber,
            start_time: toDateTimeLocal(lot.startTime),
            end_time: toDateTimeLocal(lot.endTime),
            end_mc: lot.endMC === null ? null : Number(lot.endMC),
            depth: lot.depth === null ? null : Number(lot.depth),
        };
    };

    const fetch_lot_detail = async (lotId: number) => {
        loading.value = true;
        error.value = null;

        try {
            const response = await $fetch<LotDetailResponse>("/api/lot/lot", {
                method: "GET",
                params: {
                    lot_id: lotId,
                },
            });

            return response.data;
        } catch (err) {
            error.value = err;
            throw new Error(getApiErrorMessage(err));
        } finally {
            loading.value = false;
        }
    };

    const create_lot = async () => {
        loading.value = true;
        error.value = null;

        try {
            const parsed = lotFormSchema.parse(create_data.value);

            if (!parsed.area_id) {
                throw new Error("Dryer area is required");
            }

            if (!parsed.bin_number) {
                throw new Error("Bin is required");
            }

            const result = await $fetch("/api/lot/lot", {
                method: "POST",
                body: {
                    lot_number: parsed.lot_number.trim(),
                    hybrid: normalizeOptionalText(parsed.hybrid),
                    quality: normalizeOptionalText(parsed.quality),
                    net_to_bin: parsed.net_to_bin,
                    initial_mc: parsed.initial_mc,
                    status: parsed.status,
                    down_air_at: parsed.down_air_at ? toApiDate(parsed.down_air_at) : null,
                    down_mc: parsed.down_mc,
                    area_id: parsed.area_id,
                    bin_number: parsed.bin_number,
                    start_time: toApiDate(parsed.start_time),
                    end_time: parsed.end_time ? toApiDate(parsed.end_time) : null,
                    end_mc: parsed.end_mc,
                    depth: parsed.depth,
                },
            });

            reset_create_data();
            await refreshLotData();
            return result;
        } catch (err) {
            error.value = err;
            throw new Error(getApiErrorMessage(err));
        } finally {
            loading.value = false;
        }
    };

    const update_lot = async () => {
        loading.value = true;
        error.value = null;

        try {
            const parsed = lotFormSchema.parse(update_data.value);
            const lotId = update_data.value.lot_id;

            if (!lotId) {
                throw new Error("Lot ID is required");
            }

            if (!parsed.area_id) {
                throw new Error("Dryer area is required");
            }

            if (!parsed.bin_number) {
                throw new Error("Bin is required");
            }

            const result = await $fetch("/api/lot/lot", {
                method: "PUT",
                body: {
                    lot_id: lotId,
                    lot_number: parsed.lot_number.trim(),
                    hybrid: normalizeOptionalText(parsed.hybrid),
                    quality: normalizeOptionalText(parsed.quality),
                    net_to_bin: parsed.net_to_bin,
                    initial_mc: parsed.initial_mc,
                    status: parsed.status,
                    down_air_at: parsed.down_air_at ? toApiDate(parsed.down_air_at) : null,
                    down_mc: parsed.down_mc,
                    area_id: parsed.area_id,
                    bin_number: parsed.bin_number,
                    start_time: toApiDate(parsed.start_time),
                    end_time: parsed.end_time ? toApiDate(parsed.end_time) : null,
                    end_mc: parsed.end_mc,
                    depth: parsed.depth,
                },
            });

            await refreshLotData();
            return result;
        } catch (err) {
            error.value = err;
            throw new Error(getApiErrorMessage(err));
        } finally {
            loading.value = false;
        }
    };

    const delete_lot = async (lotId: number) => {
        loading.value = true;
        error.value = null;

        try {
            const result = await $fetch("/api/lot/lot", {
                method: "DELETE",
                body: {
                    lot_id: lotId,
                },
            });

            await refreshLotData();
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
        create_lot,
        update_lot,
        delete_lot,
        fetch_lot_detail,
        prepare_update_lot,
        reset_create_data,
        reset_update_data,
    };
};
