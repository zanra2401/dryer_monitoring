import { Prisma } from "~/generated/prisma/client";
import * as z from "zod";
import { BinStatus } from "~/generated/prisma/client";
import thinkspeaks from "~~/server/utils/thinkspeaks";
import log from "~~/server/utils/log"
import sqliteUtils from "~~/server/utils/sqlite";
import { randomUUID } from "node:crypto";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { lot_number, hybrid, quality, net_to_bin, initial_mc, start_time, area_id, bin_number, interval_minutes } = body;
        const startDate = log.to_valid_date(start_time);
        const intervalMinutes = typeof interval_minutes === "number" && interval_minutes > 0 ? interval_minutes : 1;

        if (log.is_future_date(startDate)) {
            throw createError({
                statusCode: 400,
                statusMessage: "start_time tidak boleh di masa depan",
            });
        }

        const result = await prisma.$transaction(async (prisma) => {
            const lotData = await prisma.lot.create({
                data: {
                    lotNumber: lot_number,
                    hybrid: hybrid,
                    quality: quality,
                    netToBin: net_to_bin,
                    initialMc: initial_mc,
                    startTime: new Date(start_time),
                    areaId: area_id,
                    binNumber: bin_number,
                },
                select: {
                    lotId: true,
                },
            });  
    
            const updateBin = await prisma.bin.update({
                where: {
                    binNumber_areaId: {
                        areaId: area_id,
                        binNumber: bin_number,
                    }
                },
                data: {
                    occupiedBy: lot_number,
                    binStatus: BinStatus.UPAIR,
                },
                select: {
                    channelId: true,
                    fieldTempTop: true,
                    fieldRhTop: true,
                    fieldTempBottom: true,
                    fieldRhBottom: true,
                    channel: {
                        select: {
                            apiKey: true,
                        }
                    }
                }
            });

            const date_range = log.make_range_date(startDate);
            const feedResponse = await thinkspeaks.get_feeds_by_time(updateBin.channelId, updateBin.channel.apiKey, date_range);
            const feeds = Array.isArray(feedResponse?.feeds) ? feedResponse.feeds : [];
            const nearestFeed = log.find_nearest_feed(feeds, startDate);

            if (!nearestFeed) {
                throw createError({
                    statusCode: 404,
                    statusMessage: "data di thinkspeak tidak di temukan tunggu 15 detik",
                });
            }

            const requiredBinFields = [
                updateBin.fieldTempTop,
                updateBin.fieldRhTop,
                updateBin.fieldTempBottom,
                updateBin.fieldRhBottom,
            ];

            if (requiredBinFields.some((field) => !field)) {
                throw createError({
                    statusCode: 500,
                    statusMessage: "field mapping bin tidak lengkap",
                });
            }

            const startLog = log.build_start_log_data({
                lotId: lotData.lotId,
                feed: nearestFeed,
                bin: {
                    fieldTempTop: updateBin.fieldTempTop,
                    fieldRhTop: updateBin.fieldRhTop,
                    fieldTempBottom: updateBin.fieldTempBottom,
                    fieldRhBottom: updateBin.fieldRhBottom,
                },
                initialMc: initial_mc,
            });

            const createdLog = await prisma.log.create({
                data: startLog,
            });

            const nextExecuteTime = new Date(startDate.getTime() + (intervalMinutes * 60 * 1000));
            const jobTracker = await sqliteUtils.createJobTracker({
                JobId: randomUUID(),
                LotId: lotData.lotId,
                BinId: bin_number,
                ExecuteTime: nextExecuteTime,
                IntervalMinutes: intervalMinutes,
            });

            return {
                lotId: lotData.lotId,
                feed: nearestFeed,
                log: createdLog,
                jobTracker,
            };

        });

        return { success: true, data: result };

    } catch (error: unknown) {

        if (error instanceof z.ZodError) {
            throw createError({
                statusCode: 400,
                statusMessage: error.issues.map(issue => issue.message).join(", "),
            });
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw createError({
                    statusCode: 409,
                    statusMessage: "Duplicate entry detected",
                });
            } else if (error.code === "P2003") {
                throw createError({
                    statusCode: 400,
                    statusMessage: "Foreign key constraint violation",
                });
            }
        }
        console.error("Error in start process:", error);
        throw error; 
    }
});