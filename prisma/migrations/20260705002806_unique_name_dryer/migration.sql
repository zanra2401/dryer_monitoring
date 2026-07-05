/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `dryer_areas` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `dryer_areas_name_key` ON `dryer_areas`(`name`);
