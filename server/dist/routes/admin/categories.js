"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../../middleware/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const db_1 = require("../../lib/db");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.use((0, auth_1.requireAdminPermission)("catalog:view"));
const categorySchema = zod_1.z.object({
    slug: zod_1.z.string().min(2).max(120),
    name: zod_1.z.string().min(2).max(120),
    description: zod_1.z.string().optional().nullable(),
    imageUrl: zod_1.z.string().max(1000).optional().or(zod_1.z.literal("")).nullable(),
    icon: zod_1.z.string().optional().nullable(),
    sortOrder: zod_1.z.number().int().min(0).default(0),
    isActive: zod_1.z.boolean().default(true),
});
function formatCategory(db, category) {
    return {
        id: category.id,
        slug: category.slug,
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
        icon: category.icon,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        createdAt: category.createdAt,
        productCount: db.products.filter((product) => product.categoryId === category.id).length,
    };
}
router.get("/", async (_req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        const categories = [...db.categories].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || String(a.name).localeCompare(String(b.name)));
        res.json(categories.map((item) => formatCategory(db, item)));
    }
    catch (e) {
        next(e);
    }
});
router.get("/:id", async (req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        const category = db.categories.find((item) => item.id === String(req.params.id));
        if (!category)
            throw new errorHandler_1.AppError(404, "Category not found");
        res.json(formatCategory(db, category));
    }
    catch (e) {
        next(e);
    }
});
router.post("/", (0, auth_1.requireAdminPermission)("catalog:manage"), async (req, res, next) => {
    try {
        const data = categorySchema.parse(req.body);
        const db = await (0, db_1.readDb)();
        const category = {
            id: (0, db_1.createId)(),
            slug: data.slug,
            name: data.name,
            description: data.description || null,
            imageUrl: data.imageUrl || null,
            icon: data.icon || null,
            sortOrder: data.sortOrder,
            isActive: data.isActive,
            createdAt: (0, db_1.nowIso)(),
        };
        db.categories.push(category);
        await (0, db_1.writeDb)(db);
        res.status(201).json(formatCategory(db, category));
    }
    catch (e) {
        next(e);
    }
});
router.put("/:id", (0, auth_1.requireAdminPermission)("catalog:manage"), async (req, res, next) => {
    try {
        const data = categorySchema.parse(req.body);
        const db = await (0, db_1.readDb)();
        const category = db.categories.find((item) => item.id === String(req.params.id));
        if (!category)
            throw new errorHandler_1.AppError(404, "Category not found");
        Object.assign(category, {
            slug: data.slug,
            name: data.name,
            description: data.description || null,
            imageUrl: data.imageUrl || null,
            icon: data.icon || null,
            sortOrder: data.sortOrder,
            isActive: data.isActive,
        });
        await (0, db_1.writeDb)(db);
        res.json(formatCategory(db, category));
    }
    catch (e) {
        next(e);
    }
});
router.delete("/:id", (0, auth_1.requireAdminPermission)("catalog:manage"), async (req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        const category = db.categories.find((item) => item.id === String(req.params.id));
        if (!category)
            throw new errorHandler_1.AppError(404, "Category not found");
        const productCount = db.products.filter((product) => product.categoryId === category.id).length;
        if (productCount > 0)
            throw new errorHandler_1.AppError(400, "Cannot delete a category that still has products");
        await (0, db_1.executeDb)("DELETE FROM `categories` WHERE `id` = ?", [category.id]);
        res.json({ message: "Category deleted" });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=categories.js.map