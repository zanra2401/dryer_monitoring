/*
  Warnings:

  - The primary key for the `channels` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `bins` DROP FOREIGN KEY `bins_channel_id_fkey`;

-- DropIndex
DROP INDEX `bins_channel_id_fkey` ON `bins`;

-- AlterTable
ALTER TABLE `bins` MODIFY `channel_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `channels` DROP PRIMARY KEY,
    MODIFY `channel_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`channel_id`);

-- AddForeignKey
ALTER TABLE `bins` ADD CONSTRAINT `bins_channel_id_fkey` FOREIGN KEY (`channel_id`) REFERENCES `channels`(`channel_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
