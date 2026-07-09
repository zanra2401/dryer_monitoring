/*
  Warnings:

  - You are about to alter the column `net_to_bin` on the `lots` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Double`.
  - You are about to alter the column `initial_mc` on the `lots` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Double`.

*/
-- AlterTable
ALTER TABLE `lots` MODIFY `net_to_bin` DOUBLE NULL,
    MODIFY `initial_mc` DOUBLE NULL;
