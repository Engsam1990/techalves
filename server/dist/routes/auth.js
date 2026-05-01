"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const zod_1 = require("zod");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const db_1 = require("../lib/db");
const router = (0, express_1.Router)();
const loginSchema = zod_1.z.object({ email: zod_1.z.string().email(), password: zod_1.z.string().min(6) });
const changePasswordSchema = zod_1.z.object({ currentPassword: zod_1.z.string().min(6), newPassword: zod_1.z.string().min(6) });
function formatAdminUser(user) {
    const role = (0, auth_1.normalizeAdminRole)(user.role);
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
        permissions: (0, auth_1.getAdminPermissionsForUser)(user),
    };
}
async function ensureDefaultSuperAdmin(db, preferredUserId) {
    const hasSuperAdmin = db.adminUsers.some((item) => (0, auth_1.normalizeAdminRole)(item.role) === "super_admin" && item.isActive !== false);
    if (hasSuperAdmin)
        return null;
    const target = db.adminUsers.find((item) => item.id === preferredUserId) ||
        db.adminUsers.find((item) => item.isActive !== false) ||
        db.adminUsers[0];
    if (!target)
        return null;
    target.role = "super_admin";
    target.updatedAt = (0, db_1.nowIso)();
    await (0, db_1.writeDb)(db);
    return target;
}
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const db = await (0, db_1.readDb)();
        const user = db.adminUsers.find((item) => String(item.email).toLowerCase() === String(email).toLowerCase());
        if (!user || user.isActive === false)
            throw new errorHandler_1.AppError(401, "Invalid credentials");
        const valid = await (0, db_1.compareSecret)(user.password, password);
        if (!valid)
            throw new errorHandler_1.AppError(401, "Invalid credentials");
        const elevated = await ensureDefaultSuperAdmin(db, user.id);
        const effectiveUser = elevated?.id === user.id ? elevated : user;
        const role = (0, auth_1.normalizeAdminRole)(effectiveUser.role);
        const token = (0, auth_1.generateToken)({ id: effectiveUser.id, email: effectiveUser.email, role, accountType: "admin", permissions: (0, auth_1.getAdminPermissionsForUser)(effectiveUser) });
        res.json({ token, user: formatAdminUser(effectiveUser) });
    }
    catch (e) {
        next(e);
    }
});
router.get("/me", auth_1.requireAuth, async (req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        const user = db.adminUsers.find((item) => item.id === req.adminUser.id);
        if (!user)
            throw new errorHandler_1.AppError(404, "User not found");
        res.json(formatAdminUser(user));
    }
    catch (e) {
        next(e);
    }
});
router.post("/change-password", auth_1.requireAuth, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
        const db = await (0, db_1.readDb)();
        const user = db.adminUsers.find((item) => item.id === req.adminUser.id);
        if (!user)
            throw new errorHandler_1.AppError(404, "User not found");
        const valid = await (0, db_1.compareSecret)(user.password, currentPassword);
        if (!valid)
            throw new errorHandler_1.AppError(400, "Current password is incorrect");
        user.password = await (0, db_1.hashSecret)(newPassword);
        user.updatedAt = (0, db_1.nowIso)();
        await (0, db_1.writeDb)(db);
        res.json({ message: "Password updated successfully" });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map