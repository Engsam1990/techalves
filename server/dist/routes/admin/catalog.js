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
const subcategorySchema = zod_1.z.object({
    categoryId: zod_1.z.string().uuid(),
    slug: zod_1.z.string().min(2).max(120),
    name: zod_1.z.string().min(2).max(120),
    description: zod_1.z.string().optional().nullable(),
    sortOrder: zod_1.z.number().int().min(0).default(0),
    isActive: zod_1.z.boolean().default(true),
});
const brandSchema = zod_1.z.object({
    slug: zod_1.z.string().min(2).max(120),
    name: zod_1.z.string().min(2).max(120),
    description: zod_1.z.string().optional().nullable(),
    logoUrl: zod_1.z.string().max(500).optional().nullable(),
    websiteUrl: zod_1.z.string().max(500).optional().nullable(),
    isActive: zod_1.z.boolean().default(true),
});
const specValueSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    value: zod_1.z.string().min(1).max(191),
    sortOrder: zod_1.z.number().int().min(0).default(0),
    isActive: zod_1.z.boolean().default(true),
});
const specificationSchema = zod_1.z.object({
    subcategoryId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(2).max(120),
    sortOrder: zod_1.z.number().int().min(0).default(0),
    isActive: zod_1.z.boolean().default(true),
    values: zod_1.z.array(specValueSchema).min(1),
});
function formatBrand(db, brand) {
    const productCount = db.products.filter((product) => {
        const resolved = (0, db_1.findBrand)(db, product.brand);
        return resolved?.id === brand.id || String(product.brand || "").toLowerCase() === String(brand.name || "").toLowerCase();
    }).length;
    return {
        id: brand.id,
        slug: brand.slug,
        name: brand.name,
        description: brand.description,
        logoUrl: brand.logoUrl,
        websiteUrl: brand.websiteUrl,
        isActive: brand.isActive,
        createdAt: brand.createdAt,
        productCount,
    };
}
function formatSubcategory(db, subcategory) {
    const category = (0, db_1.findCategoryById)(db, subcategory.categoryId);
    const productCount = db.products.filter((product) => {
        const resolved = (0, db_1.findSubcategory)(db, product.subcategory, product.categoryId);
        return resolved?.id === subcategory.id || (product.categoryId === subcategory.categoryId && String(product.subcategory || "").toLowerCase() === String(subcategory.name || "").toLowerCase());
    }).length;
    return {
        id: subcategory.id,
        categoryId: subcategory.categoryId,
        categoryName: category?.name || null,
        slug: subcategory.slug,
        name: subcategory.name,
        description: subcategory.description,
        sortOrder: subcategory.sortOrder,
        isActive: subcategory.isActive,
        createdAt: subcategory.createdAt,
        productCount,
    };
}
function formatSpecification(db, specification) {
    const subcategory = (0, db_1.findSubcategory)(db, specification.subcategoryId);
    const category = subcategory ? (0, db_1.findCategoryById)(db, subcategory.categoryId) : null;
    const productCount = db.products.filter((product) => {
        const selections = (0, db_1.resolveProductSpecs)(db, product.specs, product.subcategory).selections;
        return Boolean(selections[specification.id]);
    }).length;
    const values = (db.specificationValues || [])
        .filter((item) => item.specificationId === specification.id)
        .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0) || String(a.value).localeCompare(String(b.value)))
        .map((item) => ({
        id: item.id,
        specificationId: item.specificationId,
        value: item.value,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
        createdAt: item.createdAt,
    }));
    return {
        id: specification.id,
        subcategoryId: specification.subcategoryId,
        subcategoryName: subcategory?.name || null,
        categoryId: category?.id || null,
        categoryName: category?.name || null,
        name: specification.name,
        sortOrder: specification.sortOrder,
        isActive: specification.isActive,
        createdAt: specification.createdAt,
        productCount,
        values,
    };
}
function formatCatalog(db) {
    const categories = [...db.categories].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0) || String(a.name).localeCompare(String(b.name)));
    const subcategories = [...(db.subcategories || [])].sort((a, b) => String(a.categoryId).localeCompare(String(b.categoryId)) || Number(a.sortOrder || 0) - Number(b.sortOrder || 0) || String(a.name).localeCompare(String(b.name)));
    const brands = [...(db.brands || [])].sort((a, b) => String(a.name).localeCompare(String(b.name)));
    const specifications = [...(db.specifications || [])].sort((a, b) => String(a.subcategoryId).localeCompare(String(b.subcategoryId)) || Number(a.sortOrder || 0) - Number(b.sortOrder || 0) || String(a.name).localeCompare(String(b.name)));
    return {
        categories,
        subcategories: subcategories.map((item) => formatSubcategory(db, item)),
        brands: brands.map((item) => formatBrand(db, item)),
        specifications: specifications.map((item) => formatSpecification(db, item)),
        groupedSubcategories: categories.map((category) => ({
            categoryId: category.id,
            categoryName: category.name,
            items: subcategories.filter((item) => item.categoryId === category.id).map((item) => formatSubcategory(db, item)),
        })),
        groupedSpecifications: categories.map((category) => ({
            categoryId: category.id,
            categoryName: category.name,
            subcategories: subcategories
                .filter((subcategory) => subcategory.categoryId === category.id)
                .map((subcategory) => ({
                subcategoryId: subcategory.id,
                subcategoryName: subcategory.name,
                items: specifications.filter((specification) => specification.subcategoryId === subcategory.id).map((specification) => formatSpecification(db, specification)),
            })),
        })),
    };
}
router.get("/", async (_req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        res.json(formatCatalog(db));
    }
    catch (error) {
        next(error);
    }
});
router.post("/subcategories", (0, auth_1.requireAdminPermission)("catalog:manage"), async (req, res, next) => {
    try {
        const payload = subcategorySchema.parse(req.body ?? {});
        const db = await (0, db_1.readDb)();
        if (!(0, db_1.findCategoryById)(db, payload.categoryId))
            throw new errorHandler_1.AppError(400, "Category not found");
        const exists = (db.subcategories || []).some((item) => item.slug === payload.slug || (item.categoryId === payload.categoryId && String(item.name).toLowerCase() === payload.name.toLowerCase()));
        if (exists)
            throw new errorHandler_1.AppError(400, "Subcategory already exists for this category");
        const id = (0, db_1.createId)();
        await (0, db_1.executeDb)(`INSERT INTO subcategories (id, category_id, slug, name, description, sort_order, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [id, payload.categoryId, payload.slug, payload.name, payload.description || null, Number(payload.sortOrder || 0), payload.isActive ? 1 : 0, (0, db_1.nowIso)().slice(0, 19).replace("T", " ")]);
        const freshDb = await (0, db_1.readDb)();
        const created = (freshDb.subcategories || []).find((item) => item.id === id);
        res.status(201).json(formatSubcategory(freshDb, created));
    }
    catch (error) {
        next(error);
    }
});
router.put("/subcategories/:id", (0, auth_1.requireAdminPermission)("catalog:manage"), async (req, res, next) => {
    try {
        const payload = subcategorySchema.parse(req.body ?? {});
        const db = await (0, db_1.readDb)();
        const subcategory = (db.subcategories || []).find((item) => item.id === String(req.params.id));
        if (!subcategory)
            throw new errorHandler_1.AppError(404, "Subcategory not found");
        if (!(0, db_1.findCategoryById)(db, payload.categoryId))
            throw new errorHandler_1.AppError(400, "Category not found");
        const exists = (db.subcategories || []).some((item) => item.id !== subcategory.id && (item.slug === payload.slug || (item.categoryId === payload.categoryId && String(item.name).toLowerCase() === payload.name.toLowerCase())));
        if (exists)
            throw new errorHandler_1.AppError(400, "Subcategory already exists for this category");
        await (0, db_1.executeDb)(`UPDATE subcategories SET category_id = ?, slug = ?, name = ?, description = ?, sort_order = ?, is_active = ? WHERE id = ?`, [payload.categoryId, payload.slug, payload.name, payload.description || null, Number(payload.sortOrder || 0), payload.isActive ? 1 : 0, subcategory.id]);
        const freshDb = await (0, db_1.readDb)();
        const updated = (freshDb.subcategories || []).find((item) => item.id === subcategory.id);
        res.json(formatSubcategory(freshDb, updated));
    }
    catch (error) {
        next(error);
    }
});
router.delete("/subcategories/:id", (0, auth_1.requireAdminPermission)("catalog:manage"), async (req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        const subcategory = (db.subcategories || []).find((item) => item.id === String(req.params.id));
        if (!subcategory)
            throw new errorHandler_1.AppError(404, "Subcategory not found");
        const productCount = db.products.filter((product) => {
            const resolved = (0, db_1.findSubcategory)(db, product.subcategory, product.categoryId);
            return resolved?.id === subcategory.id || (product.categoryId === subcategory.categoryId && String(product.subcategory || "").toLowerCase() === String(subcategory.name || "").toLowerCase());
        }).length;
        if (productCount > 0)
            throw new errorHandler_1.AppError(400, "Cannot delete a subcategory that still has products");
        const specCount = (db.specifications || []).filter((item) => item.subcategoryId === subcategory.id).length;
        if (specCount > 0)
            throw new errorHandler_1.AppError(400, "Delete specifications for this subcategory first");
        await (0, db_1.executeDb)(`DELETE FROM subcategories WHERE id = ?`, [subcategory.id]);
        res.json({ message: "Subcategory deleted" });
    }
    catch (error) {
        next(error);
    }
});
router.post("/brands", (0, auth_1.requireAdminPermission)("catalog:manage"), async (req, res, next) => {
    try {
        const payload = brandSchema.parse(req.body ?? {});
        const db = await (0, db_1.readDb)();
        const exists = (db.brands || []).some((item) => item.slug === payload.slug || String(item.name).toLowerCase() === payload.name.toLowerCase());
        if (exists)
            throw new errorHandler_1.AppError(400, "Brand already exists");
        const id = (0, db_1.createId)();
        await (0, db_1.executeDb)(`INSERT INTO brands (id, slug, name, description, logo_url, website_url, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [id, payload.slug, payload.name, payload.description || null, payload.logoUrl || null, payload.websiteUrl || null, payload.isActive ? 1 : 0, (0, db_1.nowIso)().slice(0, 19).replace("T", " ")]);
        const freshDb = await (0, db_1.readDb)();
        const created = (freshDb.brands || []).find((item) => item.id === id);
        res.status(201).json(formatBrand(freshDb, created));
    }
    catch (error) {
        next(error);
    }
});
router.put("/brands/:id", (0, auth_1.requireAdminPermission)("catalog:manage"), async (req, res, next) => {
    try {
        const payload = brandSchema.parse(req.body ?? {});
        const db = await (0, db_1.readDb)();
        const brand = (db.brands || []).find((item) => item.id === String(req.params.id));
        if (!brand)
            throw new errorHandler_1.AppError(404, "Brand not found");
        const exists = (db.brands || []).some((item) => item.id !== brand.id && (item.slug === payload.slug || String(item.name).toLowerCase() === payload.name.toLowerCase()));
        if (exists)
            throw new errorHandler_1.AppError(400, "Brand already exists");
        await (0, db_1.executeDb)(`UPDATE brands SET slug = ?, name = ?, description = ?, logo_url = ?, website_url = ?, is_active = ? WHERE id = ?`, [payload.slug, payload.name, payload.description || null, payload.logoUrl || null, payload.websiteUrl || null, payload.isActive ? 1 : 0, brand.id]);
        const freshDb = await (0, db_1.readDb)();
        const updated = (freshDb.brands || []).find((item) => item.id === brand.id);
        res.json(formatBrand(freshDb, updated));
    }
    catch (error) {
        next(error);
    }
});
router.delete("/brands/:id", (0, auth_1.requireAdminPermission)("catalog:manage"), async (req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        const brand = (db.brands || []).find((item) => item.id === String(req.params.id));
        if (!brand)
            throw new errorHandler_1.AppError(404, "Brand not found");
        const productCount = db.products.filter((product) => {
            const resolved = (0, db_1.findBrand)(db, product.brand);
            return resolved?.id === brand.id || String(product.brand || "").toLowerCase() === String(brand.name || "").toLowerCase();
        }).length;
        if (productCount > 0)
            throw new errorHandler_1.AppError(400, "Cannot delete a brand that still has products");
        await (0, db_1.executeDb)(`DELETE FROM brands WHERE id = ?`, [brand.id]);
        res.json({ message: "Brand deleted" });
    }
    catch (error) {
        next(error);
    }
});
router.post("/specifications", (0, auth_1.requireAdminPermission)("catalog:manage"), async (req, res, next) => {
    try {
        const payload = specificationSchema.parse(req.body ?? {});
        const db = await (0, db_1.readDb)();
        const subcategory = (0, db_1.findSubcategory)(db, payload.subcategoryId);
        if (!subcategory)
            throw new errorHandler_1.AppError(400, "Subcategory not found");
        const exists = (db.specifications || []).some((item) => item.subcategoryId === payload.subcategoryId && String(item.name).toLowerCase() === payload.name.toLowerCase());
        if (exists)
            throw new errorHandler_1.AppError(400, "Specification already exists for this subcategory");
        const specId = (0, db_1.createId)();
        await (0, db_1.executeDb)(`INSERT INTO specifications (id, subcategory_id, name, sort_order, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [specId, payload.subcategoryId, payload.name, Number(payload.sortOrder || 0), payload.isActive ? 1 : 0, (0, db_1.nowIso)().slice(0, 19).replace("T", " ")]);
        for (const [index, option] of payload.values.entries()) {
            await (0, db_1.executeDb)(`INSERT INTO specification_values (id, specification_id, value, sort_order, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [(0, db_1.createId)(), specId, option.value, Number(option.sortOrder ?? index), option.isActive ? 1 : 0, (0, db_1.nowIso)().slice(0, 19).replace("T", " ")]);
        }
        const freshDb = await (0, db_1.readDb)();
        const created = (freshDb.specifications || []).find((item) => item.id === specId);
        res.status(201).json(formatSpecification(freshDb, created));
    }
    catch (error) {
        next(error);
    }
});
router.put("/specifications/:id", (0, auth_1.requireAdminPermission)("catalog:manage"), async (req, res, next) => {
    try {
        const payload = specificationSchema.parse(req.body ?? {});
        const db = await (0, db_1.readDb)();
        const specification = (db.specifications || []).find((item) => item.id === String(req.params.id));
        if (!specification)
            throw new errorHandler_1.AppError(404, "Specification not found");
        const subcategory = (0, db_1.findSubcategory)(db, payload.subcategoryId);
        if (!subcategory)
            throw new errorHandler_1.AppError(400, "Subcategory not found");
        const exists = (db.specifications || []).some((item) => item.id !== specification.id && item.subcategoryId === payload.subcategoryId && String(item.name).toLowerCase() === payload.name.toLowerCase());
        if (exists)
            throw new errorHandler_1.AppError(400, "Specification already exists for this subcategory");
        await (0, db_1.executeDb)(`UPDATE specifications SET subcategory_id = ?, name = ?, sort_order = ?, is_active = ? WHERE id = ?`, [payload.subcategoryId, payload.name, Number(payload.sortOrder || 0), payload.isActive ? 1 : 0, specification.id]);
        await (0, db_1.executeDb)(`DELETE FROM specification_values WHERE specification_id = ?`, [specification.id]);
        for (const [index, option] of payload.values.entries()) {
            await (0, db_1.executeDb)(`INSERT INTO specification_values (id, specification_id, value, sort_order, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [option.id || (0, db_1.createId)(), specification.id, option.value, Number(option.sortOrder ?? index), option.isActive ? 1 : 0, (0, db_1.nowIso)().slice(0, 19).replace("T", " ")]);
        }
        const freshDb = await (0, db_1.readDb)();
        const updated = (freshDb.specifications || []).find((item) => item.id === specification.id);
        res.json(formatSpecification(freshDb, updated));
    }
    catch (error) {
        next(error);
    }
});
router.delete("/specifications/:id", (0, auth_1.requireAdminPermission)("catalog:manage"), async (req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        const specification = (db.specifications || []).find((item) => item.id === String(req.params.id));
        if (!specification)
            throw new errorHandler_1.AppError(404, "Specification not found");
        const productCount = db.products.filter((product) => {
            const selections = (0, db_1.resolveProductSpecs)(db, product.specs, product.subcategory).selections;
            return Boolean(selections[specification.id]);
        }).length;
        if (productCount > 0)
            throw new errorHandler_1.AppError(400, "Cannot delete a specification that is used by products");
        await (0, db_1.executeDb)(`DELETE FROM specification_values WHERE specification_id = ?`, [specification.id]);
        await (0, db_1.executeDb)(`DELETE FROM specifications WHERE id = ?`, [specification.id]);
        res.json({ message: "Specification deleted" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=catalog.js.map