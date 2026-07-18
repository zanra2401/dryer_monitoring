type LotStatusValue = "UPAIR" | "DOWNAIR" | "COMPLETED";

type LotStatusSyncScope = {
    lotId: number;
    lotNumber?: string | null;
    binNumber: number;
    areaId: number;
    endTime?: Date | null;
};

export const normalizeLotStatusFromLog = (value: string | null | undefined): LotStatusValue | null => {
    const normalized = String(value ?? "").replace(/[\s_-]+/g, "").toUpperCase();

    if (normalized === "UPAIR") {
        return "UPAIR";
    }

    if (normalized === "DOWNAIR") {
        return "DOWNAIR";
    }

    if (normalized === "COMPLETED" || normalized === "DRIED") {
        return "COMPLETED";
    }

    return null;
};

const toBinStatus = (status: LotStatusValue) => {
    if (status === "COMPLETED") {
        return "WAITING_TO_SHELLING";
    }

    return status;
};

export const syncLotStatusFromLog = async (
    tx: any,
    lot: LotStatusSyncScope,
    statusBin: string | null | undefined,
    timestamp: Date,
    mc: number | null | undefined,
) => {
    const status = normalizeLotStatusFromLog(statusBin);

    if (!status) {
        return null;
    }

    const newerLogTimeWhere = {
        gt: timestamp,
        ...(lot.endTime ? { lte: lot.endTime } : {}),
    };
    const newerLog = await tx.binLog.findFirst({
        where: {
            binNumber: lot.binNumber,
            areaId: lot.areaId,
            timestampThingspeak: newerLogTimeWhere,
        },
        select: {
            binLogId: true,
        },
        orderBy: {
            timestampThingspeak: "desc",
        },
    });

    if (newerLog) {
        return null;
    }

    const lotData: Record<string, unknown> = {
        status,
    };

    if (status === "UPAIR") {
        lotData.downAirAt = null;
        lotData.downMC = null;
        lotData.endTime = null;
        lotData.endMC = null;
    }

    if (status === "DOWNAIR") {
        lotData.downAirAt = timestamp;
        lotData.endTime = null;
        lotData.endMC = null;
        if (mc !== null && mc !== undefined) {
            lotData.downMC = mc;
        }
    }

    if (status === "COMPLETED") {
        lotData.endTime = timestamp;
        if (mc !== null && mc !== undefined) {
            lotData.endMC = mc;
        }
    }

    await tx.lot.update({
        where: { lotId: lot.lotId },
        data: lotData,
    });

    await tx.bin.update({
        where: {
            binNumber_areaId: {
                binNumber: lot.binNumber,
                areaId: lot.areaId,
            },
        },
        data: {
            binStatus: toBinStatus(status),
            occupiedBy: lot.lotNumber ?? null,
        },
    });

    return status;
};
