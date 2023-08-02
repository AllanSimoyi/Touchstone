/*
  Warnings:

  - Made the column `areaId` on table `area_event` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `area_event` DROP FOREIGN KEY `area_event_areaId_fkey`;

-- AlterTable
ALTER TABLE `accounts` MODIFY `areaId` INTEGER NULL;

-- AlterTable
ALTER TABLE `area_event` MODIFY `areaId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `area_event` ADD CONSTRAINT `area_event_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `areas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
