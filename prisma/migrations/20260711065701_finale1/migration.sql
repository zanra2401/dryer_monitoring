/*
  Warnings:

  - You are about to drop the column `channel_id` on the `bins` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `bins` DROP FOREIGN KEY `bins_channel_id_fkey`;

-- DropIndex
DROP INDEX `bins_channel_id_fkey` ON `bins`;

-- AlterTable
ALTER TABLE `bins` DROP COLUMN `channel_id`,
    ADD COLUMN `channel_id_bottom` VARCHAR(191) NULL,
    ADD COLUMN `channel_id_top` VARCHAR(191) NULL,
    MODIFY `field_temp_top` VARCHAR(191) NULL,
    MODIFY `field_rh_top` VARCHAR(191) NULL,
    MODIFY `field_temp_bottom` VARCHAR(191) NULL,
    MODIFY `field_rh_bottom` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `bins` ADD CONSTRAINT `bins_channel_id_top_fkey` FOREIGN KEY (`channel_id_top`) REFERENCES `channels`(`channel_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bins` ADD CONSTRAINT `bins_channel_id_bottom_fkey` FOREIGN KEY (`channel_id_bottom`) REFERENCES `channels`(`channel_id`) ON DELETE SET NULL ON UPDATE CASCADE;
