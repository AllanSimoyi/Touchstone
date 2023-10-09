CREATE TABLE `operatorz` (
  `id` int NOT NULL AUTO_INCREMENT,
  `accountId` int NOT NULL,
  `operatorName` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `operatorEmail` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=879 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
