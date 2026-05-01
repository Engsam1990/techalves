// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { readDb, writeDb, createId, nowIso, contains, findProductById } from "../../lib/db";
import { AppError } from "../../middleware/errorHandler";

const router = Router();
router.use(requireAuth);

const expenseSchema = z.object({
  categoryId: z.string().min(1),
  productId: z.string().optional().nullable(),
  sourceId: z.string().optional().nullable(),
  orderId: z.string().optional().nullable(),
  orderItemId: z.string().optional().nullable(),
  amount: z.coerce.number().min(0),
  expenseDate: z.string().trim().optional().nullable(),
  date: z.string().trim().optional().nullable(),
  paymentMethod: z.enum(["cash", "mpesa", "card", "bank_transfer", "other"]).optional().nullable(),
  reference: z.string().trim().max(120).optional().nullable(),
  description: z.string().trim().min(1, "Description is required").max(2000),
  details: z.string().trim().max(2000).optional().nullable(),
});

function adminEntrant(db, req) {
  const tokenId = String(req.adminUser?.id || "").trim();
  if (tokenId && (db.adminUsers || []).some((admin) => String(admin.id || "") === tokenId)) return tokenId;
  const email = String(req.adminUser?.email || "").trim().toLowerCase();
  const byEmail = (db.adminUsers || []).find((admin) => String(admin.email || "").trim().toLowerCase() === email && String(admin.id || "").trim());
  return byEmail?.id || tokenId || null;
}

function resolveAdminUser(db, ...refs) {
  for (const ref of refs) {
    const value = String(ref || "").trim();
    if (!value) continue;
    const lower = value.toLowerCase();
    const admin = (db.adminUsers || []).find((item) =>
      String(item.id || "").trim() === value ||
      String(item.email || "").trim().toLowerCase() === lower ||
      String(item.name || "").trim().toLowerCase() === lower
    );
    if (admin) return admin;
  }
  return null;
}

function adminDisplay(db, ...refs) {
  const admin = resolveAdminUser(db, ...refs);
  const fallback = refs.map((ref) => String(ref || "").trim()).find(Boolean) || null;
  return {
    id: admin?.id || fallback,
    name: admin?.name || null,
    email: admin?.email || (fallback && fallback.includes("@") ? fallback : null),
    label: admin ? (admin.name || admin.email || admin.id) : fallback,
  };
}

function categoryById(db, id) { return (db.expenseCategories || []).find((item) => item.id === id); }
function isSupplierCategory(category) { return String(category?.slug || "").toLowerCase() === "supplier"; }
function isSaleCategory(category) { return String(category?.slug || "").toLowerCase() === "sale"; }
function supplierExpenseExistsForProduct(db, productId, excludeExpenseId = null) {
  const id = String(productId || "").trim();
  if (!id) return false;
  return (db.expenses || []).some((expense) => {
    if (excludeExpenseId && String(expense.id) === String(excludeExpenseId)) return false;
    const category = String(expense.category || "").toLowerCase();
    const categoryId = String(expense.categoryId || "");
    return String(expense.productId || "") === id && (category === "supplier" || categoryId === "expense-cat-supplier");
  });
}
function saleExpenseExistsForOrderProduct(db, orderId, productId, orderItemId = null, excludeExpenseId = null) {
  const oid = String(orderId || "").trim();
  const pid = String(productId || "").trim();
  const itemId = String(orderItemId || "").trim();
  if (!oid || !pid) return false;
  return (db.expenses || []).some((expense) => {
    if (excludeExpenseId && String(expense.id) === String(excludeExpenseId)) return false;
    const category = String(expense.category || "").toLowerCase();
    const categoryId = String(expense.categoryId || "");
    if (!(category === "sale" || categoryId === "expense-cat-sale")) return false;
    if (String(expense.orderId || "") !== oid) return false;
    if (itemId) {
      if (String(expense.orderItemId || "") === itemId) return true;
      return !String(expense.orderItemId || "").trim() && String(expense.productId || "") === pid;
    }
    return String(expense.productId || "") === pid;
  });
}

function findOrderItemForExpense(order, productId, orderItemId = null) {
  const itemId = String(orderItemId || "").trim();
  const pid = String(productId || "").trim();
  const items = Array.isArray(order?.items) ? order.items : [];
  if (itemId) return items.find((item) => String(item.id || "") === itemId) || null;
  if (pid) return items.find((item) => String(item.productId || "") === pid) || null;
  return null;
}
function formatExpense(db, expense) {
  const category = categoryById(db, expense.categoryId);
  const source = (db.productSources || []).find((item) => item.id === expense.sourceId);
  const product = expense.productId ? findProductById(db, expense.productId) : null;
  const entrant = adminDisplay(db, expense.createdByAdminUserId, expense.dataEntrant, expense.createdBy);
  return {
    ...expense,
    categoryName: category?.name || expense.categoryName || expense.category,
    categorySlug: category?.slug || expense.category,
    sourceName: source?.name || expense.sourceName || null,
    productName: product?.name || null,
    dataEntrantId: entrant.id || null,
    dataEntrantName: entrant.name || null,
    dataEntrantEmail: entrant.email || null,
    dataEntrantLabel: entrant.label || null,
  };
}

