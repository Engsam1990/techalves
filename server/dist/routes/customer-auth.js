"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const zod_1 = require("zod");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const db_1 = require("../lib/db");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({ fullName: zod_1.z.string().min(2).max(120), email: zod_1.z.string().email(), phone: zod_1.z.string().optional(), password: zod_1.z.string().min(6) });
const loginSchema = zod_1.z.object({ email: zod_1.z.string().email(), password: zod_1.z.string().min(6) });
const profileSchema = zod_1.z.object({ fullName: zod_1.z.string().min(2).max(120), phone: zod_1.z.string().optional().nullable() });
const changePasswordSchema = zod_1.z.object({ currentPassword: zod_1.z.string().min(6), newPassword: zod_1.z.string().min(6) });
const forgotPasswordSchema = zod_1.z.object({ email: zod_1.z.string().email() });
const resetPasswordSchema = zod_1.z.object({ token: zod_1.z.string().min(20), newPassword: zod_1.z.string().min(6) });
function formatUser(user) { return { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone, role: "customer", createdAt: user.createdAt }; }
router.post("/register", async (req, res, next) => { try {
    const data = registerSchema.parse(req.body);
    const db = await (0, db_1.readDb)();
    const email = String(data.email).toLowerCase();
    const existing = db.customerUsers.find((item) => String(item.email).toLowerCase() === email);
    if (existing)
        throw new errorHandler_1.AppError(409, "An account with that email already exists");
    const now = (0, db_1.nowIso)();
    const user = { id: (0, db_1.createId)(), fullName: data.fullName, email, phone: data.phone || null, passwordHash: await (0, db_1.hashSecret)(data.password), isActive: true, createdAt: now, updatedAt: now };
    db.customerUsers.push(user);
    await (0, db_1.writeDb)(db);
    const token = (0, auth_1.generateToken)({ id: user.id, email: user.email, role: "customer", accountType: "customer" });
    res.status(201).json({ token, user: formatUser(user) });
}
catch (e) {
    next(e);
} });
router.post("/login", async (req, res, next) => { try {
    const data = loginSchema.parse(req.body);
    const db = await (0, db_1.readDb)();
    const user = db.customerUsers.find((item) => String(item.email).toLowerCase() === String(data.email).toLowerCase());
    if (!user || user.isActive === false)
        throw new errorHandler_1.AppError(401, "Invalid credentials");
    const valid = await (0, db_1.compareSecret)(user.passwordHash, data.password);
    if (!valid)
        throw new errorHandler_1.AppError(401, "Invalid credentials");
    const token = (0, auth_1.generateToken)({ id: user.id, email: user.email, role: "customer", accountType: "customer" });
    res.json({ token, user: formatUser(user) });
}
catch (e) {
    next(e);
} });
router.get("/me", auth_1.requireCustomerAuth, async (req, res, next) => { try {
    const db = await (0, db_1.readDb)();
    const user = db.customerUsers.find((item) => item.id === req.customerUser.id);
    if (!user)
        throw new errorHandler_1.AppError(404, "Customer not found");
    res.json(formatUser(user));
}
catch (e) {
    next(e);
} });
router.put("/profile", auth_1.requireCustomerAuth, async (req, res, next) => { try {
    const data = profileSchema.parse(req.body);
    const db = await (0, db_1.readDb)();
    const user = db.customerUsers.find((item) => item.id === req.customerUser.id);
    if (!user)
        throw new errorHandler_1.AppError(404, "Customer not found");
    user.fullName = data.fullName;
    user.phone = data.phone || null;
    user.updatedAt = (0, db_1.nowIso)();
    await (0, db_1.writeDb)(db);
    res.json(formatUser(user));
}
catch (e) {
    next(e);
} });
router.post("/change-password", auth_1.requireCustomerAuth, async (req, res, next) => { try {
    const data = changePasswordSchema.parse(req.body);
    if (data.currentPassword === data.newPassword)
        throw new errorHandler_1.AppError(400, "New password must be different from the current password");
    const db = await (0, db_1.readDb)();
    const user = db.customerUsers.find((item) => item.id === req.customerUser.id);
    if (!user)
        throw new errorHandler_1.AppError(404, "Customer not found");
    const valid = await (0, db_1.compareSecret)(user.passwordHash, data.currentPassword);
    if (!valid)
        throw new errorHandler_1.AppError(400, "Current password is incorrect");
    user.passwordHash = await (0, db_1.hashSecret)(data.newPassword);
    user.updatedAt = (0, db_1.nowIso)();
    db.passwordResetTokens.forEach((item) => { if (item.customerId === user.id && !item.usedAt)
        item.usedAt = (0, db_1.nowIso)(); });
    await (0, db_1.writeDb)(db);
    res.json({ message: "Password updated successfully" });
}
catch (e) {
    next(e);
} });
router.post("/forgot-password", async (req, res, next) => { try {
    const data = forgotPasswordSchema.parse(req.body);
    const db = await (0, db_1.readDb)();
    const user = db.customerUsers.find((item) => String(item.email).toLowerCase() === String(data.email).toLowerCase());
    if (!user || user.isActive === false)
        return res.json({ message: "If an account with that email exists, a reset link has been generated." });
    db.passwordResetTokens.forEach((item) => { if (item.customerId === user.id && !item.usedAt)
        item.usedAt = (0, db_1.nowIso)(); });
    const token = crypto_1.default.randomBytes(32).toString("hex");
    db.passwordResetTokens.push({ id: (0, db_1.createId)(), customerId: user.id, token, expiresAt: new Date(Date.now() + 3600_000).toISOString(), usedAt: null, createdAt: (0, db_1.nowIso)() });
    await (0, db_1.writeDb)(db);
    const response = { message: "If an account with that email exists, a reset link has been generated." };
    if (process.env.NODE_ENV !== "production") {
        response.resetToken = token;
        response.resetUrl = `/reset-password?token=${token}`;
    }
    res.json(response);
}
catch (e) {
    next(e);
} });
router.post("/reset-password", async (req, res, next) => { try {
    const data = resetPasswordSchema.parse(req.body);
    const db = await (0, db_1.readDb)();
    const resetToken = db.passwordResetTokens.find((item) => item.token === data.token);
    if (!resetToken || resetToken.usedAt || new Date(resetToken.expiresAt) < new Date())
        throw new errorHandler_1.AppError(400, "This password reset link is invalid or has expired");
    const user = db.customerUsers.find((item) => item.id === resetToken.customerId);
    if (!user)
        throw new errorHandler_1.AppError(404, "Customer not found");
    user.passwordHash = await (0, db_1.hashSecret)(data.newPassword);
    user.updatedAt = (0, db_1.nowIso)();
    resetToken.usedAt = (0, db_1.nowIso)();
    db.passwordResetTokens.forEach((item) => { if (item.customerId === resetToken.customerId && item.id !== resetToken.id && !item.usedAt)
        item.usedAt = (0, db_1.nowIso)(); });
    await (0, db_1.writeDb)(db);
    res.json({ message: "Password reset successfully" });
}
catch (e) {
    next(e);
} });
exports.default = router;
//# sourceMappingURL=customer-auth.js.map