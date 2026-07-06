// server/utils/db.ts
import { PrismaClient as SqliteClient, FlagType, StatusJob } from '~/generated/sqlite/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Klien untuk SQLite (Akses Cepat: Job Tracker, System Flag)
const adapter = new PrismaBetterSqlite3({ 
    url: process.env["DATABASE_SQLITE_URL"] || "file:./dev.db",
    // options: { verbose: true } // Aktifkan ini untuk debugging
});
const fastDb = new SqliteClient({
    adapter: adapter,    
});

let executedJobSequence = 0;

const parseValue = (value: string, type: FlagType) => {
    switch (type) {
        case FlagType.BOOLEAN:
            return value === 'true';
        case FlagType.NUMBER:
            return Number(value);
        case FlagType.STRING:
            return value;
        default:
            throw new Error(`Unknown flag type: ${type}`);
    }
}

const sqliteUtils = {
    getSystemFlag: async (key: string) => {
        try {
            const flag = await fastDb.systemFlag.findUnique({
                where: { key: key },
                select: {
                    key: true,
                    value: true,
                    type: true,
                }
            });

            const value = flag ? parseValue(flag.value, flag.type) : null;

            return flag ? value : null;       
        } catch (error) {
            console.error(`Error fetching system flag for key "${key}":`, error);
            throw error;
        }
    },

    setSystemFlag: async (key: string, value: string, type: FlagType) => {
        try {
            const flag = await fastDb.systemFlag.upsert({
                where: { key: key },
                update: { value: value, type: type },
                create: { key: key, value: value, type: type },
            });

            return flag;
        } catch (error) {
            console.error(`Error setting system flag for key "${key}":`, error);
            throw error;
        }
    },

    deleteSystemFlag: async (key: string) => {
        try {
            const flag = await fastDb.systemFlag.delete({
                where: { key: key },
            });

            return flag;
        } catch (error) {
            console.error(`Error deleting system flag for key "${key}":`, error);
            throw error;
        }
    },

    createJobTracker: async (data: {
        JobId: string;
        LotId: number;
        BinId: number;
        ExecuteTime: Date;
        IntervalMinutes?: number;
        status?: StatusJob;
    }) => {
        try {
            return await fastDb.jobTracker.create({
                data: {
                    JobId: data.JobId,
                    LotId: data.LotId,
                    BinId: data.BinId,
                    ExecuteTime: data.ExecuteTime,
                    IntervalMinutes: data.IntervalMinutes ?? 1,
                    status: data.status ?? StatusJob.ACTIVE,
                },
            });
        } catch (error) {
            console.error("Error creating job tracker:", error);
            throw error;
        }
    },

    getDueJobTrackers: async (now: Date) => {
        try {
            return await fastDb.jobTracker.findMany({
                where: {
                    status: StatusJob.ACTIVE,
                    ExecuteTime: {
                        lte: now,
                    },
                },
                orderBy: {
                    ExecuteTime: "asc",
                },
            });
        } catch (error) {
            console.error("Error fetching due job trackers:", error);
            throw error;
        }
    },

    rescheduleJobTracker: async (jobId: string, currentExecuteTime: Date, nextExecuteTime: Date) => {
        try {
            return await fastDb.jobTracker.updateMany({
                where: {
                    JobId: jobId,
                    status: StatusJob.ACTIVE,
                    ExecuteTime: currentExecuteTime,
                },
                data: {
                    ExecuteTime: nextExecuteTime,
                    lockedAt: null,
                    lastError: null,
                },
            });
        } catch (error) {
            console.error(`Error rescheduling job tracker ${jobId}:`, error);
            throw error;
        }
    },

    lockJobTracker: async (jobId: string, executeTime: Date) => {
        try {
            return await fastDb.jobTracker.updateMany({
                where: {
                    JobId: jobId,
                    status: StatusJob.ACTIVE,
                    ExecuteTime: executeTime,
                },
                data: {
                    lockedAt: new Date(),
                    attemptCount: {
                        increment: 1,
                    },
                },
            });
        } catch (error) {
            console.error(`Error locking job tracker ${jobId}:`, error);
            throw error;
        }
    },

    updateJobTrackerError: async (jobId: string, errorMessage: string) => {
        try {
            return await fastDb.jobTracker.updateMany({
                where: {
                    JobId: jobId,
                    status: StatusJob.ACTIVE,
                },
                data: {
                    lastError: errorMessage,
                    lockedAt: null,
                },
            });
        } catch (error) {
            console.error(`Error updating job tracker error for ${jobId}:`, error);
            throw error;
        }
    },

    createExecutedJob: async (data: {
        LotId: number;
        BinId: number;
        ExecutedTime: Date;
        TrackerJobId?: string;
        status?: StatusJob;
        errorMessage?: string | null;
    }) => {
        try {
            return await fastDb.mustExecutedJob.create({
                data: {
                    LotId: data.LotId,
                    BinId: data.BinId,
                    ExecutedTime: data.ExecutedTime,
                    TrackerJobId: data.TrackerJobId,
                    status: data.status ?? StatusJob.ACTIVE,
                    errorMessage: data.errorMessage ?? null,
                },
            });
        } catch (error) {
            console.error("Error creating executed job history:", error);
            throw error;
        }
    }
}


export default sqliteUtils;