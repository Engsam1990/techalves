// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler";
import { requireCustomerAuth } from "../middleware/auth";
import { readDb, writeDb, executeDb, getOrCreateCart, nowIso, findProductById, createId } from "../lib/db";

const router = Router();
router.use(requireCustomerAuth);

const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(10),
});

const quantitySchema = z.object({
  quantity: z.coerce.number().int().min(1).max(10),
});

const mergeSchema = z.object({
  items: z.array(cartItemSchema).default([]),
});

function unwrapBody(body: any) {
  if (body === null || body === undefined) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  if (typeof body !== "object") return {};
  return body;
}

function normalizeCartItemBody(body: any) {
  const source = unwrapBody(body);
  const candidate = source.item ?? source.data ?? source.payload ?? source;
  return {
    productId: candidate?.productId ?? candidate?.product?.id,
    quantity: candidate?.quantity ?? 1,
  };
}

function formatCart(db: any, cart: any) {
  const items = (cart.items || [])
    .map((item: any) => {
      const product = findProductById(db, item.productId);
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
    itemCount: items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0),
    subtotal: items.reduce(
      (sum: number, item: any) => sum + Number(item.product.price || 0) * Number(item.quantity || 0),
      0
    ),
  };
}

router.get("/", async (req, res, next) => {
  try {
    const db = await readDb();
    const cart = getOrCreateCart(db, req.customerUser.id);
    await writeDb(db);
    res.json(formatCart(db, cart));
  } catch (e) {
    next(e);
  }
});

router.post("/items", async (req, res, next) => {
  try {
    const data = cartItemSchema.parse(normalizeCartItemBody(req.body));
    const db = await readDb();
    const cart = getOrCreateCart(db, req.customerUser.id);
    const product = findProductById(db, data.productId);

    if (!product) throw new AppError(404, "Product not found");
    if (!product.inStock || Number(product.stockQuantity || 0) <= 0) {
      throw new AppError(400, `${product.name} is out of stock`);
    }

    const existing = (cart.items || []).find((item: any) => item.productId === data.productId);
    const nextQuantity = Math.min(Number(existing?.quantity || 0) + Number(data.quantity), 10);

    if (nextQuantity > Number(product.stockQuantity || 0)) {
      throw new AppError(400, `Only ${product.stockQuantity} unit(s) can be added for ${product.name}`);
    }

    if (existing) {
      existing.quantity = nextQuantity;
      existing.updatedAt = nowIso();
    } else {
      cart.items.push({
        id: createId(),
        productId: data.productId,
        quantity: Number(data.quantity),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
    }

    cart.updatedAt = nowIso();
    await writeDb(db);
    res.status(201).json(formatCart(db, cart));
  } catch (e) {
    next(e);
  }
});

router.put("/items/:productId", async (req, res, next) => {
  try {
    const data = quantitySchema.parse(unwrapBody(req.body));
    const db = await readDb();
    const cart = getOrCreateCart(db, req.customerUser.id);
    const cartItem = (cart.items || []).find((item: any) => item.productId === String(req.params.productId));

    if (!cartItem) throw new AppError(404, "Cart item not found");

    const product = findProductById(db, cartItem.productId);
    if (!product) throw new AppError(404, "Product not found");
    if (Number(data.quantity) > Number(product.stockQuantity || 0)) {
      throw new AppError(400, `Only ${product.stockQuantity} unit(s) available for ${product.name}`);
    }

    cartItem.quantity = Number(data.quantity);
    cartItem.updatedAt = nowIso();
    cart.updatedAt = nowIso();
    await writeDb(db);
    res.json(formatCart(db, cart));
  } catch (e) {
    next(e);
  }
});

router.delete("/items/:productId", async (req, res, next) => {
  try {
    const db = await readDb();
    const cart = getOrCreateCart(db, req.customerUser.id);
    cart.items = (cart.items || []).filter((item: any) => item.productId !== String(req.params.productId));
    cart.updatedAt = nowIso();
    await writeDb(db);
    await executeDb("DELETE FROM `cart_items` WHERE `cart_id` = ? AND `product_id` = ?", [cart.id, String(req.params.productId)]);
    res.json(formatCart(db, cart));
  } catch (e) {
    next(e);
  }
});

router.delete("/clear", async (req, res, next) => {
  try {
    const db = await readDb();
    const cart = getOrCreateCart(db, req.customerUser.id);
    cart.items = [];
    cart.updatedAt = nowIso();
    await writeDb(db);
    await executeDb("DELETE FROM `cart_items` WHERE `cart_id` = ?", [cart.id]);
    res.json(formatCart(db, cart));
  } catch (e) {
    next(e);
  }
});

router.post("/merge", async (req, res, next) => {
  try {
    const source = unwrapBody(req.body);
    const data = mergeSchema.parse({
      items: Array.isArray(source.items) ? source.items.map(normalizeCartItemBody) : [],
    });
    const db = await readDb();
    const cart = getOrCreateCart(db, req.customerUser.id);

    for (const item of data.items) {
      const product = findProductById(db, item.productId);
      if (!product || !product.inStock || Number(product.stockQuantity || 0) <= 0) continue;

      const existing = (cart.items || []).find((cartItem: any) => cartItem.productId === item.productId);
      const mergedQuantity = Math.min(
        Number(existing?.quantity || 0) + Number(item.quantity),
        10,
        Number(product.stockQuantity || 0)
      );

      if (existing) {
        existing.quantity = mergedQuantity;
        existing.updatedAt = nowIso();
      } else {
        cart.items.push({
          id: createId(),
          productId: item.productId,
          quantity: mergedQuantity,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        });
      }
    }

    cart.updatedAt = nowIso();
    await writeDb(db);
    res.json(formatCart(db, cart));
  } catch (e) {
    next(e);
  }
});

export default router;
