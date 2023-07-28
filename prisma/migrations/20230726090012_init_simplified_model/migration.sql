-- CreateTable
CREATE TABLE `accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `accountNumber` VARCHAR(20) NOT NULL,
    `companyName` VARCHAR(200) NOT NULL,
    `tradingAs` VARCHAR(200) NOT NULL,
    `formerly` VARCHAR(200) NOT NULL,
    `groupId` INTEGER NOT NULL,
    `areaId` INTEGER NOT NULL,
    `sectorId` INTEGER NOT NULL,
    `vatNumber` VARCHAR(200) NOT NULL,
    `otherNames` VARCHAR(200) NOT NULL,
    `description` VARCHAR(1600) NOT NULL,
    `actual` INTEGER NOT NULL,
    `reason` VARCHAR(500) NOT NULL,
    `statusId` INTEGER NOT NULL,
    `contractNumber` VARCHAR(30) NOT NULL,
    `dateOfContract` DATETIME(3) NULL,
    `licenseId` INTEGER NOT NULL,
    `licenseDetailId` INTEGER NOT NULL,
    `addedPercentage` INTEGER NOT NULL,
    `gross` DECIMAL(19, 2) NOT NULL,
    `net` DECIMAL(19, 2) NOT NULL,
    `vat` DECIMAL(19, 2) NOT NULL,
    `comment` VARCHAR(1600) NOT NULL,
    `ceoName` VARCHAR(50) NOT NULL,
    `ceoEmail` VARCHAR(50) NOT NULL,
    `ceoPhone` VARCHAR(40) NOT NULL,
    `ceoFax` VARCHAR(20) NOT NULL,
    `physicalAddress` VARCHAR(500) NOT NULL,
    `telephoneNumber` VARCHAR(40) NOT NULL,
    `faxNumber` VARCHAR(40) NOT NULL,
    `cellphoneNumber` VARCHAR(40) NOT NULL,
    `accountantName` VARCHAR(100) NOT NULL,
    `accountantEmail` VARCHAR(100) NOT NULL,
    `boxCityId` INTEGER NOT NULL,
    `boxNumber` VARCHAR(200) NOT NULL,
    `boxArea` VARCHAR(200) NOT NULL,
    `deliveryCityId` INTEGER NOT NULL,
    `deliveryAddress` VARCHAR(300) NOT NULL,
    `deliverySuburb` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `areas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `identifier` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `identifier` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `databasez` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountId` INTEGER NOT NULL,
    `databaseName` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eventz` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kind` VARCHAR(20) NOT NULL,
    `tableName` VARCHAR(30) NOT NULL,
    `recordId` INTEGER NOT NULL,
    `details` TEXT NOT NULL,
    `userId` INTEGER NOT NULL,
    `username` VARCHAR(200) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `groupz` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `identifier` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `licensedetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `identifier` VARCHAR(500) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `licenses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `identifier` VARCHAR(100) NOT NULL,
    `basicUsd` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `operatorz` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountId` INTEGER NOT NULL,
    `operatorName` VARCHAR(30) NOT NULL,
    `operatorEmail` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sectors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `identifier` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `statuses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `identifier` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(40) NOT NULL,
    `password` TEXT NOT NULL,
    `accessLevel` VARCHAR(40) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `groupz`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `areas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_sectorId_fkey` FOREIGN KEY (`sectorId`) REFERENCES `sectors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `statuses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_licenseId_fkey` FOREIGN KEY (`licenseId`) REFERENCES `licenses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_licenseDetailId_fkey` FOREIGN KEY (`licenseDetailId`) REFERENCES `licensedetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_boxCityId_fkey` FOREIGN KEY (`boxCityId`) REFERENCES `cities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_deliveryCityId_fkey` FOREIGN KEY (`deliveryCityId`) REFERENCES `cities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `databasez` ADD CONSTRAINT `databasez_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventz` ADD CONSTRAINT `eventz_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `operatorz` ADD CONSTRAINT `operatorz_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
