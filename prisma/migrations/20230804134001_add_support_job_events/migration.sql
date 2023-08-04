-- CreateTable
CREATE TABLE `support_job_event` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `supportJobId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `details` TEXT NOT NULL,
    `kind` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
