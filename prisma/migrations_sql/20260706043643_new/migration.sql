-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_JobTracker" (
    "job_id" TEXT NOT NULL PRIMARY KEY,
    "lot_id" INTEGER NOT NULL,
    "bin_id" INTEGER NOT NULL,
    "execute_time" DATETIME NOT NULL,
    "interval_minutes" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "locked_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_JobTracker" ("attempt_count", "bin_id", "created_at", "execute_time", "interval_minutes", "job_id", "last_error", "locked_at", "lot_id", "status", "updated_at") SELECT "attempt_count", "bin_id", "created_at", "execute_time", "interval_minutes", "job_id", "last_error", "locked_at", "lot_id", "status", "updated_at" FROM "JobTracker";
DROP TABLE "JobTracker";
ALTER TABLE "new_JobTracker" RENAME TO "JobTracker";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
