-- XAMPP-Lite
-- version 8.4.1
-- https://xampplite.sf.net/
--
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 01, 2026 at 10:16 AM
-- Server version: 11.4.4-MariaDB-log
-- PHP Version: 8.4.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `techalves`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_activity_logs`
--

CREATE TABLE `admin_activity_logs` (
  `id` char(36) NOT NULL,
  `actor_admin_user_id` varchar(191) DEFAULT NULL,
  `actor_email` varchar(191) DEFAULT NULL,
  `action` varchar(120) NOT NULL,
  `target_admin_user_id` varchar(191) DEFAULT NULL,
  `target_name` varchar(191) DEFAULT NULL,
  `target_email` varchar(191) DEFAULT NULL,
  `details` longtext DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'admin',
  `permissions_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions_json`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `email`, `password`, `name`, `role`, `permissions_json`, `is_active`, `created_at`, `updated_at`, `data_entrant`, `entry_date`) VALUES
('51ed4e51-41a8-11f1-9350-3464a92b0560', 'you@example.com', '$2y$10$IvWXbe0typBHXtfWOaFrwevtNqmXK.7ggTJbQDponLguY7c.TJX9C', 'Super Admin', 'super_admin', NULL, 1, '2026-03-30 18:50:44.919', '2026-04-26 22:44:21.001', NULL, '2026-03-30 18:50:44.919'),
('597b8704-bc78-4cc6-b65b-fd8b37f84024', 'admin@techalves.com', '$2a$12$leTvl9EiWJ6X2qr.XpAYTeIJ3aCKYO4dfjliwEcXrkJyBUP6LlhRG', 'Site Admin', 'admin', NULL, 1, '2026-04-25 06:07:47.176', '2026-04-25 06:07:47.176', NULL, '2026-04-25 06:07:47.176');

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
--

CREATE TABLE `blog_posts` (
  `id` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `excerpt` text NOT NULL,
  `content_html` longtext NOT NULL,
  `image_url` varchar(191) DEFAULT NULL,
  `author` varchar(191) DEFAULT NULL,
  `category` varchar(191) DEFAULT NULL,
  `read_time` varchar(191) DEFAULT NULL,
  `published_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `is_published` tinyint(1) NOT NULL DEFAULT 1,
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blog_posts`
--

INSERT INTO `blog_posts` (`id`, `slug`, `title`, `excerpt`, `content_html`, `image_url`, `author`, `category`, `read_time`, `published_at`, `is_published`, `data_entrant`, `entry_date`) VALUES
('485cc324-feb0-4801-a0ed-55b7010fcc62', 'ex-uk-laptops-what-to-know', 'Ex-UK Laptops: What You Need to Know Before Buying', 'Ex-UK laptops offer great value, but there are things to watch out for.', '<p>Ex-UK laptops are imported used laptops from corporate environments in the UK.</p><h2>What Makes Them Different?</h2><p>Business-grade laptops used in corporate settings for 2-3 years.</p><h2>Pros</h2><p>Business-grade build quality at consumer prices.</p><h2>Cons</h2><p>May have minor cosmetic wear. Battery might need replacement.</p><h2>Our Quality Promise</h2><p>Every ex-UK laptop at TECHALVES goes through rigorous testing.</p>', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80', 'TECHALVES Team', 'Buying Guide', '4 min read', '2026-01-10 00:00:00.000', 1, NULL, '2026-04-25 17:59:42.055'),
('c190a14c-2774-4070-a8c9-7b8652d509c3', 'top-5-budget-smartphones-2026', 'Top 5 Budget Smartphones Worth Buying in 2026', 'You don\'t need to break the bank for a great phone. Here are our top picks for budget smartphones this year.', '<p>The budget smartphone market has never been better.</p><h2>1. Samsung Galaxy A54 5G</h2><p>Stunning AMOLED display with 5G connectivity.</p><h2>2. Xiaomi Redmi Note 13 Pro</h2><p>200MP camera, AMOLED display, fast charging.</p><h2>3. Tecno Camon 20 Premier</h2><p>Great for photography on a budget.</p><h2>4. Samsung Galaxy A15</h2><p>Reliable with good battery life.</p><h2>5. Nokia G42 5G</h2><p>Built to last with clean Android.</p>', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80', 'TECHALVES Team', 'Product Reviews', '4 min read', '2026-02-01 00:00:00.000', 1, NULL, '2026-04-25 17:59:42.055'),
('c1f25b14-bf71-4982-b7dc-005fc21c609d', 'setting-up-home-security-cameras', 'Complete Guide to Setting Up Home Security Cameras', 'Protect your home with a proper CCTV setup.', '<p>Home security cameras are more affordable than ever.</p><h2>Choosing the Right System</h2><p>A 4-channel system is sufficient for most homes.</p><h2>Camera Placement Tips</h2><p>Cover all entry points at 8-10 feet height.</p><h2>Storage Options</h2><p>1TB HDD stores about 2 weeks of recording.</p><h2>Remote Viewing</h2><p>View live feeds from your phone via WiFi.</p>', 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80', 'TECHALVES Team', 'Tech Tips', '6 min read', '2026-01-20 00:00:00.000', 1, NULL, '2026-04-25 17:59:42.055'),
('d5118162-c5de-49de-b140-ff4ed0a006bd', 'how-to-choose-refurbished-laptop', 'How to Choose the Right Refurbished Laptop in 2026', 'Buying refurbished doesn\'t mean settling for less. Here\'s how to pick a reliable refurbished laptop that meets your needs and budget.', '<p>Refurbished laptops have become increasingly popular — and for good reason.</p><h2>1. Understand Grading Systems</h2><p>Most refurbished laptops are graded A, B, or C. Grade A means near-perfect condition.</p><h2>2. Check the Specs That Matter</h2><p>Focus on processor generation, RAM amount, and storage type.</p><h2>3. Always Ask About Warranty</h2><p>At TECHALVES, we offer 3-6 months warranty on all refurbished laptops.</p><h2>4. Battery Health</h2><p>Ask about battery cycle count and expected runtime.</p><h2>5. Buy from Trusted Sources</h2><p>Buy from established retailers like TECHALVES Solutions.</p>', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80', 'TECHALVES Team', 'Buying Guide', '5 min read', '2026-02-15 00:00:00.000', 1, NULL, '2026-04-25 17:59:42.055');

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` char(36) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `website_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `slug`, `name`, `description`, `logo_url`, `website_url`, `is_active`, `created_at`, `data_entrant`, `entry_date`) VALUES
('471e3917-31f0-11f1-a5c8-3464a92b0560', 'hp', 'HP', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e39f2-31f0-11f1-a5c8-3464a92b0560', 'dell', 'Dell', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3a1d-31f0-11f1-a5c8-3464a92b0560', 'lenovo', 'Lenovo', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3a3f-31f0-11f1-a5c8-3464a92b0560', 'apple', 'Apple', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3a60-31f0-11f1-a5c8-3464a92b0560', 'asus', 'Asus', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3a80-31f0-11f1-a5c8-3464a92b0560', 'acer', 'Acer', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3aa2-31f0-11f1-a5c8-3464a92b0560', 'msi', 'MSI', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3acb-31f0-11f1-a5c8-3464a92b0560', 'microsoft', 'Microsoft', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3aed-31f0-11f1-a5c8-3464a92b0560', 'samsung', 'Samsung', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3b0d-31f0-11f1-a5c8-3464a92b0560', 'tecno', 'Tecno', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3b32-31f0-11f1-a5c8-3464a92b0560', 'infinix', 'Infinix', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3b59-31f0-11f1-a5c8-3464a92b0560', 'xiaomi', 'Xiaomi', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3b79-31f0-11f1-a5c8-3464a92b0560', 'oppo', 'Oppo', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3b97-31f0-11f1-a5c8-3464a92b0560', 'vivo', 'Vivo', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3bba-31f0-11f1-a5c8-3464a92b0560', 'oneplus', 'OnePlus', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3bda-31f0-11f1-a5c8-3464a92b0560', 'nokia', 'Nokia', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3bfd-31f0-11f1-a5c8-3464a92b0560', 'huawei', 'Huawei', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3c1e-31f0-11f1-a5c8-3464a92b0560', 'canon', 'Canon', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3c3f-31f0-11f1-a5c8-3464a92b0560', 'nikon', 'Nikon', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3c5f-31f0-11f1-a5c8-3464a92b0560', 'sony', 'Sony', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3c81-31f0-11f1-a5c8-3464a92b0560', 'fujifilm', 'Fujifilm', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3ca5-31f0-11f1-a5c8-3464a92b0560', 'panasonic', 'Panasonic', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3ce6-31f0-11f1-a5c8-3464a92b0560', 'hikvision', 'Hikvision', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3d08-31f0-11f1-a5c8-3464a92b0560', 'dahua', 'Dahua', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3d2a-31f0-11f1-a5c8-3464a92b0560', 'epson', 'Epson', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3d4c-31f0-11f1-a5c8-3464a92b0560', 'brother', 'Brother', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3d6d-31f0-11f1-a5c8-3464a92b0560', 'kyocera', 'Kyocera', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3d8d-31f0-11f1-a5c8-3464a92b0560', 'ricoh', 'Ricoh', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3dad-31f0-11f1-a5c8-3464a92b0560', 'sharp', 'Sharp', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3dcd-31f0-11f1-a5c8-3464a92b0560', 'toshiba', 'Toshiba', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3def-31f0-11f1-a5c8-3464a92b0560', 'apc', 'APC', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3e14-31f0-11f1-a5c8-3464a92b0560', 'logitech', 'Logitech', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257'),
('471e3e35-31f0-11f1-a5c8-3464a92b0560', 'zebra', 'Zebra', NULL, NULL, NULL, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.257');

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` varchar(191) NOT NULL,
  `customer_id` varchar(191) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `customer_id`, `created_at`, `updated_at`, `data_entrant`, `entry_date`) VALUES
('7a3ee4f4-b693-45dc-a31a-b026ce0ce4a4', '465250bf-033a-47fc-a9c8-90a73eee43a0', '2026-04-27 18:23:13.445', '2026-04-27 18:23:59.583', NULL, '2026-04-27 21:23:14.598');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` varchar(191) NOT NULL,
  `cart_id` varchar(191) NOT NULL,
  `product_id` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(191) DEFAULT NULL,
  `icon` varchar(191) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `slug`, `name`, `description`, `image_url`, `icon`, `sort_order`, `is_active`, `created_at`, `data_entrant`, `entry_date`) VALUES
('049ce9be-16b9-4127-b1f5-563e8c678bbe', 'laptops', 'Laptops', 'New, refurbished & ex-UK laptops from top brands', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80', 'Laptop', 1, 1, '2026-03-19 14:33:12.336', NULL, '2026-04-25 17:59:42.049'),
('1d1566d3-e978-46f7-b888-538637b27c77', 'cameras', 'Cameras', 'Photography & security cameras', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80', 'Camera', 5, 1, '2026-03-19 14:33:12.356', NULL, '2026-04-25 17:59:42.050'),
('3c022372-61a7-46f0-a5fe-a1d61acc4d73', 'desktops', 'Computers & Desktops', 'Powerful desktops for work and gaming', 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=600&q=80', 'Monitor', 2, 1, '2026-03-19 14:33:12.343', NULL, '2026-04-25 17:59:42.049'),
('73475cf5-8222-4206-a562-ccfc7ff8bae8', 'office', 'Office Equipment', 'UPS, TVs, printers & office accessories', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80', 'Printer', 4, 1, '2026-03-19 14:33:12.352', NULL, '2026-04-25 17:59:42.050'),
('9099fa2b-4ca9-4d7c-bc5c-5f902e7cca25', 'phones', 'Phones & Tablets', 'Latest smartphones and tablets at great prices', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80', 'Smartphone', 3, 1, '2026-03-19 14:33:12.348', NULL, '2026-04-25 17:59:42.049');

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` varchar(191) NOT NULL,
  `full_name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `subject` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'new',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_users`
--

CREATE TABLE `customer_users` (
  `id` varchar(191) NOT NULL,
  `full_name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `password_hash` varchar(191) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer_users`
--

INSERT INTO `customer_users` (`id`, `full_name`, `email`, `phone`, `password_hash`, `is_active`, `created_at`, `updated_at`, `data_entrant`, `entry_date`) VALUES
('465250bf-033a-47fc-a9c8-90a73eee43a0', 'Samuel Muthui', 'you@example.com', '+254704617912', '$2a$12$zthHM.sexE6poBDNyltiMegm5fY36YT3GI.ZX23.utLqI/f9CTiSK', 1, '2026-04-10 06:20:09.777', '2026-04-10 06:20:09.777', NULL, '2026-04-25 17:59:42.049'),
('87a28782-8c24-4519-8206-5d05e1bb6bb8', 'Samuel Muthui', 'admin@lawfirm.test', '+254704617912', '$2a$12$/nsmi3CSmDRTFgZJWb.XMuxcUN2H9txQ9VeDoJvpeflomPmEAAECy', 1, '2026-03-31 12:46:41.675', '2026-03-31 12:46:41.675', NULL, '2026-04-25 17:59:42.049'),
('pos-walkin-customer', 'Walk-in Customer', 'pos-walkin@techalves.local', 'POS', '', 1, '2026-04-27 18:30:07.678', '2026-04-28 06:08:09.157', NULL, '2026-04-27 21:30:07.848');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` varchar(191) NOT NULL,
  `details` text NOT NULL,
  `category` varchar(80) NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `expense_date` date NOT NULL,
  `order_id` varchar(191) DEFAULT NULL,
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `category_id` varchar(191) NOT NULL DEFAULT 'expense-cat-other',
  `product_id` varchar(191) DEFAULT NULL,
  `source_id` varchar(191) DEFAULT NULL,
  `order_item_id` varchar(191) DEFAULT NULL,
  `payment_status` enum('pending','paid','partial','cancelled') NOT NULL DEFAULT 'paid',
  `payment_method` enum('cash','mpesa','card','bank_transfer','other') DEFAULT NULL,
  `reference` varchar(120) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_by_admin_user_id` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `details`, `category`, `amount`, `expense_date`, `order_id`, `data_entrant`, `entry_date`, `created_at`, `updated_at`, `category_id`, `product_id`, `source_id`, `order_item_id`, `payment_status`, `payment_method`, `reference`, `description`, `created_by_admin_user_id`) VALUES
('2ade7c89-eba0-4f6f-a43a-30d5972b969d', 'Sale/order expense for Dell Latitude 5520 (Ex-UK) on #DE6706AD — Njoki — KSh 46,979', 'sale', 200.00, '2026-04-30', 'de6706ad-f206-4458-aa80-0d1daa186052', '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-30 19:05:37.946', '2026-04-30 19:05:37.946', '2026-04-30 19:05:37.946', 'expense-cat-sale', 'db203226-8543-4ad2-806b-bca68db967c4', NULL, 'ac6f03d4-ec60-4f80-a986-a3f763849b87', 'paid', 'cash', NULL, 'Sale/order expense for Dell Latitude 5520 (Ex-UK) on #DE6706AD — Njoki — KSh 46,979', '51ed4e51-41a8-11f1-9350-3464a92b0560');

-- --------------------------------------------------------

--
-- Table structure for table `expense_categories`
--

