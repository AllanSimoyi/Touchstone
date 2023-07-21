/*
  Warnings:

  - You are about to alter the column `gross` on the `accounts` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(19,2)`.
  - You are about to alter the column `net` on the `accounts` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(19,2)`.

*/
-- AlterTable
ALTER TABLE `accounts` MODIFY `gross` DECIMAL(19, 2) NOT NULL,
    MODIFY `net` DECIMAL(19, 2) NOT NULL;
