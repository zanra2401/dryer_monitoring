-- Refactor JobTracker into a proper recurring job queue and make MustExecutedJob a history table.

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Redefine JobTracker with queue metadata and retry state.
-- Legacy JobTracker rows are intentionally not copied because the old schema
-- does not contain a lot_id value that can be mapped safely.
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
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE "JobTracker";
ALTER TABLE "new_JobTracker" RENAME TO "JobTracker";

-- Redefine MustExecutedJob as execution history.
CREATE TABLE "new_MustExecutedJob" (
    "job_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "executed_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lot_id" INTEGER NOT NULL,
    "bin_id" INTEGER NOT NULL,
    "tracker_job_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "error_message" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "new_MustExecutedJob" (
    "job_id",
    "executed_time",
    "lot_id",
    "bin_id"
)
SELECT
    "job_id",
    "executed_time",
    "lot_id",
    "bin_id"
FROM "MustExecutedJob";

DROP TABLE "MustExecutedJob";
ALTER TABLE "new_MustExecutedJob" RENAME TO "MustExecutedJob";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;