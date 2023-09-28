/*
  Warnings:

  - Made the column `supportPersonId` on table `support_job` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `operatorz_operatorName_key` ON `operatorz`;

-- AlterTable
ALTER TABLE `support_job` MODIFY `supportPersonId` INTEGER NOT NULL;
