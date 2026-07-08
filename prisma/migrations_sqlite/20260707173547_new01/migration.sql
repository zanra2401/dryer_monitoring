/*
  Warnings:

  - You are about to drop the `JobTracker` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MustExecutedJob` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "JobTracker";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MustExecutedJob";
PRAGMA foreign_keys=on;
