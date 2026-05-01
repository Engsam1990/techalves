"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const db_1 = require("../../lib/db");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.use((0, auth_1.requireAdminPermission)("customers:view"));
router.get("/", async (req, res, next) => { try {
    const q = String(req.query.q || "").trim();
    const db = await (0, db_1.readDb)();
    const customers = (0, db_1.sortByDateDesc)(db.customerUsers).filter((item) => !q || [item.fullName, item.email, item.phone].some((value) => (0, db_1.contains)(value, q)));
    res.json(customers.map((customer) => { const orders = (0, db_1.sortByDateDesc)(db.orders.filter((order) => order.customerId === customer.id)); return { id: customer.id, fullName: customer.fullName, email: customer.email, phone: customer.phone, isActive: customer.isActive, createdAt: customer.createdAt, orderCount: orders.length, lastOrder: orders[0] ? { totalAmount: orders[0].totalAmount, createdAt: orders[0].createdAt } : null }; }));
}
catch (e) {
    next(e);
} });
router.get("/:id", async (req, res, next) => { try {
    const db = await (0, db_1.readDb)();
    const customer = db.customerUsers.find((item) => item.id === String(req.params.id));
    if (!customer)
        throw new errorHandler_1.AppError(404, "Customer not found");
    const orders = (0, db_1.sortByDateDesc)(db.orders.filter((order) => order.customerId === customer.id)).map((order) => ({ ...order, items: (order.items || []).map((item) => { const product = db.products.find((product) => product.id === item.productId); return { ...item, product: product ? { id: product.id, name: product.name, slug: product.slug } : undefined }; }) }));
    res.json({ id: customer.id, fullName: customer.fullName, email: customer.email, phone: customer.phone, isActive: customer.isActive, createdAt: customer.createdAt, updatedAt: customer.updatedAt, orders });
}
catch (e) {
    next(e);
} });
exports.default = router;
//# sourceMappingURL=customers.js.map