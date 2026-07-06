-- DropForeignKey
ALTER TABLE `lots` DROP FOREIGN KEY `lots_create_by_fkey`;

-- DropIndex
DROP INDEX `lots_create_by_fkey` ON `lots`;

-- AlterTable
ALTER TABLE `lots` MODIFY `create_by` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `lots` ADD CONSTRAINT `lots_create_by_fkey` FOREIGN KEY (`create_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
