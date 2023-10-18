-- CreateTable
CREATE TABLE "support_job" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" INTEGER NOT NULL,
    "clientStaffName" VARCHAR(100) NOT NULL,
    "supportPersonId" INTEGER NOT NULL,
    "supportType" VARCHAR(500) NOT NULL,
    "status" VARCHAR(100) NOT NULL,
    "enquiry" TEXT NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "charge" DECIMAL(19,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "support_job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_job_event" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "supportJobId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "kind" VARCHAR(20) NOT NULL,

    CONSTRAINT "support_job_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountNumber" VARCHAR(20) NOT NULL,
    "companyName" VARCHAR(200) NOT NULL,
    "tradingAs" VARCHAR(200) NOT NULL,
    "formerly" VARCHAR(200) NOT NULL,
    "groupId" INTEGER,
    "areaId" INTEGER,
    "sectorId" INTEGER,
    "vatNumber" VARCHAR(200) NOT NULL,
    "otherNames" VARCHAR(200) NOT NULL,
    "description" VARCHAR(1600) NOT NULL,
    "actual" INTEGER NOT NULL,
    "reason" VARCHAR(500) NOT NULL,
    "statusId" INTEGER,
    "contractNumber" VARCHAR(30) NOT NULL,
    "dateOfContract" TIMESTAMP(3),
    "licenseId" INTEGER,
    "licenseDetailId" INTEGER,
    "addedPercentage" INTEGER NOT NULL,
    "gross" DECIMAL(19,2) NOT NULL,
    "net" DECIMAL(19,2) NOT NULL,
    "vat" DECIMAL(19,2) NOT NULL,
    "comment" VARCHAR(1600) NOT NULL,
    "ceoName" VARCHAR(50) NOT NULL,
    "ceoEmail" VARCHAR(50) NOT NULL,
    "ceoPhone" VARCHAR(40) NOT NULL,
    "ceoFax" VARCHAR(20) NOT NULL,
    "physicalAddress" VARCHAR(500) NOT NULL,
    "telephoneNumber" VARCHAR(40) NOT NULL,
    "faxNumber" VARCHAR(40) NOT NULL,
    "cellphoneNumber" VARCHAR(40) NOT NULL,
    "accountantName" VARCHAR(100) NOT NULL,
    "accountantEmail" VARCHAR(100) NOT NULL,
    "boxCityId" INTEGER,
    "boxNumber" VARCHAR(200) NOT NULL,
    "boxArea" VARCHAR(200) NOT NULL,
    "deliveryCityId" INTEGER,
    "deliveryAddress" VARCHAR(300) NOT NULL,
    "deliverySuburb" VARCHAR(100) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_event" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "kind" VARCHAR(20) NOT NULL,

    CONSTRAINT "account_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas" (
    "id" SERIAL NOT NULL,
    "identifier" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_event" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "areaId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "kind" VARCHAR(20) NOT NULL,

    CONSTRAINT "area_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "identifier" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_event" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cityId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "kind" VARCHAR(20) NOT NULL,

    CONSTRAINT "city_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "databasez" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "databaseName" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "databasez_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "database_event" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "databaseId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "kind" VARCHAR(20) NOT NULL,

    CONSTRAINT "database_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groupz" (
    "id" SERIAL NOT NULL,
    "identifier" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groupz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_event" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "kind" VARCHAR(20) NOT NULL,

    CONSTRAINT "group_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licensedetails" (
    "id" SERIAL NOT NULL,
    "identifier" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "licensedetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licensedetails_event" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "licenseDetailId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "kind" VARCHAR(20) NOT NULL,

    CONSTRAINT "licensedetails_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licenses" (
    "id" SERIAL NOT NULL,
    "identifier" VARCHAR(100) NOT NULL,
    "basicUsd" DECIMAL(19,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "license_event" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "licenseId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "kind" VARCHAR(20) NOT NULL,

    CONSTRAINT "license_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operatorz" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "operatorName" VARCHAR(30) NOT NULL,
    "operatorEmail" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operatorz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operator_event" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "operatorId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "kind" VARCHAR(20) NOT NULL,

    CONSTRAINT "operator_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sectors" (
    "id" SERIAL NOT NULL,
    "identifier" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sector_event" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sectorId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "kind" VARCHAR(20) NOT NULL,

    CONSTRAINT "sector_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statuses" (
    "id" SERIAL NOT NULL,
    "identifier" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_event" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "statusId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "kind" VARCHAR(20) NOT NULL,

    CONSTRAINT "status_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(40) NOT NULL,
    "password" TEXT NOT NULL,
    "accessLevel" VARCHAR(40) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_event" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "recordId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "kind" VARCHAR(20) NOT NULL,

    CONSTRAINT "user_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "areas_identifier_key" ON "areas"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "cities_identifier_key" ON "cities"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "groupz_identifier_key" ON "groupz"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "licensedetails_identifier_key" ON "licensedetails"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "licenses_identifier_key" ON "licenses"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "sectors_identifier_key" ON "sectors"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "statuses_identifier_key" ON "statuses"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
