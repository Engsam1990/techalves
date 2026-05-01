"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureCatalogTables = ensureCatalogTables;
exports.queryDb = queryDb;
exports.executeDb = executeDb;
exports.nowIso = nowIso;
exports.createId = createId;
exports.readDb = readDb;
exports.writeDb = writeDb;
exports.pingDb = pingDb;
exports.updateDb = updateDb;
exports.contains = contains;
exports.findCategoryById = findCategoryById;
exports.findCategoryBySlug = findCategoryBySlug;
exports.findProductById = findProductById;
exports.findProductBySlug = findProductBySlug;
exports.findProductByBarcode = findProductByBarcode;
exports.normalizeSerialNumber = normalizeSerialNumber;
exports.getProductSerialNumbers = getProductSerialNumbers;
exports.getAvailableSerialNumbers = getAvailableSerialNumbers;
exports.findSerialNumber = findSerialNumber;
exports.getOrCreateCart = getOrCreateCart;
exports.sortByDateDesc = sortByDateDesc;
exports.sortByDateAsc = sortByDateAsc;
exports.normalizeProduct = normalizeProduct;
exports.findBrand = findBrand;
exports.findSubcategory = findSubcategory;
exports.findSpecification = findSpecification;
exports.findSpecificationValue = findSpecificationValue;
exports.resolveProductSpecs = resolveProductSpecs;
exports.compareSecret = compareSecret;
exports.hashSecret = hashSecret;
exports.recalcProductReviewStats = recalcProductReviewStats;
// @ts-nocheck
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const promise_1 = __importDefault(require("mysql2/promise"));
let pool = null;
const WALK_IN_CUSTOMER_ID = "pos-walkin-customer";
const WALK_IN_CUSTOMER_EMAIL = "pos-walkin@techalves.local";
const ENABLE_RUNTIME_DB_MIGRATIONS = String(process.env.AUTO_DB_MIGRATIONS || process.env.RUNTIME_DB_MIGRATIONS || "").trim().toLowerCase() === "true";
function runtimeDbMigrationsEnabled() {
    return ENABLE_RUNTIME_DB_MIGRATIONS;
}
function requireEnv(name, options) {
    const value = process.env[name];
    if (value === undefined || value === null) {
        throw new Error(`${name} is not configured`);
    }
    if (!options?.allowEmpty && String(value).trim() === "") {
        throw new Error(`${name} is not configured`);
    }
    return String(value);
}
function getPool() {
    if (pool)
        return pool;
    pool = promise_1.default.createPool({
        host: process.env.DB_HOST || "127.0.0.1",
        user: requireEnv("DB_USER"),
        password: requireEnv("DB_PASSWORD", { allowEmpty: true }),
        database: requireEnv("DB_NAME"),
        port: Number(process.env.DB_PORT || 3306),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        dateStrings: true,
        charset: "utf8mb4",
        timezone: "Z",
    });
    return pool;
}
function qid(name) {
    return `\`${String(name).replace(/`/g, "``")}\``;
}
function sqlDate(value) {
    return (value || nowIso()).slice(0, 23).replace("T", " ").replace("Z", "");
}
function toIso(value) {
    if (!value)
        return null;
    if (value instanceof Date)
        return value.toISOString();
    const text = String(value).trim();
    if (!text)
        return null;
    if (text.includes("T"))
        return text.endsWith("Z") ? text : `${text}Z`;
    return `${text.replace(" ", "T")}Z`;
}
function parseJson(value, fallback) {
    if (value === null || value === undefined || value === "")
        return fallback;
    if (typeof value === "object")
        return value;
    try {
        return JSON.parse(String(value));
    }
    catch {
        return fallback;
    }
}
function normalizeImageList(value) {
    const parsed = Array.isArray(value) ? value : parseJson(value, []);
    const seen = new Set();
    return (Array.isArray(parsed) ? parsed : [])
        .map((item) => String(item?.url ?? item ?? "").trim())
        .filter(Boolean)
        .filter((url) => {
        if (seen.has(url))
            return false;
        seen.add(url);
        return true;
    });
}
function asBool(value) {
    if (value === true || value === 1 || value === "1")
        return true;
    const normalized = String(value ?? "").trim().toLowerCase();
    return normalized === "true" || normalized === "yes" || normalized === "y";
}
function normalizeStockQuantity(stockQuantity, inStock) {
    const numeric = Number(stockQuantity || 0);
    if (numeric > 0)
        return numeric;
    return asBool(inStock) ? 1 : 0;
}
async function tableExists(connection, tableName) {
    const [rows] = await connection.query(`SHOW TABLES LIKE ?`, [tableName]);
    return Array.isArray(rows) && rows.length > 0;
}
async function columnExists(connection, tableName, columnName) {
    const [rows] = await connection.query(`SHOW COLUMNS FROM ${qid(tableName)} LIKE ?`, [columnName]);
    return Array.isArray(rows) && rows.length > 0;
}
function isDuplicateColumnError(error) {
    return error?.code === "ER_DUP_FIELDNAME" || error?.errno === 1060;
}
async function addColumnIfMissing(connection, tableName, columnName, definition, afterColumn) {
    if (!(await tableExists(connection, tableName)))
        return false;
    if (await columnExists(connection, tableName, columnName))
        return false;
    const afterClause = afterColumn ? ` AFTER ${qid(afterColumn)}` : "";
    try {
        await connection.query(`ALTER TABLE ${qid(tableName)} ADD COLUMN ${qid(columnName)} ${definition}${afterClause}`);
        return true;
    }
    catch (error) {
        // Multiple HTTP requests can call readDb()/fetchAllTables() at startup.
        // If another request added the same column between our SHOW COLUMNS check
        // and ALTER TABLE, MySQL raises ER_DUP_FIELDNAME. Treat that as success.
        if (isDuplicateColumnError(error))
            return false;
        throw error;
    }
}
async function ensureOrderPaymentMethodEnum(connection) {
    if (!(await tableExists(connection, "orders")) || !(await columnExists(connection, "orders", "payment_method")))
        return;
    const requiredMethods = ["cash_on_delivery", "mpesa", "bank_transfer", "cash", "card", "other"];
    const [rows] = await connection.query(`SHOW COLUMNS FROM ${qid("orders")} LIKE 'payment_method'`);
    const column = Array.isArray(rows) ? rows[0] : null;
    const type = String(column?.Type || "").toLowerCase();
    const supportsAllMethods = requiredMethods.every((method) => type.includes(`'${method}'`));
    if (!supportsAllMethods) {
        await connection.query(`ALTER TABLE ${qid("orders")} MODIFY ${qid("payment_method")} enum('cash_on_delivery','mpesa','bank_transfer','cash','card','other') NOT NULL`);
    }
}
async function ensureDataEntryColumns(connection, tableName) {
    if (!(await tableExists(connection, tableName)))
        return;
    await addColumnIfMissing(connection, tableName, "data_entrant", "varchar(191) DEFAULT NULL");
    await addColumnIfMissing(connection, tableName, "entry_date", "datetime(3) NOT NULL DEFAULT current_timestamp(3)");
}
async function ensureProductSourcingColumns(connection) {
    if (!(await tableExists(connection, "products")))
        return;
    const columns = [
        ["sourced_from", "varchar(191) DEFAULT NULL"],
        ["sourced_by", "varchar(191) DEFAULT NULL"],
        ["source_date", "date DEFAULT NULL"],
        ["source_price", "decimal(12,2) NOT NULL DEFAULT 0"],
        ["sourcing_payment_status", "enum('paid','pay_later') NOT NULL DEFAULT 'pay_later'"],
        ["sourcing_paid_at", "datetime(3) DEFAULT NULL"],
        ["sourcing_paid_by", "varchar(191) DEFAULT NULL"],
    ];
    for (const [column, definition] of columns) {
        await addColumnIfMissing(connection, "products", column, definition);
    }
}
async function ensureProductImagesColumn(connection) {
    if (!(await tableExists(connection, "products")))
        return;
    await addColumnIfMissing(connection, "products", "images", "json DEFAULT NULL", "review_count");
    // Backfill the new products.images JSON array from the legacy product_images rows.
    // The product_images table is still mirrored by writeDb() for compatibility, but
    // products.images is now the canonical column used by product forms and APIs.
    if ((await columnExists(connection, "products", "images")) && (await tableExists(connection, "product_images"))) {
        await connection.query(`
      UPDATE ${qid("products")} p
      LEFT JOIN (
        SELECT
          ${qid("product_id")},
          CONCAT('[', GROUP_CONCAT(JSON_QUOTE(TRIM(${qid("url")})) ORDER BY ${qid("sort_order")} ASC, ${qid("id")} ASC SEPARATOR ','), ']') AS ${qid("images_json")}
        FROM ${qid("product_images")}
        WHERE ${qid("url")} IS NOT NULL AND TRIM(${qid("url")}) <> ''
        GROUP BY ${qid("product_id")}
      ) pi ON pi.${qid("product_id")} = p.${qid("id")} 
      SET p.${qid("images")} = COALESCE(pi.${qid("images_json")}, JSON_ARRAY())
      WHERE p.${qid("images")} IS NULL OR JSON_LENGTH(p.${qid("images")}) = 0
    `);
    }
}
async function ensureExpensesTable(connection) {
    await connection.query(`
    CREATE TABLE IF NOT EXISTS ${qid("expenses")} (
      ${qid("id")} varchar(191) NOT NULL,
      ${qid("details")} text NOT NULL,
      ${qid("category")} varchar(80) NOT NULL,
      ${qid("amount")} decimal(12,2) NOT NULL DEFAULT 0,
      ${qid("expense_date")} date NOT NULL,
      ${qid("order_id")} varchar(191) DEFAULT NULL,
      ${qid("data_entrant")} varchar(191) DEFAULT NULL,
      ${qid("entry_date")} datetime(3) NOT NULL DEFAULT current_timestamp(3),
      ${qid("created_at")} datetime(3) NOT NULL DEFAULT current_timestamp(3),
      ${qid("updated_at")} datetime(3) NOT NULL DEFAULT current_timestamp(3),
      PRIMARY KEY (${qid("id")}),
      KEY ${qid("expenses_category_idx")} (${qid("category")}),
      KEY ${qid("expenses_order_idx")} (${qid("order_id")}),
      KEY ${qid("expenses_date_idx")} (${qid("expense_date")})
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}
async function ensureProductSourcesTable(connection) {
    await connection.query("CREATE TABLE IF NOT EXISTS " + qid("product_sources") + " (" +
        qid("id") + " varchar(191) NOT NULL," +
        qid("name") + " varchar(191) NOT NULL," +
        qid("type") + " enum(\'supplier\',\'source\',\'marketplace\',\'walk_in\',\'other\') NOT NULL DEFAULT \'supplier\'," +
        qid("contact_person") + " varchar(191) DEFAULT NULL," +
        qid("phone") + " varchar(60) DEFAULT NULL," +
        qid("email") + " varchar(191) DEFAULT NULL," +
        qid("location") + " varchar(191) DEFAULT NULL," +
        qid("notes") + " text DEFAULT NULL," +
        qid("is_active") + " tinyint(1) NOT NULL DEFAULT 1," +
        qid("created_by_admin_user_id") + " varchar(191) DEFAULT NULL," +
        qid("created_at") + " datetime(3) NOT NULL DEFAULT current_timestamp(3)," +
        qid("updated_at") + " datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)," +
        "PRIMARY KEY (" + qid("id") + ")," +
        "KEY " + qid("product_sources_name_idx") + " (" + qid("name") + ")" +
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    // Do not auto-seed product_sources. Suppliers/sources are admin-managed records.
    // Re-inserting defaults here makes deleted suppliers come back after reloads.
}
async function ensureExpenseCategoriesTable(connection) {
    await connection.query("CREATE TABLE IF NOT EXISTS " + qid("expense_categories") + " (" +
        qid("id") + " varchar(191) NOT NULL," +
        qid("slug") + " varchar(120) NOT NULL," +
        qid("name") + " varchar(191) NOT NULL," +
        qid("is_active") + " tinyint(1) NOT NULL DEFAULT 1," +
        qid("created_at") + " datetime(3) NOT NULL DEFAULT current_timestamp(3)," +
        qid("updated_at") + " datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)," +
        "PRIMARY KEY (" + qid("id") + ")," +
        "UNIQUE KEY " + qid("expense_categories_slug_unique") + " (" + qid("slug") + ")" +
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    // Do not auto-seed expense_categories. Expense categories are admin/database-managed.
    // Supplier/acquisition cost is not an expense category.
}
async function ensureFinanceSchemaColumns(connection) {
    await ensureProductSourcesTable(connection);
    await ensureExpenseCategoriesTable(connection);
    await ensureExpensesTable(connection);
    await ensureProductSourcingColumns(connection);
    if (await tableExists(connection, "products")) {
        await addColumnIfMissing(connection, "products", "source_id", "varchar(191) DEFAULT NULL", "brand");
        await addColumnIfMissing(connection, "products", "source_payment_status", "enum(\'pending\',\'paid\',\'partial\',\'waived\') NOT NULL DEFAULT \'pending\'", "source_price");
        await addColumnIfMissing(connection, "products", "sales_channel", "enum(\'catalog\',\'pos_only\') NOT NULL DEFAULT \'catalog\'", "source_payment_status");
        await addColumnIfMissing(connection, "products", "is_catalog_visible", "tinyint(1) NOT NULL DEFAULT 1", "sales_channel");
        await addColumnIfMissing(connection, "products", "created_by_admin_user_id", "varchar(191) DEFAULT NULL");
        await addColumnIfMissing(connection, "products", "updated_by_admin_user_id", "varchar(191) DEFAULT NULL");
    }
    if (await tableExists(connection, "orders")) {
        await ensureOrderPaymentMethodEnum(connection);
        await addColumnIfMissing(connection, "orders", "transaction_reference", "varchar(120) DEFAULT NULL", "payment_method");
        await addColumnIfMissing(connection, "orders", "subtotal_amount", "int NOT NULL DEFAULT 0", "transaction_reference");
        await addColumnIfMissing(connection, "orders", "vat_rate", "decimal(5,2) NOT NULL DEFAULT 0", "subtotal_amount");
        await addColumnIfMissing(connection, "orders", "vat_amount", "int NOT NULL DEFAULT 0", "vat_rate");
        await addColumnIfMissing(connection, "orders", "is_pos_sale", "tinyint(1) NOT NULL DEFAULT 0", "vat_amount");
        await addColumnIfMissing(connection, "orders", "created_by_admin_user_id", "varchar(191) DEFAULT NULL", "notes");
    }
    if (await tableExists(connection, "order_items")) {
        await addColumnIfMissing(connection, "order_items", "source_id", "varchar(191) DEFAULT NULL", "product_barcode");
        await addColumnIfMissing(connection, "order_items", "source_name", "varchar(191) DEFAULT NULL", "source_id");
        await addColumnIfMissing(connection, "order_items", "unit_source_price", "int NOT NULL DEFAULT 0", "source_name");
        await addColumnIfMissing(connection, "order_items", "total_source_price", "int NOT NULL DEFAULT 0", "unit_source_price");
        await addColumnIfMissing(connection, "order_items", "unit_selling_price", "int NOT NULL DEFAULT 0", "total_source_price");
        await addColumnIfMissing(connection, "order_items", "total_selling_price", "int NOT NULL DEFAULT 0", "unit_selling_price");
        await addColumnIfMissing(connection, "order_items", "vat_rate", "decimal(5,2) NOT NULL DEFAULT 0", "total_selling_price");
        await addColumnIfMissing(connection, "order_items", "vat_amount", "int NOT NULL DEFAULT 0", "vat_rate");
    }
    if (await tableExists(connection, "expenses")) {
        await addColumnIfMissing(connection, "expenses", "category_id", "varchar(191) NOT NULL DEFAULT \'expense-cat-other\'", "updated_at");
        await addColumnIfMissing(connection, "expenses", "product_id", "varchar(191) DEFAULT NULL", "category_id");
        await addColumnIfMissing(connection, "expenses", "source_id", "varchar(191) DEFAULT NULL", "product_id");
        await addColumnIfMissing(connection, "expenses", "order_item_id", "varchar(191) DEFAULT NULL", "source_id");
        await addColumnIfMissing(connection, "expenses", "payment_status", "enum(\'pending\',\'paid\',\'partial\',\'cancelled\') NOT NULL DEFAULT \'paid\'", "order_item_id");
        await addColumnIfMissing(connection, "expenses", "payment_method", "enum(\'cash\',\'mpesa\',\'card\',\'bank_transfer\',\'other\') DEFAULT NULL", "payment_status");
        await addColumnIfMissing(connection, "expenses", "reference", "varchar(120) DEFAULT NULL", "payment_method");
        await addColumnIfMissing(connection, "expenses", "description", "text DEFAULT NULL", "reference");
        await addColumnIfMissing(connection, "expenses", "created_by_admin_user_id", "varchar(191) DEFAULT NULL", "description");
    }
}
async function ensureInventoryMovementTypeEnum(connection) {
    if (!(await tableExists(connection, "inventory_movements")) || !(await columnExists(connection, "inventory_movements", "type")))
        return;
    const requiredTypes = ["initial_stock", "manual_adjustment", "order_deducted", "order_restored", "pos_sale", "customer_checkout", "supplier_payment"];
    const [rows] = await connection.query(`SHOW COLUMNS FROM ${qid("inventory_movements")} LIKE 'type'`);
    const column = Array.isArray(rows) ? rows[0] : null;
    const type = String(column?.Type || "").toLowerCase();
    const supportsAllTypes = requiredTypes.every((value) => type.includes(`'${value}'`));
    if (!supportsAllTypes) {
        await connection.query(`ALTER TABLE ${qid("inventory_movements")} MODIFY ${qid("type")} enum('initial_stock','manual_adjustment','order_deducted','order_restored','pos_sale','customer_checkout','supplier_payment') NOT NULL`);
    }
}
async function ensureOrderItemSnapshotColumns(connection) {
    if (!(await tableExists(connection, "order_items")))
        return;
    await addColumnIfMissing(connection, "order_items", "product_name", "varchar(191) DEFAULT NULL", "product_id");
    await addColumnIfMissing(connection, "order_items", "product_brand", "varchar(191) DEFAULT NULL", "product_name");
    await addColumnIfMissing(connection, "order_items", "product_barcode", "varchar(120) DEFAULT NULL", "product_brand");
    await addColumnIfMissing(connection, "order_items", "serial_numbers", "json DEFAULT NULL", "product_barcode");
}
async function ensureCatalogTables() {
    const connection = getPool();
    await connection.query(`
    CREATE TABLE IF NOT EXISTS ${qid("brands")} (
      ${qid("id")} char(36) NOT NULL,
      ${qid("slug")} varchar(120) NOT NULL,
      ${qid("name")} varchar(120) NOT NULL,
      ${qid("description")} text DEFAULT NULL,
      ${qid("logo_url")} varchar(500) DEFAULT NULL,
      ${qid("website_url")} varchar(500) DEFAULT NULL,
      ${qid("is_active")} tinyint(1) NOT NULL DEFAULT 1,
      ${qid("created_at")} datetime NOT NULL,
      PRIMARY KEY (${qid("id")}),
      UNIQUE KEY ${qid("brands_slug_unique")} (${qid("slug")}),
      UNIQUE KEY ${qid("brands_name_unique")} (${qid("name")})
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
    await connection.query(`
    CREATE TABLE IF NOT EXISTS ${qid("subcategories")} (
      ${qid("id")} char(36) NOT NULL,
      ${qid("category_id")} char(36) NOT NULL,
      ${qid("slug")} varchar(120) NOT NULL,
      ${qid("name")} varchar(120) NOT NULL,
      ${qid("description")} text DEFAULT NULL,
      ${qid("sort_order")} int NOT NULL DEFAULT 0,
      ${qid("is_active")} tinyint(1) NOT NULL DEFAULT 1,
      ${qid("created_at")} datetime NOT NULL,
      PRIMARY KEY (${qid("id")}),
      UNIQUE KEY ${qid("subcategories_slug_unique")} (${qid("slug")}),
      KEY ${qid("subcategories_category_idx")} (${qid("category_id")})
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
    await connection.query(`
    CREATE TABLE IF NOT EXISTS ${qid("specifications")} (
      ${qid("id")} char(36) NOT NULL,
      ${qid("subcategory_id")} char(36) NOT NULL,
      ${qid("name")} varchar(120) NOT NULL,
      ${qid("sort_order")} int NOT NULL DEFAULT 0,
      ${qid("is_active")} tinyint(1) NOT NULL DEFAULT 1,
      ${qid("created_at")} datetime NOT NULL,
      PRIMARY KEY (${qid("id")}),
      UNIQUE KEY ${qid("specifications_subcategory_name_unique")} (${qid("subcategory_id")}, ${qid("name")}),
      KEY ${qid("specifications_subcategory_idx")} (${qid("subcategory_id")})
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
    await connection.query(`
    CREATE TABLE IF NOT EXISTS ${qid("specification_values")} (
      ${qid("id")} char(36) NOT NULL,
      ${qid("specification_id")} char(36) NOT NULL,
      ${qid("value")} varchar(191) NOT NULL,
      ${qid("sort_order")} int NOT NULL DEFAULT 0,
      ${qid("is_active")} tinyint(1) NOT NULL DEFAULT 1,
      ${qid("created_at")} datetime NOT NULL,
      PRIMARY KEY (${qid("id")}),
      UNIQUE KEY ${qid("specification_values_spec_value_unique")} (${qid("specification_id")}, ${qid("value")}),
      KEY ${qid("specification_values_specification_idx")} (${qid("specification_id")})
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}
async function fetchOptionalTable(connection, tableName, sql) {
    if (!(await tableExists(connection, tableName)))
        return [];
    return fetchTable(connection, sql);
}
async function queryDb(sql, params = []) {
    const [rows] = await getPool().query(sql, params);
    return Array.isArray(rows) ? rows : [];
}
async function executeDb(sql, params = []) {
    await getPool().execute(sql, params);
}
async function fetchTable(connection, sql) {
    const [rows] = await connection.query(sql);
    return Array.isArray(rows) ? rows : [];
}
async function runRuntimeDbMigrations(connection) {
    if (!runtimeDbMigrationsEnabled())
        return;
    await ensureCatalogTables();
    await ensureExpensesTable(connection);
    await ensureExpenseCategoriesTable(connection);
    await ensureProductSourcesTable(connection);
    await ensureProductSourcingColumns(connection);
    await ensureProductImagesColumn(connection);
    await ensureFinanceSchemaColumns(connection);
    await Promise.all([
        "admin_activity_logs",
        "admin_users",
        "blog_posts",
        "brands",
        "cart_items",
        "carts",
        "categories",
        "contact_messages",
        "customer_users",
        "inventory_movements",
        "newsletter_subscribers",
        "order_items",
        "orders",
        "password_reset_tokens",
        "product_analytics",
        "product_images",
        "products",
        "reviews",
        "specification_values",
        "specifications",
        "subcategories",
        "expenses",
        "expense_categories",
        "product_sources",
    ].map((tableName) => ensureDataEntryColumns(connection, tableName)));
    await ensureProductSourcingColumns(connection);
    await ensureProductImagesColumn(connection);
    await ensureInventoryMovementTypeEnum(connection);
    if (await tableExists(connection, "products")) {
        await addColumnIfMissing(connection, "products", "premium", "tinyint(1) NOT NULL DEFAULT 0", "featured");
        await addColumnIfMissing(connection, "products", "barcode", "varchar(120) DEFAULT NULL", "brand");
        await addColumnIfMissing(connection, "products", "total_stock_received", "int NOT NULL DEFAULT 0", "stock_quantity");
        await addColumnIfMissing(connection, "products", "serial_numbers", "json DEFAULT NULL", "stock_quantity");
    }
    if (await tableExists(connection, "orders")) {
        await ensureOrderPaymentMethodEnum(connection);
        await addColumnIfMissing(connection, "orders", "transaction_reference", "varchar(120) DEFAULT NULL", "payment_method");
        await addColumnIfMissing(connection, "orders", "discount_amount", "decimal(12,2) NOT NULL DEFAULT 0", "transaction_reference");
        await addColumnIfMissing(connection, "orders", "other_charges", "decimal(12,2) NOT NULL DEFAULT 0", "discount_amount");
    }
    await ensureOrderItemSnapshotColumns(connection);
}
async function fetchAllTables() {
    const connection = getPool();
    await runRuntimeDbMigrations(connection);
    const [categories, products, productImages, blogPosts, adminUsers, customerUsers, passwordResetTokens, carts, cartItems, orders, orderItems, inventoryMovements, productAnalytics, contactMessages, newsletterSubscribers, reviews, brands, subcategories, specifications, specificationValues, expenses, expenseCategories, productSources,] = await Promise.all([
        fetchTable(connection, `SELECT * FROM ${qid("categories")} ORDER BY ${qid("sort_order")} ASC, ${qid("name")} ASC`),
        fetchTable(connection, `SELECT * FROM ${qid("products")} ORDER BY ${qid("created_at")} DESC`),
        fetchTable(connection, `SELECT * FROM ${qid("product_images")} ORDER BY ${qid("product_id")} ASC, ${qid("sort_order")} ASC, ${qid("id")} ASC`),
        fetchTable(connection, `SELECT * FROM ${qid("blog_posts")} ORDER BY ${qid("published_at")} DESC`),
        fetchTable(connection, `SELECT * FROM ${qid("admin_users")} ORDER BY ${qid("created_at")} DESC`),
        fetchTable(connection, `SELECT * FROM ${qid("customer_users")} ORDER BY ${qid("created_at")} DESC`),
        fetchTable(connection, `SELECT * FROM ${qid("password_reset_tokens")} ORDER BY ${qid("created_at")} DESC`),
        fetchTable(connection, `SELECT * FROM ${qid("carts")} ORDER BY ${qid("created_at")} DESC`),
        fetchTable(connection, `SELECT * FROM ${qid("cart_items")} ORDER BY ${qid("created_at")} ASC`),
        fetchTable(connection, `SELECT * FROM ${qid("orders")} ORDER BY ${qid("created_at")} DESC`),
        fetchTable(connection, `SELECT * FROM ${qid("order_items")} ORDER BY ${qid("order_id")} ASC, ${qid("id")} ASC`),
        fetchTable(connection, `SELECT * FROM ${qid("inventory_movements")} ORDER BY ${qid("created_at")} DESC`),
        fetchTable(connection, `SELECT * FROM ${qid("product_analytics")} ORDER BY ${qid("created_at")} DESC`),
        fetchTable(connection, `SELECT * FROM ${qid("contact_messages")} ORDER BY ${qid("created_at")} DESC`),
        fetchTable(connection, `SELECT * FROM ${qid("newsletter_subscribers")} ORDER BY ${qid("created_at")} DESC`),
        fetchTable(connection, `SELECT * FROM ${qid("reviews")} ORDER BY ${qid("created_at")} DESC`),
        fetchOptionalTable(connection, "brands", `SELECT * FROM ${qid("brands")} ORDER BY ${qid("name")} ASC`),
        fetchOptionalTable(connection, "subcategories", `SELECT * FROM ${qid("subcategories")} ORDER BY ${qid("category_id")} ASC, ${qid("sort_order")} ASC, ${qid("name")} ASC`),
        fetchOptionalTable(connection, "specifications", `SELECT * FROM ${qid("specifications")} ORDER BY ${qid("subcategory_id")} ASC, ${qid("sort_order")} ASC, ${qid("name")} ASC`),
        fetchOptionalTable(connection, "specification_values", `SELECT * FROM ${qid("specification_values")} ORDER BY ${qid("specification_id")} ASC, ${qid("sort_order")} ASC, ${qid("value")} ASC`),
        fetchOptionalTable(connection, "expenses", `SELECT * FROM ${qid("expenses")} ORDER BY ${qid("expense_date")} DESC, ${qid("entry_date")} DESC`),
        fetchOptionalTable(connection, "expense_categories", `SELECT * FROM ${qid("expense_categories")} ORDER BY ${qid("name")} ASC`),
        fetchOptionalTable(connection, "product_sources", `SELECT * FROM ${qid("product_sources")} ORDER BY ${qid("name")} ASC`),
    ]);
    return {
        categories,
        products,
        productImages,
        blogPosts,
        adminUsers,
        customerUsers,
        passwordResetTokens,
        carts,
        cartItems,
        orders,
        orderItems,
        inventoryMovements,
        productAnalytics,
        contactMessages,
        newsletterSubscribers,
        reviews,
        brands,
        subcategories,
        specifications,
        specificationValues,
        expenses,
        expenseCategories,
        productSources,
    };
}
function nowIso() {
    return new Date().toISOString();
}
function createId() {
    return crypto_1.default.randomUUID();
}
async function readDb() {
    const raw = await fetchAllTables();
    const imagesByProductId = new Map();
    for (const row of raw.productImages) {
        const productId = String(row.product_id);
        const url = String(row.url || "").trim();
        if (!url)
            continue;
        const list = imagesByProductId.get(productId) || [];
        if (!list.includes(url))
            list.push(url);
        imagesByProductId.set(productId, list);
    }
    const cartItemsByCartId = new Map();
    for (const row of raw.cartItems) {
        const list = cartItemsByCartId.get(String(row.cart_id)) || [];
        list.push({
            id: String(row.id),
            productId: String(row.product_id),
            quantity: Number(row.quantity || 0),
            createdAt: toIso(row.created_at),
            updatedAt: toIso(row.updated_at),
        });
        cartItemsByCartId.set(String(row.cart_id), list);
    }
    const brandNameByLookup = new Map();
    for (const brand of raw.brands || []) {
        const name = String(brand.name ?? "").trim();
        if (!name)
            continue;
        [brand.id, brand.slug, brand.name]
            .map((value) => String(value ?? "").trim().toLowerCase())
            .filter(Boolean)
            .forEach((key) => brandNameByLookup.set(key, name));
    }
    const productBrandById = new Map();
    for (const product of raw.products || []) {
        productBrandById.set(String(product.id), String(product.brand ?? "").trim());
    }
    const productSourceById = new Map();
    for (const source of raw.productSources || []) {
        productSourceById.set(String(source.id), source);
    }
    const expenseCategoryById = new Map();
    for (const category of raw.expenseCategories || []) {
        expenseCategoryById.set(String(category.id), category);
    }
    const resolveBrandSnapshotName = (value, fallbackProductId) => {
        const rawValue = String(value ?? "").trim();
        if (rawValue) {
            const matched = brandNameByLookup.get(rawValue.toLowerCase());
            if (matched)
                return matched;
            if (!brandNameByLookup.size)
                return rawValue;
        }
        const productBrand = productBrandById.get(String(fallbackProductId ?? ""));
        if (productBrand) {
            return brandNameByLookup.get(productBrand.toLowerCase()) || productBrand;
        }
        return rawValue || null;
    };
    const orderItemsByOrderId = new Map();
    for (const row of raw.orderItems) {
        const serialValues = parseJson(row.serial_numbers, []);
        orderItemsByOrderId.set(String(row.order_id), (orderItemsByOrderId.get(String(row.order_id)) || []).concat({
            id: String(row.id),
            productId: String(row.product_id),
            productName: String(row.product_name ?? "").trim() || null,
            productBrand: resolveBrandSnapshotName(row.product_brand, row.product_id),
            productBarcode: String(row.product_barcode ?? "").trim() || null,
            sourceId: row.source_id ? String(row.source_id) : null,
            sourceName: String(row.source_name ?? "").trim() || null,
            unitSourcePrice: Number(row.unit_source_price || 0),
            totalSourcePrice: Number(row.total_source_price || 0),
            unitSellingPrice: Number(row.unit_selling_price || row.unit_price || 0),
            totalSellingPrice: Number(row.total_selling_price || row.total_price || 0),
            vatRate: Number(row.vat_rate || 0),
            vatAmount: Number(row.vat_amount || 0),
            quantity: Number(row.quantity || 0),
            unitPrice: Number(row.unit_price || 0),
            totalPrice: Number(row.total_price || 0),
            serialNumbers: Array.isArray(serialValues)
                ? serialValues.map((value) => normalizeSerialNumber(value?.serialNumber ?? value)).filter(Boolean)
                : [],
        }));
    }
    return {
        categories: raw.categories.map((row) => ({
            id: String(row.id),
            slug: String(row.slug),
            name: String(row.name),
            description: row.description ?? null,
            imageUrl: row.image_url ?? null,
            icon: row.icon ?? null,
            sortOrder: Number(row.sort_order || 0),
            isActive: asBool(row.is_active),
            createdAt: toIso(row.created_at),
        })),
        brands: raw.brands.map((row) => ({
            id: String(row.id),
            slug: String(row.slug),
            name: String(row.name),
            description: row.description ?? null,
            logoUrl: row.logo_url ?? null,
            websiteUrl: row.website_url ?? null,
            isActive: asBool(row.is_active),
            createdAt: toIso(row.created_at),
        })),
        subcategories: raw.subcategories.map((row) => ({
            id: String(row.id),
            categoryId: String(row.category_id),
            slug: String(row.slug),
            name: String(row.name),
            description: row.description ?? null,
            sortOrder: Number(row.sort_order || 0),
            isActive: asBool(row.is_active),
            createdAt: toIso(row.created_at),
        })),
        specifications: raw.specifications.map((row) => ({
            id: String(row.id),
            subcategoryId: String(row.subcategory_id),
            name: String(row.name),
            sortOrder: Number(row.sort_order || 0),
            isActive: asBool(row.is_active),
            createdAt: toIso(row.created_at),
        })),
        productSources: raw.productSources.map((row) => ({
            id: String(row.id),
            name: String(row.name),
            type: String(row.type || "supplier"),
            contactPerson: row.contact_person ?? null,
            phone: row.phone ?? null,
            email: row.email ?? null,
            location: row.location ?? null,
            notes: row.notes ?? null,
            isActive: asBool(row.is_active),
            createdByAdminUserId: row.created_by_admin_user_id ?? null,
            createdAt: toIso(row.created_at),
            updatedAt: toIso(row.updated_at || row.created_at),
        })),
        expenseCategories: raw.expenseCategories.map((row) => ({
            id: String(row.id),
            slug: String(row.slug),
            name: String(row.name),
            isActive: asBool(row.is_active),
            createdAt: toIso(row.created_at),
            updatedAt: toIso(row.updated_at || row.created_at),
        })),
        specificationValues: raw.specificationValues.map((row) => ({
            id: String(row.id),
            specificationId: String(row.specification_id),
            value: String(row.value),
            sortOrder: Number(row.sort_order || 0),
            isActive: asBool(row.is_active),
            createdAt: toIso(row.created_at),
        })),
        products: raw.products.map((row) => {
            const stockQuantity = normalizeStockQuantity(row.stock_quantity, row.in_stock);
            const totalStockReceived = Number(row.total_stock_received ?? row.stock_quantity ?? 0);
            const barcode = String(row.barcode ?? "").trim();
            const storedSerialNumbers = parseJson(row.serial_numbers, []);
            const serialNumbers = Array.isArray(storedSerialNumbers)
                ? storedSerialNumbers.map((item) => normalizeSerialNumber(item?.serialNumber ?? item)).filter(Boolean)
                : [];
            const legacyImages = imagesByProductId.get(String(row.id)) || [];
            const hasStoredImagesColumn = row.images !== undefined && row.images !== null && row.images !== "";
            const images = hasStoredImagesColumn ? normalizeImageList(row.images) : legacyImages;
            return {
                id: String(row.id),
                slug: String(row.slug),
                name: String(row.name),
                categoryId: String(row.category_id),
                subcategory: row.subcategory ?? null,
                brand: String(row.brand),
                sourceId: row.source_id ? String(row.source_id) : null,
                sourceName: row.source_id && productSourceById.get(String(row.source_id)) ? String(productSourceById.get(String(row.source_id)).name) : null,
                barcode: barcode || null,
                price: Number(row.price || 0),
                originalPrice: row.original_price === null || row.original_price === undefined ? null : Number(row.original_price),
                condition: String(row.condition),
                description: String(row.description || ""),
                specs: parseJson(row.specs, {}),
                warrantyText: row.warranty_text ?? null,
                inStock: stockQuantity > 0,
                featured: asBool(row.featured),
                premium: asBool(row.premium),
                rating: Number(row.rating || 0),
                reviewCount: Number(row.review_count || 0),
                createdAt: toIso(row.created_at),
                dataEntrant: row.data_entrant ?? null,
                entryDate: toIso(row.entry_date || row.created_at),
                stockQuantity,
                totalStockReceived,
                sourcedFrom: row.sourced_from ?? null,
                sourcedBy: row.sourced_by ?? null,
                sourceDate: row.source_date ? String(row.source_date).slice(0, 10) : null,
                sourcePrice: Number(row.source_price || 0),
                sourcePaymentStatus: String(row.source_payment_status || row.sourcing_payment_status || "pending"),
                salesChannel: String(row.sales_channel || "catalog"),
                isCatalogVisible: row.is_catalog_visible === undefined || row.is_catalog_visible === null ? true : asBool(row.is_catalog_visible),
                createdByAdminUserId: row.created_by_admin_user_id ?? null,
                updatedByAdminUserId: row.updated_by_admin_user_id ?? null,
                sourcingPaymentStatus: String(row.sourcing_payment_status || (row.source_payment_status === "paid" ? "paid" : "pay_later")),
                sourcingPaidAt: toIso(row.sourcing_paid_at),
                sourcingPaidBy: row.sourcing_paid_by ?? null,
                images,
                serialNumbers,
            };
        }),
        blogPosts: raw.blogPosts.map((row) => ({
            id: String(row.id),
            slug: String(row.slug),
            title: String(row.title),
            excerpt: String(row.excerpt || ""),
            contentHtml: String(row.content_html || ""),
            imageUrl: row.image_url ?? null,
            author: row.author ?? null,
            category: row.category ?? null,
            readTime: row.read_time ?? null,
            publishedAt: toIso(row.published_at),
            isPublished: asBool(row.is_published),
        })),
        adminUsers: raw.adminUsers.map((row) => ({
            id: String(row.id),
            email: String(row.email),
            password: String(row.password),
            name: String(row.name),
            role: String(row.role),
            isActive: asBool(row.is_active),
            createdAt: toIso(row.created_at),
            updatedAt: toIso(row.updated_at),
        })),
        customerUsers: raw.customerUsers.map((row) => ({
            id: String(row.id),
            fullName: String(row.full_name),
            email: String(row.email),
            phone: row.phone ?? null,
            passwordHash: String(row.password_hash),
            isActive: asBool(row.is_active),
            createdAt: toIso(row.created_at),
            updatedAt: toIso(row.updated_at),
        })),
        passwordResetTokens: raw.passwordResetTokens.map((row) => ({
            id: String(row.id),
            customerId: String(row.customer_id),
            token: String(row.token),
            expiresAt: toIso(row.expires_at),
            usedAt: toIso(row.used_at),
            createdAt: toIso(row.created_at),
        })),
        carts: raw.carts.map((row) => ({
            id: String(row.id),
            customerId: String(row.customer_id),
            createdAt: toIso(row.created_at),
            updatedAt: toIso(row.updated_at),
            items: cartItemsByCartId.get(String(row.id)) || [],
        })),
        orders: raw.orders.map((row) => ({
            id: String(row.id),
            customerId: String(row.customer_id),
            status: String(row.status),
            paymentStatus: String(row.payment_status),
            paymentMethod: String(row.payment_method),
            transactionReference: String(row.transaction_reference ?? "").trim() || null,
            subtotalAmount: Number(row.subtotal_amount || 0),
            vatRate: Number(row.vat_rate || 0),
            vatAmount: Number(row.vat_amount || 0),
            isPosSale: asBool(row.is_pos_sale),
            createdByAdminUserId: row.created_by_admin_user_id ? String(row.created_by_admin_user_id) : null,
            discountAmount: Number(row.discount_amount || 0),
            otherCharges: Number(row.other_charges || 0),
            totalAmount: Number(row.total_amount || 0),
            deliveryName: String(row.delivery_name),
            deliveryPhone: String(row.delivery_phone),
            deliveryEmail: String(row.delivery_email),
            deliveryAddress: String(row.delivery_address),
            notes: row.notes ?? null,
            createdAt: toIso(row.created_at),
            updatedAt: toIso(row.updated_at),
            dataEntrant: row.data_entrant ?? null,
            entryDate: toIso(row.entry_date || row.created_at),
            items: orderItemsByOrderId.get(String(row.id)) || [],
        })),
        inventoryMovements: raw.inventoryMovements.map((row) => ({
            id: String(row.id),
            productId: String(row.product_id),
            orderId: row.order_id ? String(row.order_id) : null,
            adminUserId: row.admin_user_id ? String(row.admin_user_id) : null,
            type: String(row.type),
            quantityChange: Number(row.quantity_change || 0),
            quantityBefore: Number(row.quantity_before || 0),
            quantityAfter: Number(row.quantity_after || 0),
            note: row.note ?? null,
            dataEntrant: row.data_entrant ?? null,
            entryDate: toIso(row.entry_date || row.created_at),
            createdAt: toIso(row.created_at),
        })),
        productAnalytics: raw.productAnalytics.map((row) => ({
            id: String(row.id),
            productId: String(row.product_id),
            event: String(row.event),
            metadata: parseJson(row.metadata, {}),
            ipAddress: row.ip_address ?? null,
            userAgent: row.user_agent ?? null,
            createdAt: toIso(row.created_at),
        })),
        contactMessages: raw.contactMessages.map((row) => ({
            id: String(row.id),
            fullName: String(row.full_name),
            email: String(row.email),
            phone: row.phone ?? null,
            subject: String(row.subject),
            message: String(row.message),
            status: String(row.status),
            createdAt: toIso(row.created_at),
        })),
        newsletterSubscribers: raw.newsletterSubscribers.map((row) => ({
            id: String(row.id),
            email: String(row.email),
            source: row.source ?? null,
            createdAt: toIso(row.created_at),
        })),
        reviews: raw.reviews.map((row) => ({
            id: String(row.id),
            productId: String(row.product_id),
            customerId: String(row.customer_id),
            rating: Number(row.rating || 0),
            comment: String(row.comment || ""),
            isApproved: asBool(row.is_approved),
            createdAt: toIso(row.created_at),
            updatedAt: toIso(row.updated_at),
        })),
        expenses: raw.expenses.map((row) => {
            const categoryId = String(row.category_id || "expense-cat-other");
            const category = expenseCategoryById.get(categoryId);
            const source = row.source_id ? productSourceById.get(String(row.source_id)) : null;
            return {
                id: String(row.id),
                details: String(row.details || row.description || ""),
                category: String(row.category || category?.slug || "other"),
                categoryId,
                categoryName: category?.name || String(row.category || "Other"),
                amount: Number(row.amount || 0),
                date: row.expense_date ? String(row.expense_date).slice(0, 10) : "",
                expenseDate: row.expense_date ? String(row.expense_date).slice(0, 10) : "",
                productId: row.product_id ? String(row.product_id) : null,
                sourceId: row.source_id ? String(row.source_id) : null,
                sourceName: source?.name || null,
                orderId: row.order_id ? String(row.order_id) : null,
                orderItemId: row.order_item_id ? String(row.order_item_id) : null,
                paymentStatus: String(row.payment_status || "paid"),
                paymentMethod: row.payment_method ?? null,
                reference: row.reference ?? null,
                description: row.description ?? row.details ?? null,
                createdByAdminUserId: row.created_by_admin_user_id ?? null,
                dataEntrant: row.data_entrant ?? null,
                entryDate: toIso(row.entry_date || row.created_at),
                createdAt: toIso(row.created_at),
                updatedAt: toIso(row.updated_at || row.created_at),
            };
        }),
    };
}
async function executeMany(connection, sql, rows) {
    if (!rows.length)
        return;
    for (const params of rows) {
        await connection.execute(sql, params);
    }
}
function insertSql(table, columns) {
    const quotedColumns = columns.map(qid).join(", ");
    const placeholders = columns.map(() => "?").join(", ");
    const updateColumns = columns.slice(1);
    const updateClause = updateColumns.length
        ? ` ON DUPLICATE KEY UPDATE ${updateColumns.map((column) => `${qid(column)} = VALUES(${qid(column)})`).join(", ")}`
        : "";
    return `INSERT INTO ${qid(table)} (${quotedColumns}) VALUES (${placeholders})${updateClause}`;
}
function stableGeneratedId(prefix, parts) {
    const hash = crypto_1.default.createHash("sha1").update(parts.map((part) => String(part ?? "")).join("|"), "utf8").digest("hex").slice(0, 32);
    return `${prefix}-${hash}`.slice(0, 191);
}
function slugify(value, fallback = "item") {
    const slug = String(value || fallback)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return slug || fallback;
}
function mergeByStableId(items, _defaults = []) {
    const byId = new Map();
    for (const item of Array.isArray(items) ? items : []) {
        const id = String(item?.id || "").trim();
        if (!id)
            continue;
        const current = byId.get(id) || {};
        byId.set(id, { ...current, ...item, id });
    }
    return Array.from(byId.values());
}
function normalizeExpenseCategories(items) {
    const byId = new Map();
    const idBySlug = new Map();
    for (const item of Array.isArray(items) ? items : []) {
        const explicitName = String(item?.name || "").trim();
        const explicitSlug = String(item?.slug || "").trim();
        if (!explicitName && !explicitSlug)
            continue;
        const slug = slugify(explicitSlug || explicitName, "other");
        if (slug === "supplier")
            continue;
        const id = String(item?.id || `expense-cat-${slug}`).trim();
        if (!id)
            continue;
        const existingId = idBySlug.get(slug);
        const targetId = existingId || id;
        const current = byId.get(targetId) || {};
        byId.set(targetId, {
            ...current,
            ...item,
            id: targetId,
            slug,
            name: String(item?.name || current.name || slug.replace(/-/g, " ")).trim() || "Other",
        });
        idBySlug.set(slug, targetId);
    }
    return Array.from(byId.values());
}
function normalizeCustomerUsersAndReferences(db) {
    // Important: do not auto-create, dedupe, or rewrite customer rows here.
    // Manual DB edits must remain manual. This function now only returns the rows
    // already present in the request payload so customer register/profile flows can
    // persist their intended changes without recreating deleted rows.
    return (Array.isArray(db.customerUsers) ? db.customerUsers : []).filter((item) => String(item?.id || "").trim());
}
function normalizeProductSources(items) {
    return (Array.isArray(items) ? items : [])
        .filter((item) => String(item?.id || "").trim() && String(item?.name || "").trim())
        .map((item) => ({
        ...item,
        id: String(item.id).trim(),
        name: String(item.name).trim(),
    }));
}
async function writeDb(db) {
    const connection = await getPool().getConnection();
    try {
        await connection.beginTransaction();
        await runRuntimeDbMigrations(connection);
        await executeMany(connection, insertSql("admin_users", ["id", "email", "password", "name", "role", "is_active", "created_at", "updated_at", "data_entrant", "entry_date"]), (db.adminUsers || []).map((item) => [
            item.id,
            item.email,
            item.password,
            item.name,
            item.role || "admin",
            item.isActive === false ? 0 : 1,
            sqlDate(item.createdAt),
            sqlDate(item.updatedAt || item.createdAt),
            item.dataEntrant || item.createdByAdminUserId || null,
            sqlDate(item.entryDate || item.createdAt),
        ]));
        const normalizedCustomerUsers = normalizeCustomerUsersAndReferences(db);
        await executeMany(connection, insertSql("customer_users", ["id", "full_name", "email", "phone", "password_hash", "is_active", "created_at", "updated_at"]), normalizedCustomerUsers.map((item) => [
            item.id,
            item.fullName,
            item.email,
            item.phone || null,
            item.passwordHash,
            item.isActive === false ? 0 : 1,
            sqlDate(item.createdAt),
            sqlDate(item.updatedAt || item.createdAt),
        ]));
        await executeMany(connection, insertSql("categories", ["id", "slug", "name", "description", "image_url", "icon", "sort_order", "is_active", "created_at"]), (db.categories || []).map((item) => [
            item.id,
            item.slug,
            item.name,
            item.description || null,
            item.imageUrl || null,
            item.icon || null,
            Number(item.sortOrder || 0),
            item.isActive === false ? 0 : 1,
            sqlDate(item.createdAt),
        ]));
        // product_sources and expense_categories are admin/database-managed lookup tables.
        // Do not upsert them from writeDb(), because a stale request can recreate rows
        // that an admin deleted in another request.
        await executeMany(connection, insertSql("products", ["id", "slug", "name", "category_id", "subcategory", "brand", "source_id", "barcode", "price", "original_price", "condition", "description", "specs", "warranty_text", "in_stock", "featured", "premium", "rating", "review_count", "images", "created_at", "stock_quantity", "total_stock_received", "serial_numbers", "created_by_admin_user_id", "updated_by_admin_user_id", "sourced_from", "sourced_by", "source_date", "source_price", "source_payment_status", "sales_channel", "is_catalog_visible", "sourcing_payment_status", "sourcing_paid_at", "sourcing_paid_by", "data_entrant", "entry_date"]), (db.products || []).map((item) => {
            const stockQuantity = Number(item.stockQuantity || 0);
            const totalStockReceived = Number(item.totalStockReceived ?? stockQuantity);
            const serialNumbers = Array.isArray(item.serialNumbers)
                ? item.serialNumbers.map((serial) => normalizeSerialNumber(serial?.serialNumber ?? serial)).filter(Boolean)
                : [];
            const sourcePaymentStatus = item.sourcePaymentStatus || (item.sourcingPaymentStatus === "paid" ? "paid" : "pending");
            return [
                item.id,
                item.slug,
                item.name,
                item.categoryId,
                item.subcategory || null,
                item.brand,
                item.sourceId || null,
                String(item.barcode || "").trim() || null,
                Number(item.price || 0),
                item.originalPrice === undefined || item.originalPrice === null || item.originalPrice === "" ? null : Number(item.originalPrice),
                item.condition,
                item.description,
                JSON.stringify(item.specs || {}),
                item.warrantyText || null,
                stockQuantity > 0 ? 1 : 0,
                item.featured ? 1 : 0,
                item.premium ? 1 : 0,
                Number(item.rating || 0),
                Number(item.reviewCount || 0),
                JSON.stringify(normalizeImageList(item.images)),
                sqlDate(item.createdAt),
                stockQuantity,
                totalStockReceived,
                JSON.stringify(serialNumbers),
                item.createdByAdminUserId || null,
                item.updatedByAdminUserId || null,
                item.sourcedFrom || null,
                item.sourcedBy || null,
                item.sourceDate || null,
                Number(item.sourcePrice || 0),
                ["paid", "partial", "waived"].includes(sourcePaymentStatus) ? sourcePaymentStatus : "pending",
                item.salesChannel === "pos_only" ? "pos_only" : "catalog",
                item.isCatalogVisible === false ? 0 : 1,
                item.sourcingPaymentStatus === "paid" || sourcePaymentStatus === "paid" ? "paid" : "pay_later",
                item.sourcingPaidAt ? sqlDate(item.sourcingPaidAt) : null,
                item.sourcingPaidBy || null,
                item.dataEntrant || null,
                sqlDate(item.entryDate || item.createdAt),
            ];
        }));
        const productIdsForImageMirror = (db.products || []).map((product) => String(product.id || "").trim()).filter(Boolean);
        if (productIdsForImageMirror.length) {
            await connection.query("DELETE FROM " + qid("product_images") + " WHERE " + qid("product_id") + " IN (" + productIdsForImageMirror.map(() => "?").join(",") + ")", productIdsForImageMirror);
        }
        await executeMany(connection, insertSql("product_images", ["id", "product_id", "url", "sort_order", "data_entrant", "entry_date"]), (db.products || []).flatMap((product) => normalizeImageList(product.images).map((url, index) => [
            stableGeneratedId("product-image", [product.id, url]),
            product.id,
            url,
            index,
            product.dataEntrant || null,
            sqlDate(product.entryDate || product.createdAt),
        ])));
        await executeMany(connection, insertSql("blog_posts", ["id", "slug", "title", "excerpt", "content_html", "image_url", "author", "category", "read_time", "published_at", "is_published"]), (db.blogPosts || []).map((item) => [
            item.id,
            item.slug,
            item.title,
            item.excerpt,
            item.contentHtml,
            item.imageUrl || null,
            item.author || null,
            item.category || null,
            item.readTime || null,
            sqlDate(item.publishedAt),
            item.isPublished === false ? 0 : 1,
        ]));
        await executeMany(connection, insertSql("carts", ["id", "customer_id", "created_at", "updated_at"]), (db.carts || []).map((item) => [
            item.id,
            item.customerId,
            sqlDate(item.createdAt),
            sqlDate(item.updatedAt || item.createdAt),
        ]));
        await executeMany(connection, insertSql("cart_items", ["id", "cart_id", "product_id", "quantity", "created_at", "updated_at"]), (db.carts || []).flatMap((cart) => (cart.items || []).map((item) => [
            item.id || createId(),
            cart.id,
            item.productId,
            Number(item.quantity || 0),
            sqlDate(item.createdAt),
            sqlDate(item.updatedAt || item.createdAt),
        ])));
        await executeMany(connection, insertSql("orders", ["id", "customer_id", "status", "payment_status", "payment_method", "transaction_reference", "subtotal_amount", "vat_rate", "vat_amount", "is_pos_sale", "discount_amount", "other_charges", "total_amount", "delivery_name", "delivery_phone", "delivery_email", "delivery_address", "notes", "created_by_admin_user_id", "created_at", "updated_at", "data_entrant", "entry_date"]), (db.orders || []).map((item) => [
            item.id,
            item.customerId,
            item.status,
            item.paymentStatus,
            item.paymentMethod,
            String(item.transactionReference || "").trim() || null,
            Number(item.subtotalAmount || 0),
            Number(item.vatRate || 0),
            Number(item.vatAmount || 0),
            item.isPosSale ? 1 : 0,
            Number(item.discountAmount || 0),
            Number(item.otherCharges || 0),
            Number(item.totalAmount || 0),
            item.deliveryName,
            item.deliveryPhone,
            item.deliveryEmail || "",
            item.deliveryAddress,
            item.notes || null,
            item.createdByAdminUserId || null,
            sqlDate(item.createdAt),
            sqlDate(item.updatedAt || item.createdAt),
            item.dataEntrant || null,
            sqlDate(item.entryDate || item.createdAt),
        ]));
        await executeMany(connection, insertSql("order_items", ["id", "order_id", "product_id", "product_name", "product_brand", "product_barcode", "source_id", "source_name", "unit_source_price", "total_source_price", "unit_selling_price", "total_selling_price", "vat_rate", "vat_amount", "serial_numbers", "quantity", "unit_price", "total_price", "data_entrant", "entry_date"]), (db.orders || []).flatMap((order) => (order.items || []).map((item) => [
            item.id || createId(),
            order.id,
            item.productId,
            item.productName || null,
            item.productBrand || null,
            item.productBarcode || null,
            item.sourceId || null,
            item.sourceName || null,
            Number(item.unitSourcePrice || 0),
            Number(item.totalSourcePrice || 0),
            Number(item.unitSellingPrice || item.unitPrice || 0),
            Number(item.totalSellingPrice || item.totalPrice || 0),
            Number(item.vatRate || 0),
            Number(item.vatAmount || 0),
            JSON.stringify(Array.isArray(item.serialNumbers) ? item.serialNumbers.map((serial) => normalizeSerialNumber(serial?.serialNumber ?? serial)).filter(Boolean) : []),
            Number(item.quantity || 0),
            Number(item.unitPrice || item.unitSellingPrice || 0),
            Number(item.totalPrice || item.totalSellingPrice || 0),
            item.dataEntrant || order.dataEntrant || null,
            sqlDate(item.entryDate || order.entryDate || order.createdAt),
        ])));
        await executeMany(connection, `UPDATE ${qid("products")} SET ${qid("stock_quantity")} = ?, ${qid("in_stock")} = ?, ${qid("total_stock_received")} = ?, ${qid("serial_numbers")} = ? WHERE ${qid("id")} = ?`, (db.products || []).map((item) => {
            const stockQuantity = Number(item.stockQuantity || 0);
            const totalStockReceived = Number(item.totalStockReceived ?? stockQuantity);
            const serialNumbers = Array.isArray(item.serialNumbers)
                ? item.serialNumbers.map((serial) => normalizeSerialNumber(serial?.serialNumber ?? serial)).filter(Boolean)
                : [];
            return [
                stockQuantity,
                stockQuantity > 0 ? 1 : 0,
                totalStockReceived,
                JSON.stringify(serialNumbers),
                item.id,
            ];
        }));
        await executeMany(connection, insertSql("inventory_movements", ["id", "product_id", "order_id", "admin_user_id", "type", "quantity_change", "quantity_before", "quantity_after", "note", "created_at", "data_entrant", "entry_date"]), (db.inventoryMovements || []).map((item) => [
            item.id,
            item.productId,
            item.orderId || null,
            item.adminUserId || null,
            item.type,
            Number(item.quantityChange || 0),
            Number(item.quantityBefore || 0),
            Number(item.quantityAfter || 0),
            item.note || null,
            sqlDate(item.createdAt),
            item.dataEntrant || null,
            sqlDate(item.entryDate || item.createdAt),
        ]));
        await executeMany(connection, insertSql("product_analytics", ["id", "product_id", "event", "metadata", "ip_address", "user_agent", "created_at"]), (db.productAnalytics || []).map((item) => [
            item.id,
            item.productId,
            item.event,
            JSON.stringify(item.metadata || {}),
            item.ipAddress || null,
            item.userAgent || null,
            sqlDate(item.createdAt),
        ]));
        await executeMany(connection, insertSql("contact_messages", ["id", "full_name", "email", "phone", "subject", "message", "status", "created_at"]), (db.contactMessages || []).map((item) => [
            item.id,
            item.fullName,
            item.email,
            item.phone || null,
            item.subject,
            item.message,
            item.status || "new",
            sqlDate(item.createdAt),
        ]));
        await executeMany(connection, insertSql("newsletter_subscribers", ["id", "email", "source", "created_at"]), (db.newsletterSubscribers || []).map((item) => [
            item.id,
            item.email,
            item.source || null,
            sqlDate(item.createdAt),
        ]));
        await executeMany(connection, insertSql("expenses", ["id", "details", "category", "amount", "expense_date", "order_id", "data_entrant", "entry_date", "created_at", "updated_at", "category_id", "product_id", "source_id", "order_item_id", "payment_status", "payment_method", "reference", "description", "created_by_admin_user_id"]), (db.expenses || []).map((item) => [
            item.id,
            item.details || item.description || "Expense",
            item.category || "other",
            Number(item.amount || 0),
            item.date || item.expenseDate || (item.createdAt ? String(item.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10)),
            item.orderId || null,
            item.dataEntrant || null,
            sqlDate(item.entryDate || item.createdAt),
            sqlDate(item.createdAt || item.entryDate),
            sqlDate(item.updatedAt || item.createdAt || item.entryDate),
            item.categoryId || (item.category === "supplier" ? "expense-cat-supplier" : "expense-cat-other"),
            item.productId || null,
            item.sourceId || null,
            item.orderItemId || null,
            item.paymentStatus || "paid",
            item.paymentMethod || null,
            item.reference || null,
            item.description || item.details || null,
            item.createdByAdminUserId || null,
        ]));
        await executeMany(connection, insertSql("password_reset_tokens", ["id", "customer_id", "token", "expires_at", "used_at", "created_at"]), (db.passwordResetTokens || []).map((item) => [
            item.id,
            item.customerId,
            item.token,
            sqlDate(item.expiresAt),
            item.usedAt ? sqlDate(item.usedAt) : null,
            sqlDate(item.createdAt),
        ]));
        await executeMany(connection, insertSql("reviews", ["id", "product_id", "customer_id", "rating", "comment", "is_approved", "created_at", "updated_at"]), (db.reviews || []).map((item) => [
            item.id,
            item.productId,
            item.customerId,
            Number(item.rating || 0),
            item.comment,
            item.isApproved === false ? 0 : 1,
            sqlDate(item.createdAt),
            sqlDate(item.updatedAt || item.createdAt),
        ]));
        await connection.commit();
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
}
async function pingDb() {
    await getPool().query("SELECT 1");
    return true;
}
async function updateDb(fn) {
    const db = await readDb();
    const result = await fn(db);
    await writeDb(db);
    return result;
}
function contains(value, query) {
    if (!query)
        return true;
    return String(value ?? "").toLowerCase().includes(String(query).toLowerCase());
}
function findCategoryById(db, id) {
    return db.categories.find((item) => item.id === id) || null;
}
function findCategoryBySlug(db, slug) {
    return db.categories.find((item) => item.slug === slug) || null;
}
function findProductById(db, id) {
    return db.products.find((item) => item.id === id) || null;
}
function findProductBySlug(db, slug) {
    return db.products.find((item) => item.slug === slug) || null;
}
function findProductByBarcode(db, barcode) {
    const needle = String(barcode || "").trim().toLowerCase();
    if (!needle)
        return null;
    return db.products.find((item) => String(item.barcode || "").trim().toLowerCase() === needle) || null;
}
function normalizeSerialNumber(value) {
    return String(value ?? "").trim();
}
function buildSerialUsageMap(db, options) {
    const excludedOrderIds = new Set([options?.excludeOrderId, ...(options?.excludeOrderIds || [])]
        .map((value) => String(value ?? "").trim())
        .filter(Boolean));
    const usage = new Map();
    for (const order of db.orders || []) {
        const orderId = String(order.id ?? "").trim();
        if (!orderId || excludedOrderIds.has(orderId))
            continue;
        const status = String(order.status ?? "").trim().toLowerCase();
        if (!["confirmed", "processing", "completed", "delivered"].includes(status))
            continue;
        const soldAt = toIso(order.updatedAt || order.createdAt);
        for (const item of order.items || []) {
            const productId = String(item.productId ?? "").trim();
            if (!productId)
                continue;
            const serialValues = Array.isArray(item.serialNumbers) ? item.serialNumbers : [];
            if (!serialValues.length)
                continue;
            let productUsage = usage.get(productId);
            if (!productUsage) {
                productUsage = new Map();
                usage.set(productId, productUsage);
            }
            for (const serialValue of serialValues) {
                const serialNumber = normalizeSerialNumber(serialValue?.serialNumber ?? serialValue);
                if (!serialNumber)
                    continue;
                const key = serialNumber.toLowerCase();
                if (!productUsage.has(key)) {
                    productUsage.set(key, {
                        serialNumber,
                        orderId,
                        orderItemId: String(item.id ?? "").trim() || null,
                        soldAt,
                    });
                }
            }
        }
    }
    return usage;
}
function getProductSerialNumbers(db, productId, options) {
    const product = findProductById(db, productId);
    if (!product)
        return [];
    const serialValues = Array.isArray(product.serialNumbers) ? product.serialNumbers : [];
    const usageBySerial = buildSerialUsageMap(db, options).get(String(productId)) || new Map();
    return serialValues
        .map((serial) => {
        const serialNumber = normalizeSerialNumber(serial?.serialNumber ?? serial);
        if (!serialNumber)
            return null;
        const usage = usageBySerial.get(serialNumber.toLowerCase());
        return {
            id: `${String(productId)}:${serialNumber}`,
            productId: String(productId),
            serialNumber,
            status: usage ? "sold" : "available",
            orderId: usage?.orderId || null,
            orderItemId: usage?.orderItemId || null,
            createdAt: usage?.soldAt || null,
            soldAt: usage?.soldAt || null,
        };
    })
        .filter(Boolean);
}
function getAvailableSerialNumbers(db, productId, options) {
    return getProductSerialNumbers(db, productId, options).filter((item) => item.status === "available");
}
function findSerialNumber(db, serialNumber) {
    const needle = normalizeSerialNumber(serialNumber).toLowerCase();
    if (!needle)
        return null;
    for (const product of db.products || []) {
        const serialValues = Array.isArray(product.serialNumbers) ? product.serialNumbers : [];
        for (const serial of serialValues) {
            const value = normalizeSerialNumber(serial?.serialNumber ?? serial).toLowerCase();
            if (!value)
                continue;
            if (value === needle) {
                return {
                    productId: String(product.id),
                    serialNumber: normalizeSerialNumber(serial?.serialNumber ?? serial),
                };
            }
        }
    }
    return null;
}
function getOrCreateCart(db, customerId) {
    let cart = db.carts.find((item) => item.customerId === customerId);
    if (!cart) {
        const now = nowIso();
        cart = { id: createId(), customerId, createdAt: now, updatedAt: now, items: [] };
        db.carts.push(cart);
    }
    if (!Array.isArray(cart.items))
        cart.items = [];
    return cart;
}
function sortByDateDesc(items, field = "createdAt") {
    return [...items].sort((a, b) => new Date(b?.[field] || 0).getTime() - new Date(a?.[field] || 0).getTime());
}
function sortByDateAsc(items, field = "createdAt") {
    return [...items].sort((a, b) => new Date(a?.[field] || 0).getTime() - new Date(b?.[field] || 0).getTime());
}
function normalizeProduct(product) {
    product.inStock = Number(product.stockQuantity || 0) > 0;
    product.totalStockReceived = Number(product.totalStockReceived ?? product.stockQuantity ?? 0);
    product.featured = asBool(product.featured);
    product.premium = asBool(product.premium);
    product.barcode = String(product.barcode || "").trim() || null;
    product.images = normalizeImageList(product.images);
    if (!Array.isArray(product.serialNumbers))
        product.serialNumbers = [];
    if (!product.specs)
        product.specs = {};
    if (product.rating === undefined || product.rating === null)
        product.rating = 0;
    if (product.reviewCount === undefined || product.reviewCount === null)
        product.reviewCount = 0;
    return product;
}
function findBrand(db, value) {
    const needle = String(value || "").trim().toLowerCase();
    if (!needle)
        return null;
    return (db.brands || []).find((item) => String(item.id || "").toLowerCase() === needle ||
        String(item.slug || "").toLowerCase() === needle ||
        String(item.name || "").toLowerCase() === needle) || null;
}
function findSubcategory(db, value, categoryId) {
    const needle = String(value || "").trim().toLowerCase();
    if (!needle)
        return null;
    return (db.subcategories || []).find((item) => {
        if (categoryId && String(item.categoryId) !== String(categoryId))
            return false;
        return (String(item.id || "").toLowerCase() === needle ||
            String(item.slug || "").toLowerCase() === needle ||
            String(item.name || "").toLowerCase() === needle);
    }) || null;
}
function findSpecification(db, value, subcategoryValue) {
    const needle = String(value || "").trim().toLowerCase();
    if (!needle)
        return null;
    const subcategory = subcategoryValue ? findSubcategory(db, String(subcategoryValue)) : null;
    return (db.specifications || []).find((item) => {
        if (subcategory && item.subcategoryId !== subcategory.id)
            return false;
        return String(item.id || "").toLowerCase() === needle || String(item.name || "").toLowerCase() === needle;
    }) || null;
}
function findSpecificationValue(db, value, specificationId) {
    const needle = String(value || "").trim().toLowerCase();
    if (!needle)
        return null;
    return (db.specificationValues || []).find((item) => {
        if (specificationId && String(item.specificationId) !== String(specificationId))
            return false;
        return String(item.id || "").toLowerCase() === needle || String(item.value || "").toLowerCase() === needle;
    }) || null;
}
function resolveProductSpecs(db, specs, subcategoryValue) {
    const source = specs && typeof specs === "object" && !Array.isArray(specs) ? specs : {};
    const display = {};
    const selections = {};
    for (const [rawKey, rawValue] of Object.entries(source)) {
        const specification = findSpecification(db, String(rawKey), subcategoryValue);
        if (!specification) {
            const keyText = String(rawKey || "").trim();
            const valueText = String(rawValue ?? "").trim();
            if (keyText && valueText)
                display[keyText] = valueText;
            continue;
        }
        const option = findSpecificationValue(db, String(rawValue ?? ""), specification.id);
        if (option) {
            display[specification.name] = option.value;
            selections[specification.id] = option.id;
            continue;
        }
        const fallbackText = String(rawValue ?? "").trim();
        if (fallbackText) {
            display[specification.name] = fallbackText;
        }
    }
    return { display, selections };
}
async function compareSecret(stored, incoming) {
    if (!stored)
        return false;
    if (stored.startsWith("$2"))
        return bcryptjs_1.default.compare(incoming, stored);
    return stored === incoming || stored === `plain:${incoming}`;
}
async function hashSecret(value) {
    return bcryptjs_1.default.hash(value, 12);
}
function recalcProductReviewStats(db, productId) {
    const approved = db.reviews.filter((item) => item.productId === productId && item.isApproved !== false);
    const count = approved.length;
    const avg = count ? approved.reduce((sum, item) => sum + Number(item.rating || 0), 0) / count : 0;
    const product = findProductById(db, productId);
    if (product) {
        product.reviewCount = count;
        product.rating = Number(avg.toFixed(1));
    }
}
//# sourceMappingURL=db.js.map