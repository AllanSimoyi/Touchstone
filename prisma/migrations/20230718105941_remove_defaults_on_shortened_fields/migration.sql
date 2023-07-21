-- AlterTable
ALTER TABLE `accounts` ALTER COLUMN `otherNames` DROP DEFAULT;

-- AlterTable
ALTER TABLE `ceos` ALTER COLUMN `ceoEmail` DROP DEFAULT,
    ALTER COLUMN `ceoFax` DROP DEFAULT,
    ALTER COLUMN `ceoPhone` DROP DEFAULT;

-- AlterTable
ALTER TABLE `operatorz` ALTER COLUMN `operatorEmail` DROP DEFAULT;
