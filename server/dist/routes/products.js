"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const errorHandler_1 = require("../middleware/errorHandler");
const products_1 = require("../validators/products");
const db_1 = require("../lib/db");
const router = (0, express_1.Router)();
function isPublicProduct(product) {
    return product?.salesChannel !== "pos_only" && product?.isCatalogVisible !== false;
}
function formatProduct(db, product) {
    (0, db_1.normalizeProduct)(product);
    const category = (0, db_1.findCategoryById)(db, product.categoryId);
    const brand = (0, db_1.findBrand)(db, product.brand);
    const subcategory = (0, db_1.findSubcategory)(db, product.subcategory, product.categoryId);
    const resolvedSpecs = (0, db_1.resolveProductSpecs)(db, product.specs, subcategory?.id ?? product.subcategory);
    return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: category?.slug ?? product.categoryId,
        subcategory: subcategory?.name ?? product.subcategory,
        brand: brand?.name ?? product.brand,
        price: product.price,
        originalPrice: product.originalPrice,
        condition: product.condition,
        description: product.description,
        specs: resolvedSpecs.display,
        images: Array.isArray(product.images) ? product.images : [],
        inStock: product.inStock,
        featured: Boolean(product.featured),
        premium: Boolean(product.premium),
        rating: Number(product.rating || 0),
        reviewCount: Number(product.reviewCount || 0),
        warranty: product.warrantyText,
    };
}
function parseBooleanFilter(value) {
    if (value === undefined || value === null || value === "")
        return null;
    const normalized = String(value).trim().toLowerCase();
    if (["1", "true", "yes", "y"].includes(normalized))
        return true;
    if (["0", "false", "no", "n"].includes(normalized))
        return false;
    return null;
}
router.get("/", async (req, res, next) => {
    try {
        const query = products_1.productQuerySchema.parse(req.query);
        const db = await (0, db_1.readDb)();
        let items = db.products.filter(isPublicProduct).map((item) => (0, db_1.normalizeProduct)({ ...item }));
        if (query.category) {
            const category = (0, db_1.findCategoryBySlug)(db, query.category);
            items = category ? items.filter((item) => item.categoryId === category.id) : [];
        }
        const featuredFilter = parseBooleanFilter(query.featured);
        if (featuredFilter !== null) {
            items = items.filter((item) => (0, db_1.normalizeProduct)(item).featured === featuredFilter);
        }
        const premiumFilter = parseBooleanFilter(query.premium);
        if (premiumFilter !== null) {
            items = items.filter((item) => (0, db_1.normalizeProduct)(item).premium === premiumFilter);
        }
        if (query.brand) {
            const brands = query.brand.split(",").map((item) => item.trim().toLowerCase());
            items = items.filter((item) => {
                const displayBrand = (0, db_1.findBrand)(db, item.brand)?.name ?? item.brand;
                return brands.includes(String(displayBrand).toLowerCase());
            });
        }
        if (query.condition) {
            const conditions = query.condition.split(",").map((item) => item.trim().toLowerCase());
            items = items.filter((item) => conditions.includes(String(item.condition).toLowerCase()));
        }
        if (query.minPrice !== undefined)
            items = items.filter((item) => Number(item.price) >= Number(query.minPrice));
        if (query.maxPrice !== undefined)
            items = items.filter((item) => Number(item.price) <= Number(query.maxPrice));
        if (query.q) {
            const q = String(query.q).toLowerCase();
            items = items.filter((item) => {
                const brand = (0, db_1.findBrand)(db, item.brand)?.name ?? item.brand;
                const subcategory = (0, db_1.findSubcategory)(db, item.subcategory, item.categoryId)?.name ?? item.subcategory;
                const specText = Object.values((0, db_1.resolveProductSpecs)(db, item.specs, item.subcategory).display || {}).join(" ");
                return [item.name, brand, subcategory, item.description, specText].some((value) => String(value || "").toLowerCase().includes(q));
            });
        }
        if (query.sort === "price-asc")
            items.sort((a, b) => Number(a.price) - Number(b.price));
        else if (query.sort === "price-desc")
            items.sort((a, b) => Number(b.price) - Number(a.price));
        else if (query.sort === "rating")
            items.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
        else
            items = (0, db_1.sortByDateDesc)(items, "createdAt");
        const total = items.length;
        const start = (query.page - 1) * query.limit;
        const paged = items.slice(start, start + query.limit);
        res.json({
            data: paged.map((item) => formatProduct(db, item)),
            pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
        });
    }
    catch (e) {
        next(e);
    }
});
router.get("/featured", async (_req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        res.json(db.products.filter(isPublicProduct).filter((item) => item.featured).map((item) => formatProduct(db, item)));
    }
    catch (e) {
        next(e);
    }
});
router.get("/:slug", async (req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        const product = db.products.filter(isPublicProduct).find((item) => item.slug === String(req.params.slug));
        if (!product)
            throw new errorHandler_1.AppError(404, "Product not found");
        res.json(formatProduct(db, product));
    }
    catch (e) {
        next(e);
    }
});
router.get("/:slug/related", async (req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        const product = db.products.filter(isPublicProduct).find((item) => item.slug === String(req.params.slug));
        if (!product)
            throw new errorHandler_1.AppError(404, "Product not found");
        const related = db.products.filter(isPublicProduct).filter((item) => item.categoryId === product.categoryId && item.id !== product.id).slice(0, 4);
        res.json(related.map((item) => formatProduct(db, item)));
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map