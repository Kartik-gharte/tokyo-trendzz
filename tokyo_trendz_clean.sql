/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address_line` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(100) DEFAULT 'India',
  `is_default` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `addresses` VALUES (1,1,'Kartik Test','9876543210','123 Test Street, College','Nashik','Maharashtra','422001','India',0);
INSERT INTO `addresses` VALUES (2,1,'Kartik Test','09876543210','123 Test Street, College','Nashik','Maharashtra','422001','India',0);
INSERT INTO `addresses` VALUES (3,1,'Kartik Test','09876543210','123 Test Street, College','Nashik','Maharashtra','422001','India',0);
INSERT INTO `addresses` VALUES (4,1,'Jeet Suryawanshi','09876543210','123 Test Street, College','Nashik','Maharashtra','422001','India',0);
INSERT INTO `addresses` VALUES (5,1,'Kartik Gharate','09876543210','Yashoda Nagar, College','Pimpalner','Maharashtra','424306','India',0);
INSERT INTO `addresses` VALUES (6,1,'Kartik Test','09876543210','123 Test Street','Nashik','Maharashtra','422001','India',0);
INSERT INTO `addresses` VALUES (7,1,'Kartik Test','09876543210','123 Test Street','Nashik','Maharashtra','422001','India',0);
INSERT INTO `addresses` VALUES (8,3,'Tokyo Trendz Admin','9876543210','123 Test Street','Nashik','Maharashtra','422001','India',0);
INSERT INTO `addresses` VALUES (9,1,'Kartik Test','9876543210','123 Test Street','Nashik','Maharashtra','422001','India',0);
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `cart` VALUES (1,2,'2026-09-28 17:41:33','2026-09-28 17:41:33');
INSERT INTO `cart` VALUES (2,1,'2026-10-02 06:24:08','2026-10-02 06:24:08');
INSERT INTO `cart` VALUES (3,3,'2026-10-05 11:00:42','2026-10-05 11:00:42');
INSERT INTO `cart` VALUES (4,4,'2026-10-09 15:09:31','2026-10-09 15:09:31');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `variant_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `cart_id` (`cart_id`,`variant_id`),
  KEY `product_id` (`product_id`),
  KEY `variant_id` (`variant_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `cart_items` VALUES (12,1,2,5,4);
INSERT INTO `cart_items` VALUES (33,1,16,61,2);
INSERT INTO `cart_items` VALUES (34,1,3,10,1);
INSERT INTO `cart_items` VALUES (35,1,3,9,1);
INSERT INTO `cart_items` VALUES (36,1,8,29,1);
INSERT INTO `cart_items` VALUES (37,1,1,1,1);
INSERT INTO `cart_items` VALUES (38,4,5,17,1);
INSERT INTO `cart_items` VALUES (43,3,1,1,1);
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `categories` VALUES (1,'T-Shirts','t-shirts','https://images.unsplash.com/photo-1521572163474-6864f9cf17ab','2026-09-28 13:42:33');
INSERT INTO `categories` VALUES (2,'Shirts','shirts','https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf','2026-09-28 13:42:33');
INSERT INTO `categories` VALUES (3,'Hoodies','hoodies','https://images.unsplash.com/photo-1556821840-3a63f95609a7','2026-09-28 13:42:33');
INSERT INTO `categories` VALUES (4,'Jeans','jeans','https://images.unsplash.com/photo-1542272604-787c3835535d','2026-09-28 13:42:33');
INSERT INTO `categories` VALUES (5,'Cargo Pants','cargo-pants','https://images.unsplash.com/photo-1517438476312-10d79c077509','2026-09-28 13:42:33');
INSERT INTO `categories` VALUES (6,'Jackets','jackets','https://images.unsplash.com/photo-1551028719-00167b16eac5','2026-09-28 13:42:33');
INSERT INTO `categories` VALUES (7,'Dresses','dresses','https://images.unsplash.com/photo-1595777457583-95e059d581b8','2026-09-28 13:42:33');
INSERT INTO `categories` VALUES (8,'Sneakers','sneakers','https://images.unsplash.com/photo-1542291026-7eec264c27ff','2026-09-28 13:42:33');
INSERT INTO `categories` VALUES (9,'whatches','whatches','https://images.unsplash.com/photo-1521572163474-6864f9cf17ab','2026-10-08 17:30:38');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `discount_type` enum('percentage','fixed') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `minimum_order_amount` decimal(10,2) DEFAULT '0.00',
  `maximum_discount` decimal(10,2) DEFAULT NULL,
  `expiry_date` datetime NOT NULL,
  `usage_limit` int DEFAULT '1',
  `used_count` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `coupons` VALUES (2,'TOKYO20','percentage',40.00,1000.00,10.00,'2026-10-24 16:31:00',2,2,1,'2026-10-05 11:01:45');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` varchar(500) NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `notifications` VALUES (1,3,'test','Test Notification','This is a test notification for Tokyo Trendz.',1,'2026-10-05 11:54:46');
INSERT INTO `notifications` VALUES (2,1,'order_placed','Order Placed','Your order TT-1791201717487-1 has been placed successfully.',1,'2026-10-05 12:01:57');
INSERT INTO `notifications` VALUES (3,1,'order_status','Order Shipped','Your order TT-1791201717487-1 has been shipped.',1,'2026-10-05 12:06:18');
INSERT INTO `notifications` VALUES (4,1,'order_status','Order Confirmed','Your order TT-1791199609262-1 has been confirmed.',1,'2026-10-05 12:07:17');
INSERT INTO `notifications` VALUES (5,1,'order_status','Order Packed','Your order TT-1791199609262-1 has been packed.',1,'2026-10-05 12:08:51');
INSERT INTO `notifications` VALUES (6,1,'order_status','Order Shipped','Your order TT-1791199609262-1 has been shipped.',1,'2026-10-05 12:08:55');
INSERT INTO `notifications` VALUES (7,1,'order_status','Out for Delivery','Your order TT-1791199609262-1 is out for delivery.',1,'2026-10-05 12:09:00');
INSERT INTO `notifications` VALUES (8,1,'order_status','Order Delivered','Your order TT-1791199609262-1 has been delivered.',1,'2026-10-05 12:09:04');
INSERT INTO `notifications` VALUES (9,1,'order_placed','Order Placed','Your order TT-1791306264780-1 has been placed successfully.',1,'2026-10-06 17:04:24');
INSERT INTO `notifications` VALUES (10,1,'order_placed','Order Placed','Your order TT-1791309839603-1 has been placed successfully.',1,'2026-10-06 18:03:59');
INSERT INTO `notifications` VALUES (11,1,'order_status','Order Packed','Your order TT-1791309839603-1 has been packed.',1,'2026-10-08 16:00:09');
INSERT INTO `notifications` VALUES (12,1,'order_status','Order Packed','Your order TT-1791306264780-1 has been packed.',1,'2026-10-08 16:48:17');
INSERT INTO `notifications` VALUES (13,1,'order_status','Order Delivered','Your order TT-1790970156779-1 has been delivered.',1,'2026-10-08 16:48:22');
INSERT INTO `notifications` VALUES (14,1,'order_status','Out for Delivery','Your order TT-1790969515815-1 is out for delivery.',1,'2026-10-08 16:48:28');
INSERT INTO `notifications` VALUES (15,1,'order_status','Order Shipped','Your order TT-1790963665379-1 has been shipped.',1,'2026-10-08 16:48:31');
INSERT INTO `notifications` VALUES (16,3,'order_placed','Order Placed','Your order TT-1791561438453-3 has been placed. ₹120.00 advance paid; ₹2878.00 is due on delivery.',1,'2026-10-09 15:57:18');
INSERT INTO `notifications` VALUES (17,3,'order_status','Order Cancelled','Your order TT-1791561438453-3 has been cancelled.',1,'2026-10-09 16:00:45');
INSERT INTO `notifications` VALUES (18,1,'order_placed','Order Placed','Your order TT-1791574658093-1 has been placed. ₹120.00 advance paid; ₹579.00 is due on delivery.',0,'2026-10-09 19:37:38');
INSERT INTO `notifications` VALUES (19,1,'order_status','Order Confirmed','Your order TT-1791574658093-1 has been confirmed.',0,'2026-10-09 19:39:31');
INSERT INTO `notifications` VALUES (20,1,'order_status','Order Delivered','Your order TT-1791574658093-1 has been delivered.',0,'2026-10-09 19:41:20');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `variant_id` int NOT NULL,
  `product_name` varchar(200) NOT NULL,
  `size` varchar(20) NOT NULL,
  `color` varchar(50) NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  KEY `variant_id` (`variant_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `order_items` VALUES (1,1,3,11,'Classic Oxford Shirt','L','Blue',1,1499.00);
INSERT INTO `order_items` VALUES (2,2,3,11,'Classic Oxford Shirt','L','Blue',2,1499.00);
INSERT INTO `order_items` VALUES (3,2,6,21,'Minimal Logo Hoodie','S','Grey',1,1799.00);
INSERT INTO `order_items` VALUES (4,3,7,25,'Classic Blue Straight Jeans','30','Blue',1,1899.00);
INSERT INTO `order_items` VALUES (5,4,8,29,'Washed Black Slim Jeans','30','Black',1,1399.00);
INSERT INTO `order_items` VALUES (6,5,2,5,'Urban Graphic T-Shirt','S','White',1,599.00);
INSERT INTO `order_items` VALUES (7,5,3,9,'Classic Oxford Shirt','S','Blue',1,999.00);
INSERT INTO `order_items` VALUES (8,5,8,29,'Washed Black Slim Jeans','30','Black',1,1399.00);
INSERT INTO `order_items` VALUES (9,6,2,5,'Urban Graphic T-Shirt','S','White',3,599.00);
INSERT INTO `order_items` VALUES (10,6,8,29,'Washed Black Slim Jeans','30','Black',3,1399.00);
INSERT INTO `order_items` VALUES (11,6,1,66,'Tokyo Essential Oversized Tee','XXL','Black',2,699.00);
INSERT INTO `order_items` VALUES (12,7,2,5,'Urban Graphic T-Shirt','S','White',3,599.00);
INSERT INTO `order_items` VALUES (13,7,8,29,'Washed Black Slim Jeans','30','Black',3,1399.00);
INSERT INTO `order_items` VALUES (14,7,1,66,'Tokyo Essential Oversized Tee','XXL','Black',2,699.00);
INSERT INTO `order_items` VALUES (15,8,16,61,'Urban Runner Sneakers','7','Black',2,1499.00);
INSERT INTO `order_items` VALUES (16,9,1,1,'Tokyo Essential Oversized Tee','S','Black',1,699.00);
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `address_id` int NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT '0.00',
  `shipping_fee` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cod','online') DEFAULT 'cod',
  `razorpay_order_id` varchar(100) DEFAULT NULL,
  `razorpay_payment_id` varchar(100) DEFAULT NULL,
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `order_status` enum('placed','confirmed','packed','shipped','out_for_delivery','delivered','cancelled') DEFAULT 'placed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `advance_paid` decimal(10,2) NOT NULL DEFAULT '0.00',
  `balance_due` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `user_id` (`user_id`),
  KEY `address_id` (`address_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `orders` VALUES (1,1,1,'TT-1790963665379-1',1499.00,0.00,0.00,1499.00,'cod',NULL,NULL,'pending','shipped','2026-10-02 17:54:25','2026-10-08 16:48:31',0.00,0.00);
INSERT INTO `orders` VALUES (2,1,2,'TT-1790969515815-1',4797.00,0.00,0.00,4797.00,'cod',NULL,NULL,'pending','out_for_delivery','2026-10-02 19:31:55','2026-10-08 16:48:28',0.00,0.00);
INSERT INTO `orders` VALUES (3,1,3,'TT-1790970156779-1',1899.00,0.00,0.00,1899.00,'cod',NULL,NULL,'pending','delivered','2026-10-02 19:42:36','2026-10-08 16:48:22',0.00,0.00);
INSERT INTO `orders` VALUES (4,1,4,'TT-1791199609262-1',1399.00,10.00,0.00,1389.00,'cod',NULL,NULL,'pending','delivered','2026-10-05 11:26:49','2026-10-05 12:09:04',0.00,0.00);
INSERT INTO `orders` VALUES (5,1,5,'TT-1791201717487-1',2997.00,10.00,0.00,2987.00,'cod',NULL,NULL,'pending','shipped','2026-10-05 12:01:57','2026-10-05 12:06:18',0.00,0.00);
INSERT INTO `orders` VALUES (6,1,6,'TT-1791306264780-1',7392.00,0.00,0.00,7392.00,'cod',NULL,NULL,'pending','packed','2026-10-06 17:04:24','2026-10-08 16:48:17',0.00,0.00);
INSERT INTO `orders` VALUES (7,1,7,'TT-1791309839603-1',7392.00,0.00,0.00,7392.00,'online','order_TkiCirlArMqCRz','pay_TkiNAM6Ztn6s9G','paid','packed','2026-10-06 18:03:59','2026-10-08 16:00:09',0.00,0.00);
INSERT INTO `orders` VALUES (8,3,8,'TT-1791561438453-3',2998.00,0.00,0.00,2998.00,'cod','order_TlrgixUJxHJ4fA','pay_TlroVTYASvMtHT','pending','cancelled','2026-10-09 15:57:18','2026-10-09 16:00:45',120.00,2878.00);
INSERT INTO `orders` VALUES (9,1,9,'TT-1791574658093-1',699.00,0.00,0.00,699.00,'cod','order_TlvZFLx4PR8B9w','pay_TlvZQDuBRNQjCS','pending','delivered','2026-10-09 19:37:38','2026-10-09 19:41:20',120.00,579.00);
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `display_order` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `product_images` VALUES (1,1,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',1,1);
INSERT INTO `product_images` VALUES (2,2,'https://images.unsplash.com/photo-1503341504253-dff4815485f1',1,1);
INSERT INTO `product_images` VALUES (3,3,'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf',1,1);
INSERT INTO `product_images` VALUES (4,4,'https://images.unsplash.com/photo-1596755094514-f87e34085b2c',1,1);
INSERT INTO `product_images` VALUES (5,5,'https://images.unsplash.com/photo-1556821840-3a63f95609a7',1,1);
INSERT INTO `product_images` VALUES (6,6,'https://images.unsplash.com/photo-1578681994506-b8f463449011',1,1);
INSERT INTO `product_images` VALUES (7,7,'https://images.unsplash.com/photo-1542272604-787c3835535d',1,1);
INSERT INTO `product_images` VALUES (8,8,'https://images.unsplash.com/photo-1541099649105-f69ad21f3246',1,1);
INSERT INTO `product_images` VALUES (9,9,'https://images.unsplash.com/photo-1517438476312-10d79c077509',1,1);
INSERT INTO `product_images` VALUES (10,10,'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80',1,1);
INSERT INTO `product_images` VALUES (11,11,'https://images.unsplash.com/photo-1551028719-00167b16eac5',1,1);
INSERT INTO `product_images` VALUES (12,12,'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef',1,1);
INSERT INTO `product_images` VALUES (13,13,'https://images.unsplash.com/photo-1595777457583-95e059d581b8',1,1);
INSERT INTO `product_images` VALUES (14,14,'https://images.unsplash.com/photo-1612336307429-8a898d10e223',1,1);
INSERT INTO `product_images` VALUES (15,15,'https://images.unsplash.com/photo-1542291026-7eec264c27ff',1,1);
INSERT INTO `product_images` VALUES (16,16,'https://images.unsplash.com/photo-1542291026-7eec264c27ff',1,1);
INSERT INTO `product_images` VALUES (22,19,'https://images.unsplash.com/photo-1789758612617-976d1051e027?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8',1,4);
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `size` varchar(20) NOT NULL,
  `color` varchar(50) NOT NULL,
  `sku` varchar(100) NOT NULL,
  `stock` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  UNIQUE KEY `product_id` (`product_id`,`size`,`color`),
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `product_variants` VALUES (1,1,'S','Black','TT-TEE-001-BLK-S',19,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (2,1,'M','Black','TT-TEE-001-BLK-M',25,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (3,1,'L','Black','TT-TEE-001-BLK-L',25,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (4,1,'XL','Black','TT-TEE-001-BLK-XL',15,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (5,2,'S','White','TT-TEE-002-WHT-S',14,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (6,2,'M','White','TT-TEE-002-WHT-M',25,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (7,2,'L','White','TT-TEE-002-WHT-L',25,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (8,2,'XL','White','TT-TEE-002-WHT-XL',15,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (9,3,'S','Blue','TT-SHT-003-BLU-S',15,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (10,3,'M','Blue','TT-SHT-003-BLU-M',20,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (11,3,'L','Blue','TT-SHT-003-BLU-L',20,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (12,3,'XL','Blue','TT-SHT-003-BLU-XL',10,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (13,4,'S','Green','TT-SHT-004-GRN-S',15,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (14,4,'M','Green','TT-SHT-004-GRN-M',20,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (15,4,'L','Green','TT-SHT-004-GRN-L',20,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (16,4,'XL','Green','TT-SHT-004-GRN-XL',10,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (17,5,'S','Black','TT-HOD-005-BLK-S',10,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (18,5,'M','Black','TT-HOD-005-BLK-M',15,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (19,5,'L','Black','TT-HOD-005-BLK-L',15,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (20,5,'XL','Black','TT-HOD-005-BLK-XL',10,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (21,6,'S','Grey','TT-HOD-006-GRY-S',10,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (22,6,'M','Grey','TT-HOD-006-GRY-M',15,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (23,6,'L','Grey','TT-HOD-006-GRY-L',15,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (24,6,'XL','Grey','TT-HOD-006-GRY-XL',10,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (25,7,'30','Blue','TT-JNS-007-BLU-30',12,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (26,7,'32','Blue','TT-JNS-007-BLU-32',15,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (27,7,'34','Blue','TT-JNS-007-BLU-34',15,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (28,7,'36','Blue','TT-JNS-007-BLU-36',8,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (29,8,'30','Black','TT-JNS-008-BLK-30',6,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (30,8,'32','Black','TT-JNS-008-BLK-32',15,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (31,8,'34','Black','TT-JNS-008-BLK-34',15,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (32,8,'36','Black','TT-JNS-008-BLK-36',8,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (33,9,'S','Olive','TT-CRG-009-OLV-S',12,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (34,9,'M','Olive','TT-CRG-009-OLV-M',15,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (35,9,'L','Olive','TT-CRG-009-OLV-L',15,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (36,9,'XL','Olive','TT-CRG-009-OLV-XL',8,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (37,10,'S','Beige','TT-CRG-010-BGE-S',12,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (38,10,'M','Beige','TT-CRG-010-BGE-M',15,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (39,10,'L','Beige','TT-CRG-010-BGE-L',15,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (40,10,'XL','Beige','TT-CRG-010-BGE-XL',8,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (41,11,'S','Black','TT-JKT-011-BLK-S',8,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (42,11,'M','Black','TT-JKT-011-BLK-M',12,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (43,11,'L','Black','TT-JKT-011-BLK-L',12,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (44,11,'XL','Black','TT-JKT-011-BLK-XL',8,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (45,12,'S','Blue','TT-JKT-012-BLU-S',8,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (46,12,'M','Blue','TT-JKT-012-BLU-M',12,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (47,12,'L','Blue','TT-JKT-012-BLU-L',12,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (48,12,'XL','Blue','TT-JKT-012-BLU-XL',8,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (49,13,'S','Black','TT-DRS-013-BLK-S',10,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (50,13,'M','Black','TT-DRS-013-BLK-M',12,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (51,13,'L','Black','TT-DRS-013-BLK-L',12,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (52,13,'XL','Black','TT-DRS-013-BLK-XL',6,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (53,14,'S','Pink','TT-DRS-014-PNK-S',10,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (54,14,'M','Pink','TT-DRS-014-PNK-M',12,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (55,14,'L','Pink','TT-DRS-014-PNK-L',12,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (56,14,'XL','Pink','TT-DRS-014-PNK-XL',6,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (57,15,'7','White','TT-SNK-015-WHT-7',10,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (58,15,'8','White','TT-SNK-015-WHT-8',12,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (59,15,'9','White','TT-SNK-015-WHT-9',12,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (60,15,'10','White','TT-SNK-015-WHT-10',8,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (61,16,'7','Black','TT-SNK-016-BLK-7',8,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (62,16,'8','Black','TT-SNK-016-BLK-8',12,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (63,16,'9','Black','TT-SNK-016-BLK-9',12,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (64,16,'10','Black','TT-SNK-016-BLK-10',8,'2026-09-28 13:44:14');
INSERT INTO `product_variants` VALUES (66,1,'XXL','Black','TT-TEST-XXL-BLK',6,'2026-10-05 03:30:05');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `description` text,
  `brand` varchar(100) DEFAULT 'Tokyo Trendz',
  `price` decimal(10,2) NOT NULL,
  `discount_price` decimal(10,2) DEFAULT NULL,
  `gender` enum('men','women','unisex','kids') DEFAULT 'unisex',
  `material` varchar(100) DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `products` VALUES (1,1,'Tokyo Essential Oversized Tee','tokyo-essential-oversized-tee','Premium oversized cotton t-shirt with a relaxed streetwear fit.','Tokyo Trendz',999.00,699.00,'unisex','100% Cotton',1,1,'2026-09-28 13:43:08','2026-09-28 13:43:08');
INSERT INTO `products` VALUES (2,1,'Urban Graphic T-Shirt','urban-graphic-tshirt','Bold graphic print t-shirt designed for everyday streetwear.','Tokyo Trendz',899.00,599.00,'unisex','Cotton',1,1,'2026-09-28 13:43:08','2026-09-28 13:43:08');
INSERT INTO `products` VALUES (3,2,'Classic Oxford Shirt','classic-oxford-shirt','Clean Oxford shirt with a modern regular fit.','Tokyo Trendz',1499.00,999.00,'men','Cotton Oxford',1,1,'2026-09-28 13:43:08','2026-09-28 13:43:08');
INSERT INTO `products` VALUES (4,2,'Relaxed Check Shirt','relaxed-check-shirt','Comfortable checked shirt with a relaxed casual silhouette.','Tokyo Trendz',1299.00,849.00,'unisex','Cotton',0,1,'2026-09-28 13:43:08','2026-09-28 13:43:08');
INSERT INTO `products` VALUES (5,3,'Tokyo Street Hoodie','tokyo-street-hoodie','Heavyweight hoodie inspired by modern Japanese streetwear.','Tokyo Trendz',1999.00,1399.00,'unisex','Fleece Cotton',1,1,'2026-09-28 13:43:08','2026-09-28 13:43:08');
INSERT INTO `products` VALUES (6,3,'Minimal Logo Hoodie','minimal-logo-hoodie','Minimal everyday hoodie featuring a clean Tokyo Trendz logo.','Tokyo Trendz',1799.00,1199.00,'unisex','Cotton Fleece',0,1,'2026-09-28 13:43:08','2026-09-28 13:43:08');
INSERT INTO `products` VALUES (7,4,'Classic Blue Straight Jeans','classic-blue-straight-jeans','Classic straight-fit denim for everyday styling.','Tokyo Trendz',1899.00,1299.00,'unisex','Denim',1,1,'2026-09-28 13:43:08','2026-09-28 13:43:08');
INSERT INTO `products` VALUES (8,4,'Washed Black Slim Jeans','washed-black-slim-jeans','Washed black jeans with a modern slim fit.','Tokyo Trendz',1999.00,1399.00,'men','Stretch Denim',0,1,'2026-09-28 13:43:08','2026-09-28 13:43:08');
INSERT INTO `products` VALUES (9,5,'Urban Utility Cargo','urban-utility-cargo','Multi-pocket cargo pants built for a modern utility look.','Tokyo Trendz',1699.00,1099.00,'unisex','Cotton Twill',1,1,'2026-09-28 13:43:08','2026-09-28 13:43:08');
INSERT INTO `products` VALUES (10,5,'Relaxed Cargo Pants','relaxed-cargo-pants','Relaxed-fit cargo pants with practical side pockets.','Tokyo Trendz',1599.00,999.00,'unisex','Cotton',0,1,'2026-09-28 13:43:08','2026-09-28 13:43:08');
INSERT INTO `products` VALUES (11,6,'Street Bomber Jacket','street-bomber-jacket','Contemporary bomber jacket for a bold streetwear look.','Tokyo Trendz',2499.00,1799.00,'unisex','Polyester',1,1,'2026-09-28 13:43:08','2026-09-28 13:43:08');
INSERT INTO `products` VALUES (12,6,'Classic Denim Jacket','classic-denim-jacket','Timeless denim jacket designed for versatile layering.','Tokyo Trendz',2299.00,1599.00,'unisex','Denim',0,1,'2026-09-28 13:43:08','2026-09-28 13:43:08');
INSERT INTO `products` VALUES (13,7,'Tokyo Flow Midi Dress','tokyo-flow-midi-dress','Elegant midi dress with a relaxed contemporary silhouette.','Tokyo Trendz',1999.00,1399.00,'women','Rayon',1,1,'2026-09-28 13:43:08','2026-09-28 13:43:08');
INSERT INTO `products` VALUES (14,7,'Everyday Summer Dress','everyday-summer-dress','Lightweight casual dress designed for comfortable summer days.','Tokyo Trendz',1599.00,999.00,'women','Cotton Rayon',0,1,'2026-09-28 13:43:08','2026-09-28 13:43:08');
INSERT INTO `products` VALUES (15,8,'Tokyo Street Sneakers','tokyo-street-sneakers','Clean everyday sneakers inspired by modern street fashion.','Tokyo Trendz',2499.00,1799.00,'unisex','Synthetic Leather',1,1,'2026-09-28 13:43:08','2026-09-28 13:43:08');
INSERT INTO `products` VALUES (16,8,'Urban Runner Sneakers','urban-runner-sneakers','Lightweight sneakers combining casual style and everyday comfort.','Tokyo Trendz',2299.00,1499.00,'unisex','Mesh',0,1,'2026-09-28 13:43:08','2026-09-28 13:43:08');
INSERT INTO `products` VALUES (19,2,'Rohan Shirt','rohan-shirt','Rohan Shirts new to our store ','Tokyo Trendz',1200.00,300.00,'unisex','Cotton',1,1,'2026-10-05 12:17:09','2026-10-08 16:08:10');
INSERT INTO `products` VALUES (20,6,'Kartik Gharate','kartik-gharate','new product \n','Tokyo Trendz',1800.00,900.00,'unisex','Premium Cotton Updated',1,1,'2026-10-08 16:39:31','2026-10-08 16:39:31');
INSERT INTO `products` VALUES (21,5,'bbb','bbb','vjhh bbh kn','n ,mn',200.00,180.00,'men','m ',0,1,'2026-10-08 17:04:13','2026-10-08 17:04:13');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `reviews` VALUES (2,3,20,5,'very best product','2026-10-08 18:18:51');
INSERT INTO `reviews` VALUES (8,3,21,5,'best product','2026-10-08 18:20:12');
INSERT INTO `reviews` VALUES (10,1,21,5,'hello guyies','2026-10-08 18:21:36');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('customer','admin') DEFAULT 'customer',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `users` VALUES (1,'Kartik Test','gharatekartik25@gmail.com','$2b$10$gmYRkOIPaZU097zxYJpgdudl4tQ2xLJix0DLo3aewmi49DZ10CISO',NULL,'customer','2026-09-28 15:09:13','2026-10-09 19:33:09');
INSERT INTO `users` VALUES (2,'Tokyo User','tokyouser2026@gmail.com','$2b$10$3HCOtCBmv07uuIfUzOp0t.1Kuq4P51Ald9UXAXgTHT4uEb4CtoxUq',NULL,'customer','2026-09-28 15:17:45','2026-10-05 10:23:28');
INSERT INTO `users` VALUES (3,'Tokyo Trendz Admin','admin@tokyotrendz.com','$2b$10$iUvSkLtzgJGUYZjv85kP8e4jBGe3tpshDiF0dmVqwfcMzN7bYZary',NULL,'admin','2026-10-02 19:51:07','2026-10-09 15:45:13');
INSERT INTO `users` VALUES (4,'Rohan Jivrag','rohan@mail.com','$2b$10$aIs/AiZL/KwbrYn3BqcT0eEhpDT3Gs80Dh1nZaOuEedGmWjyEgIpq',NULL,'customer','2026-10-09 15:05:39','2026-10-09 15:05:39');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `wishlist` VALUES (1,1,'2026-10-02 07:09:34');
INSERT INTO `wishlist` VALUES (2,3,'2026-10-04 13:59:57');
INSERT INTO `wishlist` VALUES (3,4,'2026-10-09 15:08:58');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `wishlist_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wishlist_id` (`wishlist_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `wishlist_items_ibfk_1` FOREIGN KEY (`wishlist_id`) REFERENCES `wishlist` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `wishlist_items` VALUES (3,1,2,'2026-10-02 17:23:50');
INSERT INTO `wishlist_items` VALUES (5,1,6,'2026-10-05 10:58:14');
INSERT INTO `wishlist_items` VALUES (6,1,19,'2026-10-07 03:40:15');
INSERT INTO `wishlist_items` VALUES (7,1,1,'2026-10-07 03:40:17');
INSERT INTO `wishlist_items` VALUES (8,1,3,'2026-10-07 03:40:19');
INSERT INTO `wishlist_items` VALUES (9,1,11,'2026-10-07 03:40:57');
INSERT INTO `wishlist_items` VALUES (10,1,10,'2026-10-07 03:40:58');
INSERT INTO `wishlist_items` VALUES (11,1,12,'2026-10-07 03:41:00');
INSERT INTO `wishlist_items` VALUES (12,1,13,'2026-10-07 03:41:01');
INSERT INTO `wishlist_items` VALUES (13,1,16,'2026-10-09 09:06:33');
INSERT INTO `wishlist_items` VALUES (14,3,5,'2026-10-09 15:08:58');
INSERT INTO `wishlist_items` VALUES (15,3,4,'2026-10-09 15:09:03');
