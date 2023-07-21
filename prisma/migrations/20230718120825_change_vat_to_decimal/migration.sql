/*
  Warnings:

  - You are about to alter the column `vat` on the `accounts` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(19,2)`.

*/
-- AlterTable
ALTER TABLE `accounts` MODIFY `vat` DECIMAL(19, 2) NOT NULL;
