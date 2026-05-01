import mysql from "../server/node_modules/mysql2/promise.js";

const serialNeedle = "34reerer";
const productName = "Hikvision 4-Channel CCTV Kit";

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

async function main() {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "eyctiipp_admin",
    password: "fhfyY435fgrfS",
    database: "eyctiipp_techalves",
    port: 3306,
    charset: "utf8mb4",
  });

  const [products] = await conn.query(
    "SELECT id, name, serial_numbers, stock_quantity, in_stock FROM products WHERE name = ?",
    [productName]
  );

  const [allProducts] = await conn.query(
    "SELECT id, name, serial_numbers FROM products WHERE serial_numbers IS NOT NULL AND serial_numbers <> ''"
  );

  const matches = [];
  for (const row of allProducts) {
    let serials = [];
    try {
      serials = row.serial_numbers ? JSON.parse(row.serial_numbers) : [];
    } catch {
      serials = [];
    }
    if (!Array.isArray(serials)) continue;
    for (const serial of serials) {
      const value = normalize(typeof serial === "object" ? serial.serialNumber : serial);
      if (value === normalize(serialNeedle)) {
        matches.push({ productId: row.id, productName: row.name, serial });
      }
    }
  }

  const [orderItems] = await conn.query(
    "SELECT o.id AS orderId, o.status, o.created_at, oi.product_id, oi.serial_numbers FROM orders o JOIN order_items oi ON oi.order_id = o.id ORDER BY o.created_at DESC"
  );

  const orderMatches = [];
  for (const row of orderItems) {
    let serials = [];
    try {
      serials = row.serial_numbers ? JSON.parse(row.serial_numbers) : [];
    } catch {
      serials = [];
    }
    if (!Array.isArray(serials)) continue;
    for (const serial of serials) {
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

  console.log(JSON.stringify({ products, matches, orderMatches }, null, 2));
  await conn.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
