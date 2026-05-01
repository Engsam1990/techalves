// @ts-nocheck
import "../lib/loadEnv";
import { createId, hashSecret, nowIso, readDb, writeDb } from "../lib/db";
import { normalizeAdminRole } from "../middleware/auth";

async function main() {
  const email = String(process.env.ADMIN_BOOTSTRAP_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_BOOTSTRAP_PASSWORD || "").trim();
  const name = String(process.env.ADMIN_BOOTSTRAP_NAME || "Admin User").trim() || "Admin User";
  const role = normalizeAdminRole(process.env.ADMIN_BOOTSTRAP_ROLE || "admin");

  if (!email || !password) {
    console.error("Missing ADMIN_BOOTSTRAP_EMAIL or ADMIN_BOOTSTRAP_PASSWORD in server/.env");
    process.exit(1);
  }

  const db = await readDb();
  const existing = db.adminUsers.find((item: any) => String(item.email).toLowerCase() === email);
  if (existing) {
    console.error(`Admin user already exists for ${email}`);
    process.exit(1);
  }

  const now = nowIso();
  db.adminUsers.push({
    id: createId(),
    email,
    password: await hashSecret(password),
    name,
    role,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
  await writeDb(db);
  console.log(`${role === "super_admin" ? "Super admin" : "Admin"} user created for ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
