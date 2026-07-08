// server/utils/db.ts
import { PrismaClient as SqliteClient, FlagType } from '~/generated/sqlite/client'
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
}


export default sqliteUtils;