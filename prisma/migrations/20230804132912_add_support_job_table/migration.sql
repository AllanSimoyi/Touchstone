-- CreateTable
CREATE TABLE `support_job` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `accountId` INTEGER NOT NULL,
    `clientStaffName` VARCHAR(100) NOT NULL,
    `supportPerson` VARCHAR(100) NOT NULL,
    `supportType` VARCHAR(500) NOT NULL,
    `status` VARCHAR(100) NOT NULL,
    `enquiry` TEXT NOT NULL,
    `actionTaken` TEXT NOT NULL,
    `charge` DECIMAL(19, 2) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
