/*
  Warnings:

  - You are about to drop the column `otherNamesOnCheques` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `ceoEmailAddress` on the `ceos` table. All the data in the column will be lost.
  - You are about to drop the column `ceoFaxNumber` on the `ceos` table. All the data in the column will be lost.
  - You are about to drop the column `ceoPhoneNumber` on the `ceos` table. All the data in the column will be lost.
  - You are about to drop the column `operatorEmailAddress` on the `operatorz` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `accounts` DROP COLUMN `otherNamesOnCheques`,
    ADD COLUMN `otherNames` VARCHAR(200) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `ceos` DROP COLUMN `ceoEmailAddress`,
    DROP COLUMN `ceoFaxNumber`,
    DROP COLUMN `ceoPhoneNumber`,
    ADD COLUMN `ceoEmail` VARCHAR(50) NOT NULL DEFAULT '',
    ADD COLUMN `ceoFax` VARCHAR(20) NOT NULL DEFAULT '',
    ADD COLUMN `ceoPhone` VARCHAR(40) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `operatorz` DROP COLUMN `operatorEmailAddress`,
    ADD COLUMN `operatorEmail` VARCHAR(50) NOT NULL DEFAULT '';
