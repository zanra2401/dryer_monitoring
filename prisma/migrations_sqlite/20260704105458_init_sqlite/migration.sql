-- CreateTable
CREATE TABLE "SystemFlag" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "JobTracker" (
    "jobId" TEXT NOT NULL PRIMARY KEY,
    "binNumber" INTEGER NOT NULL,
    "intervalMs" INTEGER NOT NULL,
    "lastExecuted" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Active'
);
