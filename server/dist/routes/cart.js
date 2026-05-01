"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const zod_1 = require("zod");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const db_1 = require("../lib/db");
const router = (0, express_1.Router)();
router.use(auth_1.requireCustomerAuth);
const cartItemSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    quantity: zod_1.z.coerce.number().int().min(1).max(10),
});
const quantitySchema = zod_1.z.object({
    quantity: zod_1.z.coerce.number().int().min(1).max(10),
});
const mergeSchema = zod_1.z.object({
    items: zod_1.z.array(cartItemSchema).default([]),
});
function unwrapBody(body) {
    if (body === null || body === undefined)
        return {};
    if (typeof body === "string") {
        try {
            return JSON.parse(body);
        }
        catch {
            return {};
        }
    }
    if (typeof body !== "object")
        return {};
    return body;
}
function normalizeCartItemBody(body) {
    const source = unwrapBody(body);
    const candidate = source.item ?? source.data ?? source.payload ?? source;
    return {
        productId: candidate?.productId ?? candidate?.product?.id,
        quantity: candidate?.quantity ?? 1,
    };
}
function formatCart(db, cart) {
    const items = (cart.items || [])
        .map((item) => {
        const product = (0, db_1.findProductById)(db, item.productId);
        return product
            ? {
                id: item.id,
                productId: item.productId,
                quantity: item.quantity,
                product: {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    brand: product.brand,
                    condition: product.condition,
                    images: product.images || [],
                    inStock: product.inStock,
                },
            }
            : null;
    })
        .filter(Boolean);
    return {
        id: cart.id,
        items,
        itemCount: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        subtotal: items.reduce((sum, item) => sum + Number(item.product.price || 0) * Number(item.quantity || 0), 0),
    };
}
router.get("/", async (req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        const cart = (0, db_1.getOrCreateCart)(db, req.customerUser.id);
        await (0, db_1.writeDb)(db);
        res.json(formatCart(db, cart));
    }
    catch (e) {
        next(e);
    }
});
router.post("/items", async (req, res, next) => {
    try {
        const data = cartItemSchema.parse(normalizeCartItemBody(req.body));
        const db = await (0, db_1.readDb)();
        const cart = (0, db_1.getOrCreateCart)(db, req.customerUser.id);
        const product = (0, db_1.findProductById)(db, data.productId);
        if (!product)
            throw new errorHandler_1.AppError(404, "Product not found");
        if (!product.inStock || Number(product.stockQuantity || 0) <= 0) {
            throw new errorHandler_1.AppError(400, `${product.name} is out of stock`);
        }
        const existing = (cart.items || []).find((item) => item.productId === data.productId);
        const nextQuantity = Math.min(Number(existing?.quantity || 0) + Number(data.quantity), 10);
        if (nextQuantity > Number(product.stockQuantity || 0)) {
            throw new errorHandler_1.AppError(400, `Only ${product.stockQuantity} unit(s) can be added for ${product.name}`);
        }
        if (existing) {
            existing.quantity = nextQuantity;
            existing.updatedAt = (0, db_1.nowIso)();
        }
        else {
            cart.items.push({
                id: (0, db_1.createId)(),
                productId: data.productId,
                quantity: Number(data.quantity),
                createdAt: (0, db_1.nowIso)(),
                updatedAt: (0, db_1.nowIso)(),
            });
        }
        cart.updatedAt = (0, db_1.nowIso)();
        await (0, db_1.writeDb)(db);
        res.status(201).json(formatCart(db, cart));
    }
    catch (e) {
        next(e);
    }
});
router.put("/items/:productId", async (req, res, next) => {
    try {
        const data = quantitySchema.parse(unwrapBody(req.body));
        const db = await (0, db_1.readDb)();
        const cart = (0, db_1.getOrCreateCart)(db, req.customerUser.id);
        const cartItem = (cart.items || []).find((item) => item.productId === String(req.params.productId));
        if (!cartItem)
            throw new errorHandler_1.AppError(404, "Cart item not found");
        const product = (0, db_1.findProductById)(db, cartItem.productId);
        if (!product)
            throw new errorHandler_1.AppError(404, "Product not found");
        if (Number(data.quantity) > Number(product.stockQuantity || 0)) {
            throw new errorHandler_1.AppError(400, `Only ${product.stockQuantity} unit(s) available for ${product.name}`);
        }
        cartItem.quantity = Number(data.quantity);
        cartItem.updatedAt = (0, db_1.nowIso)();
        cart.updatedAt = (0, db_1.nowIso)();
        await (0, db_1.writeDb)(db);
        res.json(formatCart(db, cart));
    }
    catch (e) {
        next(e);
    }
});
router.delete("/items/:productId", async (req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        const cart = (0, db_1.getOrCreateCart)(db, req.customerUser.id);
        cart.items = (cart.items || []).filter((item) => item.productId !== String(req.params.productId));
        cart.updatedAt = (0, db_1.nowIso)();
        await (0, db_1.writeDb)(db);
        await (0, db_1.executeDb)("DELETE FROM `cart_items` WHERE `cart_id` = ? AND `product_id` = ?", [cart.id, String(req.params.productId)]);
        res.json(formatCart(db, cart));
    }
    catch (e) {
        next(e);
    }
});
router.delete("/clear", async (req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        const cart = (0, db_1.getOrCreateCart)(db, req.customerUser.id);
        cart.items = [];
        cart.updatedAt = (0, db_1.nowIso)();
        await (0, db_1.writeDb)(db);
        await (0, db_1.executeDb)("DELETE FROM `cart_items` WHERE `cart_id` = ?", [cart.id]);
        res.json(formatCart(db, cart));
    }
    catch (e) {
        next(e);
    }
});
router.post("/merge", async (req, res, next) => {
    try {
        const source = unwrapBody(req.body);
        const data = mergeSchema.parse({
            items: Array.isArray(source.items) ? source.items.map(normalizeCartItemBody) : [],
        });
        const db = await (0, db_1.readDb)();
        const cart = (0, db_1.getOrCreateCart)(db, req.customerUser.id);
        for (const item of data.items) {
            const product = (0, db_1.findProductById)(db, item.productId);
            if (!product || !product.inStock || Number(product.stockQuantity || 0) <= 0)
                continue;
            const existing = (cart.items || []).find((cartItem) => cartItem.productId === item.productId);
            const mergedQuantity = Math.min(Number(existing?.quantity || 0) + Number(item.quantity), 10, Number(product.stockQuantity || 0));
            if (existing) {
                existing.quantity = mergedQuantity;
                existing.updatedAt = (0, db_1.nowIso)();
            }
            else {
                cart.items.push({
                    id: (0, db_1.createId)(),
                    productId: item.productId,
                    quantity: mergedQuantity,
                    createdAt: (0, db_1.nowIso)(),
                    updatedAt: (0, db_1.nowIso)(),
                });
            }
        }
        cart.updatedAt = (0, db_1.nowIso)();
        await (0, db_1.writeDb)(db);
        res.json(formatCart(db, cart));
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=cart.js.map