CREATE TABLE `expense_categories` (
  `id` varchar(191) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `name` varchar(191) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expense_categories`
--

INSERT INTO `expense_categories` (`id`, `slug`, `name`, `is_active`, `created_at`, `updated_at`, `data_entrant`, `entry_date`) VALUES
('expense-cat-other', 'other', 'Other', 1, '2026-04-25 19:23:22.165', '2026-04-26 18:35:07.027', NULL, '2026-04-26 06:51:15.385'),
('expense-cat-sale', 'sale', 'Sale', 1, '2026-04-26 18:35:07.027', '2026-04-26 18:35:07.027', NULL, '2026-04-26 18:35:07.027');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_movements`
--

CREATE TABLE `inventory_movements` (
  `id` varchar(191) NOT NULL,
  `product_id` varchar(191) NOT NULL,
  `order_id` varchar(191) DEFAULT NULL,
  `admin_user_id` varchar(191) DEFAULT NULL,
  `type` enum('initial_stock','manual_adjustment','order_deducted','order_restored','pos_sale','customer_checkout','supplier_payment') NOT NULL,
  `quantity_change` int(11) NOT NULL,
  `quantity_before` int(11) NOT NULL,
  `quantity_after` int(11) NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory_movements`
--

INSERT INTO `inventory_movements` (`id`, `product_id`, `order_id`, `admin_user_id`, `type`, `quantity_change`, `quantity_before`, `quantity_after`, `note`, `created_at`, `data_entrant`, `entry_date`) VALUES
('24d059fe-b24f-46f3-b918-ebef08b6e2d1', 'c33b8fd1-72c2-4ada-adea-7ac1eec08a3d', NULL, '51ed4e51-41a8-11f1-9350-3464a92b0560', 'initial_stock', 3, 0, 3, 'Initial stock on product creation', '2026-04-29 12:47:46.694', '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-29 12:47:46.694'),
('761b35a8-52fb-47b4-8cfb-00d8a3a65f8a', '736c7413-a11b-4689-97eb-df7a68f13acb', 'e77b447b-b659-45dc-abc2-e08944e12000', '51ed4e51-41a8-11f1-9350-3464a92b0560', 'pos_sale', -1, 1, 0, 'POS sale (cash)', '2026-04-27 19:09:04.318', '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-27 19:09:04.318'),
('9dc31a01-6648-4c0a-8cd6-b9177b63848a', 'f491f4ce-8db2-4bd7-93b5-0882deeb9b08', NULL, '51ed4e51-41a8-11f1-9350-3464a92b0560', 'initial_stock', 20, 0, 20, 'Initial stock on product creation', '2026-04-29 12:36:59.994', '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-29 12:36:59.994'),
('b2d24c94-b620-45fd-939b-1a699c34ab92', 'b3a029db-79b4-4da6-adac-100a6a043929', NULL, '51ed4e51-41a8-11f1-9350-3464a92b0560', 'initial_stock', 2, 0, 2, 'Initial stock on product creation', '2026-04-27 12:16:15.617', '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-27 12:16:15.617'),
('b5c0cfd7-484e-4f69-9158-908f292ecbfe', 'db203226-8543-4ad2-806b-bca68db967c4', 'de6706ad-f206-4458-aa80-0d1daa186052', '51ed4e51-41a8-11f1-9350-3464a92b0560', 'pos_sale', -1, 12, 11, 'POS sale (cash)', '2026-04-28 06:08:09.157', '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-28 06:08:09.157'),
('fbd0f0ba-9536-4dc3-8c40-e6df5990bb79', '37f4a96b-0631-460b-a7a9-2a463e023895', 'de6706ad-f206-4458-aa80-0d1daa186052', '51ed4e51-41a8-11f1-9350-3464a92b0560', 'pos_sale', -1, 1, 0, 'POS sale (cash)', '2026-04-28 06:08:09.157', '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-28 06:08:09.157');

-- --------------------------------------------------------

--
-- Table structure for table `newsletter_subscribers`
--

CREATE TABLE `newsletter_subscribers` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `source` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `newsletter_subscribers`
--

INSERT INTO `newsletter_subscribers` (`id`, `email`, `source`, `created_at`, `data_entrant`, `entry_date`) VALUES
('2628f420-4d86-4cb9-869d-aafb6b180601', 'danielmutua104@gmail.com', 'homepage', '2026-03-19 14:42:42.847', NULL, '2026-04-25 17:59:42.076');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` varchar(191) NOT NULL,
  `customer_id` varchar(191) NOT NULL,
  `status` enum('pending','completed','confirmed','processing','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `payment_method` enum('cash_on_delivery','mpesa','bank_transfer','cash','card','other') NOT NULL,
  `transaction_reference` varchar(120) DEFAULT NULL,
  `subtotal_amount` int(11) NOT NULL DEFAULT 0,
  `vat_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `vat_amount` int(11) NOT NULL DEFAULT 0,
  `is_pos_sale` tinyint(1) NOT NULL DEFAULT 0,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `other_charges` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` int(11) NOT NULL,
  `delivery_name` varchar(191) NOT NULL,
  `delivery_phone` varchar(191) NOT NULL,
  `delivery_email` varchar(191) NOT NULL,
  `delivery_address` text NOT NULL,
  `notes` text DEFAULT NULL,
  `created_by_admin_user_id` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `customer_id`, `status`, `payment_status`, `payment_method`, `transaction_reference`, `subtotal_amount`, `vat_rate`, `vat_amount`, `is_pos_sale`, `discount_amount`, `other_charges`, `total_amount`, `delivery_name`, `delivery_phone`, `delivery_email`, `delivery_address`, `notes`, `created_by_admin_user_id`, `created_at`, `updated_at`, `data_entrant`, `entry_date`) VALUES
('de6706ad-f206-4458-aa80-0d1daa186052', 'pos-walkin-customer', 'completed', 'paid', 'cash', NULL, 40499, 16.00, 6480, 1, 0.00, 0.00, 46979, 'Njoki', '09888888888', '', 'In-store POS sale', 'POS sale recorded by you@example.com | VAT 16% applied', '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-28 06:08:09.157', '2026-04-28 06:08:09.157', '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-28 06:08:09.157'),
('e77b447b-b659-45dc-abc2-e08944e12000', 'pos-walkin-customer', 'completed', 'paid', 'cash', NULL, 26200, 0.00, 0, 1, 0.00, 100.00, 26200, 'POS Walk-in Customer', 'POS', '', 'In-store POS sale', 'POS sale recorded by you@example.com', '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-27 19:09:04.318', '2026-04-27 19:09:04.318', '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-27 19:09:04.318'),
('fc755df2-753c-41dc-9a7a-be6709625fbd', '465250bf-033a-47fc-a9c8-90a73eee43a0', 'pending', 'pending', 'cash_on_delivery', NULL, 89999, 0.00, 0, 0, 0.00, 0.00, 89999, 'Samuel Muthui', '+254704617912', 'you@example.com', 'Nairobi, Kenya', 'Placed by you@example.com', NULL, '2026-04-27 18:23:56.678', '2026-04-27 18:23:56.678', NULL, '2026-04-27 18:23:56.678');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` varchar(191) NOT NULL,
  `order_id` varchar(191) NOT NULL,
  `product_id` varchar(191) NOT NULL,
  `product_name` varchar(191) DEFAULT NULL,
  `product_brand` varchar(191) DEFAULT NULL,
  `product_barcode` varchar(120) DEFAULT NULL,
  `source_id` varchar(191) DEFAULT NULL,
  `source_name` varchar(191) DEFAULT NULL,
  `unit_source_price` int(11) NOT NULL DEFAULT 0,
  `total_source_price` int(11) NOT NULL DEFAULT 0,
  `unit_selling_price` int(11) NOT NULL DEFAULT 0,
  `total_selling_price` int(11) NOT NULL DEFAULT 0,
  `vat_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `vat_amount` int(11) NOT NULL DEFAULT 0,
  `serial_numbers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`serial_numbers`)),
  `quantity` int(11) NOT NULL,
  `unit_price` int(11) NOT NULL,
  `total_price` int(11) NOT NULL,
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `product_brand`, `product_barcode`, `source_id`, `source_name`, `unit_source_price`, `total_source_price`, `unit_selling_price`, `total_selling_price`, `vat_rate`, `vat_amount`, `serial_numbers`, `quantity`, `unit_price`, `total_price`, `data_entrant`, `entry_date`) VALUES
('a5f8127a-2218-408a-a659-9a7e6c31d06c', 'e77b447b-b659-45dc-abc2-e08944e12000', '736c7413-a11b-4689-97eb-df7a68f13acb', 'dell laptop', 'Dell', NULL, 'e6022611-c3e0-46e9-9aad-fc4b0a64e7f3', 'Samuel Muthui', 25000, 25000, 26100, 26100, 0.00, 0, '[]', 1, 26100, 26100, '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-27 19:09:04.318'),
('ac6f03d4-ec60-4f80-a986-a3f763849b87', 'de6706ad-f206-4458-aa80-0d1daa186052', 'db203226-8543-4ad2-806b-bca68db967c4', 'Dell Latitude 5520 (Ex-UK)', 'Dell', NULL, NULL, NULL, 0, 0, 38999, 38999, 16.00, 6240, '[]', 1, 38999, 45239, '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-28 06:08:09.157'),
('afbdfccf-a1d1-45e5-b574-060aa796e847', 'de6706ad-f206-4458-aa80-0d1daa186052', '37f4a96b-0631-460b-a7a9-2a463e023895', 'Ex Uk dell big pin charger', 'Dell', NULL, '5674d4bd-b440-4070-90fb-e5a9ca20525c', 'Matthew Muthoka Nthilika', 1000, 1000, 1500, 1500, 16.00, 240, '[]', 1, 1500, 1740, '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-28 06:08:09.157'),
('b9b92702-9de7-4024-b8b8-29570ed6c38f', 'fc755df2-753c-41dc-9a7a-be6709625fbd', '2bf6e812-769e-4c48-9c07-d2cdfd70a16d', 'Canon EOS R50 Mirrorless', 'Canon', NULL, NULL, NULL, 0, 0, 89999, 89999, 0.00, 0, '[]', 1, 89999, 89999, NULL, '2026-04-27 18:23:56.678');

-- --------------------------------------------------------

--
-- Table structure for table `order_payment_events`
--

CREATE TABLE `order_payment_events` (
  `id` varchar(191) NOT NULL,
  `order_id` varchar(191) NOT NULL,
  `event_type` enum('payment','partial_payment','refund','payment_status_change','adjustment') NOT NULL DEFAULT 'payment',
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_method` enum('cash_on_delivery','mpesa','bank_transfer','cash','card','other') DEFAULT NULL,
  `reference` varchar(120) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_by_admin_user_id` varchar(191) DEFAULT NULL,
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_payment_events`
--

INSERT INTO `order_payment_events` (`id`, `order_id`, `event_type`, `amount`, `payment_method`, `reference`, `note`, `created_by_admin_user_id`, `data_entrant`, `entry_date`, `created_at`) VALUES
('e2d8f673-cfe9-46fc-90b1-fda2a017e175', '895deb1c-46ef-4309-9304-c3fc89a535d9', 'payment', 4500.00, 'cash', NULL, 'Initial POS payment recorded at checkout', '51ed4e51-41a8-11f1-9350-3464a92b0560', '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-27 20:08:21.774', '2026-04-27 20:08:21.774'),
('f297103a-60db-4964-825f-7d89f6101bdd', 'de0f0b30-35cf-4aa3-ac23-8637e77a79be', 'payment', 1200.00, 'cash', NULL, 'Initial POS payment recorded at checkout', '51ed4e51-41a8-11f1-9350-3464a92b0560', '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-27 20:07:12.726', '2026-04-27 20:07:12.726'),
('payevt-8c456416c72cb759e630bd512adfc8962866a436', 'e77b447b-b659-45dc-abc2-e08944e12000', 'payment', 26200.00, 'cash', NULL, 'Backfilled initial POS payment', '51ed4e51-41a8-11f1-9350-3464a92b0560', '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-27 19:09:04.318', '2026-04-27 19:09:04.318');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` varchar(191) NOT NULL,
  `customer_id` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `used_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `category_id` varchar(191) NOT NULL,
  `subcategory` varchar(191) DEFAULT NULL,
  `brand` varchar(191) NOT NULL,
  `source_id` varchar(191) DEFAULT NULL,
  `barcode` varchar(120) DEFAULT NULL,
  `price` int(11) NOT NULL,
  `original_price` int(11) DEFAULT NULL,
  `condition` enum('new','refurbished','ex-uk') NOT NULL,
  `description` text NOT NULL,
  `specs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`specs`)),
  `warranty_text` varchar(191) DEFAULT NULL,
  `in_stock` tinyint(1) NOT NULL DEFAULT 1,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `premium` tinyint(1) NOT NULL DEFAULT 0,
  `rating` decimal(2,1) NOT NULL DEFAULT 0.0,
  `review_count` int(11) NOT NULL DEFAULT 0,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `total_stock_received` int(11) NOT NULL DEFAULT 0,
  `serial_numbers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`serial_numbers`)),
  `created_by_admin_user_id` varchar(191) DEFAULT NULL,
  `updated_by_admin_user_id` varchar(191) DEFAULT NULL,
  `sourced_from` varchar(191) DEFAULT NULL,
  `sourced_by` varchar(191) DEFAULT NULL,
  `source_date` date DEFAULT NULL,
  `source_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `source_payment_status` enum('pending','paid','partial','waived') NOT NULL DEFAULT 'pending',
  `sales_channel` enum('catalog','pos_only') NOT NULL DEFAULT 'catalog',
  `is_catalog_visible` tinyint(1) NOT NULL DEFAULT 1,
  `sourcing_payment_status` enum('paid','pay_later') NOT NULL DEFAULT 'pay_later',
  `sourcing_paid_at` datetime(3) DEFAULT NULL,
  `sourcing_paid_by` varchar(191) DEFAULT NULL,
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `slug`, `name`, `category_id`, `subcategory`, `brand`, `source_id`, `barcode`, `price`, `original_price`, `condition`, `description`, `specs`, `warranty_text`, `in_stock`, `featured`, `premium`, `rating`, `review_count`, `images`, `created_at`, `stock_quantity`, `total_stock_received`, `serial_numbers`, `created_by_admin_user_id`, `updated_by_admin_user_id`, `sourced_from`, `sourced_by`, `source_date`, `source_price`, `source_payment_status`, `sales_channel`, `is_catalog_visible`, `sourcing_payment_status`, `sourcing_paid_at`, `sourcing_paid_by`, `data_entrant`, `entry_date`) VALUES
('261f58ce-8d6b-43f5-a06f-913737080b32', 'samsung-55-crystal-uhd-tv', 'Samsung 55\" Crystal UHD TV', '73475cf5-8222-4206-a562-ccfc7ff8bae8', NULL, 'Samsung', NULL, '123ssfd43xc', 54999, NULL, 'new', 'Crystal clear 4K display for conference rooms or entertainment.', '{\"Display\":\"55\\\" 4K UHD\",\"HDR\":\"HDR10+\",\"Smart TV\":\"Tizen OS\",\"Connectivity\":\"3x HDMI, WiFi, Bluetooth\"}', '1 Year Samsung Warranty', 1, 1, 1, 4.7, 56, '[\"/uploads/1777309982573-93667a54-photo-1593359677879-a4bb92f829d1.jpg\"]', '2026-03-19 14:33:12.473', 10, 10, '[]', NULL, '51ed4e51-41a8-11f1-9350-3464a92b0560', NULL, NULL, NULL, 0.00, 'pending', 'catalog', 1, 'pay_later', NULL, NULL, NULL, '2026-04-25 14:45:41.382'),
('2bf6e812-769e-4c48-9c07-d2cdfd70a16d', 'canon-eos-r50-mirrorless', 'Canon EOS R50 Mirrorless', '1d1566d3-e978-46f7-b888-538637b27c77', '4738e33f-31f0-11f1-a5c8-3464a92b0560', '471e3c1e-31f0-11f1-a5c8-3464a92b0560', NULL, NULL, 89999, NULL, 'new', 'Compact mirrorless camera with 24.2MP sensor — ideal for content creators.', '{}', '1 Year Canon Warranty', 1, 1, 0, 4.6, 38, '[\"/uploads/1777309911621-140d2774-photo-1516035069371-29a1b244cc32.jpg\"]', '2026-03-19 14:33:12.480', 8, 8, '[]', NULL, '51ed4e51-41a8-11f1-9350-3464a92b0560', NULL, NULL, NULL, 0.00, 'pending', 'catalog', 1, 'pay_later', NULL, NULL, NULL, '2026-04-25 14:45:41.382'),
('37f4a96b-0631-460b-a7a9-2a463e023895', 'ex-uk-dell-big-pin-charger-37f4a96b', 'Ex Uk dell big pin charger', '3c022372-61a7-46f0-a5fe-a1d61acc4d73', '4738e410-31f0-11f1-a5c8-3464a92b0560', '471e39f2-31f0-11f1-a5c8-3464a92b0560', '5674d4bd-b440-4070-90fb-e5a9ca20525c', NULL, 1500, NULL, 'ex-uk', '1 charger piece', '{}', NULL, 0, 0, 0, 0.0, 0, '[]', '2026-04-28 06:08:09.157', 0, 1, '[]', '51ed4e51-41a8-11f1-9350-3464a92b0560', '51ed4e51-41a8-11f1-9350-3464a92b0560', NULL, 'you@example.com', '2026-04-28', 1000.00, 'pending', 'pos_only', 0, 'pay_later', NULL, NULL, '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-28 06:08:09.157'),
('736c7413-a11b-4689-97eb-df7a68f13acb', 'dell-laptop-736c7413', 'dell laptop', '049ce9be-16b9-4127-b1f5-563e8c678bbe', '4738e1de-31f0-11f1-a5c8-3464a92b0560', '471e39f2-31f0-11f1-a5c8-3464a92b0560', 'e6022611-c3e0-46e9-9aad-fc4b0a64e7f3', NULL, 26100, NULL, 'refurbished', 'Instant-sale/POS-only product', '{}', NULL, 0, 0, 0, 0.0, 0, '[]', '2026-04-27 19:09:04.318', 0, 1, '[]', '51ed4e51-41a8-11f1-9350-3464a92b0560', '51ed4e51-41a8-11f1-9350-3464a92b0560', NULL, 'you@example.com', '2026-04-27', 25000.00, 'paid', 'pos_only', 0, 'paid', '2026-04-27 19:09:04.318', '51ed4e51-41a8-11f1-9350-3464a92b0560', '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-27 19:09:04.318'),
('78b333c9-0f8b-46f6-b7c4-5dbba504bcc7', 'custom-gaming-pc-rtx4060', 'Custom Gaming PC — RTX 4060', '3c022372-61a7-46f0-a5fe-a1d61acc4d73', NULL, '471e3c5f-31f0-11f1-a5c8-3464a92b0560', NULL, NULL, 89999, NULL, 'new', 'Custom-built gaming PC with RTX 4060, RGB lighting, and premium cooling.', '{}', '1 Year TECHALVES Warranty', 1, 0, 0, 4.9, 41, '[\"/uploads/1777310129633-2c2029e0-photo-1587202372775-e229f172b9d7.jpg\"]', '2026-03-19 14:33:12.435', 5, 5, '[]', NULL, '51ed4e51-41a8-11f1-9350-3464a92b0560', NULL, NULL, NULL, 0.00, 'pending', 'catalog', 1, 'pay_later', NULL, NULL, NULL, '2026-04-25 14:45:41.382'),
('7d13ca78-3c4a-4e6b-ac87-1fc80f938efc', 'ipad-air-m1-64gb', 'iPad Air M1 64GB WiFi', '9099fa2b-4ca9-4d7c-bc5c-5f902e7cca25', 'Tablets', 'Apple', NULL, NULL, 79999, NULL, 'new', 'Powerful iPad Air with M1 chip — perfect for creativity and productivity.', '{\"Processor\":\"Apple M1\",\"Storage\":\"64GB\",\"Display\":\"10.9\\\" Liquid Retina\",\"Camera\":\"12MP Wide\"}', '1 Year Apple Warranty', 1, 0, 0, 4.7, 76, '[\"/uploads/1777310030852-03219948-photo-1544244015-0df4b3ffc6b0.jpg\"]', '2026-03-19 14:33:12.458', 4, 4, '[]', NULL, '51ed4e51-41a8-11f1-9350-3464a92b0560', NULL, NULL, NULL, 0.00, 'pending', 'catalog', 1, 'pay_later', NULL, NULL, NULL, '2026-04-25 14:45:41.382'),
('b3a029db-79b4-4da6-adac-100a6a043929', 'dell-laptop', 'dell laptop', '3c022372-61a7-46f0-a5fe-a1d61acc4d73', '4738e410-31f0-11f1-a5c8-3464a92b0560', '471e39f2-31f0-11f1-a5c8-3464a92b0560', 'e6022611-c3e0-46e9-9aad-fc4b0a64e7f3', NULL, 15000, NULL, 'refurbished', '<p>dell laptop at best price</p>', '{\"47b724c5-31f0-11f1-a5c8-3464a92b0560\":\"47d40210-31f0-11f1-a5c8-3464a92b0560\",\"47b7240b-31f0-11f1-a5c8-3464a92b0560\":\"47dda2ba-31f0-11f1-a5c8-3464a92b0560\",\"47b722f1-31f0-11f1-a5c8-3464a92b0560\":\"47ea7b71-31f0-11f1-a5c8-3464a92b0560\",\"47b72189-31f0-11f1-a5c8-3464a92b0560\":\"480ac116-31f0-11f1-a5c8-3464a92b0560\"}', NULL, 1, 1, 0, 0.0, 0, '[\"/uploads/1777309931020-de618e53-1777292057264-38f7cb59-download.jpg\"]', '2026-04-27 12:16:15.617', 2, 2, '[\"SN-wewew32332\",\"SN-wewew32343\"]', '51ed4e51-41a8-11f1-9350-3464a92b0560', '51ed4e51-41a8-11f1-9350-3464a92b0560', NULL, NULL, '2026-04-27', 12000.00, 'pending', 'catalog', 1, 'paid', '2026-04-27 12:24:37.173', '51ed4e51-41a8-11f1-9350-3464a92b0560', '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-27 12:16:15.617'),
('c0f2544c-670f-4bf8-821a-54a17a5a648a', 'macbook-air-m2-13', 'MacBook Air M2 13-inch', '049ce9be-16b9-4127-b1f5-563e8c678bbe', 'MacBooks', 'Apple', NULL, NULL, 129999, NULL, 'new', 'The incredibly thin MacBook Air with the M2 chip brings next-level performance in a superbly portable design.', '{\"Processor\":\"Apple M2\",\"RAM\":\"8GB\",\"Storage\":\"256GB SSD\",\"Display\":\"13.6\\\" Liquid Retina\",\"Battery\":\"Up to 18 hours\"}', '1 Year Apple Warranty', 1, 0, 1, 4.8, 124, '[\"/uploads/1777310359274-9f52c851-1776545037162-fb5686d3-photo-1517336714731-489689fd1ca8.jpg\"]', '2026-03-19 14:33:12.360', 15, 15, '[]', NULL, '51ed4e51-41a8-11f1-9350-3464a92b0560', NULL, NULL, NULL, 0.00, 'pending', 'catalog', 1, 'pay_later', NULL, NULL, NULL, '2026-04-25 14:45:41.382'),
('c33b8fd1-72c2-4ada-adea-7ac1eec08a3d', 'samsung-galaxy-note-20-ultra-5g', 'Samsung Galaxy Note 20 Ultra 5G', '9099fa2b-4ca9-4d7c-bc5c-5f902e7cca25', '4738e70e-31f0-11f1-a5c8-3464a92b0560', '471e3aed-31f0-11f1-a5c8-3464a92b0560', '5674d4bd-b440-4070-90fb-e5a9ca20525c', NULL, 44000, 45000, 'ex-uk', '<div class=\"n6owBd awi2gc\" data-sfc-cp=\"\" jsaction=\"\" jscontroller=\"TDBkbc\" data-sfc-root=\"c\" jsuid=\"rpFgQb_f\" data-sfc-cb=\"\" data-hveid=\"CAEIAhAA\" data-complete=\"true\" data-processed=\"true\" style=\"overflow-wrap: break-word; font-family: &quot;Google Sans&quot;, Arial, sans-serif; font-size: 16px; line-height: 24px; text-wrap: wrap; margin-block: 12px 16px; margin-inline: 0px; color: rgb(10, 10, 10); background-color: rgb(255, 255, 255);\"><span data-subtree=\"aimfl\" data-processed=\"true\">The&nbsp;</span><span class=\"Yjhzub\" jsaction=\"\" jscontroller=\"zYmgkd\" data-sfc-root=\"c\" jsuid=\"rpFgQb_h\" data-sfc-cb=\"\" data-complete=\"true\" data-processed=\"true\" style=\"font-weight: 600;\">Samsung Galaxy Note 20 Ultra 5G (12GB RAM / 256GB Storage)</span>&nbsp;is a high-performance \"phablet\" designed for productivity and creative work. Originally a 2020 flagship, it remains a popular \"value flagship\" in Kenya in 2026 due to its professional-grade features.<span jsuid=\"rpFgQb_i\" class=\"uJ19be notranslate\" jsaction=\"rcuQ6b:&amp;rpFgQb_i|npT2md\" jscontroller=\"udAs2b\" data-sfc-root=\"c\" data-wiz-uids=\"rpFgQb_j,rpFgQb_k\" data-sfc-cb=\"\" data-complete=\"true\" data-processed=\"true\"><span class=\"vKEkVd\" data-animation-atomic=\"\" data-wiz-attrbind=\"class=rpFgQb_i/TKHnVd\" data-sae=\"\" style=\"position: relative; white-space: nowrap;\"><span aria-hidden=\"true\">&nbsp;</span><button jsuid=\"rpFgQb_k\" tabindex=\"0\" data-amic=\"true\" data-icl-uuid=\"df83c2f6-7668-4ff7-8b87-b950bbb0c871\" aria-label=\"Phones Store Kenya (+4) – View related links\" class=\"rBl3me IWyTpf pjvauc\" jsaction=\"click:&amp;rpFgQb_i|S9kKve;mouseenter:&amp;rpFgQb_i|sbHm2b;mouseleave:&amp;rpFgQb_i|Tx5Rb\" data-wiz-attrbind=\"disabled=rpFgQb_i/C5gNJc;aria-label=rpFgQb_i/bOjMyf;class=rpFgQb_i/UpSNec\" data-ved=\"2ahUKEwjdlYamipOUAxVjKvsDHV-nCdkQye0OegYIAQgCEAE\" data-hveid=\"CAEIAhAB\" style=\"background-color: rgb(233, 235, 240); border-width: medium; border-style: none; border-color: currentcolor; border-radius: 20px; margin-inline-end: 6px; align-items: center; overflow: hidden; position: relative; max-inline-size: 250px; vertical-align: text-top; height: 20px; width: 20px; block-size: 20px; inline-size: auto; padding-block: 3px; padding-inline: 3px 6px; outline: 0px;\"><div class=\"Fwa2Od\" data-animation-skip=\"\" data-sfc-cp=\"\" jsaction=\"\" jscontroller=\"Pwlgo\" data-sfc-root=\"c\" jsuid=\"rpFgQb_l\" data-sfc-cb=\"\" data-ved=\"2ahUKEwjdlYamipOUAxVjKvsDHV-nCdkQ3s0SegYIAQgCEAI\" data-complete=\"true\" style=\"align-items: center; display: flex; gap: 4px; height: 14px; overflow: hidden; width: 134.788px;\"><img id=\"img-FfzxaZ23KOPU7M8P386myA0_1\" class=\"lXbsme\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAArlBMVEVHcEzuCAhLoNoTfcwMecsLecsFdsoKeMtpnscvjNEdgM1wT00/k9I0kdTwKioujdPwKCgFdsoXf83HZ2XvDAwHd8pOmdM+Pj4kJCTwHh0Qe8wEdsoJeMvvFhZHR0cihtAHdsomhMs0NDMfHx8Yf83yPj4qKirxKirvDAwuLi07OznvGBgxMTHxNjZHR0ZMS0rvGxvwJyZXVlUxMTDxOzsAdMnuAQEIeMs2j9TwHh5WrAslAAAANXRSTlMA+AiN0rPz5QMvOQsWITGIR5x8BedsDou2n8L4VscXXy1IPE+lE51e0HP+sy0hqGCIdCra/BJqWmYAAAdqSURBVHic7VrpeqO4EhW7WBsDBgO2CRi8NN4T4M77v9itEt66O530JAP5Zj7OD5aSTB0dlQohmZABAwYMGDDgP4Ni536pf3vmldYX+t+t67rmSpt+FYFTzeAdv0YFuluvubp+efmr5kLrK2JhFRb2jONeXl642gv7VoHyhqr5BCjUHIpQe6u+XPNaMhZGkajITWQS4tplXf+FoeD3458KSlxVVfO/Bo5TMLjFasZiUe+HgCqjdwD4r5yLcTXj6mM//ompVFUcK2KUC85IuBhpcfT6ikJfFBJNNQ2fJ+Qpv1pp2JcAhM9Nck19qnS12uuiLwIk126XhnSJfLcnAeaHzZwIye3el8z2wp7t+vB/3n//vqfO+G65qtGLAHTz/B1wmAp3m5Di0bXWXQjgJ98YnFbm7R7dTw77NL2/fscsEbjlqQP/JJEx10HWYaF+YM0P5mSx529VaMoIdBQBTnVFQnTW/H2G9s3mroCW084EeCAg+edL8wHUaHkwmLnf3RBQJQUAmb+KE30CvX/NP9n+NvvwJYPoHQkAOc8ETPHVJ/LZ8/lqpvxmc6siqfAi6vY1KLVREBzuJnd/Y5OrbtiVABdo2AmipqbqHZp2u1IvBWZnBPgcJVDeQ6R2xiBVqj+B0N3XgfBHBPLuCDzJf+C/Sd5/0IfBJBC/vYmUdPiBpmEUiG/Heaffh5RlZeH9ip0RMFCCuLuB9j6YBKL0GwhG5wRM8c0h4Lz/hM/CeZNA/v4DPgvjLQmaHhQgCXqSR6/C6T4G8IsMBwKkm1/R0+JIgjMTqac1gNdgRtgH6dcRICnLBdpPeOqRQcTi8CcoPWrC5qe/oMdXhC99URa84bXJWdNnWFL/6Rf0kYN+gH+fgJtm/6vUfCLKyohRUCOYi/eeFsZNBUMhgpZrYhXHldzzJAVeCFHqxFWKE1Vlmih9z9Oe4kolfFSNiR/h+HOqqN8gNBVwqyrwrQofbJLhw4F//1f/IGheyZFSyQZ7OYpiu1rdJ0z8UlXwI4iHUKjk/qfq/vTbuI18mjpO+g92gG/225vMJ8ulahvHU/GjSYVaq9XK/sha9VSOEUqOmW380XiySw53D71jQXan09/aOJpWoiAIIxGmOR8nYHnoHjisd8Su69nf+CmdsjxGjRF+WCABQ70FAm+q7fyThxPYr68dX73YCa+qBiX0CK5tyz7NjsRdcXXpFli1sFcrtnjoWtYO+qjAbcbV6qfdxeklkRqx4gOBsRQ3TTvDMgWlaeT8CS7HyjhvmkZk6w/mCOwKfgYYWAOsblnX7SqZS2ZtX1hEPzJZcFsZBHopa84iFtvYWj92Eb0S8BXZBAKykjtRpUB3UDgJcI27cmCXmV3F/YlGdBwRBXMquBopDgnxqaxl1Gt3ci1yRPc16xXWQ0DAWte1B9ec/YoCWiPy4Eh5wj05tI0hzQIvocrRjhHCM7tT4cqsIVUpLyIhYvDEZo1dh7ZL7CMH3WEXNldzp50NTQ5dJOAdV0VYc8dCX3n1rHhUYKTzvJGy98q4ZaNCdvejdvpvKIp5tacxs6suz7vTWIAZsoAhQHClmGONDAsCnkuwgCghFni1twMCHMi+g+uVbQMpz35UQBFFUYmr3EACbS83EW+Il+WYKNaudk2WwA7pH1FJFKaHsiglGJCFdSpRhtOFAIQF+iTFDKX3sCOIxeFQAbRFNwWUCDBKsCWXYdgSUFoCIsw3xnF6JyA7YwYwmUkuKZWEwQfYQavLK4GQxaW7W9ceI1BArgIhypDhYXsRusAwDL8dYQ8EaN6uuakyKPFAgJeqH7Ilrymyb4UWPuB4IYB54ATpAFqNEVG0BJgaOFisx93N2yj4mQDRYLZjGKkIE49HAiSVlcTwTQHj0VF9HwlAdK3LcMa0xYgLS3sH4eeVcGhNbEcRUkQ9C0vOe9xaAAVeJ0AcGXq7aQT+ZtcgCAl15AaCBuaEEA6yKMqNoIdcO/ggyJn4GIA45pjJvRFwT229H4ahNrpnX6qNnvBsjMY83gmRmE8xLaat3RQudhFCD2JWdSRRzBOe6HY48zw2DEHp02w9w6CHc2valbOwHXj2EcqOj/5/gzYk6O+n/PSXMh8G5G9WKeiPtb/s7y7/MuiLxWJOyJltkm3hRocgyhbb9maL1wtWxmxEz9q6Z9zHmbMiHUo+oXY2CQJ42J7tEm3gxiB6MAkmc3JYPgcZmU+WS7jRoWgCdbbPC1Y3COAaigL80WbziZ2sxSTL4E1/IRBkW+QEDqFN52cYC/MJJZOM2eaTMxCYZFcCwQaaD6dl9pmdtOw5CPQHBeCcLdui87NPrgos0DbZQqsXkyuB5YJVm2+Wy/knCEzO2zkoEGzPLihw3urgc7OFzqUXAgfUGW2bpQ4EyOb7gVAkgOIBhyzLJtuPE9gu97g7u1nuoSMXcDNHCZaoyjyALtADqm/mWI+1c47SQ/3DAeN3iSLA8TMxQHVdh7zCwwnCH44Y0C47UjZnhEL3bsNbzDa0NTHHek//KRowYMCAAQMGDBgwYMCAAQMGDPjX4v8Q3BujBz0DdAAAAABJRU5ErkJggg==\" alt=\"Phones Store Kenya\" data-deferred=\"3\" data-imglogged=\"true\" data-aatf=\"1\" data-imgprocessed=\"true\" style=\"background: none 0% 0% / auto repeat scroll padding-box border-box rgb(240, 242, 245); border-radius: 20px; height: 12px; width: 12px; flex-shrink: 0;\"><span class=\"wJwe6c\" style=\"color: rgb(86, 89, 94); font-size: 11px; line-height: 1.45; display: flex; overflow: hidden; min-width: 0px;\"><span class=\"iFMVXd\" style=\"overflow: hidden; text-overflow: ellipsis; min-width: 0px;\">Phones Store Kenya</span><span class=\"IjM6od\" style=\"flex-shrink: 0;\">&nbsp;+4</span></span></div></button></span></span></div><div class=\"Fsg96\" data-sfc-cp=\"\" jsaction=\"rcuQ6b:&amp;rpFgQb_o|npT2md\" jscontroller=\"KHhJQ\" data-sfc-root=\"c\" jsuid=\"rpFgQb_o\" data-sfc-cb=\"\" data-complete=\"true\" data-processed=\"true\" style=\"color: rgb(10, 10, 10); font-family: &quot;Google Sans&quot;, Arial, sans-serif; background-color: rgb(255, 255, 255);\"></div><div class=\"otQkpb\" aria-level=\"3\" role=\"heading\" data-animation-nesting=\"\" data-sfc-cp=\"\" jsaction=\"\" jscontroller=\"a7qCn\" data-sfc-root=\"c\" jsuid=\"rpFgQb_p\" data-sfc-cb=\"\" data-complete=\"true\" data-processed=\"true\" data-sae=\"\" style=\"font-family: &quot;Google Sans&quot;, Arial, sans-serif; font-size: 20px; font-weight: 600; line-height: 28px; color: rgb(10, 10, 10); margin-block: 24px 12px; background-color: rgb(255, 255, 255);\"><span class=\"Yjhzub\" jsaction=\"\" jscontroller=\"zYmgkd\" data-sfc-root=\"c\" jsuid=\"rpFgQb_q\" data-sfc-cb=\"\" data-complete=\"true\" style=\"font-weight: inherit;\">Core Specifications</span><span jsuid=\"rpFgQb_r\" class=\"txxDge notranslate\" jsaction=\"rcuQ6b:&amp;rpFgQb_r|npT2md\" jscontroller=\"udAs2b\" data-sfc-root=\"c\" data-wiz-uids=\"rpFgQb_s,rpFgQb_t\" data-sfc-cb=\"\" data-complete=\"true\" style=\"visibility: hidden;\"><span class=\"vKEkVd\" data-animation-atomic=\"\" data-wiz-attrbind=\"class=rpFgQb_r/TKHnVd\" data-sae=\"\" style=\"position: relative; white-space: nowrap;\"><span aria-hidden=\"true\"></span><button jsuid=\"rpFgQb_t\" tabindex=\"0\" data-amic=\"true\" data-icl-uuid=\"8d981048-a418-4043-a8c9-9308340e77f3\" aria-label=\"View related links\" class=\"rBl3me\" jsaction=\"click:&amp;rpFgQb_r|S9kKve;mouseenter:&amp;rpFgQb_r|sbHm2b;mouseleave:&amp;rpFgQb_r|Tx5Rb\" data-wiz-attrbind=\"disabled=rpFgQb_r/C5gNJc;aria-label=rpFgQb_r/bOjMyf;class=rpFgQb_r/UpSNec\" data-ved=\"2ahUKEwjdlYamipOUAxVjKvsDHV-nCdkQye0OegYIAQgDEAA\" data-hveid=\"CAEIAxAA\" style=\"background-color: rgb(233, 235, 240); border-width: medium; border-style: none; border-color: currentcolor; border-radius: 10px; height: 20px; margin-inline-end: 6px; width: 20px; outline: 0px;\"><span class=\"wiMplc ofC0Ud\" style=\"color: rgb(86, 89, 94); display: inline-block; transform: rotate(135deg);\"><svg style=\"margin-top: 3px;\" fill=\"currentColor\" width=\"12px\" height=\"12px\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z\"></path></svg></span></button></span></span></div><ul class=\"KsbFXc U6u95\" jsaction=\"\" jscontroller=\"mPWODf\" data-sfc-root=\"c\" jsuid=\"rpFgQb_u\" data-sfc-cb=\"\" data-complete=\"true\" data-processed=\"true\" style=\"margin: 16px 0px; font-family: &quot;Google Sans&quot;, Arial, sans-serif; font-size: 16px; line-height: 24px; margin-block: 12px 16px; padding-inline-start: 18px; color: rgb(10, 10, 10); background-color: rgb(255, 255, 255);\"><li class=\"Z1qcYe\" data-sfc-cp=\"\" jsaction=\"\" jscontroller=\"oSLmPe\" data-sfc-root=\"c\" jsuid=\"rpFgQb_v\" data-sfc-cb=\"\" data-hveid=\"CAEIBBAA\" data-complete=\"true\" data-sae=\"\" style=\"margin: 0px; padding: 0px; list-style: disc; margin-block: 0px 12px; padding-inline-start: 4px;\"><span class=\"T286Pc\" data-sfc-cp=\"\" jsaction=\"\" jscontroller=\"fly6D\" data-sfc-root=\"c\" jsuid=\"rpFgQb_w\" data-sfc-cb=\"\" data-complete=\"true\" style=\"overflow-wrap: break-word;\"><span class=\"Yjhzub\" jsaction=\"\" jscontroller=\"zYmgkd\" data-sfc-root=\"c\" jsuid=\"rpFgQb_x\" data-sfc-cb=\"\" data-complete=\"true\" style=\"font-weight: 600;\">Display:</span>&nbsp;Massive 6.9-inch Dynamic AMOLED 2X with a fluid&nbsp;<span class=\"Yjhzub\" jsaction=\"\" jscontroller=\"zYmgkd\" data-sfc-root=\"c\" jsuid=\"rpFgQb_y\" data-sfc-cb=\"\" data-complete=\"true\" style=\"font-weight: 600;\">120Hz refresh rate</span>&nbsp;and HDR10+ support.</span></li><li class=\"Z1qcYe\" data-sfc-cp=\"\" jsaction=\"\" jscontroller=\"oSLmPe\" data-sfc-root=\"c\" jsuid=\"rpFgQb_z\" data-sfc-cb=\"\" data-hveid=\"CAEIBBAB\" data-complete=\"true\" data-sae=\"\" style=\"margin: 0px; padding: 0px; list-style: disc; margin-block: 0px 12px; padding-inline-start: 4px;\"><span class=\"T286Pc\" data-sfc-cp=\"\" jsaction=\"\" jscontroller=\"fly6D\" data-sfc-root=\"c\" jsuid=\"rpFgQb_10\" data-sfc-cb=\"\" data-complete=\"true\" style=\"overflow-wrap: break-word;\"><span class=\"Yjhzub\" jsaction=\"\" jscontroller=\"zYmgkd\" data-sfc-root=\"c\" jsuid=\"rpFgQb_11\" data-sfc-cb=\"\" data-complete=\"true\" style=\"font-weight: 600;\">Performance:</span>&nbsp;Powered by either the&nbsp;<span class=\"Yjhzub\" jsaction=\"\" jscontroller=\"zYmgkd\" data-sfc-root=\"c\" jsuid=\"rpFgQb_12\" data-sfc-cb=\"\" data-complete=\"true\" style=\"font-weight: 600;\">Snapdragon 865+</span>&nbsp;(typically US versions) or the&nbsp;<span class=\"Yjhzub\" jsaction=\"\" jscontroller=\"zYmgkd\" data-sfc-root=\"c\" jsuid=\"rpFgQb_13\" data-sfc-cb=\"\" data-complete=\"true\" style=\"font-weight: 600;\">Exynos 990</span>&nbsp;(Global), paired with 12GB of LPDDR5 RAM for heavy multitasking.</span></li><li class=\"Z1qcYe\" data-sfc-cp=\"\" jsaction=\"\" jscontroller=\"oSLmPe\" data-sfc-root=\"c\" jsuid=\"rpFgQb_14\" data-sfc-cb=\"\" data-hveid=\"CAEIBBAC\" data-complete=\"true\" data-sae=\"\" style=\"margin: 0px; padding: 0px; list-style: disc; margin-block: 0px 12px; padding-inline-start: 4px;\"><span class=\"T286Pc\" data-sfc-cp=\"\" jsaction=\"\" jscontroller=\"fly6D\" data-sfc-root=\"c\" jsuid=\"rpFgQb_15\" data-sfc-cb=\"\" data-complete=\"true\" style=\"overflow-wrap: break-word;\"><span class=\"Yjhzub\" jsaction=\"\" jscontroller=\"zYmgkd\" data-sfc-root=\"c\" jsuid=\"rpFgQb_16\" data-sfc-cb=\"\" data-complete=\"true\" style=\"font-weight: 600;\">Storage:</span>&nbsp;256GB internal capacity, uniquely featuring a&nbsp;<span class=\"Yjhzub\" jsaction=\"\" jscontroller=\"zYmgkd\" data-sfc-root=\"c\" jsuid=\"rpFgQb_17\" data-sfc-cb=\"\" data-complete=\"true\" style=\"font-weight: 600;\">microSD slot</span>&nbsp;for expansion up to 1TB—a feature missing in many newer models.</span></li><li class=\"Z1qcYe\" data-sfc-cp=\"\" jsaction=\"\" jscontroller=\"oSLmPe\" data-sfc-root=\"c\" jsuid=\"rpFgQb_18\" data-sfc-cb=\"\" data-hveid=\"CAEIBBAD\" data-complete=\"true\" data-sae=\"\" style=\"margin: 0px; padding: 0px; list-style: disc; margin-block: 0px 12px; padding-inline-start: 4px;\"><span class=\"T286Pc\" data-sfc-cp=\"\" jsaction=\"\" jscontroller=\"fly6D\" data-sfc-root=\"c\" jsuid=\"rpFgQb_19\" data-sfc-cb=\"\" data-complete=\"true\" aria-owns=\"action-menu-parent-container\" style=\"overflow-wrap: break-word;\"><span class=\"Yjhzub\" jsaction=\"\" jscontroller=\"zYmgkd\" data-sfc-root=\"c\" jsuid=\"rpFgQb_1a\" data-sfc-cb=\"\" data-complete=\"true\" style=\"font-weight: 600;\">Battery:</span>&nbsp;4500mAh capacity with 25W fast wired charging and wireless charging capabilities</span></li></ul>', '{\"47b759da-31f0-11f1-a5c8-3464a92b0560\":\"47ea9488-31f0-11f1-a5c8-3464a92b0560\",\"47b758c5-31f0-11f1-a5c8-3464a92b0560\":\"47ddb27d-31f0-11f1-a5c8-3464a92b0560\",\"47b755be-31f0-11f1-a5c8-3464a92b0560\":\"480ad778-31f0-11f1-a5c8-3464a92b0560\",\"47b757a3-31f0-11f1-a5c8-3464a92b0560\":\"47f7d87e-31f0-11f1-a5c8-3464a92b0560\"}', NULL, 1, 1, 1, 0.0, 0, '[\"/uploads/1777466846912-15148edb-whatsapp-image-2026-04-29-at-3-45-49-pm.jpeg\",\"/uploads/1777466848942-4dfceefe-whatsapp-image-2026-04-29-at-3-46-40-pm.jpeg\",\"/uploads/1777466848664-aa1cb265-whatsapp-image-2026-04-29-at-3-46-27-pm.jpeg\",\"/uploads/1777466848356-1c670359-whatsapp-image-2026-04-29-at-3-46-18-pm.jpeg\",\"/uploads/1777466463309-ceb4b0b9-whatsapp-image-2026-04-27-at-6-36-28-am.jpeg\",\"/uploads/1777466848077-4602a468-whatsapp-image-2026-04-29-at-3-45-49-pmjj.jpeg\"]', '2026-04-29 12:47:46.694', 3, 3, '[]', '51ed4e51-41a8-11f1-9350-3464a92b0560', '51ed4e51-41a8-11f1-9350-3464a92b0560', NULL, NULL, '2026-04-29', 40000.00, 'paid', 'catalog', 1, 'paid', '2026-04-29 12:47:46.694', '51ed4e51-41a8-11f1-9350-3464a92b0560', '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-29 12:47:46.694'),
('c5b90cab-64c8-4886-8375-0b44cfabb989', 'iphone-15-pro-128gb', 'iPhone 15 Pro 128GB', '9099fa2b-4ca9-4d7c-bc5c-5f902e7cca25', NULL, 'Apple', NULL, NULL, 174999, NULL, 'new', 'The latest iPhone 15 Pro with titanium design, A17 Pro chip, and advanced camera system.', '{\"Processor\":\"A17 Pro\",\"Storage\":\"128GB\",\"Display\":\"6.1\\\" Super Retina XDR\",\"Camera\":\"48MP Triple Camera\"}', '1 Year Apple Warranty', 1, 1, 0, 4.9, 201, '[\"/uploads/1777310074109-3c4a67d4-photo-1695048133142-1a20484d2569.jpg\"]', '2026-03-19 14:33:12.443', 10, 10, '[]', NULL, '51ed4e51-41a8-11f1-9350-3464a92b0560', NULL, NULL, NULL, 0.00, 'pending', 'catalog', 1, 'pay_later', NULL, NULL, NULL, '2026-04-25 14:45:41.382'),
('d2353363-0eef-4435-8721-1e918a4f7b59', 'hp-prodesk-400-g7-mini', 'HP ProDesk 400 G7 Mini', '3c022372-61a7-46f0-a5fe-a1d61acc4d73', NULL, 'HP', NULL, NULL, 34999, NULL, 'new', 'Compact desktop for productivity. Powerful performance in a small form factor.', '{\"Processor\":\"Intel Core i5-10500T\",\"RAM\":\"8GB DDR4\",\"Storage\":\"256GB SSD\",\"Graphics\":\"Intel UHD 630\"}', '1 Year HP Warranty', 1, 1, 1, 4.4, 29, '[\"/uploads/1777310223123-0afe0c00-photo-1593062096033-9a26b09da705.jpg\"]', '2026-03-19 14:33:12.427', 8, 8, '[]', NULL, '51ed4e51-41a8-11f1-9350-3464a92b0560', NULL, NULL, NULL, 0.00, 'pending', 'catalog', 1, 'pay_later', NULL, NULL, NULL, '2026-04-25 14:45:41.382'),
('db203226-8543-4ad2-806b-bca68db967c4', 'dell-latitude-5520-ex-uk', 'Dell Latitude 5520 (Ex-UK)', '3c022372-61a7-46f0-a5fe-a1d61acc4d73', '4738e410-31f0-11f1-a5c8-3464a92b0560', '471e39f2-31f0-11f1-a5c8-3464a92b0560', NULL, NULL, 38999, 75000, 'ex-uk', 'Imported ex-UK Dell Latitude in excellent condition. Perfect for professionals on a budget.', '{\"47b724c5-31f0-11f1-a5c8-3464a92b0560\":\"47d40249-31f0-11f1-a5c8-3464a92b0560\",\"47b722f1-31f0-11f1-a5c8-3464a92b0560\":\"47ea7bf6-31f0-11f1-a5c8-3464a92b0560\",\"47b7240b-31f0-11f1-a5c8-3464a92b0560\":\"47dda2ba-31f0-11f1-a5c8-3464a92b0560\",\"47b72189-31f0-11f1-a5c8-3464a92b0560\":\"480ac116-31f0-11f1-a5c8-3464a92b0560\"}', '3 Months TECHALVES Warranty', 1, 1, 1, 4.3, 45, '[\"/uploads/1777310295487-26c45231-photo-1593642632559-0c6d3fc62b89.jpg\"]', '2026-03-19 14:33:12.384', 11, 12, '[]', NULL, '51ed4e51-41a8-11f1-9350-3464a92b0560', NULL, NULL, NULL, 0.00, 'pending', 'catalog', 1, 'pay_later', NULL, NULL, NULL, '2026-04-25 14:45:41.382'),
('e51b5275-8c0a-420e-90fc-7a8891a338df', 'hikvision-4ch-cctv-kit', 'Hikvision 4-Channel CCTV Kit', '1d1566d3-e978-46f7-b888-538637b27c77', '4738e2bc-31f0-11f1-a5c8-3464a92b0560', '471e3ce6-31f0-11f1-a5c8-3464a92b0560', NULL, 'kas123', 28999, NULL, 'new', 'Complete 4-channel security camera system with night vision and remote viewing.', '{}', '12 months warranty', 1, 1, 0, 4.4, 22, '[\"/uploads/1777309579730-8a4e7838-1777294398883-fa6682d7-61wy9aaelsl.jpg\",\"/uploads/1777309580059-369cac17-1777304158381-e5d3781b-61wy9aaelsl.jpg\"]', '2026-03-19 14:33:12.488', 21, 21, '[\"dsfdssdsd\",\"34reerer\",\"34444f\"]', NULL, '51ed4e51-41a8-11f1-9350-3464a92b0560', NULL, NULL, NULL, 0.00, 'pending', 'catalog', 1, 'pay_later', NULL, NULL, NULL, '2026-04-25 14:45:41.382'),
('edaabff8-85ad-48f5-b096-c1a0ab609139', 'lenovo-thinkpad-x1-carbon-gen9', 'Lenovo ThinkPad X1 Carbon Gen 9', '049ce9be-16b9-4127-b1f5-563e8c678bbe', '4738e113-31f0-11f1-a5c8-3464a92b0560', '471e3a1d-31f0-11f1-a5c8-3464a92b0560', NULL, NULL, 62999, 120000, 'refurbished', 'Premium ultrabook built for enterprise. Lightweight, durable, and incredibly fast.', '{\"47b6d770-31f0-11f1-a5c8-3464a92b0560\":\"47dd9284-31f0-11f1-a5c8-3464a92b0560\",\"47b6d68d-31f0-11f1-a5c8-3464a92b0560\":\"47ea5b3f-31f0-11f1-a5c8-3464a92b0560\"}', '6 Months TECHALVES Warranty', 1, 1, 0, 4.7, 63, '[\"/uploads/1777310267113-7a250c59-photo-1629131726692-1accd0c53ce0.jpg\"]', '2026-03-19 14:33:12.418', 10, 10, '[]', NULL, '51ed4e51-41a8-11f1-9350-3464a92b0560', NULL, NULL, NULL, 0.00, 'pending', 'catalog', 1, 'pay_later', NULL, NULL, NULL, '2026-04-25 14:45:41.382'),
('f491f4ce-8db2-4bd7-93b5-0882deeb9b08', 'hp-probook-450-g7', 'HP ProBook 450 G7', '049ce9be-16b9-4127-b1f5-563e8c678bbe', '4738e1de-31f0-11f1-a5c8-3464a92b0560', '471e3917-31f0-11f1-a5c8-3464a92b0560', 'e6022611-c3e0-46e9-9aad-fc4b0a64e7f3', NULL, 44000, 50000, 'refurbished', 'The HP ProBook 450 G7 is a 15.6-inch business-oriented laptop featuring 10th Gen Intel Core processors (i5/i7), designed for durability and productivity with an aluminum chassis. It offers up to 32GB DDR4 RAM, SSD or HDD storage, optional NVIDIA MX250 graphics, and robust security features like BIOS protection.', '{\"47b6faf0-31f0-11f1-a5c8-3464a92b0560\":\"47d3f4d9-31f0-11f1-a5c8-3464a92b0560\",\"47b6f8be-31f0-11f1-a5c8-3464a92b0560\":\"47ea67e3-31f0-11f1-a5c8-3464a92b0560\",\"47b6fa00-31f0-11f1-a5c8-3464a92b0560\":\"47dd99c1-31f0-11f1-a5c8-3464a92b0560\",\"47b6f793-31f0-11f1-a5c8-3464a92b0560\":\"47f78e1a-31f0-11f1-a5c8-3464a92b0560\",\"47b6f692-31f0-11f1-a5c8-3464a92b0560\":\"480ab452-31f0-11f1-a5c8-3464a92b0560\"}', '3 months warranty', 1, 0, 0, 0.0, 0, '[\"/uploads/1777466206376-3af90902-whatsapp-image-2026-04-28-at-12-12-10-pm.jpeg\",\"/uploads/1777466206674-18a12ce0-whatsapp-image-2026-04-28-at-12-12-11-pm-1.jpeg\",\"/uploads/1777466205745-a3348b3d-whatsapp-image-2026-04-28-at-12-12-10-pm-1.jpeg\",\"/uploads/1777466206954-9c5f2dbb-whatsapp-image-2026-04-28-at-12-12-11-pm.jpeg\",\"/uploads/1777466207271-fe5ac855-whatsapp-image-2026-04-28-at-12-12-12-pm-1.jpeg\",\"/uploads/1777466207550-ed455d2c-whatsapp-image-2026-04-28-at-12-12-12-pm.jpeg\"]', '2026-04-29 12:36:59.994', 20, 20, '[]', '51ed4e51-41a8-11f1-9350-3464a92b0560', '51ed4e51-41a8-11f1-9350-3464a92b0560', NULL, NULL, '2026-04-29', 30000.00, 'pending', 'catalog', 1, 'pay_later', NULL, NULL, '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-29 12:36:59.994'),
('f879e596-09f6-4326-8880-9c9898a2f1be', 'hp-elitebook-840-g5', 'HP EliteBook 840 G5', '049ce9be-16b9-4127-b1f5-563e8c678bbe', 'Refurbished Laptops', 'HP', NULL, NULL, 45999, 89999, 'refurbished', 'Grade A refurbished HP EliteBook — powerful business laptop with premium build quality.', '{\"Processor\":\"Intel Core i5-8350U\",\"RAM\":\"8GB DDR4\",\"Storage\":\"256GB SSD\",\"Display\":\"14\\\" FHD\",\"Battery\":\"Up to 10 hours\"}', '6 Months TECHALVES Warranty', 1, 1, 0, 4.5, 87, '[\"/uploads/1777310335901-d6acf2bb-photo-1588872657578-7efd1f1555ed.jpg\"]', '2026-03-19 14:33:12.375', 10, 10, '[]', NULL, '51ed4e51-41a8-11f1-9350-3464a92b0560', NULL, NULL, NULL, 0.00, 'pending', 'catalog', 1, 'pay_later', NULL, NULL, NULL, '2026-04-25 14:45:41.382');

-- --------------------------------------------------------

--
-- Table structure for table `product_analytics`
--

CREATE TABLE `product_analytics` (
  `id` varchar(191) NOT NULL,
  `product_id` varchar(191) NOT NULL,
  `event` varchar(191) NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `ip_address` varchar(191) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_analytics`
--

