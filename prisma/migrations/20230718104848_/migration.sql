/*
  Warnings:

  - You are about to drop the column `accountantEmailAddress` on the `accountants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `accountants` DROP COLUMN `accountantEmailAddress`,
    ADD COLUMN `accountantEmail` VARCHAR(100) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `accounts` MODIFY `description` VARCHAR(1600) NOT NULL,
    MODIFY `comment` VARCHAR(1600) NOT NULL;
