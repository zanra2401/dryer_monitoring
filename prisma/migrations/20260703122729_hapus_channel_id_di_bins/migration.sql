/*
  Warnings:

  - You are about to drop the column `channel_id` on the `bins` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `bins` DROP FOREIGN KEY `bins_channel_id_fkey`;

-- DropIndex
DROP INDEX `bins_channel_id_fkey` ON `bins`;

-- AlterTable
ALTER TABLE `bins` DROP COLUMN `channel_id`;
