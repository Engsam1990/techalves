"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const zod_1 = require("zod");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const db_1 = require("../lib/db");
const router = (0, express_1.Router)();
const reviewSchema = zod_1.z.object({ rating: zod_1.z.number().int().min(1).max(5), comment: zod_1.z.string().trim().min(10).max(1500) });
function formatReview(db, review) { const customer = db.customerUsers.find((item) => item.id === review.customerId); return { id: review.id, rating: review.rating, comment: review.comment, createdAt: review.createdAt, reviewerName: customer?.fullName ?? "Verified customer" }; }
router.get("/product/:slug", async (req, res, next) => { try {
    const db = await (0, db_1.readDb)();
    const product = (0, db_1.findProductBySlug)(db, String(req.params.slug));
    if (!product)
        throw new errorHandler_1.AppError(404, "Product not found");
    const reviews = db.reviews.filter((item) => item.productId === product.id && item.isApproved !== false).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(reviews.map((item) => formatReview(db, item)));
}
catch (e) {
    next(e);
} });
router.post("/product/:slug", auth_1.requireCustomerAuth, async (req, res, next) => { try {
    const data = reviewSchema.parse(req.body);
    const db = await (0, db_1.readDb)();
    const product = (0, db_1.findProductBySlug)(db, String(req.params.slug));
    if (!product)
        throw new errorHandler_1.AppError(404, "Product not found");
    const existing = db.reviews.find((item) => item.productId === product.id && item.customerId === req.customerUser.id);
    if (existing) {
        existing.rating = data.rating;
        existing.comment = data.comment;
        existing.isApproved = true;
        existing.updatedAt = (0, db_1.nowIso)();
    }
    else {
        db.reviews.push({ id: (0, db_1.createId)(), productId: product.id, customerId: req.customerUser.id, rating: data.rating, comment: data.comment, isApproved: true, createdAt: (0, db_1.nowIso)(), updatedAt: (0, db_1.nowIso)() });
    }
    (0, db_1.recalcProductReviewStats)(db, product.id);
    await (0, db_1.writeDb)(db);
    res.status(201).json({ message: "Your review has been saved successfully." });
}
catch (e) {
    next(e);
} });
exports.default = router;
//# sourceMappingURL=reviews.js.map