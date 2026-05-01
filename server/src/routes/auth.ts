// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler";
import { generateToken, getAdminPermissionsForUser, normalizeAdminRole, requireAuth } from "../middleware/auth";
import { readDb, writeDb, compareSecret, hashSecret, nowIso } from "../lib/db";

const router = Router();
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const changePasswordSchema = z.object({ currentPassword: z.string().min(6), newPassword: z.string().min(6) });

function formatAdminUser(user) {
  const role = normalizeAdminRole(user.role);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role,
    permissions: getAdminPermissionsForUser(user),
  };
}

async function ensureDefaultSuperAdmin(db, preferredUserId) {
  const hasSuperAdmin = db.adminUsers.some((item) => normalizeAdminRole(item.role) === "super_admin" && item.isActive !== false);
  if (hasSuperAdmin) return null;

  const target =
    db.adminUsers.find((item) => item.id === preferredUserId) ||
    db.adminUsers.find((item) => item.isActive !== false) ||
    db.adminUsers[0];

  if (!target) return null;
  target.role = "super_admin";
  target.updatedAt = nowIso();
  await writeDb(db);
  return target;
}

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const db = await readDb();
    const user = db.adminUsers.find((item) => String(item.email).toLowerCase() === String(email).toLowerCase());
    if (!user || user.isActive === false) throw new AppError(401, "Invalid credentials");

    const valid = await compareSecret(user.password, password);
    if (!valid) throw new AppError(401, "Invalid credentials");

    const elevated = await ensureDefaultSuperAdmin(db, user.id);
    const effectiveUser = elevated?.id === user.id ? elevated : user;
    const role = normalizeAdminRole(effectiveUser.role);
    const token = generateToken({ id: effectiveUser.id, email: effectiveUser.email, role, accountType: "admin", permissions: getAdminPermissionsForUser(effectiveUser) });

    res.json({ token, user: formatAdminUser(effectiveUser) });
  } catch (e) {
    next(e);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const db = await readDb();
    const user = db.adminUsers.find((item) => item.id === req.adminUser.id);
    if (!user) throw new AppError(404, "User not found");
    res.json(formatAdminUser(user));
  } catch (e) {
    next(e);
  }
});

router.post("/change-password", requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const db = await readDb();
    const user = db.adminUsers.find((item) => item.id === req.adminUser.id);
    if (!user) throw new AppError(404, "User not found");
    const valid = await compareSecret(user.password, currentPassword);
    if (!valid) throw new AppError(400, "Current password is incorrect");
    user.password = await hashSecret(newPassword);
    user.updatedAt = nowIso();
    await writeDb(db);
    res.json({ message: "Password updated successfully" });
  } catch (e) {
    next(e);
  }
});

export default router;
