const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

const serialNeedle = "34reerer";

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function parseSerials(serialValue) {
  try {
    const parsed = serialValue ? JSON.parse(serialValue) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

(async () => {
  dotenv.config({ path: "server/.env" });

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
  });

  const [products] = await pool.query("SELECT id, name, serial_numbers, stock_quantity, in_stock FROM products");
  const productMatches = [];
  for (const row of products) {
    for (const serial of parseSerials(row.serial_numbers)) {
      const value = normalize(typeof serial === "object" ? serial.serialNumber : serial);
      if (value === normalize(serialNeedle)) {
        productMatches.push({
          productId: row.id,
          productName: row.name,
          serial,
          stockQuantity: row.stock_quantity,
          inStock: row.in_stock,
        });
      }
    }
  }

  const [orders] = await pool.query(
    "SELECT o.id AS orderId, o.status, o.created_at, oi.product_id, oi.serial_numbers FROM orders o JOIN order_items oi ON oi.order_id = o.id ORDER BY o.created_at DESC"
  );
  const orderMatches = [];
  for (const row of orders) {
    for (const serial of parseSerials(row.serial_numbers)) {
      const value = normalize(typeof serial === "object" ? serial.serialNumber : serial);
      if (value === normalize(serialNeedle)) {
        orderMatches.push({
          orderId: row.orderId,
          status: row.status,
          createdAt: row.created_at,
          productId: row.product_id,
          serial,
        });
      }
    }
  }

  console.log(JSON.stringify({ productMatches, orderMatches }, null, 2));
  await pool.end();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
