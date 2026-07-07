-- AlterTable
ALTER TABLE `lots` ADD COLUMN `depth` DOUBLE NULL,
    ADD COLUMN `down_air_at` DATETIME(3) NULL,
    ADD COLUMN `down_mc` DOUBLE NULL,
    ADD COLUMN `end_mc` DOUBLE NULL;
