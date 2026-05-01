const fs = require("fs");
const path = require("path");
const mysql = require("../server/node_modules/mysql2/promise");
const jwt = require("../server/node_modules/jsonwebtoken");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  const root = process.cwd();
  loadEnvFile(path.join(root, "server", ".env.development"));
  loadEnvFile(path.join(root, "server", ".env"));

  const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "techalves",
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    dateStrings: true,
    charset: "utf8mb4",
    timezone: "Z",
  });

  try {
    const [admins] = await pool.query(
      "SELECT id, email, role, is_active FROM admin_users WHERE is_active = 1 ORDER BY created_at DESC LIMIT 10"
    );

    if (!Array.isArray(admins) || !admins.length) {
      throw new Error("No active admin users were found");
    }

    const admin = admins[0];
    const token = jwt.sign(
      {
        id: String(admin.id),
        email: String(admin.email),
        role: String(admin.role || "admin"),
        accountType: "admin",
      },
      process.env.JWT_SECRET || "change-this-secret",
      { expiresIn: "24h" }
    );

    const productsResponse = await fetch("http://localhost:4000/api/admin/products", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const productsText = await productsResponse.text();
    if (!productsResponse.ok) {
      throw new Error(`Failed to fetch products: ${productsResponse.status} ${productsText}`);
    }

    const products = JSON.parse(productsText);
    const product = products.find((item) => Array.isArray(item.availableSerialNumbers) && item.availableSerialNumbers.length > 0);

    if (!product) {
      throw new Error("No product with available serial numbers was found");
    }

    const serialNumber = product.availableSerialNumbers[0];
    const payload = {
      items: [
        {
          productId: product.id,
          quantity: 1,
          serialNumbers: [serialNumber],
        },
      ],
      paymentStatus: "paid",
      paymentMethod: "cash",
      discountAmount: 0,
      otherCharges: 0,
      customerName: "POS Test Customer",
      customerPhone: "POS",
      note: "Automated checkout verification",
    };

    const checkoutResponse = await fetch("http://localhost:4000/api/admin/pos/checkout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const checkoutText = await checkoutResponse.text();

    console.log(JSON.stringify({
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      product: {
        id: product.id,
        name: product.name,
        availableSerialNumbers: product.availableSerialNumbers.slice(0, 5),
      },
      payload,
      checkout: {
        status: checkoutResponse.status,
        ok: checkoutResponse.ok,
        body: checkoutText,
      },
    }, null, 2));

    if (!checkoutResponse.ok) {
      throw new Error(`Checkout verification failed: ${checkoutResponse.status}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
