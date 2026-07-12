-- CreateTable
CREATE TABLE `fetch_error_master` (
    `error_id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_read` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`error_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fetch_error_details` (
    `detail_id` INTEGER NOT NULL AUTO_INCREMENT,
    `error_id` INTEGER NOT NULL,
    `bin_number` INTEGER NOT NULL,
    `area_id` INTEGER NOT NULL,
    `message` TEXT NOT NULL,

    PRIMARY KEY (`detail_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fetch_error_details` ADD CONSTRAINT `fetch_error_details_error_id_fkey` FOREIGN KEY (`error_id`) REFERENCES `fetch_error_master`(`error_id`) ON DELETE CASCADE ON UPDATE CASCADE;
