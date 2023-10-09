CREATE TABLE `support_job` (
  `id` int NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `accountId` int NOT NULL,
  `clientStaffName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supportType` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enquiry` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `actionTaken` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `charge` decimal(19,2) NOT NULL,
  `date` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `userId` int NOT NULL,
  `supportPersonId` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
