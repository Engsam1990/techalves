import mysql from "../server/node_modules/mysql2/promise.js";

const connectionConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "techalves",
  port: 3306,
  charset: "utf8mb4",
};

const serialNeedle = "34reerer".trim().toLowerCase();
const productName = "Hikvision 4-Channel CCTV Kit";

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function parseSerialList(serialValue) {
  try {
    const parsed = serialValue ? JSON.parse(serialValue) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function main() {
  const conn = await mysql.createConnection(connectionConfig);

  const [products] = await conn.query(
    "SELECT id, name, serial_numbers, stock_quantity, in_stock FROM products WHERE name = ?",
    [productName]
  );

  const [matchingProducts] = await conn.query(
    "SELECT id, name, serial_numbers FROM products WHERE serial_numbers IS NOT NULL AND serial_numbers <> ''"
  );

  const matches = [];
  for (const row of matchingProducts) {
    const serials = parseSerialList(row.serial_numbers);
    for (const serial of serials) {
      const value = normalize(typeof serial === "object" ? serial.serialNumber : serial);
      if (value === serialNeedle) {
        matches.push({ productId: row.id, productName: row.name, serial });
      }
    }
  }

  const [orderItems] = await conn.query(
    "SELECT o.id AS orderId, o.status, o.created_at, oi.product_id, oi.serial_numbers FROM orders o JOIN order_items oi ON oi.order_id = o.id ORDER BY o.created_at DESC"
  );

  const orderMatches = [];
  for (const row of orderItems) {
    const serials = parseSerialList(row.serial_numbers);
    for (const serial of serials) {
      const value = normalize(typeof serial === "object" ? serial.serialNumber : serial);
      if (value === serialNeedle) {
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
