CREATE TABLE `licensedetails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `identifier` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `licensedetails_identifier_key` (`identifier`)
) ENGINE=InnoDB AUTO_INCREMENT=2884 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
