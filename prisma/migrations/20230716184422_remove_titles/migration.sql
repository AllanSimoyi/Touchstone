/*
  Warnings:

  - The `createdAt` column on the `accountants` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `dateOfContract` column on the `accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `gross` on the `accounts` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.
  - You are about to alter the column `net` on the `accounts` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.
  - The `createdAt` column on the `accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `areas` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `boxes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `ceos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `cities` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `contacts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `databasez` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `deliveryaddresses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `eventz` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `groupz` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `licensedetails` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `licenses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `operatorz` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `roles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `sectors` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `statuses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `accessLevel` on the `users` table. All the data in the column will be lost.
  - The `createdAt` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `titlez` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `updatedAt` on the `accountants` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `areas` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `boxes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `ceos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `cities` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `contacts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `databasez` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `deliveryaddresses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `eventz` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `groupz` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `licensedetails` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `licenses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `operatorz` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `roles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `sectors` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `statuses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `roleId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `updatedAt` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE `accountants` DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `accounts` MODIFY `vatNumber` VARCHAR(200) NOT NULL,
    DROP COLUMN `dateOfContract`,
    ADD COLUMN `dateOfContract` DATETIME(3) NULL,
    MODIFY `gross` DECIMAL(65, 30) NOT NULL,
    MODIFY `net` DECIMAL(65, 30) NOT NULL,
    DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `areas` DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `boxes` DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `ceos` DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `cities` DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `contacts` DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `databasez` DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `deliveryaddresses` DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `eventz` DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `groupz` DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `licensedetails` DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `licenses` DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `operatorz` DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `roles` DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `sectors` DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `statuses` DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `accessLevel`,
    ADD COLUMN `roleId` INTEGER NOT NULL,
    DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- DropTable
DROP TABLE `titlez`;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
