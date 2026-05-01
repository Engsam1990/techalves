"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
require("../lib/loadEnv");
const db_1 = require("../lib/db");
const auth_1 = require("../middleware/auth");
async function main() {
    const email = String(process.env.ADMIN_BOOTSTRAP_EMAIL || "").trim().toLowerCase();
    const password = String(process.env.ADMIN_BOOTSTRAP_PASSWORD || "").trim();
    const name = String(process.env.ADMIN_BOOTSTRAP_NAME || "Admin User").trim() || "Admin User";
    const role = (0, auth_1.normalizeAdminRole)(process.env.ADMIN_BOOTSTRAP_ROLE || "admin");
    if (!email || !password) {
        console.error("Missing ADMIN_BOOTSTRAP_EMAIL or ADMIN_BOOTSTRAP_PASSWORD in server/.env");
        process.exit(1);
    }
    const db = await (0, db_1.readDb)();
    const existing = db.adminUsers.find((item) => String(item.email).toLowerCase() === email);
    if (existing) {
        console.error(`Admin user already exists for ${email}`);
        process.exit(1);
    }
    const now = (0, db_1.nowIso)();
    db.adminUsers.push({
        id: (0, db_1.createId)(),
        email,
        password: await (0, db_1.hashSecret)(password),
        name,
        role,
        isActive: true,
        createdAt: now,
        updatedAt: now,
    });
    await (0, db_1.writeDb)(db);
    console.log(`${role === "super_admin" ? "Super admin" : "Admin"} user created for ${email}`);
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=createAdmin.js.map