/*
  Warnings:

  - You are about to drop the column `company` on the `support_job` table. All the data in the column will be lost.
  - Made the column `accountId` on table `support_job` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `support_job` DROP COLUMN `company`,
    MODIFY `accountId` INTEGER NOT NULL;
