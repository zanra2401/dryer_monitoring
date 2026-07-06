/*
  Warnings:

  - Added the required column `channel_id` to the `bins` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bins` ADD COLUMN `channel_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `bins` ADD CONSTRAINT `bins_channel_id_fkey` FOREIGN KEY (`channel_id`) REFERENCES `channels`(`channel_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
