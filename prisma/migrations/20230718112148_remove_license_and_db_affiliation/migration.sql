/*
  Warnings:

  - You are about to drop the column `licenseId` on the `databasez` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `databasez` DROP FOREIGN KEY `databasez_licenseId_fkey`;

-- AlterTable
ALTER TABLE `databasez` DROP COLUMN `licenseId`;
