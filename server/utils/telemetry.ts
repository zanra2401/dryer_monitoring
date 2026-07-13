import { prisma } from '~~/server/utils/prisma';
import { logger } from '~~/server/utils/pino';
import thinkspeaks from '~~/server/utils/thinkspeaks';
import log from '~~/server/utils/log';

// === KONFIGURASI ===
export const INTERVAL_MS = 5 * 60 * 1000; // 5 menit dalam milidetik
const MAX_RECOVERY_MS = 24 * 60 * 60 * 1000; // Batas recovery maksimal: 24 jam
const THINGSPEAK_DELAY_MS = 1500; // Delay antar-request ThingSpeak (rate limit protection)

// === UTILITAS ===
const parseNumber = (val: any): number | null => {
    if (val === undefined || val === null || val === "") return null;
    const num = Number(val);
    return Number.isNaN(num) ? null : num;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface FeedEntry {
    created_at?: string;
    createdAt?: string;
    _isTop?: boolean;
    _isBottom?: boolean;
    [key: string]: any;
}

export interface BinWithChannel {
    binNumber: number;
    areaId: number;
    channelIdTop: string | null;
    channelIdBottom: string | null;
    binStatus: string;
    fieldTempTop: string | null;
    fieldRhTop: string | null;
    fieldTempBottom: string | null;
    fieldRhBottom: string | null;
    channelTop: {
        apiKey: string;
        [key: string]: any;
    } | null;
    channelBottom: {
        apiKey: string;
        [key: string]: any;
    } | null;
}

export function sliceFeedsIntoIntervals( 
    feeds: FeedEntry[],
    startMs: number,
    endMs: number,
    intervalMs: number
): { intervalStart: Date; intervalEnd: Date; feeds: FeedEntry[] }[] {
    const intervals: { intervalStart: Date; intervalEnd: Date; feeds: FeedEntry[] }[] = [];

    for (let t = startMs; t < endMs; t += intervalMs) {
        const iStart = t;
        const iEnd = t + intervalMs;

        const intervalFeeds = feeds.filter(feed => {
            const rawTs = feed.created_at ?? feed.createdAt;
            if (!rawTs) return false;
            const feedMs = new Date(rawTs).getTime();
            return feedMs >= iStart && feedMs < iEnd;
        });

        intervals.push({
            intervalStart: new Date(iStart),
            intervalEnd: new Date(iEnd),
            feeds: intervalFeeds
        });
    }

    return intervals;
}

export function averageFeeds(
    feeds: FeedEntry[],
    bin: BinWithChannel
): { tempTop: number | null; rhTop: number | null; tempBottom: number | null; rhBottom: number | null } {
    let sumTempTop = 0, countTempTop = 0;
    let sumRhTop = 0, countRhTop = 0;
    let sumTempBottom = 0, countTempBottom = 0;
    let sumRhBottom = 0, countRhBottom = 0;

    for (const feed of feeds) {
        if (feed._isTop) {
            if (bin.fieldTempTop) {
                const tTop = parseNumber(feed[bin.fieldTempTop]);
                if (tTop !== null && tTop >= 15 && tTop <= 70) { sumTempTop += tTop; countTempTop++; }
            }

            if (bin.fieldRhTop) {
                const rTop = parseNumber(feed[bin.fieldRhTop]);
                if (rTop !== null && rTop >= 10 && rTop <= 99) { sumRhTop += rTop; countRhTop++; }
            }
        }

        if (feed._isBottom) {
            if (bin.fieldTempBottom) {
                const tBot = parseNumber(feed[bin.fieldTempBottom]);
                if (tBot !== null && tBot >= 15 && tBot <= 70) { sumTempBottom += tBot; countTempBottom++; }
            }

            if (bin.fieldRhBottom) {
                const rBot = parseNumber(feed[bin.fieldRhBottom]);
                if (rBot !== null && rBot >= 10 && rBot <= 99) { sumRhBottom += rBot; countRhBottom++; }
            }
        }
    }

    logger.info({ context: 'telemetry', binNumber: bin.binNumber, areaId: bin.areaId },
        feeds.length > 0
            ? `data telemetry ditemukan (${feeds.length} feed). Rata-rata: tempTop=${countTempTop > 0 ? (sumTempTop / countTempTop).toFixed(2) : 'null'}, rhTop=${countRhTop > 0 ? (sumRhTop / countRhTop).toFixed(2) : 'null'}, tempBottom=${countTempBottom > 0 ? (sumTempBottom / countTempBottom).toFixed(2) : 'null'}, rhBottom=${countRhBottom > 0 ? (sumRhBottom / countRhBottom).toFixed(2) : 'null'}`
            : "tidak ada data telemetry ditemukan."
    ); 

    return {
        tempTop: countTempTop > 0 ? Number((sumTempTop / countTempTop).toFixed(2)) : null,
        rhTop: countRhTop > 0 ? Number((sumRhTop / countRhTop).toFixed(2)) : null,
        tempBottom: countTempBottom > 0 ? Number((sumTempBottom / countTempBottom).toFixed(2)) : null,
        rhBottom: countRhBottom > 0 ? Number((sumRhBottom / countRhBottom).toFixed(2)) : null,
    };
}

let isRunning = false; // Prevent concurrent runs

export async function runTelemetryFetch(isManual: boolean = false) {
    if (isRunning) {
        logger.info({ context: 'telemetry' }, "[telemetry] Sedang berjalan, fetch dilewati.");
        return;
    }
    isRunning = true;
    const contextStr = isManual ? 'manual-fetch' : 'cron';
    logger.info({ context: contextStr }, `[telemetry] Menjalankan penarikan telemetri ThingSpeak (Manual: ${isManual})...`);
    
    let currentErrorMasterId: number | null = null;

    try {
        const allBins = await prisma.bin.findMany({
            include: { channelTop: true, channelBottom: true }
        });

        const now = new Date();
        const nowMs = now.getTime();

        for (const bin of allBins) {
            try {
                if (!bin.channelTop && !bin.channelBottom) {
                    continue;
                }

                const lastLog = await prisma.binLog.findFirst({
                    where: { binNumber: bin.binNumber, areaId: bin.areaId },
                    orderBy: { timestampThingspeak: 'desc' }
                });

                let fetchStartMs: number;
                let isRecoveryMode = false;

                if (lastLog) {
                    const lastLogMs = new Date(lastLog.timestampThingspeak).getTime();
                    const gapMs = nowMs - lastLogMs;

                    if (gapMs > INTERVAL_MS * 1.5) {
                        isRecoveryMode = true;
                        fetchStartMs = Math.max(lastLogMs, nowMs - MAX_RECOVERY_MS);
                        logger.info({ context: contextStr, binNumber: bin.binNumber, areaId: bin.areaId },
                            `[telemetry] MODE RECOVERY: Gap ${Math.round(gapMs / 60000)} menit. Start: ${new Date(fetchStartMs).toISOString()}`);
                    } else {
                        fetchStartMs = nowMs - INTERVAL_MS;
                    }
                } else {
                    fetchStartMs = nowMs - INTERVAL_MS;
                }

                const startTimeFormatted = log.format_thingspeak_datetime(new Date(fetchStartMs));
                const endTimeFormatted = log.format_thingspeak_datetime(now);

                const feeds: FeedEntry[] = [];
                const channelIdsToFetch = new Set<string>();
                if (bin.channelIdTop) channelIdsToFetch.add(bin.channelIdTop);
                if (bin.channelIdBottom) channelIdsToFetch.add(bin.channelIdBottom);

                for (const cid of channelIdsToFetch) {
                    const channelObj = bin.channelTop?.channelId === cid ? bin.channelTop : bin.channelBottom;
                    if (!channelObj) continue;

                    const feedResponse = await thinkspeaks.get_feeds_by_time(
                        Number(cid),
                        channelObj.apiKey,
                        { start_time: startTimeFormatted, end_time: endTimeFormatted }
                    );
                    
                    if (Array.isArray(feedResponse?.feeds)) {
                        const isTop = cid === bin.channelIdTop;
                        const isBottom = cid === bin.channelIdBottom;
                        feedResponse.feeds.forEach((f: FeedEntry) => {
                            if (isTop) f._isTop = true;
                            if (isBottom) f._isBottom = true;
                            feeds.push(f);
                        });
                    }
                    
                    if (channelIdsToFetch.size > 1) {
                        await delay(THINGSPEAK_DELAY_MS);
                    }
                }

                const currentIsEphemeral = bin.binStatus === 'EMPTY';

                if (feeds.length === 0) {
                    logger.warn({ context: contextStr, binNumber: bin.binNumber, areaId: bin.areaId },
                        `[telemetry] Telemetri tidak ditemukan dari ThingSpeak untuk Bin ${bin.binNumber}`);

                    if (!currentErrorMasterId) {
                        const newMaster = await prisma.fetchErrorMaster.create({ data: { isRead: false } });
                        currentErrorMasterId = newMaster.errorId;
                    }
                    await prisma.fetchErrorDetail.create({
                        data: {
                            errorId: currentErrorMasterId,
                            binNumber: bin.binNumber,
                            areaId: bin.areaId,
                            message: "ThingSpeak timeout atau tidak ada data dalam rentang waktu."
                        }
                    });
                }

                const intervals = sliceFeedsIntoIntervals(feeds, fetchStartMs, nowMs, INTERVAL_MS);
                let savedCount = 0;

                const TOLERANCE_MS = 30 * 60 * 1000;
                let lastKnownTempTop = lastLog?.tempTop ?? null;
                let lastKnownTempTopMs = lastKnownTempTop !== null && lastLog ? new Date(lastLog.timestampThingspeak).getTime() : 0;
                let lastKnownRhTop = lastLog?.rhTop ?? null;
                let lastKnownRhTopMs = lastKnownRhTop !== null && lastLog ? new Date(lastLog.timestampThingspeak).getTime() : 0;
                let lastKnownTempBottom = lastLog?.tempBottom ?? null;
                let lastKnownTempBottomMs = lastKnownTempBottom !== null && lastLog ? new Date(lastLog.timestampThingspeak).getTime() : 0;
                let lastKnownRhBottom = lastLog?.rhBottom ?? null;
                let lastKnownRhBottomMs = lastKnownRhBottom !== null && lastLog ? new Date(lastLog.timestampThingspeak).getTime() : 0;

                for (const interval of intervals) {
                    const avg = averageFeeds(interval.feeds, bin as any);
                    const intervalEndMs = interval.intervalEnd.getTime();

                    const hasAnyValidData = avg.tempTop !== null || avg.rhTop !== null || avg.tempBottom !== null || avg.rhBottom !== null;
                    let carriedForward = false;

                    if (hasAnyValidData) {
                        if (avg.tempTop !== null) {
                            lastKnownTempTop = avg.tempTop;
                            lastKnownTempTopMs = intervalEndMs;
                        } else if (lastKnownTempTop !== null && (intervalEndMs - lastKnownTempTopMs) <= TOLERANCE_MS) {
                            avg.tempTop = lastKnownTempTop;
                            carriedForward = true;
                        }

                        if (avg.rhTop !== null) {
                            lastKnownRhTop = avg.rhTop;
                            lastKnownRhTopMs = intervalEndMs;
                        } else if (lastKnownRhTop !== null && (intervalEndMs - lastKnownRhTopMs) <= TOLERANCE_MS) {
                            avg.rhTop = lastKnownRhTop;
                            carriedForward = true;
                        }

                        if (avg.tempBottom !== null) {
                            lastKnownTempBottom = avg.tempBottom;
                            lastKnownTempBottomMs = intervalEndMs;
                        } else if (lastKnownTempBottom !== null && (intervalEndMs - lastKnownTempBottomMs) <= TOLERANCE_MS) {
                            avg.tempBottom = lastKnownTempBottom;
                            carriedForward = true;
                        }

                        if (avg.rhBottom !== null) {
                            lastKnownRhBottom = avg.rhBottom;
                            lastKnownRhBottomMs = intervalEndMs;
                        } else if (lastKnownRhBottom !== null && (intervalEndMs - lastKnownRhBottomMs) <= TOLERANCE_MS) {
                            avg.rhBottom = lastKnownRhBottom;
                            carriedForward = true;
                        }
                    }

                    // Insert the log even if all are null, to explicitly mark the gap.

                    const isEphemeral = isRecoveryMode ? false : currentIsEphemeral;
                    let remark = "";
                    
                    if (hasAnyValidData) {
                        if (carriedForward) {
                            remark = "Perekaman otomatis dengan data parsial (Toleransi 30 Menit).";
                        } else {
                            remark = isRecoveryMode
                                ? `SYSTEM RECOVERY: Data retroaktif. Interval ${interval.feeds.length} feed.`
                                : `Perekaman otomatis (Rata-rata ${interval.feeds.length} feed).`;
                        }
                    } else {
                        remark = "SYSTEM AUTO-FAIL: Tidak ada data yang masuk di interval ini.";
                    }

                    await prisma.binLog.create({
                        data: {
                            binNumber: bin.binNumber,
                            areaId: bin.areaId,
                            timestampThingspeak: interval.intervalEnd,
                            statusBin: isRecoveryMode ? 'UNKNOWN' : bin.binStatus,
                            isEphemeral,
                            tempTop: avg.tempTop,
                            rhTop: avg.rhTop,
                            tempBottom: avg.tempBottom,
                            rhBottom: avg.rhBottom,
                            remark
                        }
                    });

                    savedCount++;
                }
                
                await delay(THINGSPEAK_DELAY_MS);

            } catch (binError: any) {
                logger.error({ context: contextStr, binNumber: bin.binNumber, areaId: bin.areaId },
                    `[telemetry] Gagal memproses telemetri: ${binError.message}`);

                if (!currentErrorMasterId) {
                    const newMaster = await prisma.fetchErrorMaster.create({ data: { isRead: false } });
                    currentErrorMasterId = newMaster.errorId;
                }
                await prisma.fetchErrorDetail.create({
                    data: {
                        errorId: currentErrorMasterId,
                        binNumber: bin.binNumber,
                        areaId: bin.areaId,
                        message: `Sistem Error: ${binError.message}`
                    }
                });
            }
        }
    } catch (error: any) {
        logger.error({ context: contextStr, error: error.message }, "[telemetry] Kegagalan sistemik saat menjalankan fetch.");
    } finally {
        isRunning = false;
    }
}
