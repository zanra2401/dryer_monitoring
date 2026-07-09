/*
  Warnings:

  - You are about to alter the column `temp_top` on the `logs` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Double`.
  - You are about to alter the column `rh_top` on the `logs` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Double`.
  - You are about to alter the column `temp_bottom` on the `logs` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Double`.
  - You are about to alter the column `rh_bottom` on the `logs` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Double`.
  - You are about to alter the column `mc` on the `logs` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Double`.

*/
-- AlterTable
ALTER TABLE `logs` MODIFY `temp_top` DOUBLE NULL,
    MODIFY `rh_top` DOUBLE NULL,
    MODIFY `temp_bottom` DOUBLE NULL,
    MODIFY `rh_bottom` DOUBLE NULL,
    MODIFY `mc` DOUBLE NULL;
