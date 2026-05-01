// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler";
import { requireCustomerAuth } from "../middleware/auth";
import { readDb, writeDb, executeDb, createId, nowIso, findProductById, findBrand, getOrCreateCart, sortByDateDesc } from "../lib/db";
const router = Router();
router.use(requireCustomerAuth);
function getProductBrandName(db, product) { const brand = findBrand(db, product?.brand); return brand?.name || String(product?.brand || "").trim() || null; }
function getProductSource(db, product) { return product?.sourceId ? (db.productSources || []).find((item) => item.id === product.sourceId) : null; }
function customerLabel(req) { const name = String(req.customerUser?.fullName || req.customerUser?.name || "").trim(); const email = String(req.customerUser?.email || "").trim(); return name && email ? `${name} <${email}>` : email || name || "customer"; }
const checkoutSchema = z.object({ items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(10) })).min(1), deliveryName: z.string().min(2).max(120), deliveryPhone: z.string().min(6).max(40), deliveryEmail: z.string().email(), deliveryAddress: z.string().min(5).max(500), notes: z.string().optional(), paymentMethod: z.enum(["cash_on_delivery", "mpesa", "bank_transfer"]) });
function formatOrder(db, order) { return { id: order.id, status: order.status, paymentStatus: order.paymentStatus, paymentMethod: order.paymentMethod, transactionReference: order.transactionReference || null, totalAmount: order.totalAmount, deliveryName: order.deliveryName, deliveryPhone: order.deliveryPhone, deliveryEmail: order.deliveryEmail, deliveryAddress: order.deliveryAddress, notes: order.notes, createdAt: order.createdAt, items: (order.items || []).map((item) => { const product = findProductById(db, item.productId); return { id: item.id, productId: item.productId, quantity: item.quantity, unitPrice: item.unitPrice, totalPrice: item.totalPrice, serialNumbers: item.serialNumbers || [], product: product ? { id: product.id, name: product.name, slug: product.slug, image: product.images?.[0] || null } : undefined }; }) }; }
router.get("/mine", async (req, res, next) => { try { const db = await readDb(); const orders = sortByDateDesc(db.orders.filter((item) => item.customerId === req.customerUser.id)); res.json(orders.map((item) => formatOrder(db, item))); } catch (e) { next(e); } });
router.post("/checkout", async (req, res, next) => {
  try {
    const data = checkoutSchema.parse(req.body);
    const db = await readDb();
    const customerId = req.customerUser.id;
    const now = nowIso();
    const customerText = customerLabel(req);

    const items = data.items.map((item) => {
      const product = findProductById(db, item.productId);
      if (!product) throw new AppError(400, "One or more products no longer exist");
      if (!product.inStock || product.stockQuantity <= 0) throw new AppError(400, `${product.name} is out of stock`);
      if (item.quantity > product.stockQuantity) throw new AppError(400, `${product.name} does not have enough stock for quantity ${item.quantity}`);

      const source = getProductSource(db, product);
      const unitSourcePrice = Number(product.sourcePrice || 0);
      const unitSellingPrice = Number(product.price || 0);

      return {
        id: createId(),
        productId: product.id,
        productName: product.name,
        productBrand: getProductBrandName(db, product),
        productBarcode: product.barcode || null,
        sourceId: product.sourceId || null,
        sourceName: source?.name || product.sourcedFrom || null,
        sourcePaymentStatus: product.sourcePaymentStatus || product.sourcingPaymentStatus || "pending",
        quantity: item.quantity,
        unitPrice: unitSellingPrice,
        totalPrice: unitSellingPrice * item.quantity,
        unitSellingPrice,
        totalSellingPrice: unitSellingPrice * item.quantity,
        unitSourcePrice,
        totalSourcePrice: unitSourcePrice * item.quantity,
        vatRate: 0,
        vatAmount: 0,
        serialNumbers: [],
        dataEntrant: null,
        entryDate: now,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const order = {
      id: createId(),
      customerId,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: data.paymentMethod,
      transactionReference: null,
      subtotalAmount: totalAmount,
      vatRate: 0,
      vatAmount: 0,
      discountAmount: 0,
      otherCharges: 0,
      totalAmount,
      deliveryName: data.deliveryName,
      deliveryPhone: data.deliveryPhone,
      deliveryEmail: data.deliveryEmail,
      deliveryAddress: data.deliveryAddress,
      notes: data.notes ? `${data.notes} | Placed by ${customerText}` : `Placed by ${customerText}`,
      isPosSale: false,
      createdByAdminUserId: null,
      // data_entrant has an admin_users FK in production, so customer orders must not write customer text here.
      dataEntrant: null,
      entryDate: now,
      createdAt: now,
      updatedAt: now,
      items,
    };

    db.orders.push(order);

    // Online checkout creates a pending order only. Stock is deducted exactly once when an admin confirms the order.
    const cart = getOrCreateCart(db, customerId);
    cart.items = [];
    cart.updatedAt = now;

    await writeDb(db);
    await executeDb("DELETE FROM `cart_items` WHERE `cart_id` = ?", [cart.id]);

    res.status(201).json({
      message: data.paymentMethod === "mpesa"
        ? "Order placed successfully. An M-Pesa payment prompt can be initiated from the admin side."
        : "Order placed successfully",
      order: formatOrder(db, order),
    });
  } catch (e) {
    next(e);
  }
});
router.get("/:id", async (req, res, next) => { try { const db = await readDb(); const order = db.orders.find((item) => item.id === String(req.params.id) && item.customerId === req.customerUser.id); if (!order) throw new AppError(404, "Order not found"); res.json(formatOrder(db, order)); } catch (e) { next(e); } });
export default router;
