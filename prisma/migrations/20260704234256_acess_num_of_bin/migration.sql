/*
  Warnings:

  - Added the required column `number_of_bin` to the `channels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `channels` ADD COLUMN `number_of_bin` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `dryer_access` (
    `user_id` INTEGER NOT NULL,
    `area_id` INTEGER NOT NULL,

    PRIMARY KEY (`area_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `dryer_access` ADD CONSTRAINT `dryer_access_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dryer_access` ADD CONSTRAINT `dryer_access_area_id_fkey` FOREIGN KEY (`area_id`) REFERENCES `dryer_areas`(`area_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
