/*
  Warnings:

  - You are about to alter the column `basicUsd` on the `licenses` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(19,2)`.

*/
-- AlterTable
ALTER TABLE `licenses` MODIFY `basicUsd` DECIMAL(19, 2) NOT NULL;
