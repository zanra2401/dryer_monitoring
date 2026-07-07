-- DropForeignKey
ALTER TABLE `lots` DROP FOREIGN KEY `lots_bin_number_area_id_fkey`;

-- DropIndex
DROP INDEX `lots_bin_number_area_id_fkey` ON `lots`;
