/*
  Warnings:

  - You are about to drop the `logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `logs` DROP FOREIGN KEY `logs_lot_id_fkey`;

-- DropTable
DROP TABLE `logs`;

-- CreateTable
CREATE TABLE `bin_logs` (
    `bin_log_id` INTEGER NOT NULL AUTO_INCREMENT,
    `bin_number` INTEGER NOT NULL,
    `area_id` INTEGER NOT NULL,
    `timestamp_thingspeak` DATETIME(3) NOT NULL,
    `status_bin` VARCHAR(191) NOT NULL,
    `temp_top` DOUBLE NULL,
    `rh_top` DOUBLE NULL,
    `temp_bottom` DOUBLE NULL,
    `rh_bottom` DOUBLE NULL,
    `remark` VARCHAR(191) NULL,

    PRIMARY KEY (`bin_log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lot_mc_logs` (
    `lot_mc_log_id` INTEGER NOT NULL AUTO_INCREMENT,
    `lot_id` INTEGER NOT NULL,
    `mc` DOUBLE NOT NULL,
    `checker_name` VARCHAR(191) NULL,
    `remark` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`lot_mc_log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bin_logs` ADD CONSTRAINT `bin_logs_bin_number_area_id_fkey` FOREIGN KEY (`bin_number`, `area_id`) REFERENCES `bins`(`bin_number`, `area_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lot_mc_logs` ADD CONSTRAINT `lot_mc_logs_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `lots`(`lot_id`) ON DELETE CASCADE ON UPDATE CASCADE;
