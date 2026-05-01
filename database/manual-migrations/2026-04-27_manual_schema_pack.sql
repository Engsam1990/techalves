-- TECHALVES manual schema migration pack
-- Run this manually in phpMyAdmin / MySQL when deploying code that needs these columns/tables.
-- Runtime/page-load migrations are disabled by default in server/src/lib/db.ts.
-- Keep AUTO_DB_MIGRATIONS unset or false in production.

DELIMITER $$

DROP PROCEDURE IF EXISTS techalves_add_column_if_missing$$
CREATE PROCEDURE techalves_add_column_if_missing(
  IN p_table VARCHAR(128),
  IN p_column VARCHAR(128),
  IN p_definition TEXT,
  IN p_after_column VARCHAR(128)
)
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table AND COLUMN_NAME = p_column
  ) THEN
    SET @techalves_sql = CONCAT(
      'ALTER TABLE `', REPLACE(p_table, '`', '``'), '` ADD COLUMN `', REPLACE(p_column, '`', '``'), '` ', p_definition,
      IF(p_after_column IS NULL OR p_after_column = '', '', CONCAT(' AFTER `', REPLACE(p_after_column, '`', '``'), '`'))
    );
    PREPARE techalves_stmt FROM @techalves_sql;
    EXECUTE techalves_stmt;
    DEALLOCATE PREPARE techalves_stmt;
  END IF;
END$$

DROP PROCEDURE IF EXISTS techalves_modify_column_if_exists$$
CREATE PROCEDURE techalves_modify_column_if_exists(
  IN p_table VARCHAR(128),
  IN p_column VARCHAR(128),
  IN p_definition TEXT
)
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table AND COLUMN_NAME = p_column
  ) THEN
    SET @techalves_sql = CONCAT(
      'ALTER TABLE `', REPLACE(p_table, '`', '``'), '` MODIFY `', REPLACE(p_column, '`', '``'), '` ', p_definition
    );
    PREPARE techalves_stmt FROM @techalves_sql;
    EXECUTE techalves_stmt;
    DEALLOCATE PREPARE techalves_stmt;
  END IF;
END$$

DELIMITER ;

