-- DropForeignKey
ALTER TABLE `bins` DROP FOREIGN KEY `bins_channel_id_fkey`;

-- DropIndex
DROP INDEX `bins_channel_id_fkey` ON `bins`;

-- AddForeignKey
ALTER TABLE `bins` ADD CONSTRAINT `bins_channel_id_fkey` FOREIGN KEY (`channel_id`) REFERENCES `channels`(`channel_id`) ON DELETE CASCADE ON UPDATE CASCADE;
