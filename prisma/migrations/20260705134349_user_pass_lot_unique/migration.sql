/*
  Warnings:

  - A unique constraint covering the columns `[lot_number]` on the table `lots` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `password` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `lots_lot_number_key` ON `lots`(`lot_number`);
