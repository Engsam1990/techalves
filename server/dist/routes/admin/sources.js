"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../../middleware/auth");
const db_1 = require("../../lib/db");
const errorHandler_1 = require("../../middleware/errorHandler");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
const sourceSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(191),
    type: zod_1.z.enum(["supplier", "source", "marketplace", "walk_in", "other"]).default("supplier"),
    contactPerson: zod_1.z.string().trim().max(191).optional().nullable(),
    phone: zod_1.z.string().trim().max(60).optional().nullable(),
    email: zod_1.z.string().trim().email().max(191).optional().nullable().or(zod_1.z.literal("")),
    location: zod_1.z.string().trim().max(191).optional().nullable(),
    notes: zod_1.z.string().trim().max(2000).optional().nullable(),
    isActive: zod_1.z.boolean().default(true),
});
function adminId(req) { return req.adminUser?.id || null; }
function formatSource(source) { return { ...source, isActive: source.isActive !== false }; }
router.get("/", async (req, res, next) => {
    try {
        const q = String(req.query.q || "").trim();
        const db = await (0, db_1.readDb)();
        const items = (db.productSources || [])
            .filter((item) => String(req.query.active || "").toLowerCase() === "all" ? true : item.isActive !== false)
            .filter((item) => !q || [item.name, item.type, item.phone, item.email, item.location, item.contactPerson].some((value) => (0, db_1.contains)(value, q)))
            .sort((a, b) => String(a.name).localeCompare(String(b.name)))
            .map(formatSource);
        res.json(items);
    }
    catch (e) {
        next(e);
    }
});
router.post("/", (0, auth_1.requireAdminPermission)("sources:manage"), async (req, res, next) => {
    try {
        const data = sourceSchema.parse(req.body);
        const db = await (0, db_1.readDb)();
        const now = (0, db_1.nowIso)();
        if ((db.productSources || []).some((item) => String(item.name).trim().toLowerCase() === data.name.toLowerCase())) {
            throw new errorHandler_1.AppError(400, "A supplier/source with this name already exists");
        }
        const source = {
            id: (0, db_1.createId)(),
            name: data.name,
            type: data.type,
            contactPerson: data.contactPerson || null,
            phone: data.phone || null,
            email: data.email || null,
            location: data.location || null,
            notes: data.notes || null,
            isActive: data.isActive !== false,
            createdByAdminUserId: adminId(req),
            createdAt: now,
            updatedAt: now,
        };
        await (0, db_1.executeDb)("INSERT INTO `product_sources` (`id`, `name`, `type`, `contact_person`, `phone`, `email`, `location`, `notes`, `is_active`, `created_by_admin_user_id`, `created_at`, `updated_at`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [source.id, source.name, source.type, source.contactPerson, source.phone, source.email, source.location, source.notes, source.isActive ? 1 : 0, source.createdByAdminUserId, source.createdAt.replace("T", " ").replace("Z", ""), source.updatedAt.replace("T", " ").replace("Z", "")]);
        res.status(201).json(formatSource(source));
    }
    catch (e) {
        next(e);
    }
});
router.put("/:id", (0, auth_1.requireAdminPermission)("sources:manage"), async (req, res, next) => {
    try {
        const data = sourceSchema.partial().parse(req.body);
        const db = await (0, db_1.readDb)();
        const source = (db.productSources || []).find((item) => item.id === String(req.params.id));
        if (!source)
            throw new errorHandler_1.AppError(404, "Supplier/source not found");
        Object.assign(source, {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.type !== undefined ? { type: data.type } : {}),
            ...(data.contactPerson !== undefined ? { contactPerson: data.contactPerson || null } : {}),
            ...(data.phone !== undefined ? { phone: data.phone || null } : {}),
            ...(data.email !== undefined ? { email: data.email || null } : {}),
            ...(data.location !== undefined ? { location: data.location || null } : {}),
            ...(data.notes !== undefined ? { notes: data.notes || null } : {}),
            ...(data.isActive !== undefined ? { isActive: data.isActive !== false } : {}),
            updatedAt: (0, db_1.nowIso)(),
        });
        await (0, db_1.executeDb)("UPDATE `product_sources` SET `name` = ?, `type` = ?, `contact_person` = ?, `phone` = ?, `email` = ?, `location` = ?, `notes` = ?, `is_active` = ?, `updated_at` = ? WHERE `id` = ?", [source.name, source.type || "supplier", source.contactPerson || null, source.phone || null, source.email || null, source.location || null, source.notes || null, source.isActive === false ? 0 : 1, source.updatedAt.replace("T", " ").replace("Z", ""), source.id]);
        res.json(formatSource(source));
    }
    catch (e) {
        next(e);
    }
});
router.delete("/:id", (0, auth_1.requireAdminPermission)("sources:manage"), async (req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        const id = String(req.params.id);
        const source = (db.productSources || []).find((item) => item.id === id);
        if (!source)
            throw new errorHandler_1.AppError(404, "Supplier/source not found");
        const [{ count: productCount = 0 } = {}] = await (0, db_1.queryDb)("SELECT COUNT(*) AS count FROM `products` WHERE `source_id` = ?", [id]);
        const [{ count: orderItemCount = 0 } = {}] = await (0, db_1.queryDb)("SELECT COUNT(*) AS count FROM `order_items` WHERE `source_id` = ?", [id]);
        const [{ count: expenseCount = 0 } = {}] = await (0, db_1.queryDb)("SELECT COUNT(*) AS count FROM `expenses` WHERE `source_id` = ? AND COALESCE(`payment_status`, '') <> 'cancelled'", [id]);
        const isUsed = Number(productCount) > 0 || Number(orderItemCount) > 0 || Number(expenseCount) > 0;
        if (isUsed) {
            const updatedAt = (0, db_1.nowIso)();
            source.isActive = false;
            source.updatedAt = updatedAt;
            await (0, db_1.executeDb)("UPDATE `product_sources` SET `is_active` = 0, `updated_at` = ? WHERE `id` = ?", [updatedAt.replace("T", " ").replace("Z", ""), id]);
            return res.json({ message: "Supplier/source is used by records, so it was deactivated instead of deleted", source: formatSource(source) });
        }
        await (0, db_1.executeDb)("DELETE FROM `product_sources` WHERE `id` = ?", [id]);
        res.json({ message: "Supplier/source deleted" });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=sources.js.map
