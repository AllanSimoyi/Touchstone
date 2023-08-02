/*
  Warnings:

  - A unique constraint covering the columns `[identifier]` on the table `areas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identifier]` on the table `cities` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[databaseName]` on the table `databasez` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identifier]` on the table `groupz` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identifier]` on the table `licensedetails` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identifier]` on the table `licenses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[operatorName]` on the table `operatorz` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identifier]` on the table `sectors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identifier]` on the table `statuses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `areas_identifier_key` ON `areas`(`identifier`);

-- CreateIndex
CREATE UNIQUE INDEX `cities_identifier_key` ON `cities`(`identifier`);

-- CreateIndex
CREATE UNIQUE INDEX `databasez_databaseName_key` ON `databasez`(`databaseName`);

-- CreateIndex
CREATE UNIQUE INDEX `groupz_identifier_key` ON `groupz`(`identifier`);

-- CreateIndex
CREATE UNIQUE INDEX `licensedetails_identifier_key` ON `licensedetails`(`identifier`);

-- CreateIndex
CREATE UNIQUE INDEX `licenses_identifier_key` ON `licenses`(`identifier`);

-- CreateIndex
CREATE UNIQUE INDEX `operatorz_operatorName_key` ON `operatorz`(`operatorName`);

-- CreateIndex
CREATE UNIQUE INDEX `sectors_identifier_key` ON `sectors`(`identifier`);

-- CreateIndex
CREATE UNIQUE INDEX `statuses_identifier_key` ON `statuses`(`identifier`);

-- CreateIndex
CREATE UNIQUE INDEX `users_username_key` ON `users`(`username`);
