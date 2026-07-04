-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dryer_areas` (
    `area_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`area_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `channels` (
    `channel_id` INTEGER NOT NULL,
    `area_id` INTEGER NOT NULL,
    `api_key` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `number_of_fields` INTEGER NOT NULL,

    PRIMARY KEY (`channel_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bins` (
    `bin_number` INTEGER NOT NULL,
    `area_id` INTEGER NOT NULL,
    `channel_id` INTEGER NOT NULL,
    `field_temp_top` VARCHAR(191) NOT NULL,
    `field_rh_top` VARCHAR(191) NOT NULL,
    `field_temp_bottom` VARCHAR(191) NOT NULL,
    `field_rh_bottom` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`bin_number`, `area_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lots` (
    `lot_id` INTEGER NOT NULL AUTO_INCREMENT,
    `lot_number` VARCHAR(191) NOT NULL,
    `hybrid` VARCHAR(191) NULL,
    `quality` VARCHAR(191) NULL,
    `net_to_bin` DECIMAL(65, 30) NULL,
    `initial_mc` DECIMAL(65, 30) NULL,
    `status` VARCHAR(191) NOT NULL,
    `create_by` INTEGER NOT NULL,
    `bin_number` INTEGER NOT NULL,
    `area_id` INTEGER NOT NULL,
    `start_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `end_time` DATETIME(3) NULL,

    PRIMARY KEY (`lot_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logs` (
    `log_id` INTEGER NOT NULL AUTO_INCREMENT,
    `lot_id` INTEGER NOT NULL,
    `timestamp_thingspeak` DATETIME(3) NOT NULL,
    `status_bin` VARCHAR(191) NOT NULL,
    `temp_top` DECIMAL(65, 30) NULL,
    `rh_top` DECIMAL(65, 30) NULL,
    `temp_bottom` DECIMAL(65, 30) NULL,
    `rh_bottom` DECIMAL(65, 30) NULL,
    `mc` DECIMAL(65, 30) NULL,
    `checker_name` VARCHAR(191) NULL,

    PRIMARY KEY (`log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `channels` ADD CONSTRAINT `channels_area_id_fkey` FOREIGN KEY (`area_id`) REFERENCES `dryer_areas`(`area_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bins` ADD CONSTRAINT `bins_area_id_fkey` FOREIGN KEY (`area_id`) REFERENCES `dryer_areas`(`area_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bins` ADD CONSTRAINT `bins_channel_id_fkey` FOREIGN KEY (`channel_id`) REFERENCES `channels`(`channel_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lots` ADD CONSTRAINT `lots_create_by_fkey` FOREIGN KEY (`create_by`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lots` ADD CONSTRAINT `lots_bin_number_area_id_fkey` FOREIGN KEY (`bin_number`, `area_id`) REFERENCES `bins`(`bin_number`, `area_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `lots`(`lot_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
