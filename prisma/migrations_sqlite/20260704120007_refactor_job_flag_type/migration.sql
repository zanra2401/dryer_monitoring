/*
  Warnings:

  - The primary key for the `JobTracker` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `binNumber` on the `JobTracker` table. All the data in the column will be lost.
  - You are about to drop the column `intervalMs` on the `JobTracker` table. All the data in the column will be lost.
  - You are about to drop the column `jobId` on the `JobTracker` table. All the data in the column will be lost.
  - You are about to drop the column `lastExecuted` on the `JobTracker` table. All the data in the column will be lost.
  - Added the required column `Executed Time` to the `JobTracker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bin_id` to the `JobTracker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `job_id` to the `JobTracker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lot_id` to the `JobTracker` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "MustExecutedJob" (
    "job_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "executed_time" DATETIME NOT NULL,
    "lot_id" INTEGER NOT NULL,
    "bin_id" INTEGER NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_JobTracker" (
    "job_id" TEXT NOT NULL PRIMARY KEY,
    "lot_id" INTEGER NOT NULL,
    "bin_id" INTEGER NOT NULL,
    "Executed Time" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE'
);
INSERT INTO "new_JobTracker" ("status") SELECT "status" FROM "JobTracker";
DROP TABLE "JobTracker";
ALTER TABLE "new_JobTracker" RENAME TO "JobTracker";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
