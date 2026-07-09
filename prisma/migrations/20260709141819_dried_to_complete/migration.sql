/*
  Warnings:

  - The values [COMPLETED] on the enum `bins_bin_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [COMPLETED] on the enum `lots_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `bin_logs` ADD COLUMN `is_ephemeral` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `bins` MODIFY `bin_status` ENUM('EMPTY', 'UPAIR', 'DOWNAIR') NOT NULL DEFAULT 'EMPTY';

-- AlterTable
ALTER TABLE `lots` MODIFY `status` ENUM('UPAIR', 'DOWNAIR', 'COMPLETED') NOT NULL DEFAULT 'UPAIR';
