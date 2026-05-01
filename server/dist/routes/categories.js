"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const errorHandler_1 = require("../middleware/errorHandler");
const db_1 = require("../lib/db");
const router = (0, express_1.Router)();
router.get("/", async (_req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        const categories = db.categories.filter((item) => item.isActive !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((item) => ({ id: item.id, slug: item.slug, name: item.name, description: item.description, image: item.imageUrl, icon: item.icon, productCount: db.products.filter((product) => product.categoryId === item.id).length }));
        res.json(categories);
    }
    catch (e) {
        next(e);
    }
});
router.get("/:slug", async (req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        const category = db.categories.find((item) => item.slug === String(req.params.slug));
        if (!category)
            throw new errorHandler_1.AppError(404, "Category not found");
        res.json({ id: category.id, slug: category.slug, name: category.name, description: category.description, image: category.imageUrl, icon: category.icon, productCount: db.products.filter((product) => product.categoryId === category.id).length });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=categories.js.map