CREATE TABLE IF NOT EXISTS `brands` (
  `id` char(36) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `website_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `brands_slug_unique` (`slug`),
  UNIQUE KEY `brands_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `subcategories` (
  `id` char(36) NOT NULL,
  `category_id` char(36) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subcategories_slug_unique` (`slug`),
  KEY `subcategories_category_idx` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `specifications` (
  `id` char(36) NOT NULL,
  `subcategory_id` char(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `specifications_subcategory_name_unique` (`subcategory_id`, `name`),
  KEY `specifications_subcategory_idx` (`subcategory_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `specification_values` (
  `id` char(36) NOT NULL,
  `specification_id` char(36) NOT NULL,
  `value` varchar(191) NOT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `specification_values_spec_value_unique` (`specification_id`, `value`),
  KEY `specification_values_specification_idx` (`specification_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_sources` (
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
  PRIMARY KEY (`id`),
  KEY `product_sources_name_idx` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `expense_categories` (
  `id` varchar(191) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `name` varchar(191) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `expense_categories_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `expenses` (
  `id` varchar(191) NOT NULL,
  `details` text NOT NULL,
  `category` varchar(80) NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0,
  `expense_date` date NOT NULL,
  `order_id` varchar(191) DEFAULT NULL,
  `data_entrant` varchar(191) DEFAULT NULL,
  `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `expenses_category_idx` (`category`),
  KEY `expenses_order_idx` (`order_id`),
  KEY `expenses_date_idx` (`expense_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data entrant audit columns. Run manually; no page reload should add these again.
CALL techalves_add_column_if_missing('admin_activity_logs', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('admin_activity_logs', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('admin_users', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('admin_users', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('blog_posts', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('blog_posts', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('brands', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('brands', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('cart_items', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('cart_items', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('carts', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('carts', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('categories', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('categories', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('contact_messages', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('contact_messages', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('customer_users', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('customer_users', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('inventory_movements', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('inventory_movements', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('newsletter_subscribers', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('newsletter_subscribers', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('order_items', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('order_items', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('orders', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('orders', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('password_reset_tokens', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('password_reset_tokens', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('product_analytics', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('product_analytics', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('product_images', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('product_images', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('products', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('products', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('reviews', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('reviews', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('specification_values', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('specification_values', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('specifications', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('specifications', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('subcategories', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('subcategories', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('expenses', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('expenses', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('expense_categories', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('expense_categories', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);
CALL techalves_add_column_if_missing('product_sources', 'data_entrant', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('product_sources', 'entry_date', 'datetime(3) NOT NULL DEFAULT current_timestamp(3)', NULL);

-- Product sourcing, stock, serials, visibility, and image-array columns.
CALL techalves_add_column_if_missing('products', 'sourced_from', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('products', 'sourced_by', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('products', 'source_date', 'date DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('products', 'source_price', 'decimal(12,2) NOT NULL DEFAULT 0', NULL);
CALL techalves_add_column_if_missing('products', 'sourcing_payment_status', 'enum(''paid'',''pay_later'') NOT NULL DEFAULT ''pay_later''', NULL);
CALL techalves_add_column_if_missing('products', 'sourcing_paid_at', 'datetime(3) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('products', 'sourcing_paid_by', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('products', 'source_id', 'varchar(191) DEFAULT NULL', 'brand');
CALL techalves_add_column_if_missing('products', 'source_payment_status', 'enum(''pending'',''paid'',''partial'',''waived'') NOT NULL DEFAULT ''pending''', 'source_price');
CALL techalves_add_column_if_missing('products', 'sales_channel', 'enum(''catalog'',''pos_only'') NOT NULL DEFAULT ''catalog''', 'source_payment_status');
CALL techalves_add_column_if_missing('products', 'is_catalog_visible', 'tinyint(1) NOT NULL DEFAULT 1', 'sales_channel');
CALL techalves_add_column_if_missing('products', 'created_by_admin_user_id', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('products', 'updated_by_admin_user_id', 'varchar(191) DEFAULT NULL', NULL);
CALL techalves_add_column_if_missing('products', 'premium', 'tinyint(1) NOT NULL DEFAULT 0', 'featured');
CALL techalves_add_column_if_missing('products', 'barcode', 'varchar(120) DEFAULT NULL', 'brand');
CALL techalves_add_column_if_missing('products', 'total_stock_received', 'int NOT NULL DEFAULT 0', 'stock_quantity');
CALL techalves_add_column_if_missing('products', 'serial_numbers', 'json DEFAULT NULL', 'stock_quantity');
CALL techalves_add_column_if_missing('products', 'images', 'json DEFAULT NULL', 'serial_numbers');

UPDATE `products`
SET `total_stock_received` = `stock_quantity`
WHERE `total_stock_received` = 0 AND `stock_quantity` > 0;

UPDATE `products` p
LEFT JOIN (
  SELECT `product_id`, JSON_ARRAYAGG(`url`) AS `images_json`
  FROM `product_images`
  WHERE `url` IS NOT NULL AND `url` <> ''
  GROUP BY `product_id`
) pi ON pi.`product_id` = p.`id`
SET p.`images` = COALESCE(pi.`images_json`, JSON_ARRAY())
WHERE p.`images` IS NULL OR JSON_LENGTH(p.`images`) = 0;

-- Order and order-item columns.
CALL techalves_modify_column_if_exists('orders', 'payment_method', 'enum(''cash_on_delivery'',''mpesa'',''bank_transfer'',''cash'',''card'',''other'') NOT NULL');
CALL techalves_add_column_if_missing('orders', 'transaction_reference', 'varchar(120) DEFAULT NULL', 'payment_method');
CALL techalves_add_column_if_missing('orders', 'subtotal_amount', 'int NOT NULL DEFAULT 0', 'transaction_reference');
CALL techalves_add_column_if_missing('orders', 'vat_rate', 'decimal(5,2) NOT NULL DEFAULT 0', 'subtotal_amount');
CALL techalves_add_column_if_missing('orders', 'vat_amount', 'int NOT NULL DEFAULT 0', 'vat_rate');
CALL techalves_add_column_if_missing('orders', 'is_pos_sale', 'tinyint(1) NOT NULL DEFAULT 0', 'vat_amount');
CALL techalves_add_column_if_missing('orders', 'created_by_admin_user_id', 'varchar(191) DEFAULT NULL', 'notes');
CALL techalves_add_column_if_missing('orders', 'discount_amount', 'decimal(12,2) NOT NULL DEFAULT 0', 'transaction_reference');
CALL techalves_add_column_if_missing('orders', 'other_charges', 'decimal(12,2) NOT NULL DEFAULT 0', 'discount_amount');

CALL techalves_add_column_if_missing('order_items', 'product_name', 'varchar(191) DEFAULT NULL', 'product_id');
CALL techalves_add_column_if_missing('order_items', 'product_brand', 'varchar(191) DEFAULT NULL', 'product_name');
CALL techalves_add_column_if_missing('order_items', 'product_barcode', 'varchar(120) DEFAULT NULL', 'product_brand');
CALL techalves_add_column_if_missing('order_items', 'serial_numbers', 'json DEFAULT NULL', 'product_barcode');
CALL techalves_add_column_if_missing('order_items', 'source_id', 'varchar(191) DEFAULT NULL', 'product_barcode');
CALL techalves_add_column_if_missing('order_items', 'source_name', 'varchar(191) DEFAULT NULL', 'source_id');
CALL techalves_add_column_if_missing('order_items', 'unit_source_price', 'int NOT NULL DEFAULT 0', 'source_name');
CALL techalves_add_column_if_missing('order_items', 'total_source_price', 'int NOT NULL DEFAULT 0', 'unit_source_price');
CALL techalves_add_column_if_missing('order_items', 'unit_selling_price', 'int NOT NULL DEFAULT 0', 'total_source_price');
CALL techalves_add_column_if_missing('order_items', 'total_selling_price', 'int NOT NULL DEFAULT 0', 'unit_selling_price');
CALL techalves_add_column_if_missing('order_items', 'vat_rate', 'decimal(5,2) NOT NULL DEFAULT 0', 'total_selling_price');
CALL techalves_add_column_if_missing('order_items', 'vat_amount', 'int NOT NULL DEFAULT 0', 'vat_rate');

-- Inventory movement types used by current stock/order/POS flows.
CALL techalves_modify_column_if_exists('inventory_movements', 'type', 'enum(''initial_stock'',''manual_adjustment'',''order_deducted'',''order_restored'',''pos_sale'',''customer_checkout'',''supplier_payment'') NOT NULL');

-- Expense detail columns.
CALL techalves_add_column_if_missing('expenses', 'category_id', 'varchar(191) NOT NULL DEFAULT ''expense-cat-other''', 'updated_at');
CALL techalves_add_column_if_missing('expenses', 'product_id', 'varchar(191) DEFAULT NULL', 'category_id');
CALL techalves_add_column_if_missing('expenses', 'source_id', 'varchar(191) DEFAULT NULL', 'product_id');
CALL techalves_add_column_if_missing('expenses', 'order_item_id', 'varchar(191) DEFAULT NULL', 'source_id');
CALL techalves_add_column_if_missing('expenses', 'payment_status', 'enum(''pending'',''paid'',''partial'',''cancelled'') NOT NULL DEFAULT ''paid''', 'order_item_id');
CALL techalves_add_column_if_missing('expenses', 'payment_method', 'enum(''cash'',''mpesa'',''card'',''bank_transfer'',''other'') DEFAULT NULL', 'payment_status');
CALL techalves_add_column_if_missing('expenses', 'reference', 'varchar(120) DEFAULT NULL', 'payment_method');
CALL techalves_add_column_if_missing('expenses', 'description', 'text DEFAULT NULL', 'reference');
CALL techalves_add_column_if_missing('expenses', 'created_by_admin_user_id', 'varchar(191) DEFAULT NULL', 'description');

DROP PROCEDURE IF EXISTS techalves_add_column_if_missing;
DROP PROCEDURE IF EXISTS techalves_modify_column_if_exists;
