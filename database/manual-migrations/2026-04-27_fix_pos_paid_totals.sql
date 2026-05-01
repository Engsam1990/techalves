-- Fix POS/order totals used by the admin order payment summary.
-- Run once in phpMyAdmin/MySQL before testing older POS orders that show Paid = 0.

DROP PROCEDURE IF EXISTS techalves_add_column_if_missing;
DELIMITER //
CREATE PROCEDURE techalves_add_column_if_missing(
  IN p_table_name VARCHAR(64),
  IN p_column_name VARCHAR(64),
  IN p_column_definition TEXT,
  IN p_after_column VARCHAR(64)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND COLUMN_NAME = p_column_name
  ) THEN
    SET @ddl = CONCAT(
      'ALTER TABLE `', p_table_name, '` ADD COLUMN `', p_column_name, '` ', p_column_definition,
      IF(p_after_column IS NULL OR p_after_column = '', '', CONCAT(' AFTER `', p_after_column, '`'))
    );
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END //
DELIMITER ;

CALL techalves_add_column_if_missing('orders', 'transaction_reference', 'varchar(120) DEFAULT NULL', 'payment_method');
CALL techalves_add_column_if_missing('orders', 'subtotal_amount', 'int NOT NULL DEFAULT 0', 'transaction_reference');
CALL techalves_add_column_if_missing('orders', 'vat_rate', 'decimal(5,2) NOT NULL DEFAULT 0', 'subtotal_amount');
CALL techalves_add_column_if_missing('orders', 'vat_amount', 'int NOT NULL DEFAULT 0', 'vat_rate');
CALL techalves_add_column_if_missing('orders', 'is_pos_sale', 'tinyint(1) NOT NULL DEFAULT 0', 'vat_amount');
CALL techalves_add_column_if_missing('orders', 'discount_amount', 'decimal(12,2) NOT NULL DEFAULT 0', 'transaction_reference');
CALL techalves_add_column_if_missing('orders', 'other_charges', 'decimal(12,2) NOT NULL DEFAULT 0', 'discount_amount');
CALL techalves_add_column_if_missing('orders', 'total_amount', 'int NOT NULL DEFAULT 0', 'other_charges');

CALL techalves_add_column_if_missing('order_items', 'product_name', 'varchar(191) DEFAULT NULL', 'product_id');
CALL techalves_add_column_if_missing('order_items', 'product_brand', 'varchar(191) DEFAULT NULL', 'product_name');
CALL techalves_add_column_if_missing('order_items', 'product_barcode', 'varchar(120) DEFAULT NULL', 'product_brand');
CALL techalves_add_column_if_missing('order_items', 'source_id', 'varchar(191) DEFAULT NULL', 'product_barcode');
CALL techalves_add_column_if_missing('order_items', 'source_name', 'varchar(191) DEFAULT NULL', 'source_id');
CALL techalves_add_column_if_missing('order_items', 'unit_source_price', 'int NOT NULL DEFAULT 0', 'source_name');
CALL techalves_add_column_if_missing('order_items', 'total_source_price', 'int NOT NULL DEFAULT 0', 'unit_source_price');
CALL techalves_add_column_if_missing('order_items', 'unit_selling_price', 'int NOT NULL DEFAULT 0', 'total_source_price');
CALL techalves_add_column_if_missing('order_items', 'total_selling_price', 'int NOT NULL DEFAULT 0', 'unit_selling_price');
CALL techalves_add_column_if_missing('order_items', 'vat_rate', 'decimal(5,2) NOT NULL DEFAULT 0', 'total_selling_price');
CALL techalves_add_column_if_missing('order_items', 'vat_amount', 'int NOT NULL DEFAULT 0', 'vat_rate');

-- Backfill existing orders whose total_amount/subtotal_amount were left as 0.
UPDATE `orders` o
JOIN (
  SELECT
    oi.`order_id`,
    SUM(
      CASE
        WHEN COALESCE(oi.`total_selling_price`, 0) > 0 THEN oi.`total_selling_price`
        WHEN COALESCE(oi.`unit_selling_price`, 0) > 0 THEN oi.`unit_selling_price` * COALESCE(oi.`quantity`, 0)
        WHEN COALESCE(oi.`total_price`, 0) > 0 AND COALESCE(oi.`vat_amount`, 0) > 0 THEN oi.`total_price` - oi.`vat_amount`
        WHEN COALESCE(oi.`total_price`, 0) > 0 THEN oi.`total_price`
        ELSE COALESCE(oi.`unit_price`, 0) * COALESCE(oi.`quantity`, 0)
      END
    ) AS item_subtotal,
    SUM(COALESCE(oi.`vat_amount`, 0)) AS item_vat
  FROM `order_items` oi
  GROUP BY oi.`order_id`
) x ON x.`order_id` = o.`id`
SET
  o.`subtotal_amount` = CASE
    WHEN COALESCE(o.`subtotal_amount`, 0) <= 0
      THEN GREATEST(0, x.item_subtotal - COALESCE(o.`discount_amount`, 0) + COALESCE(o.`other_charges`, 0))
    ELSE o.`subtotal_amount`
  END,
  o.`vat_amount` = CASE
    WHEN COALESCE(o.`vat_amount`, 0) <= 0 THEN COALESCE(x.item_vat, 0)
    ELSE o.`vat_amount`
  END,
  o.`total_amount` = CASE
    WHEN COALESCE(o.`total_amount`, 0) <= 0
      THEN GREATEST(0, x.item_subtotal - COALESCE(o.`discount_amount`, 0) + COALESCE(o.`other_charges`, 0))
           + CASE WHEN COALESCE(o.`vat_amount`, 0) <= 0 THEN COALESCE(x.item_vat, 0) ELSE o.`vat_amount` END
    ELSE o.`total_amount`
  END
WHERE COALESCE(o.`total_amount`, 0) <= 0
   OR COALESCE(o.`subtotal_amount`, 0) <= 0;

DROP PROCEDURE IF EXISTS techalves_add_column_if_missing;
