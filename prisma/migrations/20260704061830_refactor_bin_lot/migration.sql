/*
  Warnings:

  - You are about to alter the column `status` on the `lots` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `bins` ADD COLUMN `bin_status` ENUM('EMPTY', 'UPAIR', 'DOWNAIR', 'DRIED') NOT NULL DEFAULT 'EMPTY';

-- AlterTable
ALTER TABLE `lots` MODIFY `status` ENUM('UPAIR', 'DOWNAIR') NOT NULL DEFAULT 'UPAIR';
