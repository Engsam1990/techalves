// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import {
  ADMIN_PERMISSION_DEFINITIONS,
  getAdminPermissionsForUser,
  normalizeAdminPermissions,
  normalizeAdminRole,
  requireAuth,
  requireSuperAdmin,
} from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import { createId, executeDb, hashSecret, nowIso, queryDb, readDb, sortByDateDesc, writeDb } from "../../lib/db";

const router = Router();
router.use(requireAuth);
router.use(requireSuperAdmin);

const roleEnum = z.enum(["admin", "super_admin"]);
const permissionsSchema = z.array(z.string().trim().min(1)).optional();

const createAdminSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: roleEnum.default("admin"),
  isActive: z.boolean().default(true),
  permissions: permissionsSchema,
});

const promoteCustomerSchema = z.object({
  customerId: z.string().min(1),
  role: roleEnum.default("admin"),
  permissions: permissionsSchema,
});

const updateAdminSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  role: roleEnum.optional(),
  isActive: z.boolean().optional(),
  permissions: permissionsSchema,
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6).max(100),
});

function formatAdmin(item) {
  const role = normalizeAdminRole(item.role);
  return {
    id: item.id,
    name: item.name,
    email: item.email,
    role,
    permissions: getAdminPermissionsForUser(item),
    isActive: item.isActive !== false,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function normalizeForAdminRole(permissions, role) {
  const normalizedRole = normalizeAdminRole(role);
  if (permissions === undefined) return getAdminPermissionsForUser({ role: normalizedRole });
  return normalizeAdminPermissions(permissions, normalizedRole);
}

async function persistAdminPermissionsJson(admin) {
  const permissionsJson = normalizeAdminRole(admin.role) === "super_admin"
    ? null
    : JSON.stringify(getAdminPermissionsForUser(admin));

  await executeDb(
    "UPDATE `admin_users` SET `permissions_json` = ?, `updated_at` = ? WHERE `id` = ?",
    [permissionsJson, nowIso().slice(0, 23).replace("T", " ").replace("Z", ""), admin.id]
  );
}

function isLastActiveSuperAdmin(db, adminId, nextRole, nextActive) {
  const activeSuperAdmins = db.adminUsers.filter((item) => normalizeAdminRole(item.role) === "super_admin" && item.isActive !== false);
  if (activeSuperAdmins.length !== 1) return false;
  const onlySuperAdmin = activeSuperAdmins[0];
  if (onlySuperAdmin.id !== adminId) return false;
  return normalizeAdminRole(nextRole) !== "super_admin" || nextActive === false;
}

function buildPromotionCandidates(db, q = "") {
  const existingEmails = new Set((db.adminUsers || []).map((item) => String(item.email).toLowerCase()));
  const search = String(q || "").trim().toLowerCase();

  return sortByDateDesc(db.customerUsers)
    .filter((item) => !existingEmails.has(String(item.email).toLowerCase()))
    .filter((item) => {
      if (!search) return true;
      return [item.fullName, item.email, item.phone].some((value) => String(value || "").toLowerCase().includes(search));
    })
    .map((item) => ({
      id: item.id,
      fullName: item.fullName,
      email: item.email,
      phone: item.phone,
      isActive: item.isActive !== false,
      createdAt: item.createdAt,
    }));
}

async function ensureAdminActivityTable() {
  await executeDb(`
    CREATE TABLE IF NOT EXISTS \`admin_activity_logs\` (
      \`id\` char(36) NOT NULL,
      \`actor_admin_user_id\` varchar(191) DEFAULT NULL,
      \`actor_email\` varchar(191) DEFAULT NULL,
      \`action\` varchar(120) NOT NULL,
      \`target_admin_user_id\` varchar(191) DEFAULT NULL,
      \`target_name\` varchar(191) DEFAULT NULL,
      \`target_email\` varchar(191) DEFAULT NULL,
      \`details\` longtext DEFAULT NULL,
      \`data_entrant\` varchar(191) DEFAULT NULL,
      \`entry_date\` datetime(3) NOT NULL DEFAULT current_timestamp(3),
      \`created_at\` datetime(3) NOT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`admin_activity_logs_created_idx\` (\`created_at\`),
      KEY \`admin_activity_logs_actor_idx\` (\`actor_admin_user_id\`),
      KEY \`admin_activity_logs_target_idx\` (\`target_admin_user_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await executeDb("ALTER TABLE `admin_activity_logs` ADD COLUMN IF NOT EXISTS `data_entrant` varchar(191) DEFAULT NULL");
  await executeDb("ALTER TABLE `admin_activity_logs` ADD COLUMN IF NOT EXISTS `entry_date` datetime(3) NOT NULL DEFAULT current_timestamp(3)");
}

async function listAdminActivityLogs(limit = 20) {
  await ensureAdminActivityTable();
  const rows = await queryDb(
    `SELECT * FROM \`admin_activity_logs\` ORDER BY \`created_at\` DESC LIMIT ${Math.max(1, Math.min(Number(limit) || 20, 100))}`
  );

  return rows.map((row) => {
    let details = {};
    try {
      details = row.details ? JSON.parse(String(row.details)) : {};
    } catch {
      details = {};
    }

    return {
      id: String(row.id),
      actorAdminUserId: row.actor_admin_user_id ? String(row.actor_admin_user_id) : null,
      actorEmail: row.actor_email ? String(row.actor_email) : null,
      action: String(row.action),
      targetAdminUserId: row.target_admin_user_id ? String(row.target_admin_user_id) : null,
      targetName: row.target_name ? String(row.target_name) : null,
      targetEmail: row.target_email ? String(row.target_email) : null,
      details,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at).replace(" ", "T") + "Z",
    };
  });
}

async function logAdminActivity({ actor, action, target, details = {} }) {
  await ensureAdminActivityTable();
  await executeDb(
    `INSERT INTO \`admin_activity_logs\` (\`id\`, \`actor_admin_user_id\`, \`actor_email\`, \`action\`, \`target_admin_user_id\`, \`target_name\`, \`target_email\`, \`details\`, \`data_entrant\`, \`entry_date\`, \`created_at\`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      createId(),
      actor?.id || null,
      actor?.email || null,
      String(action),
      target?.id || null,
      target?.name || null,
      target?.email || null,
      JSON.stringify(details || {}),
      actor?.id || null,
      nowIso().slice(0, 23).replace("T", " ").replace("Z", ""),
      nowIso().slice(0, 23).replace("T", " ").replace("Z", ""),
    ]
  );
}

router.get("/permissions", (_req, res) => {
  const groups = ADMIN_PERMISSION_DEFINITIONS.reduce((acc, permission) => {
    if (!acc[permission.group]) acc[permission.group] = [];
    acc[permission.group].push(permission);
    return acc;
  }, {});
  res.json({ permissions: ADMIN_PERMISSION_DEFINITIONS, groups });
});

router.get("/overview", async (_req, res, next) => {
  try {
    const db = await readDb();
    const admins = db.adminUsers || [];
    const candidates = buildPromotionCandidates(db);
    const activeAdmins = admins.filter((item) => item.isActive !== false);
    const superAdmins = activeAdmins.filter((item) => normalizeAdminRole(item.role) === "super_admin");

    res.json({
      totalAdmins: admins.length,
      activeAdmins: activeAdmins.length,
      superAdmins: superAdmins.length,
      standardAdmins: activeAdmins.filter((item) => normalizeAdminRole(item.role) === "admin").length,
      promotionCandidates: candidates.length,
      totalCustomers: (db.customerUsers || []).length,
      recentAdmins: sortByDateDesc(admins).slice(0, 5).map(formatAdmin),
      recentCandidates: candidates.slice(0, 5),
      recentActivity: await listAdminActivityLogs(8),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/activity", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 20);
    res.json({ logs: await listAdminActivityLogs(limit) });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim().toLowerCase();
    const db = await readDb();
    const admins = sortByDateDesc(db.adminUsers)
      .filter((item) => !q || [item.name, item.email, item.role].some((value) => String(value || "").toLowerCase().includes(q)))
      .map(formatAdmin);

    res.json({
      admins,
      promotionCandidates: buildPromotionCandidates(db, q),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = createAdminSchema.parse(req.body ?? {});
    const db = await readDb();
    const email = String(data.email).toLowerCase();

    const existing = db.adminUsers.find((item) => String(item.email).toLowerCase() === email);
    if (existing) throw new AppError(409, "An admin user with that email already exists");

    const now = nowIso();
    const admin = {
      id: createId(),
      name: data.name,
      email,
      password: await hashSecret(data.password),
      role: data.role,
      permissions: normalizeForAdminRole(data.permissions, data.role),
      isActive: data.isActive,
      createdAt: now,
      updatedAt: now,
    };

    db.adminUsers.push(admin);
    await writeDb(db);
    await persistAdminPermissionsJson(admin);
    await logAdminActivity({
      actor: req.adminUser,
      action: "admin_created",
      target: admin,
      details: {
        role: admin.role,
        permissions: admin.permissions,
        permissionCount: admin.permissions.length,
        isActive: admin.isActive !== false,
        source: "create_admin",
      },
    });
    res.status(201).json(formatAdmin(admin));
  } catch (error) {
    next(error);
  }
});

router.post("/promote-customer", async (req, res, next) => {
  try {
    const data = promoteCustomerSchema.parse(req.body ?? {});
    const db = await readDb();
    const customer = db.customerUsers.find((item) => item.id === data.customerId);
    if (!customer) throw new AppError(404, "Customer not found");

    const email = String(customer.email).toLowerCase();
    const existingAdmin = db.adminUsers.find((item) => String(item.email).toLowerCase() === email);
    if (existingAdmin) throw new AppError(409, "This customer is already an admin user");

    const now = nowIso();
    const admin = {
      id: createId(),
      name: customer.fullName,
      email,
      password: customer.passwordHash,
      role: data.role,
      permissions: normalizeForAdminRole(data.permissions, data.role),
      isActive: customer.isActive !== false,
      createdAt: now,
      updatedAt: now,
    };

    db.adminUsers.push(admin);
    await writeDb(db);
    await persistAdminPermissionsJson(admin);
    await logAdminActivity({
      actor: req.adminUser,
      action: "customer_promoted",
      target: admin,
      details: {
        role: admin.role,
        permissions: admin.permissions,
        permissionCount: admin.permissions.length,
        isActive: admin.isActive !== false,
        source: "promote_customer",
        customerId: customer.id,
      },
    });
    res.status(201).json({
      message: "Customer promoted to admin successfully",
      admin: formatAdmin(admin),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/reset-password", async (req, res, next) => {
  try {
    const data = resetPasswordSchema.parse(req.body ?? {});
    const db = await readDb();
    const admin = db.adminUsers.find((item) => item.id === String(req.params.id));
    if (!admin) throw new AppError(404, "Admin user not found");

    admin.password = await hashSecret(data.newPassword);
    admin.updatedAt = nowIso();
    await writeDb(db);
    await logAdminActivity({ actor: req.adminUser, action: "password_reset", target: admin, details: { resetBySuperAdmin: true } });

    res.json({ message: "Admin password reset successfully" });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const data = updateAdminSchema.parse(req.body ?? {});
    const db = await readDb();
    const admin = db.adminUsers.find((item) => item.id === String(req.params.id));
    if (!admin) throw new AppError(404, "Admin user not found");

    const before = {
      name: admin.name,
      role: normalizeAdminRole(admin.role),
      isActive: admin.isActive !== false,
      permissions: getAdminPermissionsForUser(admin),
    };

    const nextRole = data.role ?? before.role;
    const nextActive = data.isActive ?? before.isActive;

    if (isLastActiveSuperAdmin(db, admin.id, nextRole, nextActive)) {
      throw new AppError(400, "You must keep at least one active super admin");
    }

    if (data.name !== undefined) admin.name = data.name;
    if (data.role !== undefined) admin.role = data.role;
    if (data.permissions !== undefined || data.role !== undefined) {
      admin.permissions = normalizeForAdminRole(data.permissions !== undefined ? data.permissions : admin.permissions, admin.role);
    }
    if (data.isActive !== undefined) admin.isActive = data.isActive;
    admin.updatedAt = nowIso();

    await writeDb(db);
    await persistAdminPermissionsJson(admin);

    const after = {
      name: admin.name,
      role: normalizeAdminRole(admin.role),
      isActive: admin.isActive !== false,
      permissions: getAdminPermissionsForUser(admin),
    };

    if (JSON.stringify(before) !== JSON.stringify(after)) {
      await logAdminActivity({ actor: req.adminUser, action: "admin_updated", target: admin, details: { before, after } });
    }

    res.json(formatAdmin(admin));
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const db = await readDb();
    const admin = db.adminUsers.find((item) => item.id === String(req.params.id));
    if (!admin) throw new AppError(404, "Admin user not found");

    if (isLastActiveSuperAdmin(db, admin.id, normalizeAdminRole(admin.role), false)) {
      throw new AppError(400, "You must keep at least one active super admin");
    }

    await logAdminActivity({
      actor: req.adminUser,
      action: "admin_deleted",
      target: admin,
      details: { role: normalizeAdminRole(admin.role), permissions: getAdminPermissionsForUser(admin), isActive: admin.isActive !== false },
    });

    await executeDb("DELETE FROM `admin_users` WHERE `id` = ?", [admin.id]);

    res.json({ message: "Admin user deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
