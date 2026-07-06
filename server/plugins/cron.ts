import sqliteUtils from "~~/server/utils/sqlite";
import { prisma } from "~~/server/utils/prisma";
import thinkspeaks from "~~/server/utils/thinkspeaks";
import log from "~~/server/utils/log";

const jobIntervalMs = 60 * 1000;

const processDueJobs = async () => {
	const now = new Date();
	const dueJobs = await sqliteUtils.getDueJobTrackers(now);
	console.info(`[cron] poll ${now.toISOString()} dueJobs=${dueJobs.length}`);

	for (const job of dueJobs) {
		const currentExecuteTime = new Date(job.ExecuteTime);
		const intervalMinutes = job.IntervalMinutes ?? 1;
		const jobDurationMs = intervalMinutes * 60 * 1000;
		const claim = await sqliteUtils.lockJobTracker(job.JobId, currentExecuteTime);

		if (claim.count === 0) {
			console.info(`[cron] skip job=${job.JobId} reason=already-claimed`);
			continue;
		}

		console.info(
			`[cron] process job=${job.JobId} lot=${job.LotId} bin=${job.BinId} executeTime=${currentExecuteTime.toISOString()} intervalMinutes=${intervalMinutes}`,
		);

		try {
			const lot = await prisma.lot.findUnique({
				where: {
					lotId: job.LotId,
				},
				select: {
					lotId: true,
					areaId: true,
					binNumber: true,
					initialMc: true,
				},
			});

			if (!lot) {
				console.error(`Lot ${job.LotId} not found for job ${job.JobId}`);
				continue;
			}

			const bin = await prisma.bin.findUnique({
				where: {
					binNumber_areaId: {
						areaId: lot.areaId,
						binNumber: lot.binNumber,
					},
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
						},
					},
				},
			});

			if (!bin) {
				console.error(`Bin not found for job ${job.JobId}`);
				continue;
			}

			if (!bin.fieldTempTop || !bin.fieldRhTop || !bin.fieldTempBottom || !bin.fieldRhBottom) {
				console.error(`Bin field mapping incomplete for job ${job.JobId}`);
				continue;
			}

			const dateRange = log.make_range_date(currentExecuteTime);
			const feedResponse = await thinkspeaks.get_feeds_by_time(bin.channelId, bin.channel.apiKey, dateRange);
			const feeds = Array.isArray(feedResponse?.feeds) ? feedResponse.feeds : [];
			console.info(`[cron] thinkSpeak feeds job=${job.JobId} count=${feeds.length}`);
			const nearestFeed = log.find_nearest_feed(feeds, currentExecuteTime);

			if (!nearestFeed) {
				console.error(`ThinkSpeak data not found for job ${job.JobId}`);
				await sqliteUtils.updateJobTrackerError(job.JobId, "ThinkSpeak data not found");
				await sqliteUtils.rescheduleJobTracker(
					job.JobId,
					currentExecuteTime,
					new Date(currentExecuteTime.getTime() + jobDurationMs),
				);
				console.info(
					`[cron] rescheduled job=${job.JobId} nextExecuteTime=${new Date(currentExecuteTime.getTime() + jobDurationMs).toISOString()} status=no-feed`,
				);

				continue;
			}

			const logData = log.build_start_log_data({
				lotId: lot.lotId,
				feed: nearestFeed,
				bin: {
					fieldTempTop: bin.fieldTempTop,
					fieldRhTop: bin.fieldRhTop,
					fieldTempBottom: bin.fieldTempBottom,
					fieldRhBottom: bin.fieldRhBottom,
				},
				initialMc: lot.initialMc ? Number(lot.initialMc) : 0,
			});

			await prisma.log.create({
				data: logData,
			});

			await sqliteUtils.rescheduleJobTracker(
				job.JobId,
				currentExecuteTime,
				new Date(currentExecuteTime.getTime() + jobDurationMs),
			);
			console.info(
				`[cron] completed job=${job.JobId} nextExecuteTime=${new Date(currentExecuteTime.getTime() + jobDurationMs).toISOString()} status=success`,
			);
		} catch (error) {
			console.error(`Failed processing job ${job.JobId}:`, error);
			await sqliteUtils.updateJobTrackerError(
				job.JobId,
				error instanceof Error ? error.message : "Unknown error",
			);
			await sqliteUtils.rescheduleJobTracker(
				job.JobId,
				currentExecuteTime,
				new Date(currentExecuteTime.getTime() + ((job.IntervalMinutes ?? 1) * 60 * 1000)),
			);
			console.info(
				`[cron] rescheduled job=${job.JobId} nextExecuteTime=${new Date(currentExecuteTime.getTime() + ((job.IntervalMinutes ?? 1) * 60 * 1000)).toISOString()} status=error`,
			);
		}
	}
};

export default defineNitroPlugin(() => {
	const globalScope = globalThis as typeof globalThis & {
		__dryerMonitoringCronStarted?: boolean;
		__dryerMonitoringCronTimer?: ReturnType<typeof setInterval>;
	};

	if (globalScope.__dryerMonitoringCronStarted) {
		return;
	}

	globalScope.__dryerMonitoringCronStarted = true;
	console.info(`[cron] started intervalMs=${jobIntervalMs}`);
	globalScope.__dryerMonitoringCronTimer = setInterval(() => {
		void processDueJobs().catch((error) => {
			console.error("Cron job runner failed:", error);
		});
	}, jobIntervalMs);

	globalScope.__dryerMonitoringCronTimer.unref?.();
});