router.get("/categories", async (_req, res, next) => {
  try {
    const db = await readDb();
    res.json((db.expenseCategories || []).filter((item) => item.isActive !== false && !["order", "supplier"].includes(String(item.slug || item.name || "").toLowerCase())));
  } catch (e) { next(e); }
});

router.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    const db = await readDb();
    const items = (db.expenses || [])
      .filter((expense) => String(expense.category || "").toLowerCase() !== "supplier" && String(expense.categoryId || "") !== "expense-cat-supplier")
      .filter((expense) => !q || [expense.details, expense.description, expense.reference, expense.category, expense.sourceName].some((value) => contains(value, q)))
      .sort((a, b) => new Date(b.expenseDate || b.date || b.createdAt).getTime() - new Date(a.expenseDate || a.date || a.createdAt).getTime())
      .map((expense) => formatExpense(db, expense));
    res.json(items);
  } catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
  try {
    const data = expenseSchema.parse(req.body);
    const db = await readDb();
    const category = categoryById(db, data.categoryId);
    if (!category) throw new AppError(400, "Expense category not found");
    if (isSupplierCategory(category)) {
      throw new AppError(400, "Supplier/product acquisition cost must be recorded through product sourcing, not Expenses");
    }
    const product = data.productId ? findProductById(db, data.productId) : null;
    if (data.productId && !product) throw new AppError(400, "Product not found");

    let sourceId = data.sourceId || null;
    if (isSupplierCategory(category)) {
      if (!product) throw new AppError(400, "Supplier expenses require a product");
      if (!product.sourceId) throw new AppError(400, "Selected product has no supplier/source assigned");
      if (sourceId && sourceId !== product.sourceId) throw new AppError(400, "Supplier/source must match the selected product source");
      if (supplierExpenseExistsForProduct(db, product.id)) throw new AppError(400, "This product already has a supplier/product acquisition expense recorded");
      sourceId = product.sourceId;
    }

    let orderItemId = data.orderItemId || null;
    if (isSaleCategory(category)) {
      if (!data.orderId) throw new AppError(400, "Sale expenses require an order");
      if (!product) throw new AppError(400, "Sale expenses require the product/accessory given to the customer");
      const order = (db.orders || []).find((item) => String(item.id) === String(data.orderId));
      if (!order) throw new AppError(400, "Order not found");

      const orderItem = findOrderItemForExpense(order, product.id, orderItemId);
      if (!orderItem) {
        throw new AppError(400, "Selected product/accessory does not belong to the selected sale/order");
      }
      if (String(orderItem.productId || "") !== String(product.id)) {
        throw new AppError(400, "Selected product/accessory does not match the selected sale/order item");
      }

      orderItemId = orderItem.id || orderItemId || null;
      if (!sourceId && orderItem.sourceId) sourceId = orderItem.sourceId;
      if (saleExpenseExistsForOrderProduct(db, data.orderId, product.id, orderItemId)) {
        throw new AppError(400, "This sale/order already has an expense for the selected product/accessory");
      }
    }

    if (sourceId && !(db.productSources || []).some((item) => item.id === sourceId)) throw new AppError(400, "Supplier/source not found");

    const now = nowIso();
    const expense = {
      id: createId(),
      categoryId: category.id,
      category: category.slug,
      productId: data.productId || null,
      sourceId,
      orderId: data.orderId || null,
      orderItemId,
      amount: Number(data.amount || 0),
      expenseDate: data.expenseDate || data.date || now.slice(0, 10),
      date: data.expenseDate || data.date || now.slice(0, 10),
      paymentStatus: "paid",
      paymentMethod: data.paymentMethod || null,
      reference: data.reference || null,
      description: data.description,
      details: data.details || data.description || category.name,
      createdByAdminUserId: adminEntrant(db, req),
      dataEntrant: adminEntrant(db, req),
      entryDate: now,
      createdAt: now,
      updatedAt: now,
    };
    db.expenses = [expense, ...(db.expenses || [])];
    await writeDb(db);
    res.status(201).json(formatExpense(db, expense));
  } catch (e) { next(e); }
});

export default router;
