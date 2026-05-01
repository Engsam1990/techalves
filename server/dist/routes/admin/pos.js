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
const paymentMethods = ["cash", "mpesa", "card", "bank_transfer", "other"];
const methodsRequiringTransactionReference = new Set(["mpesa", "card", "bank_transfer"]);
const sourcePaymentStatuses = ["pending", "paid", "partial", "waived"];
const WALK_IN_CUSTOMER_ID = "pos-walkin-customer";
const WALK_IN_CUSTOMER_EMAIL = "pos-walkin@techalves.local";
const instantProductSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(200),
    categoryId: zod_1.z.string().uuid({ message: "Category is required for instant-sale products" }),
    subcategory: zod_1.z.string().trim().max(191).optional().nullable(),
    brand: zod_1.z.string().trim().min(1, "Brand is required for instant-sale products").max(100),
    barcode: zod_1.z.string().trim().max(120).optional().nullable(),
    condition: zod_1.z.enum(["new", "refurbished", "ex-uk"]).default("new"),
    description: zod_1.z.string().trim().max(2000).optional().nullable(),
    warrantyText: zod_1.z.string().trim().max(191).optional().nullable(),
    sourceId: zod_1.z.string().trim().min(1, "Supplier/source is required for instant-sale products"),
    sourcePrice: zod_1.z.coerce.number().int().positive("Source price is required for instant-sale products"),
    sellingPrice: zod_1.z.coerce.number().int().positive("Selling price is required"),
    sourcePaymentStatus: zod_1.z.enum(sourcePaymentStatuses, { message: "Source payment status is required" }),
});
const posItemSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid().optional().nullable(),
    quantity: zod_1.z.number().int().min(1).max(100),
    serialNumbers: zod_1.z.array(zod_1.z.string().trim().min(1).max(191)).default([]),
    instantProduct: instantProductSchema.optional().nullable(),
}).refine((item) => Boolean(item.productId) !== Boolean(item.instantProduct), {
    message: "Each POS line must use either an existing product or one instant-sale product, not both",
});
const posCheckoutSchema = zod_1.z.object({
    items: zod_1.z.array(posItemSchema).min(1),
    paymentStatus: zod_1.z.enum(["paid", "pending"]).default("paid"),
    paymentMethod: zod_1.z.enum(paymentMethods),
    transactionReference: zod_1.z.string().trim().max(120).optional(),
    customerName: zod_1.z.string().trim().max(120).optional(),
    customerPhone: zod_1.z.string().trim().max(40).optional(),
    discountAmount: zod_1.z.coerce.number().min(0).default(0),
    otherCharges: zod_1.z.coerce.number().min(0).default(0),
    note: zod_1.z.string().trim().max(500).optional(),
    vatEnabled: zod_1.z.boolean().default(false),
    vatRate: zod_1.z.coerce.number().min(0).max(100).default(16),
    sourcePaymentMethod: zod_1.z.enum(paymentMethods).optional().nullable(),
    sourcePaymentReference: zod_1.z.string().trim().max(120).optional().nullable(),
});
function ensureCollections(db) {
    if (!Array.isArray(db.products))
        db.products = [];
    if (!Array.isArray(db.orders))
        db.orders = [];
    if (!Array.isArray(db.orderItems))
        db.orderItems = [];
    if (!Array.isArray(db.inventoryMovements))
        db.inventoryMovements = [];
    if (!Array.isArray(db.productSerialNumbers))
        db.productSerialNumbers = [];
    if (!Array.isArray(db.productSources))
        db.productSources = [];
    if (!Array.isArray(db.expenseCategories))
        db.expenseCategories = [];
    if (!Array.isArray(db.expenses))
        db.expenses = [];
    if (!Array.isArray(db.customerUsers))
        db.customerUsers = [];
    if (!Array.isArray(db.categories))
        db.categories = [];
}
function ensurePosWalkInCustomer(db, now) {
    ensureCollections(db);
    const existingByEmail = (db.customerUsers || []).find((item) => String(item.email || "").trim().toLowerCase() === WALK_IN_CUSTOMER_EMAIL);
    if (existingByEmail) {
        existingByEmail.fullName = existingByEmail.fullName || "POS Walk-in Customer";
        existingByEmail.phone = existingByEmail.phone || "POS";
        existingByEmail.passwordHash = existingByEmail.passwordHash || "";
        existingByEmail.isActive = existingByEmail.isActive !== false;
        existingByEmail.updatedAt = now;
        return existingByEmail.id;
    }
    const existingById = (db.customerUsers || []).find((item) => String(item.id || "") === WALK_IN_CUSTOMER_ID);
    if (existingById) {
        existingById.email = existingById.email || WALK_IN_CUSTOMER_EMAIL;
        existingById.fullName = existingById.fullName || "POS Walk-in Customer";
        existingById.phone = existingById.phone || "POS";
        existingById.passwordHash = existingById.passwordHash || "";
        existingById.isActive = existingById.isActive !== false;
        existingById.updatedAt = now;
        return existingById.id;
    }
    db.customerUsers.push({
        id: WALK_IN_CUSTOMER_ID,
        fullName: "POS Walk-in Customer",
        email: WALK_IN_CUSTOMER_EMAIL,
        phone: "POS",
        passwordHash: "",
        isActive: true,
        createdAt: now,
        updatedAt: now,
    });
    return WALK_IN_CUSTOMER_ID;
}
function resolveRequestAdminId(db, req) {
    const tokenId = String(req.adminUser?.id || "").trim();
    if (tokenId && (db.adminUsers || []).some((admin) => String(admin.id || "") === tokenId))
        return tokenId;
    const email = String(req.adminUser?.email || "").trim().toLowerCase();
    const byEmail = (db.adminUsers || []).find((admin) => String(admin.email || "").trim().toLowerCase() === email && String(admin.id || "").trim());
    return byEmail?.id || tokenId || null;
}
function adminEntrant(req) {
    const name = String(req.adminUser?.name || "").trim();
    const email = String(req.adminUser?.email || "").trim();
    return name && email ? `${name} <${email}>` : email || name || "admin";
}
function normalizeSerialList(values) {
    const seen = new Set();
    return (Array.isArray(values) ? values : [])
        .map((value) => (0, db_1.normalizeSerialNumber)(value))
        .filter(Boolean)
        .filter((value) => {
        const key = value.toLowerCase();
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
function assertAndReserveSerials(db, product, orderItem, serialNumbers, order, soldAt) {
    const trackedSerials = (0, db_1.getProductSerialNumbers)(db, product.id);
    if (!trackedSerials.length) {
        orderItem.serialNumbers = [];
        return;
    }
    const selectedSerials = normalizeSerialList(serialNumbers);
    if (selectedSerials.length !== Number(orderItem.quantity || 0)) {
        throw new errorHandler_1.AppError(400, `${product.name} requires ${orderItem.quantity} serial number(s)`);
    }
    const availableByKey = new Map((0, db_1.getAvailableSerialNumbers)(db, product.id).map((item) => [(0, db_1.normalizeSerialNumber)(item.serialNumber).toLowerCase(), item]));
    const assigned = [];
    for (const serialNumber of selectedSerials) {
        const serial = availableByKey.get(serialNumber.toLowerCase());
        if (!serial)
            throw new errorHandler_1.AppError(400, `Serial number ${serialNumber} is not available for ${product.name}`);
        serial.status = "sold";
        serial.orderId = order.id;
        serial.orderItemId = orderItem.id;
        serial.soldAt = soldAt;
        assigned.push(serial.serialNumber);
    }
    orderItem.serialNumbers = assigned;
}
function normalizeTransactionReference(value) {
    const reference = String(value ?? "").trim();
    return reference || null;
}
function paymentNeedsTransactionReference(paymentMethod, paymentStatus) {
    return methodsRequiringTransactionReference.has(String(paymentMethod || "")) && String(paymentStatus || "") === "paid";
}
function slugify(value, fallbackId) {
    const slug = String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120);
    return `${slug || "pos-product"}-${String(fallbackId).slice(0, 8)}`;
}
function findSource(db, sourceId) {
    if (!sourceId)
        return null;
    return (db.productSources || []).find((item) => item.id === sourceId) || null;
}
function supplierCategory(_db) {
    return null;
}
function supplierExpenseExistsForProduct(db, productId) {
    const id = String(productId || "").trim();
    if (!id)
        return false;
    return (db.expenses || []).some((expense) => {
        const category = String(expense.category || "").toLowerCase();
        const categoryId = String(expense.categoryId || "");
        return String(expense.productId || "") === id && (category === "supplier" || categoryId === "expense-cat-supplier");
    });
}
function createInstantProduct(db, instant, quantity, serialNumbers, adminUserId, entrantName, now) {
    const id = (0, db_1.createId)();
    const category = (0, db_1.findCategoryById)(db, instant.categoryId);
    if (!category)
        throw new errorHandler_1.AppError(400, "Category is required for instant-sale products");
    const subcategory = instant.subcategory ? (0, db_1.findSubcategory)(db, instant.subcategory, category.id) : null;
    if (instant.subcategory && !subcategory)
        throw new errorHandler_1.AppError(400, "Selected subcategory does not belong to the selected category");
    const brand = (0, db_1.findBrand)(db, instant.brand);
    if (!brand)
        throw new errorHandler_1.AppError(400, "Brand is required for instant-sale products");
    const source = findSource(db, instant.sourceId);
    if (!source || source.isActive === false)
        throw new errorHandler_1.AppError(400, "Supplier/source is required for instant-sale products");
    const sourcePrice = Number(instant.sourcePrice || 0);
    const sellingPrice = Number(instant.sellingPrice || 0);
    if (sourcePrice <= 0)
        throw new errorHandler_1.AppError(400, "Source price is required for instant-sale products");
    if (sellingPrice <= 0)
        throw new errorHandler_1.AppError(400, "Selling price is required for instant-sale products");
    const normalizedSerials = normalizeSerialList(serialNumbers);
    const sourcePaymentStatus = instant.sourcePaymentStatus;
    const product = {
        id,
        name: instant.name,
        slug: slugify(instant.name, id),
        categoryId: category.id,
        subcategory: subcategory?.id || subcategory?.name || null,
        brand: brand.id || brand.name,
        barcode: instant.barcode || null,
        price: sellingPrice,
        originalPrice: null,
        condition: instant.condition || "new",
        description: instant.description || "Instant-sale/POS-only product",
        specs: {},
        warrantyText: instant.warrantyText || null,
        stockQuantity: quantity,
        totalStockReceived: quantity,
        inStock: quantity > 0,
        featured: false,
        premium: false,
        rating: 0,
        reviewCount: 0,
        images: [],
        sourceId: source.id,
        sourcePrice,
        sourcePaymentStatus,
        sourcedBy: entrantName || null,
        sourceDate: now.slice(0, 10),
        sourcingPaymentStatus: sourcePaymentStatus === "paid" ? "paid" : "pay_later",
        sourcingPaidAt: sourcePaymentStatus === "paid" ? now : null,
        sourcingPaidBy: sourcePaymentStatus === "paid" ? adminUserId || null : null,
        salesChannel: "pos_only",
        isCatalogVisible: false,
        serialNumbers: normalizedSerials,
        dataEntrant: adminUserId || null,
        entryDate: now,
        createdByAdminUserId: adminUserId || null,
        updatedByAdminUserId: adminUserId || null,
        createdAt: now,
        updatedAt: now,
    };
    db.products.push(product);
    for (const serialNumber of normalizedSerials) {
        db.productSerialNumbers.push({
            id: (0, db_1.createId)(),
            productId: product.id,
            serialNumber,
            status: "available",
            orderId: null,
            orderItemId: null,
            createdAt: now,
            soldAt: null,
        });
    }
    return product;
}
function buildOrderItem(db, product, source, rawItem, vatRate, now) {
    const quantity = Number(rawItem.quantity || 0);
    const sellingPrice = Number(product.price || rawItem.instantProduct?.sellingPrice || 0);
    const sourcePrice = Number(product.sourcePrice || rawItem.instantProduct?.sourcePrice || 0);
    const lineSubtotal = sellingPrice * quantity;
    const lineVat = vatRate > 0 ? Math.round(lineSubtotal * (vatRate / 100)) : 0;
    return {
        id: (0, db_1.createId)(),
        productId: product.id,
        productName: product.name,
        productBrand: product.brand || null,
        productBarcode: product.barcode || null,
        sourceId: product.sourceId || null,
        sourceName: source?.name || null,
        sourcePaymentStatus: product.sourcePaymentStatus || rawItem.instantProduct?.sourcePaymentStatus || "pending",
        quantity,
        unitPrice: sellingPrice,
        totalPrice: lineSubtotal + lineVat,
        unitSellingPrice: sellingPrice,
        totalSellingPrice: lineSubtotal,
        unitSourcePrice: sourcePrice,
        totalSourcePrice: sourcePrice * quantity,
        vatRate,
        vatAmount: lineVat,
        serialNumbers: normalizeSerialList(rawItem.serialNumbers),
        createdAt: now,
    };
}
function maybeCreateSupplierExpense(_db, _order, _orderItem, _checkout, _adminUserId, _entrantLabel, _now) {
    // Acquisition cost is recorded on the product/source payment fields only.
    // POS instant sale must not create supplier expense rows.
    return null;
}
function formatOrder(db, order) {
    const entrant = (db.adminUsers || []).find((item) => item.id === order.createdByAdminUserId);
    return {
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        transactionReference: order.transactionReference || null,
        subtotalAmount: order.subtotalAmount ?? order.totalAmount,
        vatRate: Number(order.vatRate || 0),
        vatAmount: Number(order.vatAmount || 0),
        totalAmount: order.totalAmount,
        deliveryName: order.deliveryName,
        deliveryPhone: order.deliveryPhone,
        deliveryEmail: order.deliveryEmail,
        deliveryAddress: order.deliveryAddress,
        notes: order.notes,
        isPosSale: Boolean(order.isPosSale),
        createdByAdminUserId: order.createdByAdminUserId || null,
        createdByName: entrant?.name || null,
        createdByEmail: entrant?.email || null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: (order.items || []).map((item) => {
            const product = (0, db_1.findProductById)(db, item.productId);
            return {
                id: item.id,
                productId: item.productId,
                productName: item.productName || product?.name || "Unknown product",
                productBrand: item.productBrand || product?.brand || null,
                productBarcode: item.productBarcode || product?.barcode || null,
                sourceId: item.sourceId || product?.sourceId || null,
                sourceName: item.sourceName || findSource(db, item.sourceId || product?.sourceId)?.name || null,
                sourcePaymentStatus: item.sourcePaymentStatus || product?.sourcePaymentStatus || null,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                unitSellingPrice: item.unitSellingPrice ?? item.unitPrice,
                totalSellingPrice: item.totalSellingPrice ?? item.totalPrice,
                unitSourcePrice: item.unitSourcePrice ?? product?.sourcePrice ?? 0,
                totalSourcePrice: item.totalSourcePrice ?? 0,
                vatRate: item.vatRate ?? 0,
                vatAmount: item.vatAmount ?? 0,
                serialNumbers: item.serialNumbers || [],
                product: product ? {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    image: product.images?.[0] || null,
                    stockQuantity: product.stockQuantity,
                    barcode: product.barcode || null,
                    salesChannel: product.salesChannel || "catalog",
                    isCatalogVisible: product.isCatalogVisible !== false,
                    availableSerialNumbers: (0, db_1.getAvailableSerialNumbers)(db, product.id).map((serial) => serial.serialNumber),
                } : undefined,
            };
        }),
    };
}
router.post("/checkout", async (req, res, next) => {
    try {
        const data = posCheckoutSchema.parse(req.body);
        const transactionReference = normalizeTransactionReference(data.transactionReference);
        if (paymentNeedsTransactionReference(data.paymentMethod, data.paymentStatus) && !transactionReference) {
            throw new errorHandler_1.AppError(400, "Transaction reference is required for paid M-Pesa, card, and bank transfer sales");
        }
        const db = await (0, db_1.readDb)();
        ensureCollections(db);
        const now = (0, db_1.nowIso)();
        const adminUserId = resolveRequestAdminId(db, req);
        const walkInCustomerId = ensurePosWalkInCustomer(db, now);
        const vatRate = data.vatEnabled ? Number(data.vatRate || 16) : 0;
        const items = data.items.map((rawItem) => {
            let product;
            if (rawItem.instantProduct) {
                product = createInstantProduct(db, rawItem.instantProduct, Number(rawItem.quantity || 0), rawItem.serialNumbers, adminUserId, adminEntrant(req), now);
            }
            else {
                product = (0, db_1.findProductById)(db, rawItem.productId);
            }
            if (!product)
                throw new errorHandler_1.AppError(400, "One or more scanned products no longer exist");
            if (!product.inStock || Number(product.stockQuantity || 0) <= 0) {
                throw new errorHandler_1.AppError(400, `${product.name} is out of stock`);
            }
            if (Number(rawItem.quantity) > Number(product.stockQuantity || 0)) {
                throw new errorHandler_1.AppError(400, `${product.name} only has ${product.stockQuantity} unit(s) left`);
            }
            const source = findSource(db, product.sourceId || rawItem.instantProduct?.sourceId);
            return buildOrderItem(db, product, source, rawItem, vatRate, now);
        });
        const itemsSubtotalAmount = items.reduce((sum, item) => sum + Number(item.totalSellingPrice || 0), 0);
        const discountAmount = Math.min(Math.max(Number(data.discountAmount || 0), 0), itemsSubtotalAmount);
        const otherCharges = Math.max(Number(data.otherCharges || 0), 0);
        const subtotalAmount = Math.max(0, itemsSubtotalAmount - discountAmount + otherCharges);
        const vatAmount = data.vatEnabled ? Math.round(subtotalAmount * (vatRate / 100)) : 0;
        const totalAmount = subtotalAmount + vatAmount;
        const customerName = String(data.customerName || "").trim() || "POS Walk-in Customer";
        const customerPhone = String(data.customerPhone || "").trim() || "POS";
        const checkoutNote = [`POS sale recorded by ${req.adminUser.email}`];
        if (data.vatEnabled)
            checkoutNote.push(`VAT ${vatRate}% applied`);
        if (data.note)
            checkoutNote.push(data.note);
        const orderId = (0, db_1.createId)();
        const order = {
            id: orderId,
            customerId: walkInCustomerId,
            status: "completed",
            paymentStatus: data.paymentStatus,
            paymentMethod: data.paymentMethod,
            transactionReference,
            subtotalAmount,
            vatRate,
            discountAmount,
            otherCharges,
            vatAmount,
            totalAmount,
            deliveryName: customerName,
            deliveryPhone: customerPhone,
            deliveryEmail: "",
            deliveryAddress: "In-store POS sale",
            notes: checkoutNote.join(" | "),
            isPosSale: true,
            createdByAdminUserId: adminUserId,
            dataEntrant: adminUserId,
            entryDate: now,
            createdAt: now,
            updatedAt: now,
            paymentEvents: data.paymentStatus === "paid" ? [{
                    id: (0, db_1.createId)(),
                    orderId,
                    eventType: "payment",
                    amount: totalAmount,
                    paymentMethod: data.paymentMethod,
                    reference: transactionReference,
                    note: "Initial POS payment recorded at checkout",
                    createdByAdminUserId: adminUserId,
                    dataEntrant: adminUserId,
                    entryDate: now,
                    createdAt: now,
                }] : [],
            returns: [],
            items,
        };
        db.orders.push(order);
        for (const item of items) {
            const product = (0, db_1.findProductById)(db, item.productId);
            if (!product)
                continue;
            assertAndReserveSerials(db, product, item, item.serialNumbers, order, now);
            const before = Number(product.stockQuantity || 0);
            const after = before - Number(item.quantity || 0);
            product.stockQuantity = after;
            product.inStock = after > 0;
            product.updatedAt = now;
            db.inventoryMovements.push({
                id: (0, db_1.createId)(),
                productId: product.id,
                orderId: order.id,
                adminUserId,
                type: "pos_sale",
                quantityChange: -Number(item.quantity || 0),
                quantityBefore: before,
                quantityAfter: after,
                note: data.note || `POS sale (${data.paymentMethod.replace(/_/g, " ")})${transactionReference ? ` ref ${transactionReference}` : ""}`,
                dataEntrant: adminUserId,
                entryDate: now,
                createdAt: now,
            });
            maybeCreateSupplierExpense(db, order, item, data, adminUserId, adminEntrant(req), now);
        }
        await (0, db_1.writeDb)(db);
        res.status(201).json({
            message: data.paymentStatus === "paid" ? "POS sale recorded and inventory updated" : "POS sale recorded with pending payment",
            order: formatOrder(db, order),
        });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=pos.js.map