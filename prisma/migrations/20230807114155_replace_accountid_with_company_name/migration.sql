-- AlterTable
ALTER TABLE `support_job` ADD COLUMN `company` VARCHAR(100) NOT NULL DEFAULT '',
    MODIFY `accountId` INTEGER NULL;
