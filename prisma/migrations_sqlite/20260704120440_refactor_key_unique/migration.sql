/*
  Warnings:

  - A unique constraint covering the columns `[value]` on the table `SystemFlag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SystemFlag_value_key" ON "SystemFlag"("value");
