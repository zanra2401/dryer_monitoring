/*
  Warnings:

  - You are about to drop the column `number_of_fields` on the `channels` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `channels` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `channels` DROP COLUMN `number_of_fields`,
    DROP COLUMN `url`;