INSERT INTO `product_analytics` (`id`, `product_id`, `event`, `metadata`, `ip_address`, `user_agent`, `created_at`, `data_entrant`, `entry_date`) VALUES
('0295bfc2-7de9-4b73-92a2-f590a2054f55', 'f491f4ce-8db2-4bd7-93b5-0882deeb9b08', 'view', '{}', '41.90.145.100', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-29 12:38:08.169', NULL, '2026-04-29 12:38:08.285'),
('057bc62d-ca13-4e9b-b012-4741958397bb', 'f879e596-09f6-4326-8880-9c9898a2f1be', 'view', '{}', '217.199.144.39', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-29 12:41:34.276', NULL, '2026-04-29 12:41:34.294'),
('119899c3-be9b-4a41-a472-7feb9e15a367', 'edaabff8-85ad-48f5-b096-c1a0ab609139', 'view', '{}', '217.199.144.39', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-29 12:47:36.166', NULL, '2026-04-29 12:47:36.188'),
('213bfe65-e540-4721-a8ba-d9fc5890bc47', 'db203226-8543-4ad2-806b-bca68db967c4', 'view', '{}', '105.164.117.100', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-30 07:29:28.467', NULL, '2026-04-30 07:29:28.503'),
('2c5382e3-93e9-4da6-9a0a-58b8740bd7da', 'f879e596-09f6-4326-8880-9c9898a2f1be', 'click', '{\"source\":\"product_card\"}', '217.199.144.39', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-29 12:41:33.338', NULL, '2026-04-29 12:41:33.360'),
('33728d65-d8f0-41ec-949f-a630ccbaf6d0', 'e51b5275-8c0a-420e-90fc-7a8891a338df', 'view', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-27 18:22:09.446', NULL, '2026-04-27 21:22:09.750'),
('34c694dc-c279-4ac3-b9e1-c5d86832d8be', 'edaabff8-85ad-48f5-b096-c1a0ab609139', 'click', '{\"source\":\"product_card\"}', '217.199.144.39', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-29 12:47:35.619', NULL, '2026-04-29 12:47:35.660'),
('37f6542f-0acc-470b-b17e-2b75833d0168', 'c0f2544c-670f-4bf8-821a-54a17a5a648a', 'view', '{}', '105.164.117.100', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-30 07:29:40.867', NULL, '2026-04-30 07:29:40.890'),
('40a0eb51-b49b-4c0d-bfea-5fdd76d6c1cc', '2bf6e812-769e-4c48-9c07-d2cdfd70a16d', 'view', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-27 18:23:30.843', NULL, '2026-04-27 21:23:31.325'),
('44a82c38-2348-4f38-afcd-786b82db5e99', 'e51b5275-8c0a-420e-90fc-7a8891a338df', 'view', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-27 18:21:56.550', NULL, '2026-04-27 21:21:56.940'),
('5f464cab-0890-4031-8026-10248abdc1da', 'edaabff8-85ad-48f5-b096-c1a0ab609139', 'click', '{\"source\":\"product_card\"}', '217.199.144.39', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-29 12:40:50.315', NULL, '2026-04-29 12:40:50.335'),
('602f962f-4077-40a8-bcda-ddb37bf6a612', 'c0f2544c-670f-4bf8-821a-54a17a5a648a', 'view', '{}', '105.164.117.100', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-30 07:30:15.225', NULL, '2026-04-30 07:30:15.275'),
('7077ab44-536e-4068-b3cf-ed6ab59515c1', 'f491f4ce-8db2-4bd7-93b5-0882deeb9b08', 'view', '{}', '217.199.144.39', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-29 12:43:36.297', NULL, '2026-04-29 12:43:36.323'),
('880db6a5-8f68-40f2-9545-cc9e50f91195', 'f491f4ce-8db2-4bd7-93b5-0882deeb9b08', 'click', '{\"source\":\"product_card\"}', '41.90.145.100', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-29 12:38:04.201', NULL, '2026-04-29 12:38:04.283'),
('9a812011-5f7f-41b3-8a5a-97d44616e972', '2bf6e812-769e-4c48-9c07-d2cdfd70a16d', 'click', '{\"source\":\"product_card\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-27 18:23:29.689', NULL, '2026-04-27 21:23:30.886'),
('9c32c225-4e96-41e3-9f05-bfe3c615a775', 'db203226-8543-4ad2-806b-bca68db967c4', 'view', '{}', '217.199.144.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-27 20:41:35.390', NULL, '2026-04-27 20:41:35.419'),
('ad4ee4fd-2c8a-4807-a47d-b6e8ff6725cd', 'edaabff8-85ad-48f5-b096-c1a0ab609139', 'view', '{}', '217.199.144.39', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-29 12:41:04.019', NULL, '2026-04-29 12:41:04.044'),
('af023c8c-c4f7-47af-974c-ac175170ed99', 'c0f2544c-670f-4bf8-821a-54a17a5a648a', 'view', '{}', '217.199.144.39', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-29 12:47:44.508', NULL, '2026-04-29 12:47:44.567'),
('b5a29a57-c088-48ff-9ddd-5f1e8a348876', 'f491f4ce-8db2-4bd7-93b5-0882deeb9b08', 'view', '{}', '217.199.144.39', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-29 12:56:05.610', NULL, '2026-04-29 12:56:05.641'),
('bbfdb97e-9ca5-49aa-b954-3a1dea8b046e', 'c0f2544c-670f-4bf8-821a-54a17a5a648a', 'click', '{\"source\":\"product_card\"}', '217.199.144.39', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-29 12:47:25.228', NULL, '2026-04-29 12:47:25.259'),
('c3fa138e-c54c-43bb-a1fb-d479f373a413', 'e51b5275-8c0a-420e-90fc-7a8891a338df', 'view', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-27 18:20:50.939', NULL, '2026-04-27 21:20:52.307'),
('c4678c15-4a9b-463a-baa7-302c400b4330', 'f491f4ce-8db2-4bd7-93b5-0882deeb9b08', 'view', '{}', '217.199.144.39', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-29 12:48:09.295', NULL, '2026-04-29 12:48:09.320'),
('d5570721-ca8e-47fb-a2db-1fa009a17ab5', 'db203226-8543-4ad2-806b-bca68db967c4', 'click', '{\"source\":\"product_card\"}', '217.199.144.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-27 20:41:34.762', NULL, '2026-04-27 20:41:34.782'),
('d99fefb7-7cc2-4a56-88a1-395404fbac9b', 'c0f2544c-670f-4bf8-821a-54a17a5a648a', 'view', '{}', '217.199.144.39', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-29 12:47:51.340', NULL, '2026-04-29 12:47:51.399'),
('dab4492d-3e3f-46a2-994e-621985beefb0', 'c0f2544c-670f-4bf8-821a-54a17a5a648a', 'view', '{}', '217.199.144.39', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-29 12:47:26.109', NULL, '2026-04-29 12:47:26.136'),
('e0b5c42e-b514-4352-9043-c5981d3cfc92', 'c0f2544c-670f-4bf8-821a-54a17a5a648a', 'click', '{\"source\":\"product_card\"}', '217.199.144.39', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-29 12:47:44.357', NULL, '2026-04-29 12:47:44.375'),
('e8f63fed-17b9-41c1-9313-ec96b37a09c4', 'c0f2544c-670f-4bf8-821a-54a17a5a648a', 'view', '{}', '105.164.117.100', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-30 07:43:54.403', NULL, '2026-04-30 07:43:54.425'),
('ec3d11e2-0492-4387-a517-170eaa63dbc9', 'f491f4ce-8db2-4bd7-93b5-0882deeb9b08', 'click', '{\"source\":\"product_card\"}', '217.199.144.39', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-29 12:48:03.977', NULL, '2026-04-29 12:48:04.002'),
('ee4dc74e-c0d1-4c12-b0f9-40e1d78f371b', 'f491f4ce-8db2-4bd7-93b5-0882deeb9b08', 'view', '{}', '217.199.144.39', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-29 12:48:04.988', NULL, '2026-04-29 12:48:05.012'),
('ef4b5578-d05a-498a-a295-7e952bd1844b', 'f491f4ce-8db2-4bd7-93b5-0882deeb9b08', 'click', '{\"source\":\"product_card\"}', '217.199.144.39', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '2026-04-29 12:43:35.642', NULL, '2026-04-29 12:43:35.675'),
('f326f44b-a327-462c-a97e-fe2b39b0901b', 'e51b5275-8c0a-420e-90fc-7a8891a338df', 'click', '{\"source\":\"product_card\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-27 18:20:49.314', NULL, '2026-04-27 21:20:50.878'),
('f6b0695d-293e-49de-8dbd-aea7ee75cc91', 'e51b5275-8c0a-420e-90fc-7a8891a338df', 'view', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-27 18:22:42.521', NULL, '2026-04-27 21:22:42.806');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` varchar(191) NOT NULL,
  `product_id` varchar(191) NOT NULL,
  `url` varchar(191) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `url`, `sort_order`, `data_entrant`, `entry_date`) VALUES
('product-image-004b6a70d9a9a09dd3db180ab05bc80c', '2bf6e812-769e-4c48-9c07-d2cdfd70a16d', '/uploads/1777309911621-140d2774-photo-1516035069371-29a1b244cc32.jpg', 0, NULL, '2026-04-25 14:45:41.382'),
('product-image-130b1f50f913ed6975e2e2ec4e303b88', 'f491f4ce-8db2-4bd7-93b5-0882deeb9b08', '/uploads/1777466205745-a3348b3d-whatsapp-image-2026-04-28-at-12-12-10-pm-1.jpeg', 2, '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-29 12:36:59.994'),
('product-image-1f6cccba51dd1548a487f289f454f47f', 'f491f4ce-8db2-4bd7-93b5-0882deeb9b08', '/uploads/1777466206674-18a12ce0-whatsapp-image-2026-04-28-at-12-12-11-pm-1.jpeg', 1, '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-29 12:36:59.994'),
('product-image-21662631e583446de6144dce772958f0', 'c33b8fd1-72c2-4ada-adea-7ac1eec08a3d', '/uploads/1777466463309-ceb4b0b9-whatsapp-image-2026-04-27-at-6-36-28-am.jpeg', 4, '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-29 12:47:46.694'),
('product-image-25252e5e8085f28a4cd6a353b156b475', '78b333c9-0f8b-46f6-b7c4-5dbba504bcc7', '/uploads/1777310129633-2c2029e0-photo-1587202372775-e229f172b9d7.jpg', 0, NULL, '2026-04-25 14:45:41.382'),
('product-image-27f89eb2cb0cfbec5dada3412c006ca0', 'c33b8fd1-72c2-4ada-adea-7ac1eec08a3d', '/uploads/1777466848664-aa1cb265-whatsapp-image-2026-04-29-at-3-46-27-pm.jpeg', 2, '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-29 12:47:46.694'),
('product-image-30cbf36d871d8ed4aeb803d485f8f4e9', 'f491f4ce-8db2-4bd7-93b5-0882deeb9b08', '/uploads/1777466206954-9c5f2dbb-whatsapp-image-2026-04-28-at-12-12-11-pm.jpeg', 3, '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-29 12:36:59.994'),
('product-image-428ed37f393edca6ce17c631b3ee561f', '7d13ca78-3c4a-4e6b-ac87-1fc80f938efc', '/uploads/1777310030852-03219948-photo-1544244015-0df4b3ffc6b0.jpg', 0, NULL, '2026-04-25 14:45:41.382'),
('product-image-4e66b46298e85edf9b311238403d8e4c', 'db203226-8543-4ad2-806b-bca68db967c4', '/uploads/1777310295487-26c45231-photo-1593642632559-0c6d3fc62b89.jpg', 0, NULL, '2026-04-25 14:45:41.382'),
('product-image-52baa16e24a642b6c291aeda9448cb05', 'c5b90cab-64c8-4886-8375-0b44cfabb989', '/uploads/1777310074109-3c4a67d4-photo-1695048133142-1a20484d2569.jpg', 0, NULL, '2026-04-25 14:45:41.382'),
('product-image-6083d31ae6eac7235c3b9c1a359e913d', 'f491f4ce-8db2-4bd7-93b5-0882deeb9b08', '/uploads/1777466206376-3af90902-whatsapp-image-2026-04-28-at-12-12-10-pm.jpeg', 0, '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-29 12:36:59.994'),
('product-image-62e796a73cf796372f640043b46ce116', 'edaabff8-85ad-48f5-b096-c1a0ab609139', '/uploads/1777310267113-7a250c59-photo-1629131726692-1accd0c53ce0.jpg', 0, NULL, '2026-04-25 14:45:41.382'),
('product-image-6a6d462807863f07200c407df15c6395', 'f491f4ce-8db2-4bd7-93b5-0882deeb9b08', '/uploads/1777466207550-ed455d2c-whatsapp-image-2026-04-28-at-12-12-12-pm.jpeg', 5, '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-29 12:36:59.994'),
('product-image-798c45a8883491cc211ced422b426605', 'c33b8fd1-72c2-4ada-adea-7ac1eec08a3d', '/uploads/1777466846912-15148edb-whatsapp-image-2026-04-29-at-3-45-49-pm.jpeg', 0, '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-29 12:47:46.694'),
('product-image-7f26570ec58f4cf4c2f1989276cbc6a0', 'c0f2544c-670f-4bf8-821a-54a17a5a648a', '/uploads/1777310359274-9f52c851-1776545037162-fb5686d3-photo-1517336714731-489689fd1ca8.jpg', 0, NULL, '2026-04-25 14:45:41.382'),
('product-image-b4e1e68841ae2a24da4ac0ca56eb2c82', 'e51b5275-8c0a-420e-90fc-7a8891a338df', '/uploads/1777309579730-8a4e7838-1777294398883-fa6682d7-61wy9aaelsl.jpg', 0, NULL, '2026-04-25 14:45:41.382'),
('product-image-b8077253b917fae91153236765947e35', 'c33b8fd1-72c2-4ada-adea-7ac1eec08a3d', '/uploads/1777466848942-4dfceefe-whatsapp-image-2026-04-29-at-3-46-40-pm.jpeg', 1, '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-29 12:47:46.694'),
('product-image-b9852be7e1ee98c97227fa25639e64b3', '261f58ce-8d6b-43f5-a06f-913737080b32', '/uploads/1777309982573-93667a54-photo-1593359677879-a4bb92f829d1.jpg', 0, NULL, '2026-04-25 14:45:41.382'),
('product-image-c68404943cef32c497efeeefec39d07d', 'b3a029db-79b4-4da6-adac-100a6a043929', '/uploads/1777309931020-de618e53-1777292057264-38f7cb59-download.jpg', 0, '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-27 12:16:15.617'),
('product-image-c7035516d271eaf2d4ea281242581aad', 'd2353363-0eef-4435-8721-1e918a4f7b59', '/uploads/1777310223123-0afe0c00-photo-1593062096033-9a26b09da705.jpg', 0, NULL, '2026-04-25 14:45:41.382'),
('product-image-d1e7097789b8b36366fc4b82562e1868', 'c33b8fd1-72c2-4ada-adea-7ac1eec08a3d', '/uploads/1777466848077-4602a468-whatsapp-image-2026-04-29-at-3-45-49-pmjj.jpeg', 5, '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-29 12:47:46.694'),
('product-image-ebfb00abe9561dab470a4b78ebe4d47a', 'f879e596-09f6-4326-8880-9c9898a2f1be', '/uploads/1777310335901-d6acf2bb-photo-1588872657578-7efd1f1555ed.jpg', 0, NULL, '2026-04-25 14:45:41.382'),
('product-image-f507d0d33aba0c9236dc9c22ece11b8d', 'e51b5275-8c0a-420e-90fc-7a8891a338df', '/uploads/1777309580059-369cac17-1777304158381-e5d3781b-61wy9aaelsl.jpg', 1, NULL, '2026-04-25 14:45:41.382'),
('product-image-f5a64df9581c677a62e5e970f7e38c0a', 'f491f4ce-8db2-4bd7-93b5-0882deeb9b08', '/uploads/1777466207271-fe5ac855-whatsapp-image-2026-04-28-at-12-12-12-pm-1.jpeg', 4, '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-29 12:36:59.994'),
('product-image-fa82ba78384db986d27060fb2458b572', 'c33b8fd1-72c2-4ada-adea-7ac1eec08a3d', '/uploads/1777466848356-1c670359-whatsapp-image-2026-04-29-at-3-46-18-pm.jpeg', 3, '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-29 12:47:46.694');

-- --------------------------------------------------------

--
-- Table structure for table `product_sources`
--

CREATE TABLE `product_sources` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `type` enum('supplier','source','marketplace','walk_in','other') NOT NULL DEFAULT 'supplier',
  `contact_person` varchar(191) DEFAULT NULL,
  `phone` varchar(60) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `location` varchar(191) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by_admin_user_id` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_sources`
--

INSERT INTO `product_sources` (`id`, `name`, `type`, `contact_person`, `phone`, `email`, `location`, `notes`, `is_active`, `created_by_admin_user_id`, `created_at`, `updated_at`, `data_entrant`, `entry_date`) VALUES
('5674d4bd-b440-4070-90fb-e5a9ca20525c', 'Matthew Muthoka Nthilika', 'supplier', 'Matthew Muthoka Nthilika', '070000000', 'danielmutua104@gmail.com', 'Kimanthi street', 'Supplies cables', 1, '51ed4e51-41a8-11f1-9350-3464a92b0560', '2026-04-28 06:06:05.909', '2026-04-28 06:06:05.909', NULL, '2026-04-28 06:06:05.911'),
('e6022611-c3e0-46e9-9aad-fc4b0a64e7f3', 'Samuel Muthui', 'source', 'Samuel Muthui', '45156806', 'sameeeee1990@gmail.com', NULL, NULL, 1, NULL, '2026-04-26 15:40:39.226', '2026-04-26 15:40:39.226', NULL, '2026-04-26 18:40:39.806');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` varchar(191) NOT NULL,
  `product_id` varchar(191) NOT NULL,
  `customer_id` varchar(191) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text NOT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `specifications`
--

CREATE TABLE `specifications` (
  `id` char(36) NOT NULL,
  `subcategory_id` char(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `specifications`
--

INSERT INTO `specifications` (`id`, `subcategory_id`, `name`, `sort_order`, `is_active`, `created_at`, `data_entrant`, `entry_date`) VALUES
('47b6ce94-31f0-11f1-a5c8-3464a92b0560', '4738e014-31f0-11f1-a5c8-3464a92b0560', 'Operating System', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6d038-31f0-11f1-a5c8-3464a92b0560', '4738e014-31f0-11f1-a5c8-3464a92b0560', 'Screen Size', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6d12f-31f0-11f1-a5c8-3464a92b0560', '4738e014-31f0-11f1-a5c8-3464a92b0560', 'Storage', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6d228-31f0-11f1-a5c8-3464a92b0560', '4738e014-31f0-11f1-a5c8-3464a92b0560', 'RAM', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6d2d9-31f0-11f1-a5c8-3464a92b0560', '4738e014-31f0-11f1-a5c8-3464a92b0560', 'Processor', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6d4eb-31f0-11f1-a5c8-3464a92b0560', '4738e113-31f0-11f1-a5c8-3464a92b0560', 'Operating System', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6d5bb-31f0-11f1-a5c8-3464a92b0560', '4738e113-31f0-11f1-a5c8-3464a92b0560', 'Screen Size', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6d68d-31f0-11f1-a5c8-3464a92b0560', '4738e113-31f0-11f1-a5c8-3464a92b0560', 'Storage', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6d770-31f0-11f1-a5c8-3464a92b0560', '4738e113-31f0-11f1-a5c8-3464a92b0560', 'RAM', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6d832-31f0-11f1-a5c8-3464a92b0560', '4738e113-31f0-11f1-a5c8-3464a92b0560', 'Processor', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6d931-31f0-11f1-a5c8-3464a92b0560', '4738e147-31f0-11f1-a5c8-3464a92b0560', 'Operating System', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6d9f9-31f0-11f1-a5c8-3464a92b0560', '4738e147-31f0-11f1-a5c8-3464a92b0560', 'Screen Size', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6dacf-31f0-11f1-a5c8-3464a92b0560', '4738e147-31f0-11f1-a5c8-3464a92b0560', 'Storage', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6dbbb-31f0-11f1-a5c8-3464a92b0560', '4738e147-31f0-11f1-a5c8-3464a92b0560', 'RAM', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6dc76-31f0-11f1-a5c8-3464a92b0560', '4738e147-31f0-11f1-a5c8-3464a92b0560', 'Processor', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6dda8-31f0-11f1-a5c8-3464a92b0560', '4738e172-31f0-11f1-a5c8-3464a92b0560', 'Operating System', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6de8e-31f0-11f1-a5c8-3464a92b0560', '4738e172-31f0-11f1-a5c8-3464a92b0560', 'Screen Size', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6e4a9-31f0-11f1-a5c8-3464a92b0560', '4738e172-31f0-11f1-a5c8-3464a92b0560', 'Storage', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6ea9e-31f0-11f1-a5c8-3464a92b0560', '4738e172-31f0-11f1-a5c8-3464a92b0560', 'RAM', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6ec0c-31f0-11f1-a5c8-3464a92b0560', '4738e172-31f0-11f1-a5c8-3464a92b0560', 'Processor', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6edc5-31f0-11f1-a5c8-3464a92b0560', '4738e1b0-31f0-11f1-a5c8-3464a92b0560', 'Screen Size', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6ef7c-31f0-11f1-a5c8-3464a92b0560', '4738e1b0-31f0-11f1-a5c8-3464a92b0560', 'Graphics', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6f2ae-31f0-11f1-a5c8-3464a92b0560', '4738e1b0-31f0-11f1-a5c8-3464a92b0560', 'Storage', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6f406-31f0-11f1-a5c8-3464a92b0560', '4738e1b0-31f0-11f1-a5c8-3464a92b0560', 'RAM', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6f4f2-31f0-11f1-a5c8-3464a92b0560', '4738e1b0-31f0-11f1-a5c8-3464a92b0560', 'Processor', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6f692-31f0-11f1-a5c8-3464a92b0560', '4738e1de-31f0-11f1-a5c8-3464a92b0560', 'Operating System', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6f793-31f0-11f1-a5c8-3464a92b0560', '4738e1de-31f0-11f1-a5c8-3464a92b0560', 'Screen Size', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6f8be-31f0-11f1-a5c8-3464a92b0560', '4738e1de-31f0-11f1-a5c8-3464a92b0560', 'Storage', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6fa00-31f0-11f1-a5c8-3464a92b0560', '4738e1de-31f0-11f1-a5c8-3464a92b0560', 'RAM', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6faf0-31f0-11f1-a5c8-3464a92b0560', '4738e1de-31f0-11f1-a5c8-3464a92b0560', 'Processor', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6fcc8-31f0-11f1-a5c8-3464a92b0560', '4738e209-31f0-11f1-a5c8-3464a92b0560', 'Operating System', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6fdc4-31f0-11f1-a5c8-3464a92b0560', '4738e209-31f0-11f1-a5c8-3464a92b0560', 'Screen Size', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b6fefd-31f0-11f1-a5c8-3464a92b0560', '4738e209-31f0-11f1-a5c8-3464a92b0560', 'Storage', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b70050-31f0-11f1-a5c8-3464a92b0560', '4738e209-31f0-11f1-a5c8-3464a92b0560', 'RAM', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b70142-31f0-11f1-a5c8-3464a92b0560', '4738e209-31f0-11f1-a5c8-3464a92b0560', 'Processor', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b70222-31f0-11f1-a5c8-3464a92b0560', '4738e27f-31f0-11f1-a5c8-3464a92b0560', 'Connectivity', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b70374-31f0-11f1-a5c8-3464a92b0560', '4738e27f-31f0-11f1-a5c8-3464a92b0560', 'Storage', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b70426-31f0-11f1-a5c8-3464a92b0560', '4738e27f-31f0-11f1-a5c8-3464a92b0560', 'Resolution', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b70509-31f0-11f1-a5c8-3464a92b0560', '4738e2bc-31f0-11f1-a5c8-3464a92b0560', 'Connectivity', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b705b8-31f0-11f1-a5c8-3464a92b0560', '4738e2bc-31f0-11f1-a5c8-3464a92b0560', 'Night Vision', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b7067a-31f0-11f1-a5c8-3464a92b0560', '4738e2bc-31f0-11f1-a5c8-3464a92b0560', 'Resolution', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b7072a-31f0-11f1-a5c8-3464a92b0560', '4738e2bc-31f0-11f1-a5c8-3464a92b0560', 'Camera Type', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b7081d-31f0-11f1-a5c8-3464a92b0560', '4738e2e9-31f0-11f1-a5c8-3464a92b0560', 'Connectivity', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b709d3-31f0-11f1-a5c8-3464a92b0560', '4738e2e9-31f0-11f1-a5c8-3464a92b0560', 'Waterproof', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b70a8f-31f0-11f1-a5c8-3464a92b0560', '4738e2e9-31f0-11f1-a5c8-3464a92b0560', 'Video Quality', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b70b67-31f0-11f1-a5c8-3464a92b0560', '4738e2e9-31f0-11f1-a5c8-3464a92b0560', 'Resolution', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b70c95-31f0-11f1-a5c8-3464a92b0560', '4738e312-31f0-11f1-a5c8-3464a92b0560', 'Video Quality', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b70d90-31f0-11f1-a5c8-3464a92b0560', '4738e312-31f0-11f1-a5c8-3464a92b0560', 'Optical Zoom', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b70e6e-31f0-11f1-a5c8-3464a92b0560', '4738e312-31f0-11f1-a5c8-3464a92b0560', 'Resolution', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b70f69-31f0-11f1-a5c8-3464a92b0560', '4738e33f-31f0-11f1-a5c8-3464a92b0560', 'Video Quality', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b71025-31f0-11f1-a5c8-3464a92b0560', '4738e33f-31f0-11f1-a5c8-3464a92b0560', 'Lens Mount', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b71118-31f0-11f1-a5c8-3464a92b0560', '4738e33f-31f0-11f1-a5c8-3464a92b0560', 'Resolution', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b711cc-31f0-11f1-a5c8-3464a92b0560', '4738e33f-31f0-11f1-a5c8-3464a92b0560', 'Sensor Type', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b712ca-31f0-11f1-a5c8-3464a92b0560', '4738e379-31f0-11f1-a5c8-3464a92b0560', 'Video Quality', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b71384-31f0-11f1-a5c8-3464a92b0560', '4738e379-31f0-11f1-a5c8-3464a92b0560', 'Lens Mount', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b714bd-31f0-11f1-a5c8-3464a92b0560', '4738e379-31f0-11f1-a5c8-3464a92b0560', 'Resolution', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b7157e-31f0-11f1-a5c8-3464a92b0560', '4738e379-31f0-11f1-a5c8-3464a92b0560', 'Sensor Type', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b716a6-31f0-11f1-a5c8-3464a92b0560', '4738e3b8-31f0-11f1-a5c8-3464a92b0560', 'Operating System', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b717a9-31f0-11f1-a5c8-3464a92b0560', '4738e3b8-31f0-11f1-a5c8-3464a92b0560', 'Graphics', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b718af-31f0-11f1-a5c8-3464a92b0560', '4738e3b8-31f0-11f1-a5c8-3464a92b0560', 'Storage', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b719af-31f0-11f1-a5c8-3464a92b0560', '4738e3b8-31f0-11f1-a5c8-3464a92b0560', 'RAM', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b71aaf-31f0-11f1-a5c8-3464a92b0560', '4738e3b8-31f0-11f1-a5c8-3464a92b0560', 'Processor', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b71bf9-31f0-11f1-a5c8-3464a92b0560', '4738e3e5-31f0-11f1-a5c8-3464a92b0560', 'Operating System', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b71d11-31f0-11f1-a5c8-3464a92b0560', '4738e3e5-31f0-11f1-a5c8-3464a92b0560', 'Graphics', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b71e2d-31f0-11f1-a5c8-3464a92b0560', '4738e3e5-31f0-11f1-a5c8-3464a92b0560', 'Storage', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b71f41-31f0-11f1-a5c8-3464a92b0560', '4738e3e5-31f0-11f1-a5c8-3464a92b0560', 'RAM', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b7204e-31f0-11f1-a5c8-3464a92b0560', '4738e3e5-31f0-11f1-a5c8-3464a92b0560', 'Processor', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b72189-31f0-11f1-a5c8-3464a92b0560', '4738e410-31f0-11f1-a5c8-3464a92b0560', 'Operating System', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b722f1-31f0-11f1-a5c8-3464a92b0560', '4738e410-31f0-11f1-a5c8-3464a92b0560', 'Storage', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b7240b-31f0-11f1-a5c8-3464a92b0560', '4738e410-31f0-11f1-a5c8-3464a92b0560', 'RAM', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b724c5-31f0-11f1-a5c8-3464a92b0560', '4738e410-31f0-11f1-a5c8-3464a92b0560', 'Processor', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b7262f-31f0-11f1-a5c8-3464a92b0560', '4738e456-31f0-11f1-a5c8-3464a92b0560', 'Operating System', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b72843-31f0-11f1-a5c8-3464a92b0560', '4738e456-31f0-11f1-a5c8-3464a92b0560', 'Screen Size', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b7297e-31f0-11f1-a5c8-3464a92b0560', '4738e456-31f0-11f1-a5c8-3464a92b0560', 'Storage', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b72aaa-31f0-11f1-a5c8-3464a92b0560', '4738e456-31f0-11f1-a5c8-3464a92b0560', 'RAM', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b72baa-31f0-11f1-a5c8-3464a92b0560', '4738e456-31f0-11f1-a5c8-3464a92b0560', 'Processor', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b72d43-31f0-11f1-a5c8-3464a92b0560', '4738e481-31f0-11f1-a5c8-3464a92b0560', 'Operating System', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b72e64-31f0-11f1-a5c8-3464a92b0560', '4738e481-31f0-11f1-a5c8-3464a92b0560', 'Graphics', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b72f40-31f0-11f1-a5c8-3464a92b0560', '4738e481-31f0-11f1-a5c8-3464a92b0560', 'Storage', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b73079-31f0-11f1-a5c8-3464a92b0560', '4738e481-31f0-11f1-a5c8-3464a92b0560', 'RAM', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b73194-31f0-11f1-a5c8-3464a92b0560', '4738e481-31f0-11f1-a5c8-3464a92b0560', 'Processor', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b732a8-31f0-11f1-a5c8-3464a92b0560', '4738e4e7-31f0-11f1-a5c8-3464a92b0560', 'Smart TV', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b733cb-31f0-11f1-a5c8-3464a92b0560', '4738e4e7-31f0-11f1-a5c8-3464a92b0560', 'Resolution', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b73486-31f0-11f1-a5c8-3464a92b0560', '4738e4e7-31f0-11f1-a5c8-3464a92b0560', 'Screen Size', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b73565-31f0-11f1-a5c8-3464a92b0560', '4738e526-31f0-11f1-a5c8-3464a92b0560', 'Panel Type', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b7368d-31f0-11f1-a5c8-3464a92b0560', '4738e526-31f0-11f1-a5c8-3464a92b0560', 'Resolution', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b7374f-31f0-11f1-a5c8-3464a92b0560', '4738e526-31f0-11f1-a5c8-3464a92b0560', 'Screen Size', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b73836-31f0-11f1-a5c8-3464a92b0560', '4738e54e-31f0-11f1-a5c8-3464a92b0560', 'Type', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b738d4-31f0-11f1-a5c8-3464a92b0560', '4738e54e-31f0-11f1-a5c8-3464a92b0560', 'Runtime', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b73974-31f0-11f1-a5c8-3464a92b0560', '4738e54e-31f0-11f1-a5c8-3464a92b0560', 'Capacity', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b73a79-31f0-11f1-a5c8-3464a92b0560', '4738e57b-31f0-11f1-a5c8-3464a92b0560', 'Connectivity', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b73b23-31f0-11f1-a5c8-3464a92b0560', '4738e57b-31f0-11f1-a5c8-3464a92b0560', 'Brightness', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b73c5a-31f0-11f1-a5c8-3464a92b0560', '4738e57b-31f0-11f1-a5c8-3464a92b0560', 'Resolution', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b73d7d-31f0-11f1-a5c8-3464a92b0560', '4738e5a6-31f0-11f1-a5c8-3464a92b0560', 'Paper Size', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b73e35-31f0-11f1-a5c8-3464a92b0560', '4738e5a6-31f0-11f1-a5c8-3464a92b0560', 'Print Color', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b73ee3-31f0-11f1-a5c8-3464a92b0560', '4738e5a6-31f0-11f1-a5c8-3464a92b0560', 'Copy Type', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b73fda-31f0-11f1-a5c8-3464a92b0560', '4738e5e3-31f0-11f1-a5c8-3464a92b0560', 'Paper Size', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b740cd-31f0-11f1-a5c8-3464a92b0560', '4738e5e3-31f0-11f1-a5c8-3464a92b0560', 'Connectivity', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b7417e-31f0-11f1-a5c8-3464a92b0560', '4738e5e3-31f0-11f1-a5c8-3464a92b0560', 'Scanner Type', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b7426a-31f0-11f1-a5c8-3464a92b0560', '4738e610-31f0-11f1-a5c8-3464a92b0560', 'Paper Size', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b7435b-31f0-11f1-a5c8-3464a92b0560', '4738e610-31f0-11f1-a5c8-3464a92b0560', 'Connectivity', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b74413-31f0-11f1-a5c8-3464a92b0560', '4738e610-31f0-11f1-a5c8-3464a92b0560', 'Print Color', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b744c1-31f0-11f1-a5c8-3464a92b0560', '4738e610-31f0-11f1-a5c8-3464a92b0560', 'Printer Type', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b7461f-31f0-11f1-a5c8-3464a92b0560', '4738e676-31f0-11f1-a5c8-3464a92b0560', 'Operating System', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b74719-31f0-11f1-a5c8-3464a92b0560', '4738e676-31f0-11f1-a5c8-3464a92b0560', 'Connectivity', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b74824-31f0-11f1-a5c8-3464a92b0560', '4738e676-31f0-11f1-a5c8-3464a92b0560', 'Screen Size', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b74959-31f0-11f1-a5c8-3464a92b0560', '4738e676-31f0-11f1-a5c8-3464a92b0560', 'RAM', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b74a33-31f0-11f1-a5c8-3464a92b0560', '4738e676-31f0-11f1-a5c8-3464a92b0560', 'Storage', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b74b84-31f0-11f1-a5c8-3464a92b0560', '4738e6b3-31f0-11f1-a5c8-3464a92b0560', 'Operating System', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b74c96-31f0-11f1-a5c8-3464a92b0560', '4738e6b3-31f0-11f1-a5c8-3464a92b0560', 'Connectivity', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b74d93-31f0-11f1-a5c8-3464a92b0560', '4738e6b3-31f0-11f1-a5c8-3464a92b0560', 'Screen Size', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b74e9d-31f0-11f1-a5c8-3464a92b0560', '4738e6b3-31f0-11f1-a5c8-3464a92b0560', 'RAM', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b74f9d-31f0-11f1-a5c8-3464a92b0560', '4738e6b3-31f0-11f1-a5c8-3464a92b0560', 'Storage', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b750af-31f0-11f1-a5c8-3464a92b0560', '4738e6dd-31f0-11f1-a5c8-3464a92b0560', 'Operating System', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b7514f-31f0-11f1-a5c8-3464a92b0560', '4738e6dd-31f0-11f1-a5c8-3464a92b0560', 'Network', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b75228-31f0-11f1-a5c8-3464a92b0560', '4738e6dd-31f0-11f1-a5c8-3464a92b0560', 'Screen Size', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b75334-31f0-11f1-a5c8-3464a92b0560', '4738e6dd-31f0-11f1-a5c8-3464a92b0560', 'RAM', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b7542a-31f0-11f1-a5c8-3464a92b0560', '4738e6dd-31f0-11f1-a5c8-3464a92b0560', 'Storage', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b755be-31f0-11f1-a5c8-3464a92b0560', '4738e70e-31f0-11f1-a5c8-3464a92b0560', 'Operating System', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b75693-31f0-11f1-a5c8-3464a92b0560', '4738e70e-31f0-11f1-a5c8-3464a92b0560', 'Network', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b757a3-31f0-11f1-a5c8-3464a92b0560', '4738e70e-31f0-11f1-a5c8-3464a92b0560', 'Screen Size', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b758c5-31f0-11f1-a5c8-3464a92b0560', '4738e70e-31f0-11f1-a5c8-3464a92b0560', 'RAM', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456'),
('47b759da-31f0-11f1-a5c8-3464a92b0560', '4738e70e-31f0-11f1-a5c8-3464a92b0560', 'Storage', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.456');

-- --------------------------------------------------------

--
-- Table structure for table `specification_values`
--

CREATE TABLE `specification_values` (
  `id` char(36) NOT NULL,
  `specification_id` char(36) NOT NULL,
  `value` varchar(191) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `specification_values`
--

INSERT INTO `specification_values` (`id`, `specification_id`, `value`, `sort_order`, `is_active`, `created_at`, `data_entrant`, `entry_date`) VALUES
('0007e70d-3cbb-4434-b8ce-825d206f8546', '47b74e9d-31f0-11f1-a5c8-3464a92b0560', '8GB', 1, 1, '2026-04-29 13:09:57', NULL, '2026-04-29 13:09:57.850'),
('031273bb-77f6-4221-86bd-292f4ba236ad', '47b72aaa-31f0-11f1-a5c8-3464a92b0560', '64GB', 7, 1, '2026-04-29 13:08:40', NULL, '2026-04-29 13:08:40.374'),
('03f13dd0-7f41-43dd-bb37-19fb8943db87', '47b6f406-31f0-11f1-a5c8-3464a92b0560', '64GB', 7, 1, '2026-04-29 13:02:22', NULL, '2026-04-29 13:02:22.848'),
('040a0068-b034-4ba5-be9d-c9a334a32dac', '47b74e9d-31f0-11f1-a5c8-3464a92b0560', '4GB', 0, 1, '2026-04-29 13:09:57', NULL, '2026-04-29 13:09:57.850'),
('099499f7-0ac9-4439-b36d-0f851f576246', '47b70050-31f0-11f1-a5c8-3464a92b0560', '16GB', 5, 1, '2026-04-29 13:01:11', NULL, '2026-04-29 13:01:11.959'),
('09ada363-61ea-43b5-a50f-d0fa595a38e1', '47b6dbbb-31f0-11f1-a5c8-3464a92b0560', '16GB', 5, 1, '2026-04-29 13:05:33', NULL, '2026-04-29 13:05:33.505'),
('0acf5cd2-875c-472a-8c20-138835336446', '47b6d228-31f0-11f1-a5c8-3464a92b0560', '6GB', 1, 1, '2026-04-29 13:06:49', NULL, '2026-04-29 13:06:49.907'),
('0ea0f118-3bbc-4fad-9e69-fbec19abd8cb', '47b6d770-31f0-11f1-a5c8-3464a92b0560', '32GB', 6, 1, '2026-04-29 13:03:35', NULL, '2026-04-29 13:03:35.085'),
('0ef86173-2d5f-4269-8f0d-fd26af98d12d', '47b70050-31f0-11f1-a5c8-3464a92b0560', '8GB', 2, 1, '2026-04-29 13:01:11', NULL, '2026-04-29 13:01:11.954'),
('13962f7d-8e9f-4112-acbd-961bbd49c001', '47b74959-31f0-11f1-a5c8-3464a92b0560', '8GB', 2, 1, '2026-04-29 13:05:02', NULL, '2026-04-29 13:05:02.978'),
('16e46d66-415b-492d-84c8-10ddb3394674', '47b72aaa-31f0-11f1-a5c8-3464a92b0560', '32GB', 6, 1, '2026-04-29 13:08:40', NULL, '2026-04-29 13:08:40.374'),
('16e8c106-bc7d-43f3-a851-981f8a3188ef', '47b6dbbb-31f0-11f1-a5c8-3464a92b0560', '64GB', 7, 1, '2026-04-29 13:05:33', NULL, '2026-04-29 13:05:33.506'),
('17875ae7-3e46-4b8a-badb-f3c55b126278', '47b6d228-31f0-11f1-a5c8-3464a92b0560', '4GB', 0, 1, '2026-04-29 13:06:49', NULL, '2026-04-29 13:06:49.907'),
('1af60da1-c111-47ee-a4fb-899cc3b51169', '47b6fa00-31f0-11f1-a5c8-3464a92b0560', '8GB', 2, 1, '2026-04-29 13:01:33', NULL, '2026-04-29 13:01:33.849'),
('1f8df45e-cc73-41b2-8b7f-60920d00c6f2', '47b6ea9e-31f0-11f1-a5c8-3464a92b0560', '14GB', 4, 1, '2026-04-29 13:06:07', NULL, '2026-04-29 13:06:07.399'),
('207bd5ab-c7a0-41cb-8257-b8d0519b8064', '47b74959-31f0-11f1-a5c8-3464a92b0560', '64GB', 7, 1, '2026-04-29 13:05:02', NULL, '2026-04-29 13:05:02.979'),
('23245b57-a573-446f-bfc3-f9778c0dd214', '47b6d770-31f0-11f1-a5c8-3464a92b0560', '4GB', 0, 1, '2026-04-29 13:03:35', NULL, '2026-04-29 13:03:35.070'),
('2648d8aa-df5b-4e5e-a94b-c0a1fbcf4e4a', '47b6ea9e-31f0-11f1-a5c8-3464a92b0560', '4GB', 0, 1, '2026-04-29 13:06:07', NULL, '2026-04-29 13:06:07.398'),
('29040b53-43a7-443d-a4e0-fb6ef287d64f', '47b74959-31f0-11f1-a5c8-3464a92b0560', '4GB', 0, 1, '2026-04-29 13:05:02', NULL, '2026-04-29 13:05:02.977'),
('2b29fc10-0640-48e8-8c20-1062bc8a92c0', '47b6fa00-31f0-11f1-a5c8-3464a92b0560', '16GB', 5, 1, '2026-04-29 13:01:33', NULL, '2026-04-29 13:01:33.850'),
('2cb578de-e990-4e22-8b68-cfc422863ec1', '47b6d228-31f0-11f1-a5c8-3464a92b0560', '32GB', 6, 1, '2026-04-29 13:06:49', NULL, '2026-04-29 13:06:49.908'),
('2d7bc1ee-d8d8-49bf-82d3-d7509b7cd29c', '47b6f406-31f0-11f1-a5c8-3464a92b0560', '6GB', 1, 1, '2026-04-29 13:02:22', NULL, '2026-04-29 13:02:22.846'),
('2dd23d36-ae12-4a09-b493-7450482c4762', '47b6dbbb-31f0-11f1-a5c8-3464a92b0560', '14GB', 4, 1, '2026-04-29 13:05:33', NULL, '2026-04-29 13:05:33.505'),
('2ecae82d-0c71-4b92-bdf8-b6c8c8b49554', '47b74e9d-31f0-11f1-a5c8-3464a92b0560', '64GB', 4, 1, '2026-04-29 13:09:57', NULL, '2026-04-29 13:09:57.852'),
('2f5990fc-41bd-4900-b311-eff5648df3f6', '47b719af-31f0-11f1-a5c8-3464a92b0560', '16GB', 5, 1, '2026-04-29 13:11:37', NULL, '2026-04-29 13:11:37.092'),
('372d4cbf-096e-47d4-b269-3187c224911d', '47b6dbbb-31f0-11f1-a5c8-3464a92b0560', '4GB', 0, 1, '2026-04-29 13:05:33', NULL, '2026-04-29 13:05:33.504'),
('37e14126-7568-4cff-8cae-c7de92158bfb', '47b74959-31f0-11f1-a5c8-3464a92b0560', '6GB', 1, 1, '2026-04-29 13:05:02', NULL, '2026-04-29 13:05:02.978'),
('3fa3ae29-c3d6-4b8f-9c63-f51b894c086a', '47b7240b-31f0-11f1-a5c8-3464a92b0560', '64GB', 7, 1, '2026-04-29 13:09:20', NULL, '2026-04-29 13:09:20.854'),
('44ab2e3d-7e46-4826-b23a-8763b0181c39', '47b6fa00-31f0-11f1-a5c8-3464a92b0560', '4GB', 0, 1, '2026-04-29 13:01:33', NULL, '2026-04-29 13:01:33.849'),
('4592a07b-e5ed-45db-8f93-c1ca6a0adb54', '47b71f41-31f0-11f1-a5c8-3464a92b0560', '8GB', 2, 1, '2026-04-29 13:10:38', NULL, '2026-04-29 13:10:38.634'),
('47d3e599-31f0-11f1-a5c8-3464a92b0560', '47b6d2d9-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i3', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3e5f4-31f0-11f1-a5c8-3464a92b0560', '47b6d2d9-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i5', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3e637-31f0-11f1-a5c8-3464a92b0560', '47b6d2d9-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i7', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3e67d-31f0-11f1-a5c8-3464a92b0560', '47b6d2d9-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i9', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3e6a9-31f0-11f1-a5c8-3464a92b0560', '47b6d2d9-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 3', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3e6dd-31f0-11f1-a5c8-3464a92b0560', '47b6d2d9-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 5', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3e717-31f0-11f1-a5c8-3464a92b0560', '47b6d2d9-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 7', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3e75b-31f0-11f1-a5c8-3464a92b0560', '47b6d2d9-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 9', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3e795-31f0-11f1-a5c8-3464a92b0560', '47b6d2d9-31f0-11f1-a5c8-3464a92b0560', 'Apple M1', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3e7d7-31f0-11f1-a5c8-3464a92b0560', '47b6d2d9-31f0-11f1-a5c8-3464a92b0560', 'Apple M2', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3e81f-31f0-11f1-a5c8-3464a92b0560', '47b6d2d9-31f0-11f1-a5c8-3464a92b0560', 'Apple M3', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3e86e-31f0-11f1-a5c8-3464a92b0560', '47b6d2d9-31f0-11f1-a5c8-3464a92b0560', 'Apple M4', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3e8e6-31f0-11f1-a5c8-3464a92b0560', '47b6d832-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i3', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3e929-31f0-11f1-a5c8-3464a92b0560', '47b6d832-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i5', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3e963-31f0-11f1-a5c8-3464a92b0560', '47b6d832-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i7', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3e99d-31f0-11f1-a5c8-3464a92b0560', '47b6d832-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i9', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3e9ce-31f0-11f1-a5c8-3464a92b0560', '47b6d832-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 3', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ea01-31f0-11f1-a5c8-3464a92b0560', '47b6d832-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 5', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ea2d-31f0-11f1-a5c8-3464a92b0560', '47b6d832-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 7', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ea60-31f0-11f1-a5c8-3464a92b0560', '47b6d832-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 9', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ea9b-31f0-11f1-a5c8-3464a92b0560', '47b6d832-31f0-11f1-a5c8-3464a92b0560', 'Apple M1', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ead6-31f0-11f1-a5c8-3464a92b0560', '47b6d832-31f0-11f1-a5c8-3464a92b0560', 'Apple M2', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3eb18-31f0-11f1-a5c8-3464a92b0560', '47b6d832-31f0-11f1-a5c8-3464a92b0560', 'Apple M3', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3eb5b-31f0-11f1-a5c8-3464a92b0560', '47b6d832-31f0-11f1-a5c8-3464a92b0560', 'Apple M4', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ebbd-31f0-11f1-a5c8-3464a92b0560', '47b6dc76-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i3', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ebf6-31f0-11f1-a5c8-3464a92b0560', '47b6dc76-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i5', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ec26-31f0-11f1-a5c8-3464a92b0560', '47b6dc76-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i7', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ec68-31f0-11f1-a5c8-3464a92b0560', '47b6dc76-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i9', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ec98-31f0-11f1-a5c8-3464a92b0560', '47b6dc76-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 3', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ecd0-31f0-11f1-a5c8-3464a92b0560', '47b6dc76-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 5', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ecff-31f0-11f1-a5c8-3464a92b0560', '47b6dc76-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 7', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ed3e-31f0-11f1-a5c8-3464a92b0560', '47b6dc76-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 9', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ed6e-31f0-11f1-a5c8-3464a92b0560', '47b6dc76-31f0-11f1-a5c8-3464a92b0560', 'Apple M1', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3edad-31f0-11f1-a5c8-3464a92b0560', '47b6dc76-31f0-11f1-a5c8-3464a92b0560', 'Apple M2', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3edea-31f0-11f1-a5c8-3464a92b0560', '47b6dc76-31f0-11f1-a5c8-3464a92b0560', 'Apple M3', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ee19-31f0-11f1-a5c8-3464a92b0560', '47b6dc76-31f0-11f1-a5c8-3464a92b0560', 'Apple M4', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ee80-31f0-11f1-a5c8-3464a92b0560', '47b6ec0c-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i3', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3eeb5-31f0-11f1-a5c8-3464a92b0560', '47b6ec0c-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i5', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ef1b-31f0-11f1-a5c8-3464a92b0560', '47b6ec0c-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i7', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ef53-31f0-11f1-a5c8-3464a92b0560', '47b6ec0c-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i9', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ef88-31f0-11f1-a5c8-3464a92b0560', '47b6ec0c-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 3', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3efbb-31f0-11f1-a5c8-3464a92b0560', '47b6ec0c-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 5', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3efee-31f0-11f1-a5c8-3464a92b0560', '47b6ec0c-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 7', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f02c-31f0-11f1-a5c8-3464a92b0560', '47b6ec0c-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 9', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f05f-31f0-11f1-a5c8-3464a92b0560', '47b6ec0c-31f0-11f1-a5c8-3464a92b0560', 'Apple M1', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f093-31f0-11f1-a5c8-3464a92b0560', '47b6ec0c-31f0-11f1-a5c8-3464a92b0560', 'Apple M2', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f0d7-31f0-11f1-a5c8-3464a92b0560', '47b6ec0c-31f0-11f1-a5c8-3464a92b0560', 'Apple M3', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f10a-31f0-11f1-a5c8-3464a92b0560', '47b6ec0c-31f0-11f1-a5c8-3464a92b0560', 'Apple M4', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f176-31f0-11f1-a5c8-3464a92b0560', '47b6f4f2-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i3', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f1af-31f0-11f1-a5c8-3464a92b0560', '47b6f4f2-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i5', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f1e7-31f0-11f1-a5c8-3464a92b0560', '47b6f4f2-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i7', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f21e-31f0-11f1-a5c8-3464a92b0560', '47b6f4f2-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i9', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f255-31f0-11f1-a5c8-3464a92b0560', '47b6f4f2-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 3', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f28c-31f0-11f1-a5c8-3464a92b0560', '47b6f4f2-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 5', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f2c3-31f0-11f1-a5c8-3464a92b0560', '47b6f4f2-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 7', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f307-31f0-11f1-a5c8-3464a92b0560', '47b6f4f2-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 9', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f33d-31f0-11f1-a5c8-3464a92b0560', '47b6f4f2-31f0-11f1-a5c8-3464a92b0560', 'Apple M1', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f373-31f0-11f1-a5c8-3464a92b0560', '47b6f4f2-31f0-11f1-a5c8-3464a92b0560', 'Apple M2', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f3be-31f0-11f1-a5c8-3464a92b0560', '47b6f4f2-31f0-11f1-a5c8-3464a92b0560', 'Apple M3', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f3f3-31f0-11f1-a5c8-3464a92b0560', '47b6f4f2-31f0-11f1-a5c8-3464a92b0560', 'Apple M4', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f462-31f0-11f1-a5c8-3464a92b0560', '47b6faf0-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i3', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f49e-31f0-11f1-a5c8-3464a92b0560', '47b6faf0-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i5', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f4d9-31f0-11f1-a5c8-3464a92b0560', '47b6faf0-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i7', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f514-31f0-11f1-a5c8-3464a92b0560', '47b6faf0-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i9', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f54f-31f0-11f1-a5c8-3464a92b0560', '47b6faf0-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 3', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f589-31f0-11f1-a5c8-3464a92b0560', '47b6faf0-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 5', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f5f9-31f0-11f1-a5c8-3464a92b0560', '47b6faf0-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 7', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f647-31f0-11f1-a5c8-3464a92b0560', '47b6faf0-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 9', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f682-31f0-11f1-a5c8-3464a92b0560', '47b6faf0-31f0-11f1-a5c8-3464a92b0560', 'Apple M1', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f6bc-31f0-11f1-a5c8-3464a92b0560', '47b6faf0-31f0-11f1-a5c8-3464a92b0560', 'Apple M2', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f70f-31f0-11f1-a5c8-3464a92b0560', '47b6faf0-31f0-11f1-a5c8-3464a92b0560', 'Apple M3', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f749-31f0-11f1-a5c8-3464a92b0560', '47b6faf0-31f0-11f1-a5c8-3464a92b0560', 'Apple M4', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f7b3-31f0-11f1-a5c8-3464a92b0560', '47b70142-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i3', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f7f2-31f0-11f1-a5c8-3464a92b0560', '47b70142-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i5', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f830-31f0-11f1-a5c8-3464a92b0560', '47b70142-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i7', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f86d-31f0-11f1-a5c8-3464a92b0560', '47b70142-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i9', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f8a1-31f0-11f1-a5c8-3464a92b0560', '47b70142-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 3', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f8d4-31f0-11f1-a5c8-3464a92b0560', '47b70142-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 5', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f907-31f0-11f1-a5c8-3464a92b0560', '47b70142-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 7', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f96f-31f0-11f1-a5c8-3464a92b0560', '47b70142-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 9', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f9a3-31f0-11f1-a5c8-3464a92b0560', '47b70142-31f0-11f1-a5c8-3464a92b0560', 'Apple M1', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3f9df-31f0-11f1-a5c8-3464a92b0560', '47b70142-31f0-11f1-a5c8-3464a92b0560', 'Apple M2', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3fa37-31f0-11f1-a5c8-3464a92b0560', '47b70142-31f0-11f1-a5c8-3464a92b0560', 'Apple M3', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3fa74-31f0-11f1-a5c8-3464a92b0560', '47b70142-31f0-11f1-a5c8-3464a92b0560', 'Apple M4', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3fba5-31f0-11f1-a5c8-3464a92b0560', '47b71aaf-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i3', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3fbe8-31f0-11f1-a5c8-3464a92b0560', '47b71aaf-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i5', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3fc1c-31f0-11f1-a5c8-3464a92b0560', '47b71aaf-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i7', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3fc5d-31f0-11f1-a5c8-3464a92b0560', '47b71aaf-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i9', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3fc91-31f0-11f1-a5c8-3464a92b0560', '47b71aaf-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 3', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3fcc4-31f0-11f1-a5c8-3464a92b0560', '47b71aaf-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 5', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3fcf6-31f0-11f1-a5c8-3464a92b0560', '47b71aaf-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 7', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3fd4e-31f0-11f1-a5c8-3464a92b0560', '47b71aaf-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 9', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3fd95-31f0-11f1-a5c8-3464a92b0560', '47b71aaf-31f0-11f1-a5c8-3464a92b0560', 'Apple M1', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3fdd8-31f0-11f1-a5c8-3464a92b0560', '47b71aaf-31f0-11f1-a5c8-3464a92b0560', 'Apple M2', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3fe37-31f0-11f1-a5c8-3464a92b0560', '47b71aaf-31f0-11f1-a5c8-3464a92b0560', 'Apple M3', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3fe6a-31f0-11f1-a5c8-3464a92b0560', '47b71aaf-31f0-11f1-a5c8-3464a92b0560', 'Apple M4', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3fed5-31f0-11f1-a5c8-3464a92b0560', '47b7204e-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i3', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ff0c-31f0-11f1-a5c8-3464a92b0560', '47b7204e-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i5', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ff43-31f0-11f1-a5c8-3464a92b0560', '47b7204e-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i7', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ff88-31f0-11f1-a5c8-3464a92b0560', '47b7204e-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i9', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3ffbf-31f0-11f1-a5c8-3464a92b0560', '47b7204e-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 3', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d3fff7-31f0-11f1-a5c8-3464a92b0560', '47b7204e-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 5', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d4002e-31f0-11f1-a5c8-3464a92b0560', '47b7204e-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 7', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d4008d-31f0-11f1-a5c8-3464a92b0560', '47b7204e-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 9', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d400c4-31f0-11f1-a5c8-3464a92b0560', '47b7204e-31f0-11f1-a5c8-3464a92b0560', 'Apple M1', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d4010f-31f0-11f1-a5c8-3464a92b0560', '47b7204e-31f0-11f1-a5c8-3464a92b0560', 'Apple M2', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d40177-31f0-11f1-a5c8-3464a92b0560', '47b7204e-31f0-11f1-a5c8-3464a92b0560', 'Apple M3', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d401ae-31f0-11f1-a5c8-3464a92b0560', '47b7204e-31f0-11f1-a5c8-3464a92b0560', 'Apple M4', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d40210-31f0-11f1-a5c8-3464a92b0560', '47b724c5-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i3', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d40249-31f0-11f1-a5c8-3464a92b0560', '47b724c5-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i5', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d4027f-31f0-11f1-a5c8-3464a92b0560', '47b724c5-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i7', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d402b6-31f0-11f1-a5c8-3464a92b0560', '47b724c5-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i9', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d402ed-31f0-11f1-a5c8-3464a92b0560', '47b724c5-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 3', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d40324-31f0-11f1-a5c8-3464a92b0560', '47b724c5-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 5', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d40359-31f0-11f1-a5c8-3464a92b0560', '47b724c5-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 7', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d403c0-31f0-11f1-a5c8-3464a92b0560', '47b724c5-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 9', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d403f6-31f0-11f1-a5c8-3464a92b0560', '47b724c5-31f0-11f1-a5c8-3464a92b0560', 'Apple M1', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d4042c-31f0-11f1-a5c8-3464a92b0560', '47b724c5-31f0-11f1-a5c8-3464a92b0560', 'Apple M2', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d4049a-31f0-11f1-a5c8-3464a92b0560', '47b724c5-31f0-11f1-a5c8-3464a92b0560', 'Apple M3', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d404e5-31f0-11f1-a5c8-3464a92b0560', '47b724c5-31f0-11f1-a5c8-3464a92b0560', 'Apple M4', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d4054d-31f0-11f1-a5c8-3464a92b0560', '47b72baa-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i3', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d40588-31f0-11f1-a5c8-3464a92b0560', '47b72baa-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i5', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d405c3-31f0-11f1-a5c8-3464a92b0560', '47b72baa-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i7', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d405fd-31f0-11f1-a5c8-3464a92b0560', '47b72baa-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i9', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d40638-31f0-11f1-a5c8-3464a92b0560', '47b72baa-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 3', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d40672-31f0-11f1-a5c8-3464a92b0560', '47b72baa-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 5', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d406ac-31f0-11f1-a5c8-3464a92b0560', '47b72baa-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 7', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d4071d-31f0-11f1-a5c8-3464a92b0560', '47b72baa-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 9', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d40758-31f0-11f1-a5c8-3464a92b0560', '47b72baa-31f0-11f1-a5c8-3464a92b0560', 'Apple M1', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d40791-31f0-11f1-a5c8-3464a92b0560', '47b72baa-31f0-11f1-a5c8-3464a92b0560', 'Apple M2', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d407e4-31f0-11f1-a5c8-3464a92b0560', '47b72baa-31f0-11f1-a5c8-3464a92b0560', 'Apple M3', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d4081f-31f0-11f1-a5c8-3464a92b0560', '47b72baa-31f0-11f1-a5c8-3464a92b0560', 'Apple M4', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d408ad-31f0-11f1-a5c8-3464a92b0560', '47b73194-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i3', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d408ea-31f0-11f1-a5c8-3464a92b0560', '47b73194-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i5', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d40925-31f0-11f1-a5c8-3464a92b0560', '47b73194-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i7', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d40961-31f0-11f1-a5c8-3464a92b0560', '47b73194-31f0-11f1-a5c8-3464a92b0560', 'Intel Core i9', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d4099c-31f0-11f1-a5c8-3464a92b0560', '47b73194-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 3', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d409d3-31f0-11f1-a5c8-3464a92b0560', '47b73194-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 5', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d40a09-31f0-11f1-a5c8-3464a92b0560', '47b73194-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 7', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d40a55-31f0-11f1-a5c8-3464a92b0560', '47b73194-31f0-11f1-a5c8-3464a92b0560', 'AMD Ryzen 9', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d40a8f-31f0-11f1-a5c8-3464a92b0560', '47b73194-31f0-11f1-a5c8-3464a92b0560', 'Apple M1', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d40ac8-31f0-11f1-a5c8-3464a92b0560', '47b73194-31f0-11f1-a5c8-3464a92b0560', 'Apple M2', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d40b1a-31f0-11f1-a5c8-3464a92b0560', '47b73194-31f0-11f1-a5c8-3464a92b0560', 'Apple M3', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47d40b54-31f0-11f1-a5c8-3464a92b0560', '47b73194-31f0-11f1-a5c8-3464a92b0560', 'Apple M4', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ddaf93-31f0-11f1-a5c8-3464a92b0560', '47b75334-31f0-11f1-a5c8-3464a92b0560', '4GB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ddaffd-31f0-11f1-a5c8-3464a92b0560', '47b75334-31f0-11f1-a5c8-3464a92b0560', '8GB', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ddb094-31f0-11f1-a5c8-3464a92b0560', '47b75334-31f0-11f1-a5c8-3464a92b0560', '16GB', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ddb134-31f0-11f1-a5c8-3464a92b0560', '47b75334-31f0-11f1-a5c8-3464a92b0560', '32GB', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ddb189-31f0-11f1-a5c8-3464a92b0560', '47b75334-31f0-11f1-a5c8-3464a92b0560', '64GB', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ddb226-31f0-11f1-a5c8-3464a92b0560', '47b758c5-31f0-11f1-a5c8-3464a92b0560', '4GB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ddb27d-31f0-11f1-a5c8-3464a92b0560', '47b758c5-31f0-11f1-a5c8-3464a92b0560', '8GB', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ddb31d-31f0-11f1-a5c8-3464a92b0560', '47b758c5-31f0-11f1-a5c8-3464a92b0560', '16GB', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ddb3c2-31f0-11f1-a5c8-3464a92b0560', '47b758c5-31f0-11f1-a5c8-3464a92b0560', '32GB', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ddb41a-31f0-11f1-a5c8-3464a92b0560', '47b758c5-31f0-11f1-a5c8-3464a92b0560', '64GB', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea56d7-31f0-11f1-a5c8-3464a92b0560', '47b6d12f-31f0-11f1-a5c8-3464a92b0560', '64GB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea579e-31f0-11f1-a5c8-3464a92b0560', '47b6d12f-31f0-11f1-a5c8-3464a92b0560', '128GB', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea57f5-31f0-11f1-a5c8-3464a92b0560', '47b6d12f-31f0-11f1-a5c8-3464a92b0560', '256GB SSD', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea584a-31f0-11f1-a5c8-3464a92b0560', '47b6d12f-31f0-11f1-a5c8-3464a92b0560', '512GB SSD', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea589f-31f0-11f1-a5c8-3464a92b0560', '47b6d12f-31f0-11f1-a5c8-3464a92b0560', '1TB SSD', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea58f8-31f0-11f1-a5c8-3464a92b0560', '47b6d12f-31f0-11f1-a5c8-3464a92b0560', '2TB SSD', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea5935-31f0-11f1-a5c8-3464a92b0560', '47b6d12f-31f0-11f1-a5c8-3464a92b0560', '500GB HDD', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea597a-31f0-11f1-a5c8-3464a92b0560', '47b6d12f-31f0-11f1-a5c8-3464a92b0560', '1TB HDD', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea59c4-31f0-11f1-a5c8-3464a92b0560', '47b6d12f-31f0-11f1-a5c8-3464a92b0560', '2TB HDD', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea5a58-31f0-11f1-a5c8-3464a92b0560', '47b6d68d-31f0-11f1-a5c8-3464a92b0560', '64GB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea5aa5-31f0-11f1-a5c8-3464a92b0560', '47b6d68d-31f0-11f1-a5c8-3464a92b0560', '128GB', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea5aef-31f0-11f1-a5c8-3464a92b0560', '47b6d68d-31f0-11f1-a5c8-3464a92b0560', '256GB SSD', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea5b3f-31f0-11f1-a5c8-3464a92b0560', '47b6d68d-31f0-11f1-a5c8-3464a92b0560', '512GB SSD', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea5b93-31f0-11f1-a5c8-3464a92b0560', '47b6d68d-31f0-11f1-a5c8-3464a92b0560', '1TB SSD', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea5bec-31f0-11f1-a5c8-3464a92b0560', '47b6d68d-31f0-11f1-a5c8-3464a92b0560', '2TB SSD', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea5c32-31f0-11f1-a5c8-3464a92b0560', '47b6d68d-31f0-11f1-a5c8-3464a92b0560', '500GB HDD', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea5c78-31f0-11f1-a5c8-3464a92b0560', '47b6d68d-31f0-11f1-a5c8-3464a92b0560', '1TB HDD', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea5cc6-31f0-11f1-a5c8-3464a92b0560', '47b6d68d-31f0-11f1-a5c8-3464a92b0560', '2TB HDD', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea5d4f-31f0-11f1-a5c8-3464a92b0560', '47b6dacf-31f0-11f1-a5c8-3464a92b0560', '64GB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea5d98-31f0-11f1-a5c8-3464a92b0560', '47b6dacf-31f0-11f1-a5c8-3464a92b0560', '128GB', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea5de7-31f0-11f1-a5c8-3464a92b0560', '47b6dacf-31f0-11f1-a5c8-3464a92b0560', '256GB SSD', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea5e3e-31f0-11f1-a5c8-3464a92b0560', '47b6dacf-31f0-11f1-a5c8-3464a92b0560', '512GB SSD', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea5e9a-31f0-11f1-a5c8-3464a92b0560', '47b6dacf-31f0-11f1-a5c8-3464a92b0560', '1TB SSD', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea5efe-31f0-11f1-a5c8-3464a92b0560', '47b6dacf-31f0-11f1-a5c8-3464a92b0560', '2TB SSD', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea5f46-31f0-11f1-a5c8-3464a92b0560', '47b6dacf-31f0-11f1-a5c8-3464a92b0560', '500GB HDD', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea5f94-31f0-11f1-a5c8-3464a92b0560', '47b6dacf-31f0-11f1-a5c8-3464a92b0560', '1TB HDD', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea5feb-31f0-11f1-a5c8-3464a92b0560', '47b6dacf-31f0-11f1-a5c8-3464a92b0560', '2TB HDD', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6081-31f0-11f1-a5c8-3464a92b0560', '47b6e4a9-31f0-11f1-a5c8-3464a92b0560', '64GB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea60cd-31f0-11f1-a5c8-3464a92b0560', '47b6e4a9-31f0-11f1-a5c8-3464a92b0560', '128GB', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6124-31f0-11f1-a5c8-3464a92b0560', '47b6e4a9-31f0-11f1-a5c8-3464a92b0560', '256GB SSD', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6183-31f0-11f1-a5c8-3464a92b0560', '47b6e4a9-31f0-11f1-a5c8-3464a92b0560', '512GB SSD', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea61ea-31f0-11f1-a5c8-3464a92b0560', '47b6e4a9-31f0-11f1-a5c8-3464a92b0560', '1TB SSD', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6259-31f0-11f1-a5c8-3464a92b0560', '47b6e4a9-31f0-11f1-a5c8-3464a92b0560', '2TB SSD', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea62a5-31f0-11f1-a5c8-3464a92b0560', '47b6e4a9-31f0-11f1-a5c8-3464a92b0560', '500GB HDD', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea62fa-31f0-11f1-a5c8-3464a92b0560', '47b6e4a9-31f0-11f1-a5c8-3464a92b0560', '1TB HDD', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6356-31f0-11f1-a5c8-3464a92b0560', '47b6e4a9-31f0-11f1-a5c8-3464a92b0560', '2TB HDD', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea63ed-31f0-11f1-a5c8-3464a92b0560', '47b6f2ae-31f0-11f1-a5c8-3464a92b0560', '64GB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6438-31f0-11f1-a5c8-3464a92b0560', '47b6f2ae-31f0-11f1-a5c8-3464a92b0560', '128GB', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6491-31f0-11f1-a5c8-3464a92b0560', '47b6f2ae-31f0-11f1-a5c8-3464a92b0560', '256GB SSD', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea64f2-31f0-11f1-a5c8-3464a92b0560', '47b6f2ae-31f0-11f1-a5c8-3464a92b0560', '512GB SSD', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea654b-31f0-11f1-a5c8-3464a92b0560', '47b6f2ae-31f0-11f1-a5c8-3464a92b0560', '1TB SSD', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea65a9-31f0-11f1-a5c8-3464a92b0560', '47b6f2ae-31f0-11f1-a5c8-3464a92b0560', '2TB SSD', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea65f4-31f0-11f1-a5c8-3464a92b0560', '47b6f2ae-31f0-11f1-a5c8-3464a92b0560', '500GB HDD', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea664d-31f0-11f1-a5c8-3464a92b0560', '47b6f2ae-31f0-11f1-a5c8-3464a92b0560', '1TB HDD', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea66ab-31f0-11f1-a5c8-3464a92b0560', '47b6f2ae-31f0-11f1-a5c8-3464a92b0560', '2TB HDD', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea672e-31f0-11f1-a5c8-3464a92b0560', '47b6f8be-31f0-11f1-a5c8-3464a92b0560', '64GB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea677f-31f0-11f1-a5c8-3464a92b0560', '47b6f8be-31f0-11f1-a5c8-3464a92b0560', '128GB', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea67e3-31f0-11f1-a5c8-3464a92b0560', '47b6f8be-31f0-11f1-a5c8-3464a92b0560', '256GB SSD', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea684d-31f0-11f1-a5c8-3464a92b0560', '47b6f8be-31f0-11f1-a5c8-3464a92b0560', '512GB SSD', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea68af-31f0-11f1-a5c8-3464a92b0560', '47b6f8be-31f0-11f1-a5c8-3464a92b0560', '1TB SSD', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6917-31f0-11f1-a5c8-3464a92b0560', '47b6f8be-31f0-11f1-a5c8-3464a92b0560', '2TB SSD', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea696a-31f0-11f1-a5c8-3464a92b0560', '47b6f8be-31f0-11f1-a5c8-3464a92b0560', '500GB HDD', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea69cb-31f0-11f1-a5c8-3464a92b0560', '47b6f8be-31f0-11f1-a5c8-3464a92b0560', '1TB HDD', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6a35-31f0-11f1-a5c8-3464a92b0560', '47b6f8be-31f0-11f1-a5c8-3464a92b0560', '2TB HDD', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6ac1-31f0-11f1-a5c8-3464a92b0560', '47b6fefd-31f0-11f1-a5c8-3464a92b0560', '64GB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6b12-31f0-11f1-a5c8-3464a92b0560', '47b6fefd-31f0-11f1-a5c8-3464a92b0560', '128GB', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6b7a-31f0-11f1-a5c8-3464a92b0560', '47b6fefd-31f0-11f1-a5c8-3464a92b0560', '256GB SSD', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6be9-31f0-11f1-a5c8-3464a92b0560', '47b6fefd-31f0-11f1-a5c8-3464a92b0560', '512GB SSD', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6c4f-31f0-11f1-a5c8-3464a92b0560', '47b6fefd-31f0-11f1-a5c8-3464a92b0560', '1TB SSD', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6cbc-31f0-11f1-a5c8-3464a92b0560', '47b6fefd-31f0-11f1-a5c8-3464a92b0560', '2TB SSD', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6d0f-31f0-11f1-a5c8-3464a92b0560', '47b6fefd-31f0-11f1-a5c8-3464a92b0560', '500GB HDD', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6d75-31f0-11f1-a5c8-3464a92b0560', '47b6fefd-31f0-11f1-a5c8-3464a92b0560', '1TB HDD', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6de1-31f0-11f1-a5c8-3464a92b0560', '47b6fefd-31f0-11f1-a5c8-3464a92b0560', '2TB HDD', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6e5c-31f0-11f1-a5c8-3464a92b0560', '47b70374-31f0-11f1-a5c8-3464a92b0560', '64GB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6eb4-31f0-11f1-a5c8-3464a92b0560', '47b70374-31f0-11f1-a5c8-3464a92b0560', '128GB', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6f22-31f0-11f1-a5c8-3464a92b0560', '47b70374-31f0-11f1-a5c8-3464a92b0560', '256GB SSD', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea6f98-31f0-11f1-a5c8-3464a92b0560', '47b70374-31f0-11f1-a5c8-3464a92b0560', '512GB SSD', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea7006-31f0-11f1-a5c8-3464a92b0560', '47b70374-31f0-11f1-a5c8-3464a92b0560', '1TB SSD', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea707a-31f0-11f1-a5c8-3464a92b0560', '47b70374-31f0-11f1-a5c8-3464a92b0560', '2TB SSD', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea70d1-31f0-11f1-a5c8-3464a92b0560', '47b70374-31f0-11f1-a5c8-3464a92b0560', '500GB HDD', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea713e-31f0-11f1-a5c8-3464a92b0560', '47b70374-31f0-11f1-a5c8-3464a92b0560', '1TB HDD', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea71b4-31f0-11f1-a5c8-3464a92b0560', '47b70374-31f0-11f1-a5c8-3464a92b0560', '2TB HDD', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea72dd-31f0-11f1-a5c8-3464a92b0560', '47b718af-31f0-11f1-a5c8-3464a92b0560', '64GB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea7337-31f0-11f1-a5c8-3464a92b0560', '47b718af-31f0-11f1-a5c8-3464a92b0560', '128GB', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea73ad-31f0-11f1-a5c8-3464a92b0560', '47b718af-31f0-11f1-a5c8-3464a92b0560', '256GB SSD', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea742a-31f0-11f1-a5c8-3464a92b0560', '47b718af-31f0-11f1-a5c8-3464a92b0560', '512GB SSD', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea74a2-31f0-11f1-a5c8-3464a92b0560', '47b718af-31f0-11f1-a5c8-3464a92b0560', '1TB SSD', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea751e-31f0-11f1-a5c8-3464a92b0560', '47b718af-31f0-11f1-a5c8-3464a92b0560', '2TB SSD', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea757c-31f0-11f1-a5c8-3464a92b0560', '47b718af-31f0-11f1-a5c8-3464a92b0560', '500GB HDD', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea75f0-31f0-11f1-a5c8-3464a92b0560', '47b718af-31f0-11f1-a5c8-3464a92b0560', '1TB HDD', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea766c-31f0-11f1-a5c8-3464a92b0560', '47b718af-31f0-11f1-a5c8-3464a92b0560', '2TB HDD', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea76ec-31f0-11f1-a5c8-3464a92b0560', '47b71e2d-31f0-11f1-a5c8-3464a92b0560', '64GB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea7734-31f0-11f1-a5c8-3464a92b0560', '47b71e2d-31f0-11f1-a5c8-3464a92b0560', '128GB', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea77b3-31f0-11f1-a5c8-3464a92b0560', '47b71e2d-31f0-11f1-a5c8-3464a92b0560', '256GB SSD', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea783c-31f0-11f1-a5c8-3464a92b0560', '47b71e2d-31f0-11f1-a5c8-3464a92b0560', '512GB SSD', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea78bc-31f0-11f1-a5c8-3464a92b0560', '47b71e2d-31f0-11f1-a5c8-3464a92b0560', '1TB SSD', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea7987-31f0-11f1-a5c8-3464a92b0560', '47b71e2d-31f0-11f1-a5c8-3464a92b0560', '2TB SSD', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea79ea-31f0-11f1-a5c8-3464a92b0560', '47b71e2d-31f0-11f1-a5c8-3464a92b0560', '500GB HDD', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea7a4a-31f0-11f1-a5c8-3464a92b0560', '47b71e2d-31f0-11f1-a5c8-3464a92b0560', '1TB HDD', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea7aac-31f0-11f1-a5c8-3464a92b0560', '47b71e2d-31f0-11f1-a5c8-3464a92b0560', '2TB HDD', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea7b25-31f0-11f1-a5c8-3464a92b0560', '47b722f1-31f0-11f1-a5c8-3464a92b0560', '64GB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea7b71-31f0-11f1-a5c8-3464a92b0560', '47b722f1-31f0-11f1-a5c8-3464a92b0560', '128GB', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea7bf6-31f0-11f1-a5c8-3464a92b0560', '47b722f1-31f0-11f1-a5c8-3464a92b0560', '256GB SSD', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea7c83-31f0-11f1-a5c8-3464a92b0560', '47b722f1-31f0-11f1-a5c8-3464a92b0560', '512GB SSD', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea7d09-31f0-11f1-a5c8-3464a92b0560', '47b722f1-31f0-11f1-a5c8-3464a92b0560', '1TB SSD', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea7d95-31f0-11f1-a5c8-3464a92b0560', '47b722f1-31f0-11f1-a5c8-3464a92b0560', '2TB SSD', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea7df8-31f0-11f1-a5c8-3464a92b0560', '47b722f1-31f0-11f1-a5c8-3464a92b0560', '500GB HDD', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea7e5c-31f0-11f1-a5c8-3464a92b0560', '47b722f1-31f0-11f1-a5c8-3464a92b0560', '1TB HDD', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea7ebf-31f0-11f1-a5c8-3464a92b0560', '47b722f1-31f0-11f1-a5c8-3464a92b0560', '2TB HDD', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea7f41-31f0-11f1-a5c8-3464a92b0560', '47b7297e-31f0-11f1-a5c8-3464a92b0560', '64GB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea7f91-31f0-11f1-a5c8-3464a92b0560', '47b7297e-31f0-11f1-a5c8-3464a92b0560', '128GB', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea801d-31f0-11f1-a5c8-3464a92b0560', '47b7297e-31f0-11f1-a5c8-3464a92b0560', '256GB SSD', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea80b2-31f0-11f1-a5c8-3464a92b0560', '47b7297e-31f0-11f1-a5c8-3464a92b0560', '512GB SSD', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea813f-31f0-11f1-a5c8-3464a92b0560', '47b7297e-31f0-11f1-a5c8-3464a92b0560', '1TB SSD', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea81a5-31f0-11f1-a5c8-3464a92b0560', '47b7297e-31f0-11f1-a5c8-3464a92b0560', '2TB SSD', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea81f5-31f0-11f1-a5c8-3464a92b0560', '47b7297e-31f0-11f1-a5c8-3464a92b0560', '500GB HDD', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea825c-31f0-11f1-a5c8-3464a92b0560', '47b7297e-31f0-11f1-a5c8-3464a92b0560', '1TB HDD', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea82c1-31f0-11f1-a5c8-3464a92b0560', '47b7297e-31f0-11f1-a5c8-3464a92b0560', '2TB HDD', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8345-31f0-11f1-a5c8-3464a92b0560', '47b72f40-31f0-11f1-a5c8-3464a92b0560', '64GB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8399-31f0-11f1-a5c8-3464a92b0560', '47b72f40-31f0-11f1-a5c8-3464a92b0560', '128GB', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea842c-31f0-11f1-a5c8-3464a92b0560', '47b72f40-31f0-11f1-a5c8-3464a92b0560', '256GB SSD', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea84c8-31f0-11f1-a5c8-3464a92b0560', '47b72f40-31f0-11f1-a5c8-3464a92b0560', '512GB SSD', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8533-31f0-11f1-a5c8-3464a92b0560', '47b72f40-31f0-11f1-a5c8-3464a92b0560', '1TB SSD', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea859f-31f0-11f1-a5c8-3464a92b0560', '47b72f40-31f0-11f1-a5c8-3464a92b0560', '2TB SSD', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea85f3-31f0-11f1-a5c8-3464a92b0560', '47b72f40-31f0-11f1-a5c8-3464a92b0560', '500GB HDD', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8660-31f0-11f1-a5c8-3464a92b0560', '47b72f40-31f0-11f1-a5c8-3464a92b0560', '1TB HDD', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea86ca-31f0-11f1-a5c8-3464a92b0560', '47b72f40-31f0-11f1-a5c8-3464a92b0560', '2TB HDD', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8810-31f0-11f1-a5c8-3464a92b0560', '47b74a33-31f0-11f1-a5c8-3464a92b0560', '64GB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8864-31f0-11f1-a5c8-3464a92b0560', '47b74a33-31f0-11f1-a5c8-3464a92b0560', '128GB', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea88d0-31f0-11f1-a5c8-3464a92b0560', '47b74a33-31f0-11f1-a5c8-3464a92b0560', '256GB SSD', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea893c-31f0-11f1-a5c8-3464a92b0560', '47b74a33-31f0-11f1-a5c8-3464a92b0560', '512GB SSD', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea89a8-31f0-11f1-a5c8-3464a92b0560', '47b74a33-31f0-11f1-a5c8-3464a92b0560', '1TB SSD', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8a11-31f0-11f1-a5c8-3464a92b0560', '47b74a33-31f0-11f1-a5c8-3464a92b0560', '2TB SSD', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8a65-31f0-11f1-a5c8-3464a92b0560', '47b74a33-31f0-11f1-a5c8-3464a92b0560', '500GB HDD', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8acf-31f0-11f1-a5c8-3464a92b0560', '47b74a33-31f0-11f1-a5c8-3464a92b0560', '1TB HDD', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8b3a-31f0-11f1-a5c8-3464a92b0560', '47b74a33-31f0-11f1-a5c8-3464a92b0560', '2TB HDD', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8bc3-31f0-11f1-a5c8-3464a92b0560', '47b74f9d-31f0-11f1-a5c8-3464a92b0560', '64GB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8c1c-31f0-11f1-a5c8-3464a92b0560', '47b74f9d-31f0-11f1-a5c8-3464a92b0560', '128GB', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8c8d-31f0-11f1-a5c8-3464a92b0560', '47b74f9d-31f0-11f1-a5c8-3464a92b0560', '256GB SSD', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8cfc-31f0-11f1-a5c8-3464a92b0560', '47b74f9d-31f0-11f1-a5c8-3464a92b0560', '512GB SSD', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8d6b-31f0-11f1-a5c8-3464a92b0560', '47b74f9d-31f0-11f1-a5c8-3464a92b0560', '1TB SSD', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8dda-31f0-11f1-a5c8-3464a92b0560', '47b74f9d-31f0-11f1-a5c8-3464a92b0560', '2TB SSD', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8e33-31f0-11f1-a5c8-3464a92b0560', '47b74f9d-31f0-11f1-a5c8-3464a92b0560', '500GB HDD', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8ea3-31f0-11f1-a5c8-3464a92b0560', '47b74f9d-31f0-11f1-a5c8-3464a92b0560', '1TB HDD', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8f14-31f0-11f1-a5c8-3464a92b0560', '47b74f9d-31f0-11f1-a5c8-3464a92b0560', '2TB HDD', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea8fa3-31f0-11f1-a5c8-3464a92b0560', '47b7542a-31f0-11f1-a5c8-3464a92b0560', '64GB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea9000-31f0-11f1-a5c8-3464a92b0560', '47b7542a-31f0-11f1-a5c8-3464a92b0560', '128GB', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea9074-31f0-11f1-a5c8-3464a92b0560', '47b7542a-31f0-11f1-a5c8-3464a92b0560', '256GB SSD', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398');
INSERT INTO `specification_values` (`id`, `specification_id`, `value`, `sort_order`, `is_active`, `created_at`, `data_entrant`, `entry_date`) VALUES
('47ea90e9-31f0-11f1-a5c8-3464a92b0560', '47b7542a-31f0-11f1-a5c8-3464a92b0560', '512GB SSD', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea915e-31f0-11f1-a5c8-3464a92b0560', '47b7542a-31f0-11f1-a5c8-3464a92b0560', '1TB SSD', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea91d2-31f0-11f1-a5c8-3464a92b0560', '47b7542a-31f0-11f1-a5c8-3464a92b0560', '2TB SSD', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea9231-31f0-11f1-a5c8-3464a92b0560', '47b7542a-31f0-11f1-a5c8-3464a92b0560', '500GB HDD', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea92a6-31f0-11f1-a5c8-3464a92b0560', '47b7542a-31f0-11f1-a5c8-3464a92b0560', '1TB HDD', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea931c-31f0-11f1-a5c8-3464a92b0560', '47b7542a-31f0-11f1-a5c8-3464a92b0560', '2TB HDD', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea93ac-31f0-11f1-a5c8-3464a92b0560', '47b759da-31f0-11f1-a5c8-3464a92b0560', '64GB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea940c-31f0-11f1-a5c8-3464a92b0560', '47b759da-31f0-11f1-a5c8-3464a92b0560', '128GB', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea9488-31f0-11f1-a5c8-3464a92b0560', '47b759da-31f0-11f1-a5c8-3464a92b0560', '256GB SSD', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea9503-31f0-11f1-a5c8-3464a92b0560', '47b759da-31f0-11f1-a5c8-3464a92b0560', '512GB SSD', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea957d-31f0-11f1-a5c8-3464a92b0560', '47b759da-31f0-11f1-a5c8-3464a92b0560', '1TB SSD', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea95fa-31f0-11f1-a5c8-3464a92b0560', '47b759da-31f0-11f1-a5c8-3464a92b0560', '2TB SSD', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea9656-31f0-11f1-a5c8-3464a92b0560', '47b759da-31f0-11f1-a5c8-3464a92b0560', '500GB HDD', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea96b5-31f0-11f1-a5c8-3464a92b0560', '47b759da-31f0-11f1-a5c8-3464a92b0560', '1TB HDD', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47ea972f-31f0-11f1-a5c8-3464a92b0560', '47b759da-31f0-11f1-a5c8-3464a92b0560', '2TB HDD', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75598-31f0-11f1-a5c8-3464a92b0560', '47b6d038-31f0-11f1-a5c8-3464a92b0560', '6.1 inch', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75603-31f0-11f1-a5c8-3464a92b0560', '47b6d038-31f0-11f1-a5c8-3464a92b0560', '6.5 inch', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75658-31f0-11f1-a5c8-3464a92b0560', '47b6d038-31f0-11f1-a5c8-3464a92b0560', '10.1 inch', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f756ad-31f0-11f1-a5c8-3464a92b0560', '47b6d038-31f0-11f1-a5c8-3464a92b0560', '10.9 inch', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f756fa-31f0-11f1-a5c8-3464a92b0560', '47b6d038-31f0-11f1-a5c8-3464a92b0560', '11 inch', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7574f-31f0-11f1-a5c8-3464a92b0560', '47b6d038-31f0-11f1-a5c8-3464a92b0560', '12.9 inch', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f757a9-31f0-11f1-a5c8-3464a92b0560', '47b6d038-31f0-11f1-a5c8-3464a92b0560', '13.3 inch', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7580c-31f0-11f1-a5c8-3464a92b0560', '47b6d038-31f0-11f1-a5c8-3464a92b0560', '13.6 inch', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75855-31f0-11f1-a5c8-3464a92b0560', '47b6d038-31f0-11f1-a5c8-3464a92b0560', '14 inch', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f758b7-31f0-11f1-a5c8-3464a92b0560', '47b6d038-31f0-11f1-a5c8-3464a92b0560', '15.6 inch', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75903-31f0-11f1-a5c8-3464a92b0560', '47b6d038-31f0-11f1-a5c8-3464a92b0560', '16 inch', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7596d-31f0-11f1-a5c8-3464a92b0560', '47b6d038-31f0-11f1-a5c8-3464a92b0560', '21.5 inch', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75a0a-31f0-11f1-a5c8-3464a92b0560', '47b6d038-31f0-11f1-a5c8-3464a92b0560', '23.8 inch', 13, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75a5e-31f0-11f1-a5c8-3464a92b0560', '47b6d038-31f0-11f1-a5c8-3464a92b0560', '24 inch', 14, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75ab8-31f0-11f1-a5c8-3464a92b0560', '47b6d038-31f0-11f1-a5c8-3464a92b0560', '27 inch', 15, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75b19-31f0-11f1-a5c8-3464a92b0560', '47b6d038-31f0-11f1-a5c8-3464a92b0560', '32 inch', 16, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75b80-31f0-11f1-a5c8-3464a92b0560', '47b6d038-31f0-11f1-a5c8-3464a92b0560', '43 inch', 17, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75bee-31f0-11f1-a5c8-3464a92b0560', '47b6d038-31f0-11f1-a5c8-3464a92b0560', '55 inch', 18, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75c7c-31f0-11f1-a5c8-3464a92b0560', '47b6d5bb-31f0-11f1-a5c8-3464a92b0560', '6.1 inch', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75ccf-31f0-11f1-a5c8-3464a92b0560', '47b6d5bb-31f0-11f1-a5c8-3464a92b0560', '6.5 inch', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75d2d-31f0-11f1-a5c8-3464a92b0560', '47b6d5bb-31f0-11f1-a5c8-3464a92b0560', '10.1 inch', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75d93-31f0-11f1-a5c8-3464a92b0560', '47b6d5bb-31f0-11f1-a5c8-3464a92b0560', '10.9 inch', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75df0-31f0-11f1-a5c8-3464a92b0560', '47b6d5bb-31f0-11f1-a5c8-3464a92b0560', '11 inch', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75e5e-31f0-11f1-a5c8-3464a92b0560', '47b6d5bb-31f0-11f1-a5c8-3464a92b0560', '12.9 inch', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75ed2-31f0-11f1-a5c8-3464a92b0560', '47b6d5bb-31f0-11f1-a5c8-3464a92b0560', '13.3 inch', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75f4f-31f0-11f1-a5c8-3464a92b0560', '47b6d5bb-31f0-11f1-a5c8-3464a92b0560', '13.6 inch', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f75fb4-31f0-11f1-a5c8-3464a92b0560', '47b6d5bb-31f0-11f1-a5c8-3464a92b0560', '14 inch', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f76036-31f0-11f1-a5c8-3464a92b0560', '47b6d5bb-31f0-11f1-a5c8-3464a92b0560', '15.6 inch', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f760a4-31f0-11f1-a5c8-3464a92b0560', '47b6d5bb-31f0-11f1-a5c8-3464a92b0560', '16 inch', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7612e-31f0-11f1-a5c8-3464a92b0560', '47b6d5bb-31f0-11f1-a5c8-3464a92b0560', '21.5 inch', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f761c0-31f0-11f1-a5c8-3464a92b0560', '47b6d5bb-31f0-11f1-a5c8-3464a92b0560', '23.8 inch', 13, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f76234-31f0-11f1-a5c8-3464a92b0560', '47b6d5bb-31f0-11f1-a5c8-3464a92b0560', '24 inch', 14, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f762af-31f0-11f1-a5c8-3464a92b0560', '47b6d5bb-31f0-11f1-a5c8-3464a92b0560', '27 inch', 15, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f76330-31f0-11f1-a5c8-3464a92b0560', '47b6d5bb-31f0-11f1-a5c8-3464a92b0560', '32 inch', 16, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f763b7-31f0-11f1-a5c8-3464a92b0560', '47b6d5bb-31f0-11f1-a5c8-3464a92b0560', '43 inch', 17, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f76446-31f0-11f1-a5c8-3464a92b0560', '47b6d5bb-31f0-11f1-a5c8-3464a92b0560', '55 inch', 18, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f764c9-31f0-11f1-a5c8-3464a92b0560', '47b6d9f9-31f0-11f1-a5c8-3464a92b0560', '6.1 inch', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7651e-31f0-11f1-a5c8-3464a92b0560', '47b6d9f9-31f0-11f1-a5c8-3464a92b0560', '6.5 inch', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f76594-31f0-11f1-a5c8-3464a92b0560', '47b6d9f9-31f0-11f1-a5c8-3464a92b0560', '10.1 inch', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f76613-31f0-11f1-a5c8-3464a92b0560', '47b6d9f9-31f0-11f1-a5c8-3464a92b0560', '10.9 inch', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f76689-31f0-11f1-a5c8-3464a92b0560', '47b6d9f9-31f0-11f1-a5c8-3464a92b0560', '11 inch', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7670e-31f0-11f1-a5c8-3464a92b0560', '47b6d9f9-31f0-11f1-a5c8-3464a92b0560', '12.9 inch', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7679b-31f0-11f1-a5c8-3464a92b0560', '47b6d9f9-31f0-11f1-a5c8-3464a92b0560', '13.3 inch', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f76830-31f0-11f1-a5c8-3464a92b0560', '47b6d9f9-31f0-11f1-a5c8-3464a92b0560', '13.6 inch', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f768ad-31f0-11f1-a5c8-3464a92b0560', '47b6d9f9-31f0-11f1-a5c8-3464a92b0560', '14 inch', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f76949-31f0-11f1-a5c8-3464a92b0560', '47b6d9f9-31f0-11f1-a5c8-3464a92b0560', '15.6 inch', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f769ce-31f0-11f1-a5c8-3464a92b0560', '47b6d9f9-31f0-11f1-a5c8-3464a92b0560', '16 inch', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f76a6f-31f0-11f1-a5c8-3464a92b0560', '47b6d9f9-31f0-11f1-a5c8-3464a92b0560', '21.5 inch', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f76b18-31f0-11f1-a5c8-3464a92b0560', '47b6d9f9-31f0-11f1-a5c8-3464a92b0560', '23.8 inch', 13, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f76ba4-31f0-11f1-a5c8-3464a92b0560', '47b6d9f9-31f0-11f1-a5c8-3464a92b0560', '24 inch', 14, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f76c37-31f0-11f1-a5c8-3464a92b0560', '47b6d9f9-31f0-11f1-a5c8-3464a92b0560', '27 inch', 15, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f76cd1-31f0-11f1-a5c8-3464a92b0560', '47b6d9f9-31f0-11f1-a5c8-3464a92b0560', '32 inch', 16, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f76d73-31f0-11f1-a5c8-3464a92b0560', '47b6d9f9-31f0-11f1-a5c8-3464a92b0560', '43 inch', 17, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f76e1a-31f0-11f1-a5c8-3464a92b0560', '47b6d9f9-31f0-11f1-a5c8-3464a92b0560', '55 inch', 18, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f76ea9-31f0-11f1-a5c8-3464a92b0560', '47b6de8e-31f0-11f1-a5c8-3464a92b0560', '6.1 inch', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f76f06-31f0-11f1-a5c8-3464a92b0560', '47b6de8e-31f0-11f1-a5c8-3464a92b0560', '6.5 inch', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f76f9a-31f0-11f1-a5c8-3464a92b0560', '47b6de8e-31f0-11f1-a5c8-3464a92b0560', '10.1 inch', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f77035-31f0-11f1-a5c8-3464a92b0560', '47b6de8e-31f0-11f1-a5c8-3464a92b0560', '10.9 inch', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f770c8-31f0-11f1-a5c8-3464a92b0560', '47b6de8e-31f0-11f1-a5c8-3464a92b0560', '11 inch', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7716b-31f0-11f1-a5c8-3464a92b0560', '47b6de8e-31f0-11f1-a5c8-3464a92b0560', '12.9 inch', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f77215-31f0-11f1-a5c8-3464a92b0560', '47b6de8e-31f0-11f1-a5c8-3464a92b0560', '13.3 inch', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f772c6-31f0-11f1-a5c8-3464a92b0560', '47b6de8e-31f0-11f1-a5c8-3464a92b0560', '13.6 inch', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f77360-31f0-11f1-a5c8-3464a92b0560', '47b6de8e-31f0-11f1-a5c8-3464a92b0560', '14 inch', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f77418-31f0-11f1-a5c8-3464a92b0560', '47b6de8e-31f0-11f1-a5c8-3464a92b0560', '15.6 inch', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f774bb-31f0-11f1-a5c8-3464a92b0560', '47b6de8e-31f0-11f1-a5c8-3464a92b0560', '16 inch', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7757b-31f0-11f1-a5c8-3464a92b0560', '47b6de8e-31f0-11f1-a5c8-3464a92b0560', '21.5 inch', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f77641-31f0-11f1-a5c8-3464a92b0560', '47b6de8e-31f0-11f1-a5c8-3464a92b0560', '23.8 inch', 13, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f776ea-31f0-11f1-a5c8-3464a92b0560', '47b6de8e-31f0-11f1-a5c8-3464a92b0560', '24 inch', 14, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7779a-31f0-11f1-a5c8-3464a92b0560', '47b6de8e-31f0-11f1-a5c8-3464a92b0560', '27 inch', 15, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f77851-31f0-11f1-a5c8-3464a92b0560', '47b6de8e-31f0-11f1-a5c8-3464a92b0560', '32 inch', 16, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7790f-31f0-11f1-a5c8-3464a92b0560', '47b6de8e-31f0-11f1-a5c8-3464a92b0560', '43 inch', 17, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f779d3-31f0-11f1-a5c8-3464a92b0560', '47b6de8e-31f0-11f1-a5c8-3464a92b0560', '55 inch', 18, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f77a64-31f0-11f1-a5c8-3464a92b0560', '47b6edc5-31f0-11f1-a5c8-3464a92b0560', '6.1 inch', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f77ac9-31f0-11f1-a5c8-3464a92b0560', '47b6edc5-31f0-11f1-a5c8-3464a92b0560', '6.5 inch', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f77b76-31f0-11f1-a5c8-3464a92b0560', '47b6edc5-31f0-11f1-a5c8-3464a92b0560', '10.1 inch', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f77c2c-31f0-11f1-a5c8-3464a92b0560', '47b6edc5-31f0-11f1-a5c8-3464a92b0560', '10.9 inch', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f77cdb-31f0-11f1-a5c8-3464a92b0560', '47b6edc5-31f0-11f1-a5c8-3464a92b0560', '11 inch', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f77d98-31f0-11f1-a5c8-3464a92b0560', '47b6edc5-31f0-11f1-a5c8-3464a92b0560', '12.9 inch', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f77e5c-31f0-11f1-a5c8-3464a92b0560', '47b6edc5-31f0-11f1-a5c8-3464a92b0560', '13.3 inch', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f77f27-31f0-11f1-a5c8-3464a92b0560', '47b6edc5-31f0-11f1-a5c8-3464a92b0560', '13.6 inch', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f77fdc-31f0-11f1-a5c8-3464a92b0560', '47b6edc5-31f0-11f1-a5c8-3464a92b0560', '14 inch', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f780b0-31f0-11f1-a5c8-3464a92b0560', '47b6edc5-31f0-11f1-a5c8-3464a92b0560', '15.6 inch', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7825a-31f0-11f1-a5c8-3464a92b0560', '47b6edc5-31f0-11f1-a5c8-3464a92b0560', '16 inch', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7834d-31f0-11f1-a5c8-3464a92b0560', '47b6edc5-31f0-11f1-a5c8-3464a92b0560', '21.5 inch', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f783cd-31f0-11f1-a5c8-3464a92b0560', '47b6edc5-31f0-11f1-a5c8-3464a92b0560', '23.8 inch', 13, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f78491-31f0-11f1-a5c8-3464a92b0560', '47b6edc5-31f0-11f1-a5c8-3464a92b0560', '24 inch', 14, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7855d-31f0-11f1-a5c8-3464a92b0560', '47b6edc5-31f0-11f1-a5c8-3464a92b0560', '27 inch', 15, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7862e-31f0-11f1-a5c8-3464a92b0560', '47b6edc5-31f0-11f1-a5c8-3464a92b0560', '32 inch', 16, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f78706-31f0-11f1-a5c8-3464a92b0560', '47b6edc5-31f0-11f1-a5c8-3464a92b0560', '43 inch', 17, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f787e5-31f0-11f1-a5c8-3464a92b0560', '47b6edc5-31f0-11f1-a5c8-3464a92b0560', '55 inch', 18, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f78885-31f0-11f1-a5c8-3464a92b0560', '47b6f793-31f0-11f1-a5c8-3464a92b0560', '6.1 inch', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f788f0-31f0-11f1-a5c8-3464a92b0560', '47b6f793-31f0-11f1-a5c8-3464a92b0560', '6.5 inch', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7896c-31f0-11f1-a5c8-3464a92b0560', '47b6f793-31f0-11f1-a5c8-3464a92b0560', '10.1 inch', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f78a3d-31f0-11f1-a5c8-3464a92b0560', '47b6f793-31f0-11f1-a5c8-3464a92b0560', '10.9 inch', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f78b07-31f0-11f1-a5c8-3464a92b0560', '47b6f793-31f0-11f1-a5c8-3464a92b0560', '11 inch', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f78b98-31f0-11f1-a5c8-3464a92b0560', '47b6f793-31f0-11f1-a5c8-3464a92b0560', '12.9 inch', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f78c22-31f0-11f1-a5c8-3464a92b0560', '47b6f793-31f0-11f1-a5c8-3464a92b0560', '13.3 inch', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f78cb9-31f0-11f1-a5c8-3464a92b0560', '47b6f793-31f0-11f1-a5c8-3464a92b0560', '13.6 inch', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f78d89-31f0-11f1-a5c8-3464a92b0560', '47b6f793-31f0-11f1-a5c8-3464a92b0560', '14 inch', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f78e1a-31f0-11f1-a5c8-3464a92b0560', '47b6f793-31f0-11f1-a5c8-3464a92b0560', '15.6 inch', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f78ef3-31f0-11f1-a5c8-3464a92b0560', '47b6f793-31f0-11f1-a5c8-3464a92b0560', '16 inch', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f78f8c-31f0-11f1-a5c8-3464a92b0560', '47b6f793-31f0-11f1-a5c8-3464a92b0560', '21.5 inch', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7902a-31f0-11f1-a5c8-3464a92b0560', '47b6f793-31f0-11f1-a5c8-3464a92b0560', '23.8 inch', 13, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7910c-31f0-11f1-a5c8-3464a92b0560', '47b6f793-31f0-11f1-a5c8-3464a92b0560', '24 inch', 14, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f79199-31f0-11f1-a5c8-3464a92b0560', '47b6f793-31f0-11f1-a5c8-3464a92b0560', '27 inch', 15, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7922d-31f0-11f1-a5c8-3464a92b0560', '47b6f793-31f0-11f1-a5c8-3464a92b0560', '32 inch', 16, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f792c8-31f0-11f1-a5c8-3464a92b0560', '47b6f793-31f0-11f1-a5c8-3464a92b0560', '43 inch', 17, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f79362-31f0-11f1-a5c8-3464a92b0560', '47b6f793-31f0-11f1-a5c8-3464a92b0560', '55 inch', 18, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f79401-31f0-11f1-a5c8-3464a92b0560', '47b6fdc4-31f0-11f1-a5c8-3464a92b0560', '6.1 inch', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f79465-31f0-11f1-a5c8-3464a92b0560', '47b6fdc4-31f0-11f1-a5c8-3464a92b0560', '6.5 inch', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f794fe-31f0-11f1-a5c8-3464a92b0560', '47b6fdc4-31f0-11f1-a5c8-3464a92b0560', '10.1 inch', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7959f-31f0-11f1-a5c8-3464a92b0560', '47b6fdc4-31f0-11f1-a5c8-3464a92b0560', '10.9 inch', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f79632-31f0-11f1-a5c8-3464a92b0560', '47b6fdc4-31f0-11f1-a5c8-3464a92b0560', '11 inch', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f796bd-31f0-11f1-a5c8-3464a92b0560', '47b6fdc4-31f0-11f1-a5c8-3464a92b0560', '12.9 inch', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f79765-31f0-11f1-a5c8-3464a92b0560', '47b6fdc4-31f0-11f1-a5c8-3464a92b0560', '13.3 inch', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f797fa-31f0-11f1-a5c8-3464a92b0560', '47b6fdc4-31f0-11f1-a5c8-3464a92b0560', '13.6 inch', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7988c-31f0-11f1-a5c8-3464a92b0560', '47b6fdc4-31f0-11f1-a5c8-3464a92b0560', '14 inch', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7993c-31f0-11f1-a5c8-3464a92b0560', '47b6fdc4-31f0-11f1-a5c8-3464a92b0560', '15.6 inch', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f799d6-31f0-11f1-a5c8-3464a92b0560', '47b6fdc4-31f0-11f1-a5c8-3464a92b0560', '16 inch', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f79a8e-31f0-11f1-a5c8-3464a92b0560', '47b6fdc4-31f0-11f1-a5c8-3464a92b0560', '21.5 inch', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f79b27-31f0-11f1-a5c8-3464a92b0560', '47b6fdc4-31f0-11f1-a5c8-3464a92b0560', '23.8 inch', 13, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f79bc8-31f0-11f1-a5c8-3464a92b0560', '47b6fdc4-31f0-11f1-a5c8-3464a92b0560', '24 inch', 14, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f79c64-31f0-11f1-a5c8-3464a92b0560', '47b6fdc4-31f0-11f1-a5c8-3464a92b0560', '27 inch', 15, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f79d03-31f0-11f1-a5c8-3464a92b0560', '47b6fdc4-31f0-11f1-a5c8-3464a92b0560', '32 inch', 16, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f79dad-31f0-11f1-a5c8-3464a92b0560', '47b6fdc4-31f0-11f1-a5c8-3464a92b0560', '43 inch', 17, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f79e54-31f0-11f1-a5c8-3464a92b0560', '47b6fdc4-31f0-11f1-a5c8-3464a92b0560', '55 inch', 18, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7a02d-31f0-11f1-a5c8-3464a92b0560', '47b72843-31f0-11f1-a5c8-3464a92b0560', '6.1 inch', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7a09b-31f0-11f1-a5c8-3464a92b0560', '47b72843-31f0-11f1-a5c8-3464a92b0560', '6.5 inch', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7a144-31f0-11f1-a5c8-3464a92b0560', '47b72843-31f0-11f1-a5c8-3464a92b0560', '10.1 inch', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7a1f5-31f0-11f1-a5c8-3464a92b0560', '47b72843-31f0-11f1-a5c8-3464a92b0560', '10.9 inch', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7a292-31f0-11f1-a5c8-3464a92b0560', '47b72843-31f0-11f1-a5c8-3464a92b0560', '11 inch', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7a328-31f0-11f1-a5c8-3464a92b0560', '47b72843-31f0-11f1-a5c8-3464a92b0560', '12.9 inch', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7a3df-31f0-11f1-a5c8-3464a92b0560', '47b72843-31f0-11f1-a5c8-3464a92b0560', '13.3 inch', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7a47c-31f0-11f1-a5c8-3464a92b0560', '47b72843-31f0-11f1-a5c8-3464a92b0560', '13.6 inch', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7a51b-31f0-11f1-a5c8-3464a92b0560', '47b72843-31f0-11f1-a5c8-3464a92b0560', '14 inch', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7a5da-31f0-11f1-a5c8-3464a92b0560', '47b72843-31f0-11f1-a5c8-3464a92b0560', '15.6 inch', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7a681-31f0-11f1-a5c8-3464a92b0560', '47b72843-31f0-11f1-a5c8-3464a92b0560', '16 inch', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7a749-31f0-11f1-a5c8-3464a92b0560', '47b72843-31f0-11f1-a5c8-3464a92b0560', '21.5 inch', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7a7ed-31f0-11f1-a5c8-3464a92b0560', '47b72843-31f0-11f1-a5c8-3464a92b0560', '23.8 inch', 13, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7a89c-31f0-11f1-a5c8-3464a92b0560', '47b72843-31f0-11f1-a5c8-3464a92b0560', '24 inch', 14, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7a942-31f0-11f1-a5c8-3464a92b0560', '47b72843-31f0-11f1-a5c8-3464a92b0560', '27 inch', 15, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7a9f0-31f0-11f1-a5c8-3464a92b0560', '47b72843-31f0-11f1-a5c8-3464a92b0560', '32 inch', 16, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7aaa5-31f0-11f1-a5c8-3464a92b0560', '47b72843-31f0-11f1-a5c8-3464a92b0560', '43 inch', 17, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7ab59-31f0-11f1-a5c8-3464a92b0560', '47b72843-31f0-11f1-a5c8-3464a92b0560', '55 inch', 18, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7ac14-31f0-11f1-a5c8-3464a92b0560', '47b73486-31f0-11f1-a5c8-3464a92b0560', '6.1 inch', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7ac85-31f0-11f1-a5c8-3464a92b0560', '47b73486-31f0-11f1-a5c8-3464a92b0560', '6.5 inch', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7ad3d-31f0-11f1-a5c8-3464a92b0560', '47b73486-31f0-11f1-a5c8-3464a92b0560', '10.1 inch', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7adff-31f0-11f1-a5c8-3464a92b0560', '47b73486-31f0-11f1-a5c8-3464a92b0560', '10.9 inch', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7aea9-31f0-11f1-a5c8-3464a92b0560', '47b73486-31f0-11f1-a5c8-3464a92b0560', '11 inch', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7af21-31f0-11f1-a5c8-3464a92b0560', '47b73486-31f0-11f1-a5c8-3464a92b0560', '12.9 inch', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7afe8-31f0-11f1-a5c8-3464a92b0560', '47b73486-31f0-11f1-a5c8-3464a92b0560', '13.3 inch', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7b068-31f0-11f1-a5c8-3464a92b0560', '47b73486-31f0-11f1-a5c8-3464a92b0560', '13.6 inch', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7b113-31f0-11f1-a5c8-3464a92b0560', '47b73486-31f0-11f1-a5c8-3464a92b0560', '14 inch', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7b1e1-31f0-11f1-a5c8-3464a92b0560', '47b73486-31f0-11f1-a5c8-3464a92b0560', '15.6 inch', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7b295-31f0-11f1-a5c8-3464a92b0560', '47b73486-31f0-11f1-a5c8-3464a92b0560', '16 inch', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7b36b-31f0-11f1-a5c8-3464a92b0560', '47b73486-31f0-11f1-a5c8-3464a92b0560', '21.5 inch', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7b3cf-31f0-11f1-a5c8-3464a92b0560', '47b73486-31f0-11f1-a5c8-3464a92b0560', '23.8 inch', 13, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7b489-31f0-11f1-a5c8-3464a92b0560', '47b73486-31f0-11f1-a5c8-3464a92b0560', '24 inch', 14, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7b53c-31f0-11f1-a5c8-3464a92b0560', '47b73486-31f0-11f1-a5c8-3464a92b0560', '27 inch', 15, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7b5f6-31f0-11f1-a5c8-3464a92b0560', '47b73486-31f0-11f1-a5c8-3464a92b0560', '32 inch', 16, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7b6b8-31f0-11f1-a5c8-3464a92b0560', '47b73486-31f0-11f1-a5c8-3464a92b0560', '43 inch', 17, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7b77a-31f0-11f1-a5c8-3464a92b0560', '47b73486-31f0-11f1-a5c8-3464a92b0560', '55 inch', 18, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7b7f2-31f0-11f1-a5c8-3464a92b0560', '47b7374f-31f0-11f1-a5c8-3464a92b0560', '6.1 inch', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7b847-31f0-11f1-a5c8-3464a92b0560', '47b7374f-31f0-11f1-a5c8-3464a92b0560', '6.5 inch', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7b8af-31f0-11f1-a5c8-3464a92b0560', '47b7374f-31f0-11f1-a5c8-3464a92b0560', '10.1 inch', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7b92f-31f0-11f1-a5c8-3464a92b0560', '47b7374f-31f0-11f1-a5c8-3464a92b0560', '10.9 inch', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7b9eb-31f0-11f1-a5c8-3464a92b0560', '47b7374f-31f0-11f1-a5c8-3464a92b0560', '11 inch', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7bab9-31f0-11f1-a5c8-3464a92b0560', '47b7374f-31f0-11f1-a5c8-3464a92b0560', '12.9 inch', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7bb42-31f0-11f1-a5c8-3464a92b0560', '47b7374f-31f0-11f1-a5c8-3464a92b0560', '13.3 inch', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7bc14-31f0-11f1-a5c8-3464a92b0560', '47b7374f-31f0-11f1-a5c8-3464a92b0560', '13.6 inch', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7bccf-31f0-11f1-a5c8-3464a92b0560', '47b7374f-31f0-11f1-a5c8-3464a92b0560', '14 inch', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7bd41-31f0-11f1-a5c8-3464a92b0560', '47b7374f-31f0-11f1-a5c8-3464a92b0560', '15.6 inch', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7be03-31f0-11f1-a5c8-3464a92b0560', '47b7374f-31f0-11f1-a5c8-3464a92b0560', '16 inch', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7be93-31f0-11f1-a5c8-3464a92b0560', '47b7374f-31f0-11f1-a5c8-3464a92b0560', '21.5 inch', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7bf6e-31f0-11f1-a5c8-3464a92b0560', '47b7374f-31f0-11f1-a5c8-3464a92b0560', '23.8 inch', 13, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7c037-31f0-11f1-a5c8-3464a92b0560', '47b7374f-31f0-11f1-a5c8-3464a92b0560', '24 inch', 14, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7c0c1-31f0-11f1-a5c8-3464a92b0560', '47b7374f-31f0-11f1-a5c8-3464a92b0560', '27 inch', 15, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7c137-31f0-11f1-a5c8-3464a92b0560', '47b7374f-31f0-11f1-a5c8-3464a92b0560', '32 inch', 16, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7c208-31f0-11f1-a5c8-3464a92b0560', '47b7374f-31f0-11f1-a5c8-3464a92b0560', '43 inch', 17, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7c29a-31f0-11f1-a5c8-3464a92b0560', '47b7374f-31f0-11f1-a5c8-3464a92b0560', '55 inch', 18, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7c3a8-31f0-11f1-a5c8-3464a92b0560', '47b74824-31f0-11f1-a5c8-3464a92b0560', '6.1 inch', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7c3ff-31f0-11f1-a5c8-3464a92b0560', '47b74824-31f0-11f1-a5c8-3464a92b0560', '6.5 inch', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7c4d4-31f0-11f1-a5c8-3464a92b0560', '47b74824-31f0-11f1-a5c8-3464a92b0560', '10.1 inch', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7c5b0-31f0-11f1-a5c8-3464a92b0560', '47b74824-31f0-11f1-a5c8-3464a92b0560', '10.9 inch', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7c679-31f0-11f1-a5c8-3464a92b0560', '47b74824-31f0-11f1-a5c8-3464a92b0560', '11 inch', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7c705-31f0-11f1-a5c8-3464a92b0560', '47b74824-31f0-11f1-a5c8-3464a92b0560', '12.9 inch', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7c7e9-31f0-11f1-a5c8-3464a92b0560', '47b74824-31f0-11f1-a5c8-3464a92b0560', '13.3 inch', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7c87b-31f0-11f1-a5c8-3464a92b0560', '47b74824-31f0-11f1-a5c8-3464a92b0560', '13.6 inch', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7c8f5-31f0-11f1-a5c8-3464a92b0560', '47b74824-31f0-11f1-a5c8-3464a92b0560', '14 inch', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7c9e0-31f0-11f1-a5c8-3464a92b0560', '47b74824-31f0-11f1-a5c8-3464a92b0560', '15.6 inch', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7ca6e-31f0-11f1-a5c8-3464a92b0560', '47b74824-31f0-11f1-a5c8-3464a92b0560', '16 inch', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7cb60-31f0-11f1-a5c8-3464a92b0560', '47b74824-31f0-11f1-a5c8-3464a92b0560', '21.5 inch', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7cbd0-31f0-11f1-a5c8-3464a92b0560', '47b74824-31f0-11f1-a5c8-3464a92b0560', '23.8 inch', 13, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7cc52-31f0-11f1-a5c8-3464a92b0560', '47b74824-31f0-11f1-a5c8-3464a92b0560', '24 inch', 14, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7cd20-31f0-11f1-a5c8-3464a92b0560', '47b74824-31f0-11f1-a5c8-3464a92b0560', '27 inch', 15, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7cdf7-31f0-11f1-a5c8-3464a92b0560', '47b74824-31f0-11f1-a5c8-3464a92b0560', '32 inch', 16, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7ce8c-31f0-11f1-a5c8-3464a92b0560', '47b74824-31f0-11f1-a5c8-3464a92b0560', '43 inch', 17, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7cf69-31f0-11f1-a5c8-3464a92b0560', '47b74824-31f0-11f1-a5c8-3464a92b0560', '55 inch', 18, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7cfff-31f0-11f1-a5c8-3464a92b0560', '47b74d93-31f0-11f1-a5c8-3464a92b0560', '6.1 inch', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d07c-31f0-11f1-a5c8-3464a92b0560', '47b74d93-31f0-11f1-a5c8-3464a92b0560', '6.5 inch', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d0b2-31f0-11f1-a5c8-3464a92b0560', '47b74d93-31f0-11f1-a5c8-3464a92b0560', '10.1 inch', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d0e6-31f0-11f1-a5c8-3464a92b0560', '47b74d93-31f0-11f1-a5c8-3464a92b0560', '10.9 inch', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d11c-31f0-11f1-a5c8-3464a92b0560', '47b74d93-31f0-11f1-a5c8-3464a92b0560', '11 inch', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d151-31f0-11f1-a5c8-3464a92b0560', '47b74d93-31f0-11f1-a5c8-3464a92b0560', '12.9 inch', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d185-31f0-11f1-a5c8-3464a92b0560', '47b74d93-31f0-11f1-a5c8-3464a92b0560', '13.3 inch', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d1b9-31f0-11f1-a5c8-3464a92b0560', '47b74d93-31f0-11f1-a5c8-3464a92b0560', '13.6 inch', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d1ee-31f0-11f1-a5c8-3464a92b0560', '47b74d93-31f0-11f1-a5c8-3464a92b0560', '14 inch', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d223-31f0-11f1-a5c8-3464a92b0560', '47b74d93-31f0-11f1-a5c8-3464a92b0560', '15.6 inch', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d258-31f0-11f1-a5c8-3464a92b0560', '47b74d93-31f0-11f1-a5c8-3464a92b0560', '16 inch', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d28d-31f0-11f1-a5c8-3464a92b0560', '47b74d93-31f0-11f1-a5c8-3464a92b0560', '21.5 inch', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d2c1-31f0-11f1-a5c8-3464a92b0560', '47b74d93-31f0-11f1-a5c8-3464a92b0560', '23.8 inch', 13, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d2f6-31f0-11f1-a5c8-3464a92b0560', '47b74d93-31f0-11f1-a5c8-3464a92b0560', '24 inch', 14, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d32c-31f0-11f1-a5c8-3464a92b0560', '47b74d93-31f0-11f1-a5c8-3464a92b0560', '27 inch', 15, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d361-31f0-11f1-a5c8-3464a92b0560', '47b74d93-31f0-11f1-a5c8-3464a92b0560', '32 inch', 16, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d396-31f0-11f1-a5c8-3464a92b0560', '47b74d93-31f0-11f1-a5c8-3464a92b0560', '43 inch', 17, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d3cb-31f0-11f1-a5c8-3464a92b0560', '47b74d93-31f0-11f1-a5c8-3464a92b0560', '55 inch', 18, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d435-31f0-11f1-a5c8-3464a92b0560', '47b75228-31f0-11f1-a5c8-3464a92b0560', '6.1 inch', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d46c-31f0-11f1-a5c8-3464a92b0560', '47b75228-31f0-11f1-a5c8-3464a92b0560', '6.5 inch', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d4a2-31f0-11f1-a5c8-3464a92b0560', '47b75228-31f0-11f1-a5c8-3464a92b0560', '10.1 inch', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d4d7-31f0-11f1-a5c8-3464a92b0560', '47b75228-31f0-11f1-a5c8-3464a92b0560', '10.9 inch', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d50d-31f0-11f1-a5c8-3464a92b0560', '47b75228-31f0-11f1-a5c8-3464a92b0560', '11 inch', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d542-31f0-11f1-a5c8-3464a92b0560', '47b75228-31f0-11f1-a5c8-3464a92b0560', '12.9 inch', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d578-31f0-11f1-a5c8-3464a92b0560', '47b75228-31f0-11f1-a5c8-3464a92b0560', '13.3 inch', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d5ad-31f0-11f1-a5c8-3464a92b0560', '47b75228-31f0-11f1-a5c8-3464a92b0560', '13.6 inch', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d5e3-31f0-11f1-a5c8-3464a92b0560', '47b75228-31f0-11f1-a5c8-3464a92b0560', '14 inch', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d618-31f0-11f1-a5c8-3464a92b0560', '47b75228-31f0-11f1-a5c8-3464a92b0560', '15.6 inch', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d64d-31f0-11f1-a5c8-3464a92b0560', '47b75228-31f0-11f1-a5c8-3464a92b0560', '16 inch', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d683-31f0-11f1-a5c8-3464a92b0560', '47b75228-31f0-11f1-a5c8-3464a92b0560', '21.5 inch', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d6b8-31f0-11f1-a5c8-3464a92b0560', '47b75228-31f0-11f1-a5c8-3464a92b0560', '23.8 inch', 13, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d6ef-31f0-11f1-a5c8-3464a92b0560', '47b75228-31f0-11f1-a5c8-3464a92b0560', '24 inch', 14, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d724-31f0-11f1-a5c8-3464a92b0560', '47b75228-31f0-11f1-a5c8-3464a92b0560', '27 inch', 15, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d759-31f0-11f1-a5c8-3464a92b0560', '47b75228-31f0-11f1-a5c8-3464a92b0560', '32 inch', 16, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d78e-31f0-11f1-a5c8-3464a92b0560', '47b75228-31f0-11f1-a5c8-3464a92b0560', '43 inch', 17, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d7c4-31f0-11f1-a5c8-3464a92b0560', '47b75228-31f0-11f1-a5c8-3464a92b0560', '55 inch', 18, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d84b-31f0-11f1-a5c8-3464a92b0560', '47b757a3-31f0-11f1-a5c8-3464a92b0560', '6.1 inch', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d87e-31f0-11f1-a5c8-3464a92b0560', '47b757a3-31f0-11f1-a5c8-3464a92b0560', '6.5 inch', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d8b0-31f0-11f1-a5c8-3464a92b0560', '47b757a3-31f0-11f1-a5c8-3464a92b0560', '10.1 inch', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d8e3-31f0-11f1-a5c8-3464a92b0560', '47b757a3-31f0-11f1-a5c8-3464a92b0560', '10.9 inch', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d915-31f0-11f1-a5c8-3464a92b0560', '47b757a3-31f0-11f1-a5c8-3464a92b0560', '11 inch', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d947-31f0-11f1-a5c8-3464a92b0560', '47b757a3-31f0-11f1-a5c8-3464a92b0560', '12.9 inch', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d978-31f0-11f1-a5c8-3464a92b0560', '47b757a3-31f0-11f1-a5c8-3464a92b0560', '13.3 inch', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d9ab-31f0-11f1-a5c8-3464a92b0560', '47b757a3-31f0-11f1-a5c8-3464a92b0560', '13.6 inch', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7d9dc-31f0-11f1-a5c8-3464a92b0560', '47b757a3-31f0-11f1-a5c8-3464a92b0560', '14 inch', 9, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7da0e-31f0-11f1-a5c8-3464a92b0560', '47b757a3-31f0-11f1-a5c8-3464a92b0560', '15.6 inch', 10, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7da40-31f0-11f1-a5c8-3464a92b0560', '47b757a3-31f0-11f1-a5c8-3464a92b0560', '16 inch', 11, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7da72-31f0-11f1-a5c8-3464a92b0560', '47b757a3-31f0-11f1-a5c8-3464a92b0560', '21.5 inch', 12, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7daa4-31f0-11f1-a5c8-3464a92b0560', '47b757a3-31f0-11f1-a5c8-3464a92b0560', '23.8 inch', 13, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7dad5-31f0-11f1-a5c8-3464a92b0560', '47b757a3-31f0-11f1-a5c8-3464a92b0560', '24 inch', 14, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7db07-31f0-11f1-a5c8-3464a92b0560', '47b757a3-31f0-11f1-a5c8-3464a92b0560', '27 inch', 15, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7db39-31f0-11f1-a5c8-3464a92b0560', '47b757a3-31f0-11f1-a5c8-3464a92b0560', '32 inch', 16, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7db6b-31f0-11f1-a5c8-3464a92b0560', '47b757a3-31f0-11f1-a5c8-3464a92b0560', '43 inch', 17, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('47f7db9d-31f0-11f1-a5c8-3464a92b0560', '47b757a3-31f0-11f1-a5c8-3464a92b0560', '55 inch', 18, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aaa18-31f0-11f1-a5c8-3464a92b0560', '47b6ce94-31f0-11f1-a5c8-3464a92b0560', 'Windows 11', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aaa81-31f0-11f1-a5c8-3464a92b0560', '47b6ce94-31f0-11f1-a5c8-3464a92b0560', 'Windows 10', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aaac2-31f0-11f1-a5c8-3464a92b0560', '47b6ce94-31f0-11f1-a5c8-3464a92b0560', 'macOS', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aab0d-31f0-11f1-a5c8-3464a92b0560', '47b6ce94-31f0-11f1-a5c8-3464a92b0560', 'Linux', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aab52-31f0-11f1-a5c8-3464a92b0560', '47b6ce94-31f0-11f1-a5c8-3464a92b0560', 'Android', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aab95-31f0-11f1-a5c8-3464a92b0560', '47b6ce94-31f0-11f1-a5c8-3464a92b0560', 'iOS', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aabd2-31f0-11f1-a5c8-3464a92b0560', '47b6ce94-31f0-11f1-a5c8-3464a92b0560', 'iPadOS', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aac0e-31f0-11f1-a5c8-3464a92b0560', '47b6ce94-31f0-11f1-a5c8-3464a92b0560', 'ChromeOS', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aaca9-31f0-11f1-a5c8-3464a92b0560', '47b6d4eb-31f0-11f1-a5c8-3464a92b0560', 'Windows 11', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aaced-31f0-11f1-a5c8-3464a92b0560', '47b6d4eb-31f0-11f1-a5c8-3464a92b0560', 'Windows 10', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aad30-31f0-11f1-a5c8-3464a92b0560', '47b6d4eb-31f0-11f1-a5c8-3464a92b0560', 'macOS', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aad72-31f0-11f1-a5c8-3464a92b0560', '47b6d4eb-31f0-11f1-a5c8-3464a92b0560', 'Linux', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aadb7-31f0-11f1-a5c8-3464a92b0560', '47b6d4eb-31f0-11f1-a5c8-3464a92b0560', 'Android', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aadf9-31f0-11f1-a5c8-3464a92b0560', '47b6d4eb-31f0-11f1-a5c8-3464a92b0560', 'iOS', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aae3a-31f0-11f1-a5c8-3464a92b0560', '47b6d4eb-31f0-11f1-a5c8-3464a92b0560', 'iPadOS', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aae7c-31f0-11f1-a5c8-3464a92b0560', '47b6d4eb-31f0-11f1-a5c8-3464a92b0560', 'ChromeOS', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aaefb-31f0-11f1-a5c8-3464a92b0560', '47b6d931-31f0-11f1-a5c8-3464a92b0560', 'Windows 11', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aaf42-31f0-11f1-a5c8-3464a92b0560', '47b6d931-31f0-11f1-a5c8-3464a92b0560', 'Windows 10', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aaf89-31f0-11f1-a5c8-3464a92b0560', '47b6d931-31f0-11f1-a5c8-3464a92b0560', 'macOS', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480aafcf-31f0-11f1-a5c8-3464a92b0560', '47b6d931-31f0-11f1-a5c8-3464a92b0560', 'Linux', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab017-31f0-11f1-a5c8-3464a92b0560', '47b6d931-31f0-11f1-a5c8-3464a92b0560', 'Android', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab05c-31f0-11f1-a5c8-3464a92b0560', '47b6d931-31f0-11f1-a5c8-3464a92b0560', 'iOS', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab0a3-31f0-11f1-a5c8-3464a92b0560', '47b6d931-31f0-11f1-a5c8-3464a92b0560', 'iPadOS', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab0ea-31f0-11f1-a5c8-3464a92b0560', '47b6d931-31f0-11f1-a5c8-3464a92b0560', 'ChromeOS', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab176-31f0-11f1-a5c8-3464a92b0560', '47b6dda8-31f0-11f1-a5c8-3464a92b0560', 'Windows 11', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab1c6-31f0-11f1-a5c8-3464a92b0560', '47b6dda8-31f0-11f1-a5c8-3464a92b0560', 'Windows 10', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab213-31f0-11f1-a5c8-3464a92b0560', '47b6dda8-31f0-11f1-a5c8-3464a92b0560', 'macOS', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab260-31f0-11f1-a5c8-3464a92b0560', '47b6dda8-31f0-11f1-a5c8-3464a92b0560', 'Linux', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab2af-31f0-11f1-a5c8-3464a92b0560', '47b6dda8-31f0-11f1-a5c8-3464a92b0560', 'Android', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab2fe-31f0-11f1-a5c8-3464a92b0560', '47b6dda8-31f0-11f1-a5c8-3464a92b0560', 'iOS', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab34d-31f0-11f1-a5c8-3464a92b0560', '47b6dda8-31f0-11f1-a5c8-3464a92b0560', 'iPadOS', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab39c-31f0-11f1-a5c8-3464a92b0560', '47b6dda8-31f0-11f1-a5c8-3464a92b0560', 'ChromeOS', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab452-31f0-11f1-a5c8-3464a92b0560', '47b6f692-31f0-11f1-a5c8-3464a92b0560', 'Windows 11', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab4a3-31f0-11f1-a5c8-3464a92b0560', '47b6f692-31f0-11f1-a5c8-3464a92b0560', 'Windows 10', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab4f4-31f0-11f1-a5c8-3464a92b0560', '47b6f692-31f0-11f1-a5c8-3464a92b0560', 'macOS', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab547-31f0-11f1-a5c8-3464a92b0560', '47b6f692-31f0-11f1-a5c8-3464a92b0560', 'Linux', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab59a-31f0-11f1-a5c8-3464a92b0560', '47b6f692-31f0-11f1-a5c8-3464a92b0560', 'Android', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab5ea-31f0-11f1-a5c8-3464a92b0560', '47b6f692-31f0-11f1-a5c8-3464a92b0560', 'iOS', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab63b-31f0-11f1-a5c8-3464a92b0560', '47b6f692-31f0-11f1-a5c8-3464a92b0560', 'iPadOS', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab68e-31f0-11f1-a5c8-3464a92b0560', '47b6f692-31f0-11f1-a5c8-3464a92b0560', 'ChromeOS', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab71d-31f0-11f1-a5c8-3464a92b0560', '47b6fcc8-31f0-11f1-a5c8-3464a92b0560', 'Windows 11', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab76e-31f0-11f1-a5c8-3464a92b0560', '47b6fcc8-31f0-11f1-a5c8-3464a92b0560', 'Windows 10', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab7bf-31f0-11f1-a5c8-3464a92b0560', '47b6fcc8-31f0-11f1-a5c8-3464a92b0560', 'macOS', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab80f-31f0-11f1-a5c8-3464a92b0560', '47b6fcc8-31f0-11f1-a5c8-3464a92b0560', 'Linux', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab862-31f0-11f1-a5c8-3464a92b0560', '47b6fcc8-31f0-11f1-a5c8-3464a92b0560', 'Android', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab8b2-31f0-11f1-a5c8-3464a92b0560', '47b6fcc8-31f0-11f1-a5c8-3464a92b0560', 'iOS', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab904-31f0-11f1-a5c8-3464a92b0560', '47b6fcc8-31f0-11f1-a5c8-3464a92b0560', 'iPadOS', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ab955-31f0-11f1-a5c8-3464a92b0560', '47b6fcc8-31f0-11f1-a5c8-3464a92b0560', 'ChromeOS', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480abaa7-31f0-11f1-a5c8-3464a92b0560', '47b716a6-31f0-11f1-a5c8-3464a92b0560', 'Windows 11', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480abaff-31f0-11f1-a5c8-3464a92b0560', '47b716a6-31f0-11f1-a5c8-3464a92b0560', 'Windows 10', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480abb56-31f0-11f1-a5c8-3464a92b0560', '47b716a6-31f0-11f1-a5c8-3464a92b0560', 'macOS', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480abbad-31f0-11f1-a5c8-3464a92b0560', '47b716a6-31f0-11f1-a5c8-3464a92b0560', 'Linux', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480abc05-31f0-11f1-a5c8-3464a92b0560', '47b716a6-31f0-11f1-a5c8-3464a92b0560', 'Android', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480abc5b-31f0-11f1-a5c8-3464a92b0560', '47b716a6-31f0-11f1-a5c8-3464a92b0560', 'iOS', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480abcb2-31f0-11f1-a5c8-3464a92b0560', '47b716a6-31f0-11f1-a5c8-3464a92b0560', 'iPadOS', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480abd0a-31f0-11f1-a5c8-3464a92b0560', '47b716a6-31f0-11f1-a5c8-3464a92b0560', 'ChromeOS', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398');
INSERT INTO `specification_values` (`id`, `specification_id`, `value`, `sort_order`, `is_active`, `created_at`, `data_entrant`, `entry_date`) VALUES
('480abd9b-31f0-11f1-a5c8-3464a92b0560', '47b71bf9-31f0-11f1-a5c8-3464a92b0560', 'Windows 11', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480abdf8-31f0-11f1-a5c8-3464a92b0560', '47b71bf9-31f0-11f1-a5c8-3464a92b0560', 'Windows 10', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480abe53-31f0-11f1-a5c8-3464a92b0560', '47b71bf9-31f0-11f1-a5c8-3464a92b0560', 'macOS', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480abeae-31f0-11f1-a5c8-3464a92b0560', '47b71bf9-31f0-11f1-a5c8-3464a92b0560', 'Linux', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480abf0b-31f0-11f1-a5c8-3464a92b0560', '47b71bf9-31f0-11f1-a5c8-3464a92b0560', 'Android', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480abf65-31f0-11f1-a5c8-3464a92b0560', '47b71bf9-31f0-11f1-a5c8-3464a92b0560', 'iOS', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480abfc1-31f0-11f1-a5c8-3464a92b0560', '47b71bf9-31f0-11f1-a5c8-3464a92b0560', 'iPadOS', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac01f-31f0-11f1-a5c8-3464a92b0560', '47b71bf9-31f0-11f1-a5c8-3464a92b0560', 'ChromeOS', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac0b4-31f0-11f1-a5c8-3464a92b0560', '47b72189-31f0-11f1-a5c8-3464a92b0560', 'Windows 11', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac116-31f0-11f1-a5c8-3464a92b0560', '47b72189-31f0-11f1-a5c8-3464a92b0560', 'Windows 10', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac177-31f0-11f1-a5c8-3464a92b0560', '47b72189-31f0-11f1-a5c8-3464a92b0560', 'macOS', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac1d7-31f0-11f1-a5c8-3464a92b0560', '47b72189-31f0-11f1-a5c8-3464a92b0560', 'Linux', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac238-31f0-11f1-a5c8-3464a92b0560', '47b72189-31f0-11f1-a5c8-3464a92b0560', 'Android', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac298-31f0-11f1-a5c8-3464a92b0560', '47b72189-31f0-11f1-a5c8-3464a92b0560', 'iOS', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac2f9-31f0-11f1-a5c8-3464a92b0560', '47b72189-31f0-11f1-a5c8-3464a92b0560', 'iPadOS', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac35a-31f0-11f1-a5c8-3464a92b0560', '47b72189-31f0-11f1-a5c8-3464a92b0560', 'ChromeOS', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac3eb-31f0-11f1-a5c8-3464a92b0560', '47b7262f-31f0-11f1-a5c8-3464a92b0560', 'Windows 11', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac44f-31f0-11f1-a5c8-3464a92b0560', '47b7262f-31f0-11f1-a5c8-3464a92b0560', 'Windows 10', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac4b2-31f0-11f1-a5c8-3464a92b0560', '47b7262f-31f0-11f1-a5c8-3464a92b0560', 'macOS', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac516-31f0-11f1-a5c8-3464a92b0560', '47b7262f-31f0-11f1-a5c8-3464a92b0560', 'Linux', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac57c-31f0-11f1-a5c8-3464a92b0560', '47b7262f-31f0-11f1-a5c8-3464a92b0560', 'Android', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac5de-31f0-11f1-a5c8-3464a92b0560', '47b7262f-31f0-11f1-a5c8-3464a92b0560', 'iOS', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac641-31f0-11f1-a5c8-3464a92b0560', '47b7262f-31f0-11f1-a5c8-3464a92b0560', 'iPadOS', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac698-31f0-11f1-a5c8-3464a92b0560', '47b7262f-31f0-11f1-a5c8-3464a92b0560', 'ChromeOS', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac740-31f0-11f1-a5c8-3464a92b0560', '47b72d43-31f0-11f1-a5c8-3464a92b0560', 'Windows 11', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac7a9-31f0-11f1-a5c8-3464a92b0560', '47b72d43-31f0-11f1-a5c8-3464a92b0560', 'Windows 10', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac811-31f0-11f1-a5c8-3464a92b0560', '47b72d43-31f0-11f1-a5c8-3464a92b0560', 'macOS', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac877-31f0-11f1-a5c8-3464a92b0560', '47b72d43-31f0-11f1-a5c8-3464a92b0560', 'Linux', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac8de-31f0-11f1-a5c8-3464a92b0560', '47b72d43-31f0-11f1-a5c8-3464a92b0560', 'Android', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac937-31f0-11f1-a5c8-3464a92b0560', '47b72d43-31f0-11f1-a5c8-3464a92b0560', 'iOS', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac99d-31f0-11f1-a5c8-3464a92b0560', '47b72d43-31f0-11f1-a5c8-3464a92b0560', 'iPadOS', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ac9f8-31f0-11f1-a5c8-3464a92b0560', '47b72d43-31f0-11f1-a5c8-3464a92b0560', 'ChromeOS', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480acb8a-31f0-11f1-a5c8-3464a92b0560', '47b7461f-31f0-11f1-a5c8-3464a92b0560', 'Windows 11', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480acbf6-31f0-11f1-a5c8-3464a92b0560', '47b7461f-31f0-11f1-a5c8-3464a92b0560', 'Windows 10', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480acc5f-31f0-11f1-a5c8-3464a92b0560', '47b7461f-31f0-11f1-a5c8-3464a92b0560', 'macOS', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480accc6-31f0-11f1-a5c8-3464a92b0560', '47b7461f-31f0-11f1-a5c8-3464a92b0560', 'Linux', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480acd2f-31f0-11f1-a5c8-3464a92b0560', '47b7461f-31f0-11f1-a5c8-3464a92b0560', 'Android', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480acd8a-31f0-11f1-a5c8-3464a92b0560', '47b7461f-31f0-11f1-a5c8-3464a92b0560', 'iOS', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480acdf3-31f0-11f1-a5c8-3464a92b0560', '47b7461f-31f0-11f1-a5c8-3464a92b0560', 'iPadOS', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ace4f-31f0-11f1-a5c8-3464a92b0560', '47b7461f-31f0-11f1-a5c8-3464a92b0560', 'ChromeOS', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480acee7-31f0-11f1-a5c8-3464a92b0560', '47b74b84-31f0-11f1-a5c8-3464a92b0560', 'Windows 11', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480acf57-31f0-11f1-a5c8-3464a92b0560', '47b74b84-31f0-11f1-a5c8-3464a92b0560', 'Windows 10', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480acfc6-31f0-11f1-a5c8-3464a92b0560', '47b74b84-31f0-11f1-a5c8-3464a92b0560', 'macOS', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad036-31f0-11f1-a5c8-3464a92b0560', '47b74b84-31f0-11f1-a5c8-3464a92b0560', 'Linux', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad0a6-31f0-11f1-a5c8-3464a92b0560', '47b74b84-31f0-11f1-a5c8-3464a92b0560', 'Android', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad107-31f0-11f1-a5c8-3464a92b0560', '47b74b84-31f0-11f1-a5c8-3464a92b0560', 'iOS', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad177-31f0-11f1-a5c8-3464a92b0560', '47b74b84-31f0-11f1-a5c8-3464a92b0560', 'iPadOS', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad1da-31f0-11f1-a5c8-3464a92b0560', '47b74b84-31f0-11f1-a5c8-3464a92b0560', 'ChromeOS', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad271-31f0-11f1-a5c8-3464a92b0560', '47b750af-31f0-11f1-a5c8-3464a92b0560', 'Windows 11', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad2e1-31f0-11f1-a5c8-3464a92b0560', '47b750af-31f0-11f1-a5c8-3464a92b0560', 'Windows 10', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad351-31f0-11f1-a5c8-3464a92b0560', '47b750af-31f0-11f1-a5c8-3464a92b0560', 'macOS', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad3b3-31f0-11f1-a5c8-3464a92b0560', '47b750af-31f0-11f1-a5c8-3464a92b0560', 'Linux', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad424-31f0-11f1-a5c8-3464a92b0560', '47b750af-31f0-11f1-a5c8-3464a92b0560', 'Android', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad487-31f0-11f1-a5c8-3464a92b0560', '47b750af-31f0-11f1-a5c8-3464a92b0560', 'iOS', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad4f7-31f0-11f1-a5c8-3464a92b0560', '47b750af-31f0-11f1-a5c8-3464a92b0560', 'iPadOS', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad55a-31f0-11f1-a5c8-3464a92b0560', '47b750af-31f0-11f1-a5c8-3464a92b0560', 'ChromeOS', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad5e5-31f0-11f1-a5c8-3464a92b0560', '47b755be-31f0-11f1-a5c8-3464a92b0560', 'Windows 11', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad65b-31f0-11f1-a5c8-3464a92b0560', '47b755be-31f0-11f1-a5c8-3464a92b0560', 'Windows 10', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad6d2-31f0-11f1-a5c8-3464a92b0560', '47b755be-31f0-11f1-a5c8-3464a92b0560', 'macOS', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad725-31f0-11f1-a5c8-3464a92b0560', '47b755be-31f0-11f1-a5c8-3464a92b0560', 'Linux', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad778-31f0-11f1-a5c8-3464a92b0560', '47b755be-31f0-11f1-a5c8-3464a92b0560', 'Android', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad7cb-31f0-11f1-a5c8-3464a92b0560', '47b755be-31f0-11f1-a5c8-3464a92b0560', 'iOS', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad841-31f0-11f1-a5c8-3464a92b0560', '47b755be-31f0-11f1-a5c8-3464a92b0560', 'iPadOS', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('480ad895-31f0-11f1-a5c8-3464a92b0560', '47b755be-31f0-11f1-a5c8-3464a92b0560', 'ChromeOS', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815bcac-31f0-11f1-a5c8-3464a92b0560', '47b6ef7c-31f0-11f1-a5c8-3464a92b0560', 'Integrated Graphics', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815bd6f-31f0-11f1-a5c8-3464a92b0560', '47b6ef7c-31f0-11f1-a5c8-3464a92b0560', 'Intel UHD', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815bdca-31f0-11f1-a5c8-3464a92b0560', '47b6ef7c-31f0-11f1-a5c8-3464a92b0560', 'Intel Iris Xe', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815be1f-31f0-11f1-a5c8-3464a92b0560', '47b6ef7c-31f0-11f1-a5c8-3464a92b0560', 'AMD Radeon Graphics', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815be78-31f0-11f1-a5c8-3464a92b0560', '47b6ef7c-31f0-11f1-a5c8-3464a92b0560', 'NVIDIA GTX 1650', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815bed8-31f0-11f1-a5c8-3464a92b0560', '47b6ef7c-31f0-11f1-a5c8-3464a92b0560', 'NVIDIA RTX 3050', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815bf31-31f0-11f1-a5c8-3464a92b0560', '47b6ef7c-31f0-11f1-a5c8-3464a92b0560', 'NVIDIA RTX 3060', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815bf93-31f0-11f1-a5c8-3464a92b0560', '47b6ef7c-31f0-11f1-a5c8-3464a92b0560', 'NVIDIA RTX 4060', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c144-31f0-11f1-a5c8-3464a92b0560', '47b717a9-31f0-11f1-a5c8-3464a92b0560', 'Integrated Graphics', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c193-31f0-11f1-a5c8-3464a92b0560', '47b717a9-31f0-11f1-a5c8-3464a92b0560', 'Intel UHD', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c1eb-31f0-11f1-a5c8-3464a92b0560', '47b717a9-31f0-11f1-a5c8-3464a92b0560', 'Intel Iris Xe', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c242-31f0-11f1-a5c8-3464a92b0560', '47b717a9-31f0-11f1-a5c8-3464a92b0560', 'AMD Radeon Graphics', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c298-31f0-11f1-a5c8-3464a92b0560', '47b717a9-31f0-11f1-a5c8-3464a92b0560', 'NVIDIA GTX 1650', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c2f6-31f0-11f1-a5c8-3464a92b0560', '47b717a9-31f0-11f1-a5c8-3464a92b0560', 'NVIDIA RTX 3050', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c35e-31f0-11f1-a5c8-3464a92b0560', '47b717a9-31f0-11f1-a5c8-3464a92b0560', 'NVIDIA RTX 3060', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c3cd-31f0-11f1-a5c8-3464a92b0560', '47b717a9-31f0-11f1-a5c8-3464a92b0560', 'NVIDIA RTX 4060', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c460-31f0-11f1-a5c8-3464a92b0560', '47b71d11-31f0-11f1-a5c8-3464a92b0560', 'Integrated Graphics', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c4bb-31f0-11f1-a5c8-3464a92b0560', '47b71d11-31f0-11f1-a5c8-3464a92b0560', 'Intel UHD', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c50f-31f0-11f1-a5c8-3464a92b0560', '47b71d11-31f0-11f1-a5c8-3464a92b0560', 'Intel Iris Xe', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c573-31f0-11f1-a5c8-3464a92b0560', '47b71d11-31f0-11f1-a5c8-3464a92b0560', 'AMD Radeon Graphics', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c5da-31f0-11f1-a5c8-3464a92b0560', '47b71d11-31f0-11f1-a5c8-3464a92b0560', 'NVIDIA GTX 1650', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c64c-31f0-11f1-a5c8-3464a92b0560', '47b71d11-31f0-11f1-a5c8-3464a92b0560', 'NVIDIA RTX 3050', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c6c6-31f0-11f1-a5c8-3464a92b0560', '47b71d11-31f0-11f1-a5c8-3464a92b0560', 'NVIDIA RTX 3060', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c748-31f0-11f1-a5c8-3464a92b0560', '47b71d11-31f0-11f1-a5c8-3464a92b0560', 'NVIDIA RTX 4060', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c830-31f0-11f1-a5c8-3464a92b0560', '47b72e64-31f0-11f1-a5c8-3464a92b0560', 'Integrated Graphics', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c883-31f0-11f1-a5c8-3464a92b0560', '47b72e64-31f0-11f1-a5c8-3464a92b0560', 'Intel UHD', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c8d6-31f0-11f1-a5c8-3464a92b0560', '47b72e64-31f0-11f1-a5c8-3464a92b0560', 'Intel Iris Xe', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c93d-31f0-11f1-a5c8-3464a92b0560', '47b72e64-31f0-11f1-a5c8-3464a92b0560', 'AMD Radeon Graphics', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815c9af-31f0-11f1-a5c8-3464a92b0560', '47b72e64-31f0-11f1-a5c8-3464a92b0560', 'NVIDIA GTX 1650', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815ca29-31f0-11f1-a5c8-3464a92b0560', '47b72e64-31f0-11f1-a5c8-3464a92b0560', 'NVIDIA RTX 3050', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815caab-31f0-11f1-a5c8-3464a92b0560', '47b72e64-31f0-11f1-a5c8-3464a92b0560', 'NVIDIA RTX 3060', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4815cb39-31f0-11f1-a5c8-3464a92b0560', '47b72e64-31f0-11f1-a5c8-3464a92b0560', 'NVIDIA RTX 4060', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('481d4e72-31f0-11f1-a5c8-3464a92b0560', '47b7514f-31f0-11f1-a5c8-3464a92b0560', '4G', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('481d4f38-31f0-11f1-a5c8-3464a92b0560', '47b7514f-31f0-11f1-a5c8-3464a92b0560', '5G', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('481d4fd4-31f0-11f1-a5c8-3464a92b0560', '47b75693-31f0-11f1-a5c8-3464a92b0560', '4G', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('481d5031-31f0-11f1-a5c8-3464a92b0560', '47b75693-31f0-11f1-a5c8-3464a92b0560', '5G', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('482309dd-31f0-11f1-a5c8-3464a92b0560', '47b70222-31f0-11f1-a5c8-3464a92b0560', 'USB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48230a4b-31f0-11f1-a5c8-3464a92b0560', '47b70222-31f0-11f1-a5c8-3464a92b0560', 'Wi-Fi', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48230a9b-31f0-11f1-a5c8-3464a92b0560', '47b70222-31f0-11f1-a5c8-3464a92b0560', 'Bluetooth', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48230aef-31f0-11f1-a5c8-3464a92b0560', '47b70222-31f0-11f1-a5c8-3464a92b0560', 'Ethernet', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48230b45-31f0-11f1-a5c8-3464a92b0560', '47b70222-31f0-11f1-a5c8-3464a92b0560', 'USB + Wi-Fi', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48230b96-31f0-11f1-a5c8-3464a92b0560', '47b70222-31f0-11f1-a5c8-3464a92b0560', 'USB + Wi-Fi + Bluetooth', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48230be7-31f0-11f1-a5c8-3464a92b0560', '47b70222-31f0-11f1-a5c8-3464a92b0560', 'HDMI', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48230c31-31f0-11f1-a5c8-3464a92b0560', '47b70222-31f0-11f1-a5c8-3464a92b0560', 'VGA', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48230caf-31f0-11f1-a5c8-3464a92b0560', '47b70509-31f0-11f1-a5c8-3464a92b0560', 'USB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48230cfa-31f0-11f1-a5c8-3464a92b0560', '47b70509-31f0-11f1-a5c8-3464a92b0560', 'Wi-Fi', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48230d49-31f0-11f1-a5c8-3464a92b0560', '47b70509-31f0-11f1-a5c8-3464a92b0560', 'Bluetooth', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48230d90-31f0-11f1-a5c8-3464a92b0560', '47b70509-31f0-11f1-a5c8-3464a92b0560', 'Ethernet', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48230ddc-31f0-11f1-a5c8-3464a92b0560', '47b70509-31f0-11f1-a5c8-3464a92b0560', 'USB + Wi-Fi', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48230e28-31f0-11f1-a5c8-3464a92b0560', '47b70509-31f0-11f1-a5c8-3464a92b0560', 'USB + Wi-Fi + Bluetooth', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48230e79-31f0-11f1-a5c8-3464a92b0560', '47b70509-31f0-11f1-a5c8-3464a92b0560', 'HDMI', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48230eca-31f0-11f1-a5c8-3464a92b0560', '47b70509-31f0-11f1-a5c8-3464a92b0560', 'VGA', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48230f33-31f0-11f1-a5c8-3464a92b0560', '47b7081d-31f0-11f1-a5c8-3464a92b0560', 'USB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48230f7e-31f0-11f1-a5c8-3464a92b0560', '47b7081d-31f0-11f1-a5c8-3464a92b0560', 'Wi-Fi', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48230fc8-31f0-11f1-a5c8-3464a92b0560', '47b7081d-31f0-11f1-a5c8-3464a92b0560', 'Bluetooth', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231012-31f0-11f1-a5c8-3464a92b0560', '47b7081d-31f0-11f1-a5c8-3464a92b0560', 'Ethernet', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231065-31f0-11f1-a5c8-3464a92b0560', '47b7081d-31f0-11f1-a5c8-3464a92b0560', 'USB + Wi-Fi', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('482310b5-31f0-11f1-a5c8-3464a92b0560', '47b7081d-31f0-11f1-a5c8-3464a92b0560', 'USB + Wi-Fi + Bluetooth', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('482310fe-31f0-11f1-a5c8-3464a92b0560', '47b7081d-31f0-11f1-a5c8-3464a92b0560', 'HDMI', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231156-31f0-11f1-a5c8-3464a92b0560', '47b7081d-31f0-11f1-a5c8-3464a92b0560', 'VGA', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4823135c-31f0-11f1-a5c8-3464a92b0560', '47b73a79-31f0-11f1-a5c8-3464a92b0560', 'USB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('482313aa-31f0-11f1-a5c8-3464a92b0560', '47b73a79-31f0-11f1-a5c8-3464a92b0560', 'Wi-Fi', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('482313f9-31f0-11f1-a5c8-3464a92b0560', '47b73a79-31f0-11f1-a5c8-3464a92b0560', 'Bluetooth', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231449-31f0-11f1-a5c8-3464a92b0560', '47b73a79-31f0-11f1-a5c8-3464a92b0560', 'Ethernet', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('482314a4-31f0-11f1-a5c8-3464a92b0560', '47b73a79-31f0-11f1-a5c8-3464a92b0560', 'USB + Wi-Fi', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('482314f8-31f0-11f1-a5c8-3464a92b0560', '47b73a79-31f0-11f1-a5c8-3464a92b0560', 'USB + Wi-Fi + Bluetooth', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231546-31f0-11f1-a5c8-3464a92b0560', '47b73a79-31f0-11f1-a5c8-3464a92b0560', 'HDMI', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('482315a6-31f0-11f1-a5c8-3464a92b0560', '47b73a79-31f0-11f1-a5c8-3464a92b0560', 'VGA', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4823162a-31f0-11f1-a5c8-3464a92b0560', '47b740cd-31f0-11f1-a5c8-3464a92b0560', 'USB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4823167d-31f0-11f1-a5c8-3464a92b0560', '47b740cd-31f0-11f1-a5c8-3464a92b0560', 'Wi-Fi', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('482316d0-31f0-11f1-a5c8-3464a92b0560', '47b740cd-31f0-11f1-a5c8-3464a92b0560', 'Bluetooth', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231724-31f0-11f1-a5c8-3464a92b0560', '47b740cd-31f0-11f1-a5c8-3464a92b0560', 'Ethernet', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231786-31f0-11f1-a5c8-3464a92b0560', '47b740cd-31f0-11f1-a5c8-3464a92b0560', 'USB + Wi-Fi', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('482317dc-31f0-11f1-a5c8-3464a92b0560', '47b740cd-31f0-11f1-a5c8-3464a92b0560', 'USB + Wi-Fi + Bluetooth', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4823182f-31f0-11f1-a5c8-3464a92b0560', '47b740cd-31f0-11f1-a5c8-3464a92b0560', 'HDMI', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231895-31f0-11f1-a5c8-3464a92b0560', '47b740cd-31f0-11f1-a5c8-3464a92b0560', 'VGA', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4823190c-31f0-11f1-a5c8-3464a92b0560', '47b7435b-31f0-11f1-a5c8-3464a92b0560', 'USB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231962-31f0-11f1-a5c8-3464a92b0560', '47b7435b-31f0-11f1-a5c8-3464a92b0560', 'Wi-Fi', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('482319b9-31f0-11f1-a5c8-3464a92b0560', '47b7435b-31f0-11f1-a5c8-3464a92b0560', 'Bluetooth', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231a10-31f0-11f1-a5c8-3464a92b0560', '47b7435b-31f0-11f1-a5c8-3464a92b0560', 'Ethernet', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231a79-31f0-11f1-a5c8-3464a92b0560', '47b7435b-31f0-11f1-a5c8-3464a92b0560', 'USB + Wi-Fi', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231ad3-31f0-11f1-a5c8-3464a92b0560', '47b7435b-31f0-11f1-a5c8-3464a92b0560', 'USB + Wi-Fi + Bluetooth', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231b29-31f0-11f1-a5c8-3464a92b0560', '47b7435b-31f0-11f1-a5c8-3464a92b0560', 'HDMI', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231b98-31f0-11f1-a5c8-3464a92b0560', '47b7435b-31f0-11f1-a5c8-3464a92b0560', 'VGA', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231c1f-31f0-11f1-a5c8-3464a92b0560', '47b74719-31f0-11f1-a5c8-3464a92b0560', 'USB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231c79-31f0-11f1-a5c8-3464a92b0560', '47b74719-31f0-11f1-a5c8-3464a92b0560', 'Wi-Fi', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231cd6-31f0-11f1-a5c8-3464a92b0560', '47b74719-31f0-11f1-a5c8-3464a92b0560', 'Bluetooth', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231d32-31f0-11f1-a5c8-3464a92b0560', '47b74719-31f0-11f1-a5c8-3464a92b0560', 'Ethernet', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231da3-31f0-11f1-a5c8-3464a92b0560', '47b74719-31f0-11f1-a5c8-3464a92b0560', 'USB + Wi-Fi', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231e03-31f0-11f1-a5c8-3464a92b0560', '47b74719-31f0-11f1-a5c8-3464a92b0560', 'USB + Wi-Fi + Bluetooth', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231e5e-31f0-11f1-a5c8-3464a92b0560', '47b74719-31f0-11f1-a5c8-3464a92b0560', 'HDMI', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231eb9-31f0-11f1-a5c8-3464a92b0560', '47b74719-31f0-11f1-a5c8-3464a92b0560', 'VGA', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231f51-31f0-11f1-a5c8-3464a92b0560', '47b74c96-31f0-11f1-a5c8-3464a92b0560', 'USB', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48231fb8-31f0-11f1-a5c8-3464a92b0560', '47b74c96-31f0-11f1-a5c8-3464a92b0560', 'Wi-Fi', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4823201f-31f0-11f1-a5c8-3464a92b0560', '47b74c96-31f0-11f1-a5c8-3464a92b0560', 'Bluetooth', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48232085-31f0-11f1-a5c8-3464a92b0560', '47b74c96-31f0-11f1-a5c8-3464a92b0560', 'Ethernet', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('482320ec-31f0-11f1-a5c8-3464a92b0560', '47b74c96-31f0-11f1-a5c8-3464a92b0560', 'USB + Wi-Fi', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48232156-31f0-11f1-a5c8-3464a92b0560', '47b74c96-31f0-11f1-a5c8-3464a92b0560', 'USB + Wi-Fi + Bluetooth', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('482321bc-31f0-11f1-a5c8-3464a92b0560', '47b74c96-31f0-11f1-a5c8-3464a92b0560', 'HDMI', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48232221-31f0-11f1-a5c8-3464a92b0560', '47b74c96-31f0-11f1-a5c8-3464a92b0560', 'VGA', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('482f1eb1-31f0-11f1-a5c8-3464a92b0560', '47b744c1-31f0-11f1-a5c8-3464a92b0560', 'Inkjet', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('482f1f73-31f0-11f1-a5c8-3464a92b0560', '47b744c1-31f0-11f1-a5c8-3464a92b0560', 'Laser', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('482f2004-31f0-11f1-a5c8-3464a92b0560', '47b744c1-31f0-11f1-a5c8-3464a92b0560', 'Thermal', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('482f2091-31f0-11f1-a5c8-3464a92b0560', '47b744c1-31f0-11f1-a5c8-3464a92b0560', 'All-in-One', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('483850b9-31f0-11f1-a5c8-3464a92b0560', '47b73ee3-31f0-11f1-a5c8-3464a92b0560', 'Black & White', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48385151-31f0-11f1-a5c8-3464a92b0560', '47b73ee3-31f0-11f1-a5c8-3464a92b0560', 'Color', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('483851f1-31f0-11f1-a5c8-3464a92b0560', '47b73e35-31f0-11f1-a5c8-3464a92b0560', 'Black & White', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48385255-31f0-11f1-a5c8-3464a92b0560', '47b73e35-31f0-11f1-a5c8-3464a92b0560', 'Color', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48385319-31f0-11f1-a5c8-3464a92b0560', '47b74413-31f0-11f1-a5c8-3464a92b0560', 'Black & White', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('48385380-31f0-11f1-a5c8-3464a92b0560', '47b74413-31f0-11f1-a5c8-3464a92b0560', 'Color', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('483dc41e-31f0-11f1-a5c8-3464a92b0560', '47b73d7d-31f0-11f1-a5c8-3464a92b0560', 'A4', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('483dc532-31f0-11f1-a5c8-3464a92b0560', '47b73d7d-31f0-11f1-a5c8-3464a92b0560', 'A3', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('483dc5a7-31f0-11f1-a5c8-3464a92b0560', '47b73d7d-31f0-11f1-a5c8-3464a92b0560', 'Letter', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('483dc61d-31f0-11f1-a5c8-3464a92b0560', '47b73d7d-31f0-11f1-a5c8-3464a92b0560', 'Legal', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('483dc6de-31f0-11f1-a5c8-3464a92b0560', '47b73fda-31f0-11f1-a5c8-3464a92b0560', 'A4', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('483dc762-31f0-11f1-a5c8-3464a92b0560', '47b73fda-31f0-11f1-a5c8-3464a92b0560', 'A3', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('483dc7df-31f0-11f1-a5c8-3464a92b0560', '47b73fda-31f0-11f1-a5c8-3464a92b0560', 'Letter', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('483dc866-31f0-11f1-a5c8-3464a92b0560', '47b73fda-31f0-11f1-a5c8-3464a92b0560', 'Legal', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('483dc912-31f0-11f1-a5c8-3464a92b0560', '47b7426a-31f0-11f1-a5c8-3464a92b0560', 'A4', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('483dc997-31f0-11f1-a5c8-3464a92b0560', '47b7426a-31f0-11f1-a5c8-3464a92b0560', 'A3', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('483dca14-31f0-11f1-a5c8-3464a92b0560', '47b7426a-31f0-11f1-a5c8-3464a92b0560', 'Letter', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('483dca9d-31f0-11f1-a5c8-3464a92b0560', '47b7426a-31f0-11f1-a5c8-3464a92b0560', 'Legal', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4843fceb-31f0-11f1-a5c8-3464a92b0560', '47b7417e-31f0-11f1-a5c8-3464a92b0560', 'Flatbed', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4843fd66-31f0-11f1-a5c8-3464a92b0560', '47b7417e-31f0-11f1-a5c8-3464a92b0560', 'Sheet-fed', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4843fdc3-31f0-11f1-a5c8-3464a92b0560', '47b7417e-31f0-11f1-a5c8-3464a92b0560', 'Portable', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ac8fe-31f0-11f1-a5c8-3464a92b0560', '47b70426-31f0-11f1-a5c8-3464a92b0560', '720p', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ac9f3-31f0-11f1-a5c8-3464a92b0560', '47b70426-31f0-11f1-a5c8-3464a92b0560', '1080p', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484acab8-31f0-11f1-a5c8-3464a92b0560', '47b70426-31f0-11f1-a5c8-3464a92b0560', '2K', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484acb7b-31f0-11f1-a5c8-3464a92b0560', '47b70426-31f0-11f1-a5c8-3464a92b0560', '4K', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484acc21-31f0-11f1-a5c8-3464a92b0560', '47b70426-31f0-11f1-a5c8-3464a92b0560', '12MP', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484accd5-31f0-11f1-a5c8-3464a92b0560', '47b70426-31f0-11f1-a5c8-3464a92b0560', '20MP', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484acd95-31f0-11f1-a5c8-3464a92b0560', '47b70426-31f0-11f1-a5c8-3464a92b0560', '24MP', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ace66-31f0-11f1-a5c8-3464a92b0560', '47b70426-31f0-11f1-a5c8-3464a92b0560', '48MP', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484acfa6-31f0-11f1-a5c8-3464a92b0560', '47b7067a-31f0-11f1-a5c8-3464a92b0560', '720p', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ad051-31f0-11f1-a5c8-3464a92b0560', '47b7067a-31f0-11f1-a5c8-3464a92b0560', '1080p', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ad106-31f0-11f1-a5c8-3464a92b0560', '47b7067a-31f0-11f1-a5c8-3464a92b0560', '2K', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ad1c7-31f0-11f1-a5c8-3464a92b0560', '47b7067a-31f0-11f1-a5c8-3464a92b0560', '4K', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ad28d-31f0-11f1-a5c8-3464a92b0560', '47b7067a-31f0-11f1-a5c8-3464a92b0560', '12MP', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ad363-31f0-11f1-a5c8-3464a92b0560', '47b7067a-31f0-11f1-a5c8-3464a92b0560', '20MP', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ad445-31f0-11f1-a5c8-3464a92b0560', '47b7067a-31f0-11f1-a5c8-3464a92b0560', '24MP', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ad539-31f0-11f1-a5c8-3464a92b0560', '47b7067a-31f0-11f1-a5c8-3464a92b0560', '48MP', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ad650-31f0-11f1-a5c8-3464a92b0560', '47b70b67-31f0-11f1-a5c8-3464a92b0560', '720p', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ad71a-31f0-11f1-a5c8-3464a92b0560', '47b70b67-31f0-11f1-a5c8-3464a92b0560', '1080p', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ad843-31f0-11f1-a5c8-3464a92b0560', '47b70b67-31f0-11f1-a5c8-3464a92b0560', '2K', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ad933-31f0-11f1-a5c8-3464a92b0560', '47b70b67-31f0-11f1-a5c8-3464a92b0560', '4K', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ada28-31f0-11f1-a5c8-3464a92b0560', '47b70b67-31f0-11f1-a5c8-3464a92b0560', '12MP', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484adb2a-31f0-11f1-a5c8-3464a92b0560', '47b70b67-31f0-11f1-a5c8-3464a92b0560', '20MP', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484adc3b-31f0-11f1-a5c8-3464a92b0560', '47b70b67-31f0-11f1-a5c8-3464a92b0560', '24MP', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484add5b-31f0-11f1-a5c8-3464a92b0560', '47b70b67-31f0-11f1-a5c8-3464a92b0560', '48MP', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484adebf-31f0-11f1-a5c8-3464a92b0560', '47b70e6e-31f0-11f1-a5c8-3464a92b0560', '720p', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484adf9d-31f0-11f1-a5c8-3464a92b0560', '47b70e6e-31f0-11f1-a5c8-3464a92b0560', '1080p', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ae08a-31f0-11f1-a5c8-3464a92b0560', '47b70e6e-31f0-11f1-a5c8-3464a92b0560', '2K', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ae184-31f0-11f1-a5c8-3464a92b0560', '47b70e6e-31f0-11f1-a5c8-3464a92b0560', '4K', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ae29b-31f0-11f1-a5c8-3464a92b0560', '47b70e6e-31f0-11f1-a5c8-3464a92b0560', '12MP', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ae3c5-31f0-11f1-a5c8-3464a92b0560', '47b70e6e-31f0-11f1-a5c8-3464a92b0560', '20MP', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ae4fc-31f0-11f1-a5c8-3464a92b0560', '47b70e6e-31f0-11f1-a5c8-3464a92b0560', '24MP', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ae642-31f0-11f1-a5c8-3464a92b0560', '47b70e6e-31f0-11f1-a5c8-3464a92b0560', '48MP', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ae7b0-31f0-11f1-a5c8-3464a92b0560', '47b71118-31f0-11f1-a5c8-3464a92b0560', '720p', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ae86a-31f0-11f1-a5c8-3464a92b0560', '47b71118-31f0-11f1-a5c8-3464a92b0560', '1080p', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484ae93b-31f0-11f1-a5c8-3464a92b0560', '47b71118-31f0-11f1-a5c8-3464a92b0560', '2K', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484aea1d-31f0-11f1-a5c8-3464a92b0560', '47b71118-31f0-11f1-a5c8-3464a92b0560', '4K', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484aeb5a-31f0-11f1-a5c8-3464a92b0560', '47b71118-31f0-11f1-a5c8-3464a92b0560', '12MP', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484aeca3-31f0-11f1-a5c8-3464a92b0560', '47b71118-31f0-11f1-a5c8-3464a92b0560', '20MP', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484aedfa-31f0-11f1-a5c8-3464a92b0560', '47b71118-31f0-11f1-a5c8-3464a92b0560', '24MP', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484aef62-31f0-11f1-a5c8-3464a92b0560', '47b71118-31f0-11f1-a5c8-3464a92b0560', '48MP', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484af16f-31f0-11f1-a5c8-3464a92b0560', '47b714bd-31f0-11f1-a5c8-3464a92b0560', '720p', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484af22f-31f0-11f1-a5c8-3464a92b0560', '47b714bd-31f0-11f1-a5c8-3464a92b0560', '1080p', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484af30f-31f0-11f1-a5c8-3464a92b0560', '47b714bd-31f0-11f1-a5c8-3464a92b0560', '2K', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484af400-31f0-11f1-a5c8-3464a92b0560', '47b714bd-31f0-11f1-a5c8-3464a92b0560', '4K', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484af560-31f0-11f1-a5c8-3464a92b0560', '47b714bd-31f0-11f1-a5c8-3464a92b0560', '12MP', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484af6ce-31f0-11f1-a5c8-3464a92b0560', '47b714bd-31f0-11f1-a5c8-3464a92b0560', '20MP', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484af84b-31f0-11f1-a5c8-3464a92b0560', '47b714bd-31f0-11f1-a5c8-3464a92b0560', '24MP', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484af9da-31f0-11f1-a5c8-3464a92b0560', '47b714bd-31f0-11f1-a5c8-3464a92b0560', '48MP', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484afd5c-31f0-11f1-a5c8-3464a92b0560', '47b733cb-31f0-11f1-a5c8-3464a92b0560', '720p', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484afe21-31f0-11f1-a5c8-3464a92b0560', '47b733cb-31f0-11f1-a5c8-3464a92b0560', '1080p', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484aff0c-31f0-11f1-a5c8-3464a92b0560', '47b733cb-31f0-11f1-a5c8-3464a92b0560', '2K', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b0006-31f0-11f1-a5c8-3464a92b0560', '47b733cb-31f0-11f1-a5c8-3464a92b0560', '4K', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b0186-31f0-11f1-a5c8-3464a92b0560', '47b733cb-31f0-11f1-a5c8-3464a92b0560', '12MP', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b0318-31f0-11f1-a5c8-3464a92b0560', '47b733cb-31f0-11f1-a5c8-3464a92b0560', '20MP', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b04b6-31f0-11f1-a5c8-3464a92b0560', '47b733cb-31f0-11f1-a5c8-3464a92b0560', '24MP', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b0662-31f0-11f1-a5c8-3464a92b0560', '47b733cb-31f0-11f1-a5c8-3464a92b0560', '48MP', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b0852-31f0-11f1-a5c8-3464a92b0560', '47b7368d-31f0-11f1-a5c8-3464a92b0560', '720p', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b091a-31f0-11f1-a5c8-3464a92b0560', '47b7368d-31f0-11f1-a5c8-3464a92b0560', '1080p', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b0a13-31f0-11f1-a5c8-3464a92b0560', '47b7368d-31f0-11f1-a5c8-3464a92b0560', '2K', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b0b1c-31f0-11f1-a5c8-3464a92b0560', '47b7368d-31f0-11f1-a5c8-3464a92b0560', '4K', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b0cc1-31f0-11f1-a5c8-3464a92b0560', '47b7368d-31f0-11f1-a5c8-3464a92b0560', '12MP', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b0e76-31f0-11f1-a5c8-3464a92b0560', '47b7368d-31f0-11f1-a5c8-3464a92b0560', '20MP', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b1037-31f0-11f1-a5c8-3464a92b0560', '47b7368d-31f0-11f1-a5c8-3464a92b0560', '24MP', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b1208-31f0-11f1-a5c8-3464a92b0560', '47b7368d-31f0-11f1-a5c8-3464a92b0560', '48MP', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b1465-31f0-11f1-a5c8-3464a92b0560', '47b73c5a-31f0-11f1-a5c8-3464a92b0560', '720p', 1, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b153a-31f0-11f1-a5c8-3464a92b0560', '47b73c5a-31f0-11f1-a5c8-3464a92b0560', '1080p', 2, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b1647-31f0-11f1-a5c8-3464a92b0560', '47b73c5a-31f0-11f1-a5c8-3464a92b0560', '2K', 3, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b1762-31f0-11f1-a5c8-3464a92b0560', '47b73c5a-31f0-11f1-a5c8-3464a92b0560', '4K', 4, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b192e-31f0-11f1-a5c8-3464a92b0560', '47b73c5a-31f0-11f1-a5c8-3464a92b0560', '12MP', 5, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b1b0a-31f0-11f1-a5c8-3464a92b0560', '47b73c5a-31f0-11f1-a5c8-3464a92b0560', '20MP', 6, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b1cf5-31f0-11f1-a5c8-3464a92b0560', '47b73c5a-31f0-11f1-a5c8-3464a92b0560', '24MP', 7, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('484b1ef8-31f0-11f1-a5c8-3464a92b0560', '47b73c5a-31f0-11f1-a5c8-3464a92b0560', '48MP', 8, 1, '2026-04-06 22:39:09', NULL, '2026-04-25 14:45:41.398'),
('4858cf1e-31f0-11f1-a5c8-3464a92b0560', '47b73b23-31f0-11f1-a5c8-3464a92b0560', '2500 Lumens', 1, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('4858d014-31f0-11f1-a5c8-3464a92b0560', '47b73b23-31f0-11f1-a5c8-3464a92b0560', '3000 Lumens', 2, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('4858d0dd-31f0-11f1-a5c8-3464a92b0560', '47b73b23-31f0-11f1-a5c8-3464a92b0560', '3500 Lumens', 3, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('4858d1a7-31f0-11f1-a5c8-3464a92b0560', '47b73b23-31f0-11f1-a5c8-3464a92b0560', '4000 Lumens', 4, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('486237a7-31f0-11f1-a5c8-3464a92b0560', '47b73974-31f0-11f1-a5c8-3464a92b0560', '650VA', 1, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('4862389e-31f0-11f1-a5c8-3464a92b0560', '47b73974-31f0-11f1-a5c8-3464a92b0560', '850VA', 2, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48623964-31f0-11f1-a5c8-3464a92b0560', '47b73974-31f0-11f1-a5c8-3464a92b0560', '1100VA', 3, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48623a2b-31f0-11f1-a5c8-3464a92b0560', '47b73974-31f0-11f1-a5c8-3464a92b0560', '1500VA', 4, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48623ae1-31f0-11f1-a5c8-3464a92b0560', '47b73974-31f0-11f1-a5c8-3464a92b0560', '2000VA', 5, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48731dc0-31f0-11f1-a5c8-3464a92b0560', '47b738d4-31f0-11f1-a5c8-3464a92b0560', 'Up to 15 min', 1, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48731e34-31f0-11f1-a5c8-3464a92b0560', '47b738d4-31f0-11f1-a5c8-3464a92b0560', 'Up to 30 min', 2, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48731e90-31f0-11f1-a5c8-3464a92b0560', '47b738d4-31f0-11f1-a5c8-3464a92b0560', 'Up to 45 min', 3, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48731ef0-31f0-11f1-a5c8-3464a92b0560', '47b738d4-31f0-11f1-a5c8-3464a92b0560', 'Up to 60 min', 4, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('4882fd15-31f0-11f1-a5c8-3464a92b0560', '47b73836-31f0-11f1-a5c8-3464a92b0560', 'Line Interactive', 1, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('4882fdcf-31f0-11f1-a5c8-3464a92b0560', '47b73836-31f0-11f1-a5c8-3464a92b0560', 'Offline', 2, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('4882fe30-31f0-11f1-a5c8-3464a92b0560', '47b73836-31f0-11f1-a5c8-3464a92b0560', 'Online', 3, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('488899e3-31f0-11f1-a5c8-3464a92b0560', '47b73565-31f0-11f1-a5c8-3464a92b0560', 'IPS', 1, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48889a51-31f0-11f1-a5c8-3464a92b0560', '47b73565-31f0-11f1-a5c8-3464a92b0560', 'VA', 2, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48889aa1-31f0-11f1-a5c8-3464a92b0560', '47b73565-31f0-11f1-a5c8-3464a92b0560', 'TN', 3, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48889af0-31f0-11f1-a5c8-3464a92b0560', '47b73565-31f0-11f1-a5c8-3464a92b0560', 'OLED', 4, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('4890484a-31f0-11f1-a5c8-3464a92b0560', '47b732a8-31f0-11f1-a5c8-3464a92b0560', 'Yes', 1, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('489048ba-31f0-11f1-a5c8-3464a92b0560', '47b732a8-31f0-11f1-a5c8-3464a92b0560', 'No', 2, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48993cb5-31f0-11f1-a5c8-3464a92b0560', '47b711cc-31f0-11f1-a5c8-3464a92b0560', 'Full Frame', 1, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48993d6a-31f0-11f1-a5c8-3464a92b0560', '47b711cc-31f0-11f1-a5c8-3464a92b0560', 'APS-C', 2, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48993db9-31f0-11f1-a5c8-3464a92b0560', '47b711cc-31f0-11f1-a5c8-3464a92b0560', 'Micro Four Thirds', 3, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48993e0b-31f0-11f1-a5c8-3464a92b0560', '47b711cc-31f0-11f1-a5c8-3464a92b0560', '1-inch Sensor', 4, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48993e98-31f0-11f1-a5c8-3464a92b0560', '47b7157e-31f0-11f1-a5c8-3464a92b0560', 'Full Frame', 1, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48993ef3-31f0-11f1-a5c8-3464a92b0560', '47b7157e-31f0-11f1-a5c8-3464a92b0560', 'APS-C', 2, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48993f46-31f0-11f1-a5c8-3464a92b0560', '47b7157e-31f0-11f1-a5c8-3464a92b0560', 'Micro Four Thirds', 3, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48993f97-31f0-11f1-a5c8-3464a92b0560', '47b7157e-31f0-11f1-a5c8-3464a92b0560', '1-inch Sensor', 4, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('489dbca9-31f0-11f1-a5c8-3464a92b0560', '47b71025-31f0-11f1-a5c8-3464a92b0560', 'Canon EF', 1, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('489dbd1b-31f0-11f1-a5c8-3464a92b0560', '47b71025-31f0-11f1-a5c8-3464a92b0560', 'Canon RF', 2, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('489dbd74-31f0-11f1-a5c8-3464a92b0560', '47b71025-31f0-11f1-a5c8-3464a92b0560', 'Nikon F', 3, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('489dbdd0-31f0-11f1-a5c8-3464a92b0560', '47b71025-31f0-11f1-a5c8-3464a92b0560', 'Nikon Z', 4, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('489dbe1c-31f0-11f1-a5c8-3464a92b0560', '47b71025-31f0-11f1-a5c8-3464a92b0560', 'Sony E', 5, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('489dbe79-31f0-11f1-a5c8-3464a92b0560', '47b71025-31f0-11f1-a5c8-3464a92b0560', 'Fujifilm X', 6, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('489dbf02-31f0-11f1-a5c8-3464a92b0560', '47b71384-31f0-11f1-a5c8-3464a92b0560', 'Canon EF', 1, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('489dbf50-31f0-11f1-a5c8-3464a92b0560', '47b71384-31f0-11f1-a5c8-3464a92b0560', 'Canon RF', 2, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('489dbfa4-31f0-11f1-a5c8-3464a92b0560', '47b71384-31f0-11f1-a5c8-3464a92b0560', 'Nikon F', 3, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('489dc000-31f0-11f1-a5c8-3464a92b0560', '47b71384-31f0-11f1-a5c8-3464a92b0560', 'Nikon Z', 4, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('489dc04d-31f0-11f1-a5c8-3464a92b0560', '47b71384-31f0-11f1-a5c8-3464a92b0560', 'Sony E', 5, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('489dc0b1-31f0-11f1-a5c8-3464a92b0560', '47b71384-31f0-11f1-a5c8-3464a92b0560', 'Fujifilm X', 6, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48a6b81d-31f0-11f1-a5c8-3464a92b0560', '47b70a8f-31f0-11f1-a5c8-3464a92b0560', 'Full HD', 1, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48a6b904-31f0-11f1-a5c8-3464a92b0560', '47b70a8f-31f0-11f1-a5c8-3464a92b0560', '4K', 2, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48a6b97d-31f0-11f1-a5c8-3464a92b0560', '47b70a8f-31f0-11f1-a5c8-3464a92b0560', '5.3K', 3, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48a6b9f3-31f0-11f1-a5c8-3464a92b0560', '47b70a8f-31f0-11f1-a5c8-3464a92b0560', '8K', 4, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48a6bab2-31f0-11f1-a5c8-3464a92b0560', '47b70c95-31f0-11f1-a5c8-3464a92b0560', 'Full HD', 1, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48a6bb29-31f0-11f1-a5c8-3464a92b0560', '47b70c95-31f0-11f1-a5c8-3464a92b0560', '4K', 2, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48a6bb86-31f0-11f1-a5c8-3464a92b0560', '47b70c95-31f0-11f1-a5c8-3464a92b0560', '5.3K', 3, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48a6bbfe-31f0-11f1-a5c8-3464a92b0560', '47b70c95-31f0-11f1-a5c8-3464a92b0560', '8K', 4, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48a6bcb1-31f0-11f1-a5c8-3464a92b0560', '47b70f69-31f0-11f1-a5c8-3464a92b0560', 'Full HD', 1, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48a6bd2f-31f0-11f1-a5c8-3464a92b0560', '47b70f69-31f0-11f1-a5c8-3464a92b0560', '4K', 2, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48a6bd96-31f0-11f1-a5c8-3464a92b0560', '47b70f69-31f0-11f1-a5c8-3464a92b0560', '5.3K', 3, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48a6be1b-31f0-11f1-a5c8-3464a92b0560', '47b70f69-31f0-11f1-a5c8-3464a92b0560', '8K', 4, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48a6bed4-31f0-11f1-a5c8-3464a92b0560', '47b712ca-31f0-11f1-a5c8-3464a92b0560', 'Full HD', 1, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48a6bf5d-31f0-11f1-a5c8-3464a92b0560', '47b712ca-31f0-11f1-a5c8-3464a92b0560', '4K', 2, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48a6bfc4-31f0-11f1-a5c8-3464a92b0560', '47b712ca-31f0-11f1-a5c8-3464a92b0560', '5.3K', 3, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48a6c056-31f0-11f1-a5c8-3464a92b0560', '47b712ca-31f0-11f1-a5c8-3464a92b0560', '8K', 4, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48abc75e-31f0-11f1-a5c8-3464a92b0560', '47b70d90-31f0-11f1-a5c8-3464a92b0560', '3x', 1, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48abc7d3-31f0-11f1-a5c8-3464a92b0560', '47b70d90-31f0-11f1-a5c8-3464a92b0560', '5x', 2, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48abc832-31f0-11f1-a5c8-3464a92b0560', '47b70d90-31f0-11f1-a5c8-3464a92b0560', '10x', 3, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48abc893-31f0-11f1-a5c8-3464a92b0560', '47b70d90-31f0-11f1-a5c8-3464a92b0560', '20x', 4, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48b143bd-31f0-11f1-a5c8-3464a92b0560', '47b705b8-31f0-11f1-a5c8-3464a92b0560', 'Yes', 1, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48b1442f-31f0-11f1-a5c8-3464a92b0560', '47b705b8-31f0-11f1-a5c8-3464a92b0560', 'No', 2, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398');
INSERT INTO `specification_values` (`id`, `specification_id`, `value`, `sort_order`, `is_active`, `created_at`, `data_entrant`, `entry_date`) VALUES
('48b144c4-31f0-11f1-a5c8-3464a92b0560', '47b709d3-31f0-11f1-a5c8-3464a92b0560', 'Yes', 1, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48b14516-31f0-11f1-a5c8-3464a92b0560', '47b709d3-31f0-11f1-a5c8-3464a92b0560', 'No', 2, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48b5cbd6-31f0-11f1-a5c8-3464a92b0560', '47b7072a-31f0-11f1-a5c8-3464a92b0560', 'Bullet', 1, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48b5cc48-31f0-11f1-a5c8-3464a92b0560', '47b7072a-31f0-11f1-a5c8-3464a92b0560', 'Dome', 2, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48b5cca4-31f0-11f1-a5c8-3464a92b0560', '47b7072a-31f0-11f1-a5c8-3464a92b0560', 'PTZ', 3, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('48b5ccf2-31f0-11f1-a5c8-3464a92b0560', '47b7072a-31f0-11f1-a5c8-3464a92b0560', 'Wireless', 4, 1, '2026-04-06 22:39:10', NULL, '2026-04-25 14:45:41.398'),
('4db072b8-73a3-4b7e-ba16-b999f4b6298c', '47b7240b-31f0-11f1-a5c8-3464a92b0560', '8GB', 2, 1, '2026-04-29 13:09:20', NULL, '2026-04-29 13:09:20.853'),
('4f8b055b-728e-478a-af7d-7a2f64a8271d', '47b719af-31f0-11f1-a5c8-3464a92b0560', '6GB', 1, 1, '2026-04-29 13:11:37', NULL, '2026-04-29 13:11:37.090'),
('52ee0f2b-9c21-4638-8cee-38f807974bb6', '47b72aaa-31f0-11f1-a5c8-3464a92b0560', '12GB', 3, 1, '2026-04-29 13:08:40', NULL, '2026-04-29 13:08:40.373'),
('59ce7e9f-28ef-482b-b5de-730ff070dc36', '47b72aaa-31f0-11f1-a5c8-3464a92b0560', '6GB', 1, 1, '2026-04-29 13:08:40', NULL, '2026-04-29 13:08:40.373'),
('5a4e4b82-f392-4c57-97d9-75bd16119c4d', '47b7240b-31f0-11f1-a5c8-3464a92b0560', '14GB', 4, 1, '2026-04-29 13:09:20', NULL, '2026-04-29 13:09:20.853'),
('5aace2d4-b8ec-4046-9ed1-b6388f296863', '47b73079-31f0-11f1-a5c8-3464a92b0560', '4GB', 0, 1, '2026-04-29 13:07:30', NULL, '2026-04-29 13:07:30.440'),
('631e1036-b8d3-4ba1-9a34-c6b9735f744d', '47b71f41-31f0-11f1-a5c8-3464a92b0560', '16GB', 5, 1, '2026-04-29 13:10:38', NULL, '2026-04-29 13:10:38.635'),
('632398fb-5bd5-45b4-b23d-9af6b6fe7547', '47b74959-31f0-11f1-a5c8-3464a92b0560', '14GB', 4, 1, '2026-04-29 13:05:02', NULL, '2026-04-29 13:05:02.979'),
('663bc1a7-1db9-47e5-8b26-6a6561b282f7', '47b70050-31f0-11f1-a5c8-3464a92b0560', '64GB', 7, 1, '2026-04-29 13:01:11', NULL, '2026-04-29 13:01:11.959'),
('6868e36d-e7bc-4143-b6ed-6c4a34749065', '47b6f406-31f0-11f1-a5c8-3464a92b0560', '8GB', 2, 1, '2026-04-29 13:02:22', NULL, '2026-04-29 13:02:22.847'),
('6cd0d1df-7877-4ac9-9b04-cf24cf44f915', '47b72aaa-31f0-11f1-a5c8-3464a92b0560', '16GB', 5, 1, '2026-04-29 13:08:40', NULL, '2026-04-29 13:08:40.374'),
('6df576dd-178e-4e73-88ba-9ef0943bf385', '47b719af-31f0-11f1-a5c8-3464a92b0560', '14GB', 4, 1, '2026-04-29 13:11:37', NULL, '2026-04-29 13:11:37.091'),
('6ffd4fe7-d236-4ad6-853b-58cf972be728', '47b719af-31f0-11f1-a5c8-3464a92b0560', '8GB', 2, 1, '2026-04-29 13:11:37', NULL, '2026-04-29 13:11:37.091'),
('709ae29a-20d7-49f8-a60a-0f25377125c3', '47b719af-31f0-11f1-a5c8-3464a92b0560', '32GB', 6, 1, '2026-04-29 13:11:37', NULL, '2026-04-29 13:11:37.092'),
('71cf0dc1-69e3-4225-bb50-1b011efed8bc', '47b72aaa-31f0-11f1-a5c8-3464a92b0560', '8GB', 2, 1, '2026-04-29 13:08:40', NULL, '2026-04-29 13:08:40.373'),
('71d65dcc-3fd1-4043-9305-11e884914166', '47b6f406-31f0-11f1-a5c8-3464a92b0560', '32GB', 6, 1, '2026-04-29 13:02:22', NULL, '2026-04-29 13:02:22.848'),
('74e49ebe-1193-4cf6-b6a6-65bd814b58b0', '47b74959-31f0-11f1-a5c8-3464a92b0560', '32GB', 6, 1, '2026-04-29 13:05:02', NULL, '2026-04-29 13:05:02.979'),
('7726a3c1-c96f-4589-81d2-b7b6ea864196', '47b73079-31f0-11f1-a5c8-3464a92b0560', '8GB', 2, 1, '2026-04-29 13:07:30', NULL, '2026-04-29 13:07:30.441'),
('7a505c5e-3238-4e1e-ad31-aaaf2e55fc40', '47b6ea9e-31f0-11f1-a5c8-3464a92b0560', '32GB', 6, 1, '2026-04-29 13:06:07', NULL, '2026-04-29 13:06:07.400'),
('7c2b863d-79d3-4a86-aefe-789559cd6e1f', '47b6d228-31f0-11f1-a5c8-3464a92b0560', '12GB', 3, 1, '2026-04-29 13:06:49', NULL, '2026-04-29 13:06:49.908'),
('7cd14507-9041-4d12-a81e-da1e0afdd715', '47b6f406-31f0-11f1-a5c8-3464a92b0560', '16GB', 5, 1, '2026-04-29 13:02:22', NULL, '2026-04-29 13:02:22.848'),
('80e3b531-7c6c-4953-98b9-b823bc6a0bf1', '47b74e9d-31f0-11f1-a5c8-3464a92b0560', '32GB', 3, 1, '2026-04-29 13:09:57', NULL, '2026-04-29 13:09:57.851'),
('81326e6d-5e69-4f6a-a8b8-858dc63c33eb', '47b73079-31f0-11f1-a5c8-3464a92b0560', '6GB', 1, 1, '2026-04-29 13:07:30', NULL, '2026-04-29 13:07:30.441'),
('86777933-68b8-48ac-89b3-9ad8979892da', '47b719af-31f0-11f1-a5c8-3464a92b0560', '12GB', 3, 1, '2026-04-29 13:11:37', NULL, '2026-04-29 13:11:37.091'),
('89ebff1c-e0bb-4aee-baef-957144a332d7', '47b6fa00-31f0-11f1-a5c8-3464a92b0560', '6GB', 1, 1, '2026-04-29 13:01:33', NULL, '2026-04-29 13:01:33.849'),
('9170d747-2268-4a0e-81d3-c315d10006e7', '47b71f41-31f0-11f1-a5c8-3464a92b0560', '12GB', 3, 1, '2026-04-29 13:10:38', NULL, '2026-04-29 13:10:38.634'),
('96ee4793-6cf8-45e9-a111-239475ed88ef', '47b6d228-31f0-11f1-a5c8-3464a92b0560', '64GB', 7, 1, '2026-04-29 13:06:49', NULL, '2026-04-29 13:06:49.909'),
('981843c6-44e6-41c7-8eb3-d12e2073836c', '47b6fa00-31f0-11f1-a5c8-3464a92b0560', '32GB', 6, 1, '2026-04-29 13:01:33', NULL, '2026-04-29 13:01:33.850'),
('991b369e-a914-453e-8722-c7d7f761c3b6', '47b719af-31f0-11f1-a5c8-3464a92b0560', '4GB', 0, 1, '2026-04-29 13:11:37', NULL, '2026-04-29 13:11:37.090'),
('9a102a0b-f019-4cab-92be-444ea2e2e6a5', '47b74e9d-31f0-11f1-a5c8-3464a92b0560', '16GB', 2, 1, '2026-04-29 13:09:57', NULL, '2026-04-29 13:09:57.851'),
('9bac121e-9240-40e1-b8a2-eeb40d5ff814', '47b6fa00-31f0-11f1-a5c8-3464a92b0560', '64GB', 7, 1, '2026-04-29 13:01:33', NULL, '2026-04-29 13:01:33.850'),
('9c654611-b9c2-43ed-aa43-7e1f4c8a633c', '47b6d770-31f0-11f1-a5c8-3464a92b0560', '14GB', 4, 1, '2026-04-29 13:03:35', NULL, '2026-04-29 13:03:35.071'),
('9cc96017-a89c-4734-abfd-9f83a424d642', '47b7240b-31f0-11f1-a5c8-3464a92b0560', '4GB', 0, 1, '2026-04-29 13:09:20', NULL, '2026-04-29 13:09:20.853'),
('9dbbb5ee-7b9b-4ee4-b779-7ad5ea0b2fad', '47b6d770-31f0-11f1-a5c8-3464a92b0560', '8GB', 2, 1, '2026-04-29 13:03:35', NULL, '2026-04-29 13:03:35.071'),
('9ddb0f7a-2ae4-4104-9242-c2f47bf91eb0', '47b6ea9e-31f0-11f1-a5c8-3464a92b0560', '16GB', 5, 1, '2026-04-29 13:06:07', NULL, '2026-04-29 13:06:07.399'),
('9eb5f5fb-ceb8-482c-b8e8-1e19a7ae5f4a', '47b71f41-31f0-11f1-a5c8-3464a92b0560', '6GB', 1, 1, '2026-04-29 13:10:38', NULL, '2026-04-29 13:10:38.628'),
('a0d50c70-050e-439f-8da0-6a763a9e5c67', '47b73079-31f0-11f1-a5c8-3464a92b0560', '32GB', 6, 1, '2026-04-29 13:07:30', NULL, '2026-04-29 13:07:30.442'),
('a280928d-682b-4c78-b927-e0783944d705', '47b71f41-31f0-11f1-a5c8-3464a92b0560', '32GB', 6, 1, '2026-04-29 13:10:38', NULL, '2026-04-29 13:10:38.636'),
('a2ab0316-64bf-43fe-815a-70fb02ece37d', '47b6d228-31f0-11f1-a5c8-3464a92b0560', '14GB', 4, 1, '2026-04-29 13:06:49', NULL, '2026-04-29 13:06:49.908'),
('a2e2336c-9660-4a4c-bfa2-12432eaedfc0', '47b7240b-31f0-11f1-a5c8-3464a92b0560', '16GB', 5, 1, '2026-04-29 13:09:20', NULL, '2026-04-29 13:09:20.854'),
('a4db04b2-e0b0-4768-b5e1-1738deff64ba', '47b6dbbb-31f0-11f1-a5c8-3464a92b0560', '12GB', 3, 1, '2026-04-29 13:05:33', NULL, '2026-04-29 13:05:33.505'),
('a55f578c-4a16-4937-bb12-07f71e9be28e', '47b70050-31f0-11f1-a5c8-3464a92b0560', '6GB', 1, 1, '2026-04-29 13:01:11', NULL, '2026-04-29 13:01:11.952'),
('a633a8da-b90d-4656-b9b0-f460473f97f8', '47b6dbbb-31f0-11f1-a5c8-3464a92b0560', '32GB', 6, 1, '2026-04-29 13:05:33', NULL, '2026-04-29 13:05:33.506'),
('aa263999-a88e-4da3-85df-ccdd2904970c', '47b70050-31f0-11f1-a5c8-3464a92b0560', '4GB', 0, 1, '2026-04-29 13:01:11', NULL, '2026-04-29 13:01:11.950'),
('ad70d6b9-f491-4002-916a-b55ee3311fd3', '47b6fa00-31f0-11f1-a5c8-3464a92b0560', '14GB', 4, 1, '2026-04-29 13:01:33', NULL, '2026-04-29 13:01:33.850'),
('b571cc47-3147-49b3-8215-27e8ca3871b9', '47b7240b-31f0-11f1-a5c8-3464a92b0560', '32GB', 6, 1, '2026-04-29 13:09:20', NULL, '2026-04-29 13:09:20.854'),
('b6f4e78f-9de8-4159-bc44-587bb067ac12', '47b6d770-31f0-11f1-a5c8-3464a92b0560', '12GB', 3, 1, '2026-04-29 13:03:35', NULL, '2026-04-29 13:03:35.071'),
('b7019bae-dd48-4cbe-b434-1636f27141f9', '47b6dbbb-31f0-11f1-a5c8-3464a92b0560', '6GB', 1, 1, '2026-04-29 13:05:33', NULL, '2026-04-29 13:05:33.504'),
('b9559fbe-35e3-412c-9f27-684227329c71', '47b71f41-31f0-11f1-a5c8-3464a92b0560', '64GB', 7, 1, '2026-04-29 13:10:38', NULL, '2026-04-29 13:10:38.636'),
('ba15c564-2731-4f54-ae02-47cdbd340ccb', '47b74959-31f0-11f1-a5c8-3464a92b0560', '16GB', 5, 1, '2026-04-29 13:05:02', NULL, '2026-04-29 13:05:02.979'),
('baf26d45-6a0f-4bf1-82af-2df5d6532981', '47b73079-31f0-11f1-a5c8-3464a92b0560', '16GB', 5, 1, '2026-04-29 13:07:30', NULL, '2026-04-29 13:07:30.442'),
('bca29fbd-be1a-4ea5-9f7a-4311ec5558ec', '47b6ea9e-31f0-11f1-a5c8-3464a92b0560', '8GB', 2, 1, '2026-04-29 13:06:07', NULL, '2026-04-29 13:06:07.398'),
('c0c3f9e0-8ad3-49d7-9dd9-4dbab161904d', '47b6ea9e-31f0-11f1-a5c8-3464a92b0560', '6GB', 1, 1, '2026-04-29 13:06:07', NULL, '2026-04-29 13:06:07.398'),
('c461312e-0d55-4670-95aa-12695533a8d4', '47b6d770-31f0-11f1-a5c8-3464a92b0560', '64GB', 7, 1, '2026-04-29 13:03:35', NULL, '2026-04-29 13:03:35.087'),
('c529e089-34d8-4f60-8c3b-1ecabaeabefb', '47b7240b-31f0-11f1-a5c8-3464a92b0560', '6GB', 1, 1, '2026-04-29 13:09:20', NULL, '2026-04-29 13:09:20.853'),
('c75fe7ea-10ce-4161-b955-df15d012cb36', '47b70050-31f0-11f1-a5c8-3464a92b0560', '32GB', 6, 1, '2026-04-29 13:01:11', NULL, '2026-04-29 13:01:11.959'),
('c949a5b6-5406-4632-860e-d7694e868919', '47b6f406-31f0-11f1-a5c8-3464a92b0560', '14GB', 4, 1, '2026-04-29 13:02:22', NULL, '2026-04-29 13:02:22.848'),
('ca4950ff-404b-4dc9-957f-76148fcd12f5', '47b73079-31f0-11f1-a5c8-3464a92b0560', '12GB', 3, 1, '2026-04-29 13:07:30', NULL, '2026-04-29 13:07:30.441'),
('cc2b0b84-8e0f-49b3-9105-372a3567dabe', '47b7240b-31f0-11f1-a5c8-3464a92b0560', '12GB', 3, 1, '2026-04-29 13:09:20', NULL, '2026-04-29 13:09:20.853'),
('cd5c008d-a16a-45ef-8a57-1c96d703f16c', '47b6fa00-31f0-11f1-a5c8-3464a92b0560', '12GB', 3, 1, '2026-04-29 13:01:33', NULL, '2026-04-29 13:01:33.849'),
('cea9c546-aefb-4b6e-80ed-16dff765e1f2', '47b73079-31f0-11f1-a5c8-3464a92b0560', '64GB', 7, 1, '2026-04-29 13:07:30', NULL, '2026-04-29 13:07:30.442'),
('d672daef-87e4-46b0-ade3-6203b7a9682e', '47b71f41-31f0-11f1-a5c8-3464a92b0560', '4GB', 0, 1, '2026-04-29 13:10:38', NULL, '2026-04-29 13:10:38.628'),
('d8c98126-eb8a-4039-88ee-d6239137b8c6', '47b6f406-31f0-11f1-a5c8-3464a92b0560', '4GB', 0, 1, '2026-04-29 13:02:22', NULL, '2026-04-29 13:02:22.846'),
('dc0c717f-a55c-4876-8444-f29b3a923c79', '47b6d228-31f0-11f1-a5c8-3464a92b0560', '8GB', 2, 1, '2026-04-29 13:06:49', NULL, '2026-04-29 13:06:49.907'),
('df350f27-9e43-47a3-8b99-e0c963304da1', '47b73079-31f0-11f1-a5c8-3464a92b0560', '14GB', 4, 1, '2026-04-29 13:07:30', NULL, '2026-04-29 13:07:30.441'),
('e04571a8-edd3-4726-9e48-e8909321e0f7', '47b72aaa-31f0-11f1-a5c8-3464a92b0560', '4GB', 0, 1, '2026-04-29 13:08:40', NULL, '2026-04-29 13:08:40.372'),
('e139af3d-e797-431d-aa03-052afe06303c', '47b6ea9e-31f0-11f1-a5c8-3464a92b0560', '12GB', 3, 1, '2026-04-29 13:06:07', NULL, '2026-04-29 13:06:07.399'),
('e47ddcea-a944-41d0-919f-a3721aac2df4', '47b71f41-31f0-11f1-a5c8-3464a92b0560', '14GB', 4, 1, '2026-04-29 13:10:38', NULL, '2026-04-29 13:10:38.635'),
('e880e04e-d9f9-4f20-b6e9-0d1964e4f20a', '47b6ea9e-31f0-11f1-a5c8-3464a92b0560', '64GB', 7, 1, '2026-04-29 13:06:07', NULL, '2026-04-29 13:06:07.400'),
('e903afe5-1d14-4234-a5bd-b3d30203e808', '47b6f406-31f0-11f1-a5c8-3464a92b0560', '12GB', 3, 1, '2026-04-29 13:02:22', NULL, '2026-04-29 13:02:22.847'),
('e90f426f-bb49-4799-88e5-d924252c795e', '47b6dbbb-31f0-11f1-a5c8-3464a92b0560', '8GB', 2, 1, '2026-04-29 13:05:33', NULL, '2026-04-29 13:05:33.505'),
('ed7e81c7-5fd5-4594-816a-9be459a5a954', '47b74959-31f0-11f1-a5c8-3464a92b0560', '12GB', 3, 1, '2026-04-29 13:05:02', NULL, '2026-04-29 13:05:02.978'),
('edc9ce50-59c5-45e7-b9a8-148403c879ef', '47b70050-31f0-11f1-a5c8-3464a92b0560', '14GB', 4, 1, '2026-04-29 13:01:11', NULL, '2026-04-29 13:01:11.956'),
('efc8934d-2ca8-47d7-8858-92010cb26933', '47b72aaa-31f0-11f1-a5c8-3464a92b0560', '14GB', 4, 1, '2026-04-29 13:08:40', NULL, '2026-04-29 13:08:40.373'),
('f19e8700-fb96-45f6-8454-f3bdad6e2fa6', '47b6d770-31f0-11f1-a5c8-3464a92b0560', '16GB', 5, 1, '2026-04-29 13:03:35', NULL, '2026-04-29 13:03:35.071'),
('f4a8374e-cec1-41a9-8ba4-104a4e577f9c', '47b719af-31f0-11f1-a5c8-3464a92b0560', '64GB', 7, 1, '2026-04-29 13:11:37', NULL, '2026-04-29 13:11:37.092'),
('f5f86976-dbe6-4de1-bc6c-aefd505d302c', '47b6d770-31f0-11f1-a5c8-3464a92b0560', '6GB', 1, 1, '2026-04-29 13:03:35', NULL, '2026-04-29 13:03:35.070'),
('f64da9ee-472b-447a-8bb1-005f30e3619f', '47b70050-31f0-11f1-a5c8-3464a92b0560', '12GB', 3, 1, '2026-04-29 13:01:11', NULL, '2026-04-29 13:01:11.955'),
('f89815a5-dd0b-4b39-b79e-e186b346226e', '47b6d228-31f0-11f1-a5c8-3464a92b0560', '16GB', 5, 1, '2026-04-29 13:06:49', NULL, '2026-04-29 13:06:49.908');

-- --------------------------------------------------------

--
-- Table structure for table `subcategories`
--

CREATE TABLE `subcategories` (
  `id` char(36) NOT NULL,
  `category_id` char(36) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subcategories`
--

INSERT INTO `subcategories` (`id`, `category_id`, `slug`, `name`, `description`, `sort_order`, `is_active`, `created_at`, `data_entrant`, `entry_date`) VALUES
('4738e014-31f0-11f1-a5c8-3464a92b0560', '049ce9be-16b9-4127-b1f5-563e8c678bbe', 'ex-uk-laptops', 'Ex-UK Laptops', NULL, 7, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e113-31f0-11f1-a5c8-3464a92b0560', '049ce9be-16b9-4127-b1f5-563e8c678bbe', 'refurbished-laptops', 'Refurbished Laptops', NULL, 6, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e147-31f0-11f1-a5c8-3464a92b0560', '049ce9be-16b9-4127-b1f5-563e8c678bbe', 'macbooks', 'MacBooks', NULL, 5, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e172-31f0-11f1-a5c8-3464a92b0560', '049ce9be-16b9-4127-b1f5-563e8c678bbe', '2-in-1-laptops', '2-in-1 Laptops', NULL, 4, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e1b0-31f0-11f1-a5c8-3464a92b0560', '049ce9be-16b9-4127-b1f5-563e8c678bbe', 'gaming-laptops', 'Gaming Laptops', NULL, 3, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e1de-31f0-11f1-a5c8-3464a92b0560', '049ce9be-16b9-4127-b1f5-563e8c678bbe', 'business-laptops', 'Business Laptops', NULL, 2, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e209-31f0-11f1-a5c8-3464a92b0560', '049ce9be-16b9-4127-b1f5-563e8c678bbe', 'ultrabooks', 'Ultrabooks', NULL, 1, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e27f-31f0-11f1-a5c8-3464a92b0560', '1d1566d3-e978-46f7-b888-538637b27c77', 'camcorders', 'Camcorders', NULL, 6, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e2bc-31f0-11f1-a5c8-3464a92b0560', '1d1566d3-e978-46f7-b888-538637b27c77', 'cctv-cameras', 'CCTV Cameras', NULL, 5, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e2e9-31f0-11f1-a5c8-3464a92b0560', '1d1566d3-e978-46f7-b888-538637b27c77', 'action-cameras', 'Action Cameras', NULL, 4, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e312-31f0-11f1-a5c8-3464a92b0560', '1d1566d3-e978-46f7-b888-538637b27c77', 'compact-cameras', 'Compact Cameras', NULL, 3, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e33f-31f0-11f1-a5c8-3464a92b0560', '1d1566d3-e978-46f7-b888-538637b27c77', 'mirrorless-cameras', 'Mirrorless Cameras', NULL, 2, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e379-31f0-11f1-a5c8-3464a92b0560', '1d1566d3-e978-46f7-b888-538637b27c77', 'dslr-cameras', 'DSLR Cameras', NULL, 1, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e3b8-31f0-11f1-a5c8-3464a92b0560', '3c022372-61a7-46f0-a5fe-a1d61acc4d73', 'workstations', 'Workstations', NULL, 5, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e3e5-31f0-11f1-a5c8-3464a92b0560', '3c022372-61a7-46f0-a5fe-a1d61acc4d73', 'gaming-desktops', 'Gaming Desktops', NULL, 4, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e410-31f0-11f1-a5c8-3464a92b0560', '3c022372-61a7-46f0-a5fe-a1d61acc4d73', 'mini-pcs', 'Mini PCs', NULL, 3, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e456-31f0-11f1-a5c8-3464a92b0560', '3c022372-61a7-46f0-a5fe-a1d61acc4d73', 'all-in-one-pcs', 'All-in-One PCs', NULL, 2, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e481-31f0-11f1-a5c8-3464a92b0560', '3c022372-61a7-46f0-a5fe-a1d61acc4d73', 'desktop-towers', 'Desktop Towers', NULL, 1, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e4bc-31f0-11f1-a5c8-3464a92b0560', '73475cf5-8222-4206-a562-ccfc7ff8bae8', 'pos-systems', 'POS Systems', NULL, 8, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e4e7-31f0-11f1-a5c8-3464a92b0560', '73475cf5-8222-4206-a562-ccfc7ff8bae8', 'tv-screens', 'TV Screens', NULL, 7, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e526-31f0-11f1-a5c8-3464a92b0560', '73475cf5-8222-4206-a562-ccfc7ff8bae8', 'monitors', 'Monitors', NULL, 6, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e54e-31f0-11f1-a5c8-3464a92b0560', '73475cf5-8222-4206-a562-ccfc7ff8bae8', 'ups', 'UPS', NULL, 5, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e57b-31f0-11f1-a5c8-3464a92b0560', '73475cf5-8222-4206-a562-ccfc7ff8bae8', 'projectors', 'Projectors', NULL, 4, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e5a6-31f0-11f1-a5c8-3464a92b0560', '73475cf5-8222-4206-a562-ccfc7ff8bae8', 'photocopiers', 'Photocopiers', NULL, 3, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e5e3-31f0-11f1-a5c8-3464a92b0560', '73475cf5-8222-4206-a562-ccfc7ff8bae8', 'scanners', 'Scanners', NULL, 2, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e610-31f0-11f1-a5c8-3464a92b0560', '73475cf5-8222-4206-a562-ccfc7ff8bae8', 'printers', 'Printers', NULL, 1, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e64f-31f0-11f1-a5c8-3464a92b0560', '9099fa2b-4ca9-4d7c-bc5c-5f902e7cca25', 'feature-phones', 'Feature Phones', NULL, 5, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e676-31f0-11f1-a5c8-3464a92b0560', '9099fa2b-4ca9-4d7c-bc5c-5f902e7cca25', 'ipads', 'iPads', NULL, 4, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e6b3-31f0-11f1-a5c8-3464a92b0560', '9099fa2b-4ca9-4d7c-bc5c-5f902e7cca25', 'tablets', 'Tablets', NULL, 3, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e6dd-31f0-11f1-a5c8-3464a92b0560', '9099fa2b-4ca9-4d7c-bc5c-5f902e7cca25', 'iphones', 'iPhones', NULL, 2, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463'),
('4738e70e-31f0-11f1-a5c8-3464a92b0560', '9099fa2b-4ca9-4d7c-bc5c-5f902e7cca25', 'android-phones', 'Android Phones', NULL, 1, 1, '2026-04-06 22:39:08', NULL, '2026-04-25 14:45:41.463');

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_finance_expense_lines`
-- (See below for the actual view)
--
CREATE TABLE `vw_finance_expense_lines` (
`expense_id` varchar(191)
,`expense_date` date
,`category_slug` varchar(120)
,`category_name` varchar(191)
,`amount` decimal(12,2)
,`payment_status` enum('pending','paid','partial','cancelled')
,`payment_method` enum('cash','mpesa','card','bank_transfer','other')
,`reference` varchar(120)
,`description` text
,`product_id` varchar(191)
,`product_name` varchar(191)
,`source_id` varchar(191)
,`source_name` varchar(191)
,`order_id` varchar(191)
,`created_by_admin_user_id` varchar(191)
,`data_entrant_name` varchar(191)
,`data_entrant_email` varchar(191)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_finance_revenue_lines`
-- (See below for the actual view)
--
CREATE TABLE `vw_finance_revenue_lines` (
`order_id` varchar(191)
,`order_date` datetime(3)
,`order_status` enum('pending','completed','confirmed','processing','delivered','cancelled')
,`customer_payment_status` enum('pending','paid','failed','refunded')
,`payment_method` enum('cash_on_delivery','mpesa','bank_transfer','cash','card','other')
,`transaction_reference` varchar(120)
,`created_by_admin_user_id` varchar(191)
,`data_entrant_name` varchar(191)
,`data_entrant_email` varchar(191)
,`order_item_id` varchar(191)
,`product_id` varchar(191)
,`product_name` varchar(191)
,`brand` varchar(191)
,`quantity` int(11)
,`source_price` decimal(12,2)
,`selling_price` int(11)
,`total_source_price` decimal(22,2)
,`total_selling_price` int(11)
,`vat_amount` int(11)
,`gross_profit` decimal(23,2)
,`source_id` varchar(191)
,`source_name` varchar(191)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_finance_supplier_payment_lines`
-- (See below for the actual view)
--
CREATE TABLE `vw_finance_supplier_payment_lines` (
`expense_id` varchar(191)
,`expense_date` date
,`category_slug` varchar(120)
,`category_name` varchar(191)
,`amount` decimal(12,2)
,`payment_status` enum('pending','paid','partial','cancelled')
,`payment_method` enum('cash','mpesa','card','bank_transfer','other')
,`reference` varchar(120)
,`description` text
,`product_id` varchar(191)
,`product_name` varchar(191)
,`source_id` varchar(191)
,`source_name` varchar(191)
,`order_id` varchar(191)
,`created_by_admin_user_id` varchar(191)
,`data_entrant_name` varchar(191)
,`data_entrant_email` varchar(191)
);

-- --------------------------------------------------------

--
-- Structure for view `vw_finance_expense_lines`
--
DROP TABLE IF EXISTS `vw_finance_expense_lines`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY INVOKER VIEW `vw_finance_expense_lines`  AS SELECT `e`.`id` AS `expense_id`, `e`.`expense_date` AS `expense_date`, `ec`.`slug` AS `category_slug`, `ec`.`name` AS `category_name`, `e`.`amount` AS `amount`, `e`.`payment_status` AS `payment_status`, `e`.`payment_method` AS `payment_method`, `e`.`reference` AS `reference`, `e`.`description` AS `description`, `e`.`product_id` AS `product_id`, `p`.`name` AS `product_name`, `e`.`source_id` AS `source_id`, `ps`.`name` AS `source_name`, `e`.`order_id` AS `order_id`, `e`.`created_by_admin_user_id` AS `created_by_admin_user_id`, `au`.`name` AS `data_entrant_name`, `au`.`email` AS `data_entrant_email` FROM ((((`expenses` `e` join `expense_categories` `ec` on(`ec`.`id` = `e`.`category_id`)) left join `products` `p` on(`p`.`id` = `e`.`product_id`)) left join `product_sources` `ps` on(`ps`.`id` = `e`.`source_id`)) left join `admin_users` `au` on(`au`.`id` = `e`.`created_by_admin_user_id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `vw_finance_revenue_lines`
--
DROP TABLE IF EXISTS `vw_finance_revenue_lines`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY INVOKER VIEW `vw_finance_revenue_lines`  AS SELECT `o`.`id` AS `order_id`, `o`.`created_at` AS `order_date`, `o`.`status` AS `order_status`, `o`.`payment_status` AS `customer_payment_status`, `o`.`payment_method` AS `payment_method`, `o`.`transaction_reference` AS `transaction_reference`, `o`.`created_by_admin_user_id` AS `created_by_admin_user_id`, `au`.`name` AS `data_entrant_name`, `au`.`email` AS `data_entrant_email`, `oi`.`id` AS `order_item_id`, `oi`.`product_id` AS `product_id`, coalesce(`oi`.`product_name`,`p`.`name`,'Unknown product') AS `product_name`, coalesce(`oi`.`product_brand`,`p`.`brand`) AS `brand`, `oi`.`quantity` AS `quantity`, coalesce(nullif(`oi`.`unit_source_price`,0),`p`.`source_price`,0) AS `source_price`, coalesce(nullif(`oi`.`unit_selling_price`,0),`oi`.`unit_price`,`p`.`price`,0) AS `selling_price`, coalesce(nullif(`oi`.`total_source_price`,0),coalesce(nullif(`oi`.`unit_source_price`,0),`p`.`source_price`,0) * `oi`.`quantity`,0) AS `total_source_price`, coalesce(nullif(`oi`.`total_selling_price`,0),`oi`.`total_price`,0) AS `total_selling_price`, coalesce(`oi`.`vat_amount`,0) AS `vat_amount`, coalesce(nullif(`oi`.`total_selling_price`,0),`oi`.`total_price`,0) - coalesce(nullif(`oi`.`total_source_price`,0),coalesce(nullif(`oi`.`unit_source_price`,0),`p`.`source_price`,0) * `oi`.`quantity`,0) AS `gross_profit`, coalesce(`oi`.`source_id`,`p`.`source_id`) AS `source_id`, coalesce(`oi`.`source_name`,`ps`.`name`) AS `source_name` FROM ((((`order_items` `oi` join `orders` `o` on(`o`.`id` = `oi`.`order_id`)) left join `products` `p` on(`p`.`id` = `oi`.`product_id`)) left join `product_sources` `ps` on(`ps`.`id` = coalesce(`oi`.`source_id`,`p`.`source_id`))) left join `admin_users` `au` on(`au`.`id` = `o`.`created_by_admin_user_id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `vw_finance_supplier_payment_lines`
--
DROP TABLE IF EXISTS `vw_finance_supplier_payment_lines`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY INVOKER VIEW `vw_finance_supplier_payment_lines`  AS SELECT `vw_finance_expense_lines`.`expense_id` AS `expense_id`, `vw_finance_expense_lines`.`expense_date` AS `expense_date`, `vw_finance_expense_lines`.`category_slug` AS `category_slug`, `vw_finance_expense_lines`.`category_name` AS `category_name`, `vw_finance_expense_lines`.`amount` AS `amount`, `vw_finance_expense_lines`.`payment_status` AS `payment_status`, `vw_finance_expense_lines`.`payment_method` AS `payment_method`, `vw_finance_expense_lines`.`reference` AS `reference`, `vw_finance_expense_lines`.`description` AS `description`, `vw_finance_expense_lines`.`product_id` AS `product_id`, `vw_finance_expense_lines`.`product_name` AS `product_name`, `vw_finance_expense_lines`.`source_id` AS `source_id`, `vw_finance_expense_lines`.`source_name` AS `source_name`, `vw_finance_expense_lines`.`order_id` AS `order_id`, `vw_finance_expense_lines`.`created_by_admin_user_id` AS `created_by_admin_user_id`, `vw_finance_expense_lines`.`data_entrant_name` AS `data_entrant_name`, `vw_finance_expense_lines`.`data_entrant_email` AS `data_entrant_email` FROM `vw_finance_expense_lines` WHERE `vw_finance_expense_lines`.`category_slug` = 'supplier' ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_activity_logs`
--
ALTER TABLE `admin_activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_activity_logs_created_idx` (`created_at`),
  ADD KEY `admin_activity_logs_actor_idx` (`actor_admin_user_id`),
  ADD KEY `admin_activity_logs_target_idx` (`target_admin_user_id`),
  ADD KEY `admin_activity_logs_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admin_users_email_key` (`email`),
  ADD KEY `admin_users_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `blog_posts_slug_key` (`slug`),
  ADD KEY `blog_posts_is_published_idx` (`is_published`),
  ADD KEY `blog_posts_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `brands_slug_unique` (`slug`),
  ADD UNIQUE KEY `brands_name_unique` (`name`),
  ADD KEY `brands_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `carts_customer_id_key` (`customer_id`),
  ADD KEY `carts_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cart_items_cart_id_product_id_key` (`cart_id`,`product_id`),
  ADD KEY `cart_items_cart_id_idx` (`cart_id`),
  ADD KEY `cart_items_product_id_idx` (`product_id`),
  ADD KEY `cart_items_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_slug_key` (`slug`),
  ADD KEY `categories_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contact_messages_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `customer_users`
--
ALTER TABLE `customer_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customer_users_email_key` (`email`),
  ADD KEY `customer_users_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expenses_category_idx` (`category`),
  ADD KEY `expenses_order_idx` (`order_id`),
  ADD KEY `expenses_date_idx` (`expense_date`),
  ADD KEY `expenses_product_id_idx` (`product_id`),
  ADD KEY `expenses_source_id_idx` (`source_id`),
  ADD KEY `expenses_order_id_idx` (`order_id`),
  ADD KEY `expenses_payment_status_idx` (`payment_status`),
  ADD KEY `expenses_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `expense_categories`
--
ALTER TABLE `expense_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `expense_categories_slug_key` (`slug`),
  ADD KEY `expense_categories_is_active_idx` (`is_active`),
  ADD KEY `expense_categories_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inventory_movements_product_id_idx` (`product_id`),
  ADD KEY `inventory_movements_order_id_idx` (`order_id`),
  ADD KEY `inventory_movements_admin_user_id_idx` (`admin_user_id`),
  ADD KEY `inventory_movements_type_idx` (`type`),
  ADD KEY `inventory_movements_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `newsletter_subscribers`
--
ALTER TABLE `newsletter_subscribers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `newsletter_subscribers_email_key` (`email`),
  ADD KEY `newsletter_subscribers_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_customer_id_idx` (`customer_id`),
  ADD KEY `orders_status_idx` (`status`),
  ADD KEY `orders_payment_status_idx` (`payment_status`),
  ADD KEY `orders_created_by_idx` (`created_by_admin_user_id`),
  ADD KEY `orders_is_pos_sale_idx` (`is_pos_sale`),
  ADD KEY `orders_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_order_id_idx` (`order_id`),
  ADD KEY `order_items_product_id_idx` (`product_id`),
  ADD KEY `order_items_source_id_idx` (`source_id`),
  ADD KEY `order_items_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `order_payment_events`
--
ALTER TABLE `order_payment_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_payment_events_order_id_idx` (`order_id`),
  ADD KEY `order_payment_events_created_at_idx` (`created_at`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `password_reset_tokens_token_key` (`token`),
  ADD KEY `password_reset_tokens_customer_id_idx` (`customer_id`),
  ADD KEY `password_reset_tokens_expires_at_idx` (`expires_at`),
  ADD KEY `password_reset_tokens_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_slug_key` (`slug`),
  ADD KEY `products_category_id_idx` (`category_id`),
  ADD KEY `products_brand_idx` (`brand`),
  ADD KEY `products_condition_idx` (`condition`),
  ADD KEY `products_price_idx` (`price`),
  ADD KEY `products_featured_idx` (`featured`),
  ADD KEY `products_in_stock_idx` (`in_stock`),
  ADD KEY `products_source_id_idx` (`source_id`),
  ADD KEY `products_sales_channel_idx` (`sales_channel`),
  ADD KEY `products_catalog_visible_idx` (`is_catalog_visible`),
  ADD KEY `products_created_by_idx` (`created_by_admin_user_id`),
  ADD KEY `products_updated_by_admin_fkey` (`updated_by_admin_user_id`),
  ADD KEY `products_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `product_analytics`
--
ALTER TABLE `product_analytics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_analytics_product_id_idx` (`product_id`),
  ADD KEY `product_analytics_event_idx` (`event`),
  ADD KEY `product_analytics_created_at_idx` (`created_at`),
  ADD KEY `product_analytics_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_images_product_id_fkey` (`product_id`),
  ADD KEY `product_images_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `product_sources`
--
ALTER TABLE `product_sources`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_sources_name_key` (`name`),
  ADD KEY `product_sources_type_idx` (`type`),
  ADD KEY `product_sources_created_by_idx` (`created_by_admin_user_id`),
  ADD KEY `product_sources_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reviews_product_id_customer_id_key` (`product_id`,`customer_id`),
  ADD KEY `reviews_product_id_is_approved_idx` (`product_id`,`is_approved`),
  ADD KEY `reviews_customer_id_fkey` (`customer_id`),
  ADD KEY `reviews_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `specifications`
--
ALTER TABLE `specifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `specifications_subcategory_name_unique` (`subcategory_id`,`name`),
  ADD KEY `specifications_subcategory_idx` (`subcategory_id`),
  ADD KEY `specifications_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `specification_values`
--
ALTER TABLE `specification_values`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `specification_values_spec_value_unique` (`specification_id`,`value`),
  ADD KEY `specification_values_specification_idx` (`specification_id`),
  ADD KEY `specification_values_data_entrant_idx` (`data_entrant`);

--
-- Indexes for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subcategories_slug_unique` (`slug`),
  ADD KEY `subcategories_category_idx` (`category_id`),
  ADD KEY `subcategories_data_entrant_idx` (`data_entrant`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_activity_logs`
--
ALTER TABLE `admin_activity_logs`
  ADD CONSTRAINT `admin_activity_logs_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD CONSTRAINT `admin_users_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD CONSTRAINT `blog_posts_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `brands`
--
ALTER TABLE `brands`
  ADD CONSTRAINT `brands_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `carts_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_cart_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cart_items_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `cart_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD CONSTRAINT `contact_messages_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `customer_users`
--
ALTER TABLE `customer_users`
  ADD CONSTRAINT `customer_users_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `expense_categories`
--
ALTER TABLE `expense_categories`
  ADD CONSTRAINT `expense_categories_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD CONSTRAINT `inventory_movements_admin_user_id_fkey` FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `inventory_movements_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `inventory_movements_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `inventory_movements_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `newsletter_subscribers`
--
ALTER TABLE `newsletter_subscribers`
  ADD CONSTRAINT `newsletter_subscribers_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_created_by_admin_fkey` FOREIGN KEY (`created_by_admin_user_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_source_id_fkey` FOREIGN KEY (`source_id`) REFERENCES `product_sources` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `password_reset_tokens_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `password_reset_tokens_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `products_created_by_admin_fkey` FOREIGN KEY (`created_by_admin_user_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `products_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `products_source_id_fkey` FOREIGN KEY (`source_id`) REFERENCES `product_sources` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `products_updated_by_admin_fkey` FOREIGN KEY (`updated_by_admin_user_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `product_analytics`
--
ALTER TABLE `product_analytics`
  ADD CONSTRAINT `product_analytics_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `product_analytics_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `product_images_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_sources`
--
ALTER TABLE `product_sources`
  ADD CONSTRAINT `product_sources_created_by_admin_fkey` FOREIGN KEY (`created_by_admin_user_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `product_sources_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reviews_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `reviews_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `specifications`
--
ALTER TABLE `specifications`
  ADD CONSTRAINT `specifications_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `specifications_subcategory_fk` FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `specification_values`
--
ALTER TABLE `specification_values`
  ADD CONSTRAINT `specification_values_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `specification_values_specification_fk` FOREIGN KEY (`specification_id`) REFERENCES `specifications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD CONSTRAINT `subcategories_category_fk` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subcategories_data_entrant_admin_users_fkey` FOREIGN KEY (`data_entrant`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
