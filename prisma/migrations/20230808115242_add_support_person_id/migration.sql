/*
  Warnings:

  - You are about to drop the column `supportPerson` on the `support_job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `support_job` DROP COLUMN `supportPerson`,
    ADD COLUMN `supportPersonId` INTEGER NULL;
