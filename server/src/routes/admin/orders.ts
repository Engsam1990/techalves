// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdminPermission, hasAdminPermission } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import { readDb, writeDb, createId, nowIso, contains, sortByDateDesc, findProductById, getProductSerialNumbers, getAvailableSerialNumbers, normalizeSerialNumber } from "../../lib/db";

const router = Router();
router.use(requireAuth);
router.use(requireAdminPermission("orders:view"));

const listQuerySchema = z.object({
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  paymentMethod: z.string().optional(),
  financeIssue: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(20),
});

const methodsRequiringTransactionReference = new Set(["mpesa", "card", "bank_transfer"]);

function adminEntrant(req) {
  const name = String(req.adminUser?.name || "").trim();
  const email = String(req.adminUser?.email || "").trim();
  return name && email ? `${name} <${email}>` : email || name || "admin";
}

function adminEntrantId(req, db = null) {
  const tokenId = String(req.adminUser?.id || "").trim();
  if (tokenId && (!db || (db.adminUsers || []).some((admin) => String(admin.id || "") === tokenId))) return tokenId;
  const email = String(req.adminUser?.email || "").trim().toLowerCase();
  const byEmail = (db?.adminUsers || []).find((admin) => String(admin.email || "").trim().toLowerCase() === email && String(admin.id || "").trim());
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

function adminScopeValues(req) {
  return [req.adminUser?.id, req.adminUser?.email, req.adminUser?.name]
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);
}

function isOwnAdminRecord(req, record, ...extraRefs) {
  const scopeValues = adminScopeValues(req);
  const refs = [
    record?.createdByAdminUserId,
    record?.dataEntrant,
    record?.createdBy,
    ...extraRefs,
  ].map((value) => String(value || "").trim().toLowerCase());
  return refs.some((ref) => ref && scopeValues.includes(ref));
}

const updateOrderSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "completed", "delivered", "cancelled"]).optional(),
  paymentStatus: z.enum(["pending", "partial", "paid", "failed", "refunded"]).optional(),
  transactionReference: z.string().trim().max(120).optional().nullable(),
  itemSerialNumbers: z.record(z.array(z.string().trim().min(1).max(191))).optional(),
  note: z.string().max(500).optional(),
}).refine((value) => value.status !== undefined || value.paymentStatus !== undefined || value.transactionReference !== undefined, {
  message: "Provide at least one field to update",
});

const paymentEventSchema = z.object({
  eventType: z.enum(["payment", "partial_payment", "refund", "payment_status_change", "adjustment"]).default("payment"),
  amount: z.coerce.number().min(0).default(0),
  paymentMethod: z.enum(["cash_on_delivery", "mpesa", "bank_transfer", "cash", "card", "other"]).optional().nullable(),
  reference: z.string().trim().max(120).optional().nullable(),
  note: z.string().trim().max(500).optional().nullable(),
});

const returnItemSchema = z.object({
  orderItemId: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(1),
  serialNumbers: z.array(z.string().trim().min(1).max(191)).optional(),
});

const orderReturnSchema = z.object({
  items: z.array(returnItemSchema).min(1),
  restoreStock: z.boolean().default(true),
  refundAmount: z.coerce.number().min(0).default(0),
  refundMethod: z.enum(["cash_on_delivery", "mpesa", "bank_transfer", "cash", "card", "other"]).optional().nullable(),
  reference: z.string().trim().max(120).optional().nullable(),
  reason: z.string().trim().max(500).optional().nullable(),
});

function shouldDeductInventory(prevStatus, nextStatus) {
  return prevStatus === "pending" && nextStatus === "confirmed";
}

function orderAlreadyHasStockDeduction(db, orderId) {
  return (db.inventoryMovements || []).some((movement) =>
    String(movement.orderId || "") === String(orderId) &&
    Number(movement.quantityChange || 0) < 0 &&
    ["customer_checkout", "order_deducted", "pos_sale"].includes(String(movement.type || ""))
  );
}

function shouldRestoreInventory(prevStatus, nextStatus) {
  return ["confirmed", "processing", "completed", "delivered"].includes(prevStatus) && nextStatus === "cancelled";
}

function normalizeTransactionReference(value) {
  const reference = String(value ?? "").trim();
  return reference || null;
}

function paymentNeedsTransactionReference(paymentMethod, paymentStatus) {
  return methodsRequiringTransactionReference.has(String(paymentMethod || "")) && String(paymentStatus || "") === "paid";
}

function parseDateBoundary(value, boundary) {
  const text = String(value || "").trim();
  if (!text) return null;

  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(text)
    ? new Date(`${text}T${boundary === "start" ? "00:00:00.000" : "23:59:59.999"}Z`)
    : new Date(text);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isOrderInDateWindow(order, startDate, endDate) {
  const timestamp = new Date(order.createdAt).getTime();
  if (Number.isNaN(timestamp)) return false;
  if (startDate && timestamp < startDate.getTime()) return false;
  if (endDate && timestamp > endDate.getTime()) return false;
  return true;
}

function orderMatchesFinanceIssue(db, order, issueKey) {
  const key = String(issueKey || "").trim();
  if (!key) return true;

  if (key === "open") return buildOrderIssues(db, order).length > 0;
  return buildOrderIssues(db, order).some((issue) => issue.key === key);
}

function activePaymentEvents(order) {
  return (order.paymentEvents || []).filter((event) => !["payment_status_change"].includes(String(event.eventType || "")));
}

function summarizeOrderPayments(order, fallbackTotalDue = 0) {
  const storedTotalDue = Number(order.totalAmount || 0);
  const calculatedTotalDue = Number(fallbackTotalDue || 0);
  const totalDue = storedTotalDue > 0 ? storedTotalDue : Math.max(0, calculatedTotalDue);
  const events = activePaymentEvents(order);
  const hasCollectionEvents = events.some((event) => ["payment", "partial_payment"].includes(String(event.eventType || "")));
  const hasRefundEvents = events.some((event) => String(event.eventType || "") === "refund");

  let paidAmount = events
    .filter((event) => ["payment", "partial_payment"].includes(String(event.eventType || "")))
    .reduce((sum, event) => sum + Number(event.amount || 0), 0);
  const refundedAmount = events
    .filter((event) => String(event.eventType || "") === "refund")
    .reduce((sum, event) => sum + Number(event.amount || 0), 0);

  // Older POS sales were saved as paymentStatus="paid" but did not get an initial
  // paymentEvents row. For reporting/listing, treat those paid orders as fully paid
  // so the UI does not show "Paid KSh 0" while the status says paid.
  if (!hasCollectionEvents && !hasRefundEvents && String(order.paymentStatus || "") === "paid" && totalDue > 0) {
    paidAmount = totalDue;
  }

  const netPaidAmount = Math.max(0, paidAmount - refundedAmount);
  const balanceAmount = Math.max(0, totalDue - netPaidAmount);

  return {
    totalDue,
    paidAmount,
    refundedAmount,
    netPaidAmount,
    balanceAmount,
    isFullyPaid: totalDue > 0 && netPaidAmount >= totalDue,
    isPartiallyPaid: netPaidAmount > 0 && netPaidAmount < totalDue,
    isFullyRefunded: totalDue > 0 && refundedAmount >= totalDue,
  };
}

function inferPaymentStatus(order) {
  const summary = summarizeOrderPayments(order);
  if (summary.isFullyRefunded) return "refunded";
  if (summary.isFullyPaid) return "paid";
  if (summary.isPartiallyPaid) return "partial";
  return order.paymentStatus === "failed" ? "failed" : "pending";
}

function returnedQuantityByOrderItem(order) {
  const totals = new Map();
  for (const entry of order.returns || []) {
    for (const item of entry.items || []) {
      const key = String(item.orderItemId || "");
      if (!key) continue;
      totals.set(key, Number(totals.get(key) || 0) + Number(item.quantity || 0));
    }
  }
  return totals;
}

function buildOrderIssues(db, order) {
  const status = normalizeOrderStatus(db, order);
  const paymentStatus = String(order.paymentStatus || "");
  const active = status !== "cancelled";
  const issues = [];

  if (active && paymentStatus === "pending") {
    issues.push({
      key: "pending_payments",
      title: "Pending payment",
      message: "Payment is still pending. Confirm collection before fulfilment is closed.",
      severity: "warning",
    });
  }

  if (active && ["pending", "confirmed", "processing"].includes(status)) {
    issues.push({
      key: "fulfillment_backlog",
      title: "Fulfilment backlog",
      message: "Order still needs confirmation, processing, completion, or delivery follow-up.",
      severity: "warning",
    });
  }

  if (paymentStatus === "partial") {
    const summary = summarizeOrderPayments(order);
    issues.push({
      key: "partial_payments",
      title: "Partially paid",
      message: `Customer has paid ${summary.netPaidAmount} of ${summary.totalDue}. Balance collection is still pending.`,
      severity: "warning",
    });
  }

  if ((order.returns || []).length > 0) {
    issues.push({
      key: "returned_items",
      title: "Returned item history",
      message: "This order has return/refund records. Review stock restoration and customer refund notes.",
      severity: "warning",
    });
  }

  if (paymentStatus === "failed") {
    issues.push({
      key: "failed_payments",
      title: "Failed payment",
      message: "Payment failed. Follow up with the customer before processing this order.",
      severity: "destructive",
    });
  }

  if (
    active &&
    paymentStatus === "paid" &&
    paymentNeedsTransactionReference(order.paymentMethod, paymentStatus) &&
    !String(order.transactionReference || "").trim()
  ) {
    issues.push({
      key: "missing_references",
      title: "Missing transaction reference",
      message: "This paid digital-payment order has no M-Pesa, card, or bank transfer reference recorded.",
      severity: "destructive",
    });
  }

  if (active && paymentStatus === "paid" && !["completed", "delivered"].includes(status)) {
    issues.push({
      key: "paid_not_completed",
      title: "Paid but not completed",
      message: "Payment is complete, but fulfilment is still not completed or delivered.",
      severity: "warning",
    });
  }

  if (paymentStatus === "refunded") {
    issues.push({
      key: "refunded_orders",
      title: "Refunded order",
      message: "This order is marked as refunded. Confirm stock and customer follow-up are complete.",
      severity: "warning",
    });
  }

  return issues;
}

function normalizeSerialList(values) {
  const seen = new Set();
  return (Array.isArray(values) ? values : [])
    .map((value) => normalizeSerialNumber(value))
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function assignOrderItemSerials(db, product, order, item, requestedSerialNumbers, soldAt, reservedSerialKeys = new Set()) {
  const trackedSerials = getProductSerialNumbers(db, product.id);
  if (!trackedSerials.length) {
    item.serialNumbers = [];
    return;
  }

  const selectedSerials = normalizeSerialList(requestedSerialNumbers);
  if (selectedSerials.length !== Number(item.quantity || 0)) {
    throw new AppError(400, `${product.name} requires ${item.quantity} serial number(s) before confirmation`);
  }

  const trackedByKey = new Map(
    trackedSerials.map((serial) => [normalizeSerialNumber(serial.serialNumber).toLowerCase(), serial])
  );

  const availableByKey = new Map(
    getAvailableSerialNumbers(db, product.id)
      .filter((serial) => !reservedSerialKeys.has(normalizeSerialNumber(serial.serialNumber).toLowerCase()))
      .map((serial) => [normalizeSerialNumber(serial.serialNumber).toLowerCase(), serial])
  );

  const assigned = [];
  for (const serialNumber of selectedSerials) {
    const serialKey = serialNumber.toLowerCase();

    if (reservedSerialKeys.has(serialKey)) {
      throw new AppError(400, `Serial number ${serialNumber} is already used in this order`);
    }

    const serial = availableByKey.get(serialKey);
    if (!serial) {
      if (trackedByKey.has(serialKey)) {
        throw new AppError(400, `Serial number ${serialNumber} has already been sold for ${product.name}`);
      }

      throw new AppError(400, `Serial number ${serialNumber} is not available for ${product.name}`);
    }

    serial.status = "sold";
    serial.orderId = order.id;
    serial.orderItemId = item.id;
    serial.soldAt = soldAt;
    reservedSerialKeys.add(serialKey);
    assigned.push(serial.serialNumber);
  }
  item.serialNumbers = assigned;
}

function releaseOrderSerials(db, order) {
  for (const item of order.items || []) {
    item.serialNumbers = [];
  }
}

function findCustomerByOrder(db, order) {
  return db.customerUsers.find((item) => item.id === order.customerId);
}

function isWalkInOrder(db, order) {
  return !findCustomerByOrder(db, order) && String(order.deliveryAddress || "").trim() === "In-store POS sale";
}

function normalizeOrderStatus(db, order) {
  return isWalkInOrder(db, order) && order.status === "delivered" ? "completed" : order.status;
}

function formatOrder(db, order) {
  const customer = findCustomerByOrder(db, order);
  const isWalkInCustomer = isWalkInOrder(db, order);
  const entrant = adminDisplay(db, order.createdByAdminUserId, order.dataEntrant, order.createdBy);
  const returnedQuantities = returnedQuantityByOrderItem(order);
  const items = (order.items || []).map((item) => {
    const product = findProductById(db, item.productId);
    const sourceId = item.sourceId || product?.sourceId || null;
    const source = sourceId ? (db.productSources || []).find((row) => row.id === sourceId) : null;
    const quantity = Number(item.quantity || 0);
    const unitSellingPrice = Number(item.unitSellingPrice ?? item.unitPrice ?? product?.price ?? 0);
    const totalSellingPrice = Number(item.totalSellingPrice ?? unitSellingPrice * quantity);
    const unitSourcePrice = Number(item.unitSourcePrice ?? product?.sourcePrice ?? 0);
    const totalSourcePrice = Number(item.totalSourcePrice ?? unitSourcePrice * quantity);
    const vatAmount = Number(item.vatAmount || 0);
    const grossProfit = totalSellingPrice - totalSourcePrice;

    return {
      id: item.id,
      productId: item.productId,
      productName: item.productName || product?.name || "Unknown product",
      productBrand: item.productBrand || product?.brand || null,
      productBarcode: item.productBarcode || product?.barcode || null,
      brand: item.productBrand || product?.brand || null,
      barcode: item.productBarcode || product?.barcode || null,
      quantity,
      unitPrice: Number(item.unitPrice ?? unitSellingPrice),
      totalPrice: Number(item.totalPrice ?? totalSellingPrice + vatAmount),
      unitSellingPrice,
      totalSellingPrice,
      unitSourcePrice,
      totalSourcePrice,
      sourcePrice: unitSourcePrice,
      sourceCost: totalSourcePrice,
      sourceId,
      sourceName: item.sourceName || source?.name || null,
      sourcePaymentStatus: item.sourcePaymentStatus || product?.sourcePaymentStatus || null,
      vatRate: Number(item.vatRate || order.vatRate || 0),
      vatAmount,
      grossProfit,
      returnedQuantity: Number(returnedQuantities.get(String(item.id)) || 0),
      returnableQuantity: Math.max(0, quantity - Number(returnedQuantities.get(String(item.id)) || 0)),
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
        availableSerialNumbers: getAvailableSerialNumbers(db, product.id).map((serial) => serial.serialNumber),
      } : undefined,
    };
  });

  const totalSourcePrice = items.reduce((sum, item) => sum + Number(item.totalSourcePrice || 0), 0);
  const totalSellingPrice = items.reduce((sum, item) => sum + Number(item.totalSellingPrice || 0), 0);
  const itemVatAmount = items.reduce((sum, item) => sum + Number(item.vatAmount || 0), 0);
  const storedVatAmount = Number(order.vatAmount || 0);
  const totalVatAmount = storedVatAmount > 0 ? storedVatAmount : itemVatAmount;
  const discountAmount = Math.max(0, Number(order.discountAmount || 0));
  const otherCharges = Math.max(0, Number(order.otherCharges || 0));
  const calculatedSubtotalAmount = Math.max(0, totalSellingPrice - discountAmount + otherCharges);
  const storedSubtotalAmount = Number(order.subtotalAmount || 0);
  const subtotalAmount = storedSubtotalAmount > 0 ? storedSubtotalAmount : calculatedSubtotalAmount;
  const storedTotalAmount = Number(order.totalAmount || 0);
  const effectiveTotalAmount = storedTotalAmount > 0 ? storedTotalAmount : subtotalAmount + totalVatAmount;
  const paymentSummary = summarizeOrderPayments(order, effectiveTotalAmount);
  const paymentEvents = (order.paymentEvents || []).map((event) => {
    const entrant = adminDisplay(db, event.createdByAdminUserId, event.dataEntrant);
    return {
      id: event.id,
      orderId: event.orderId || order.id,
      eventType: event.eventType || "payment",
      amount: Number(event.amount || 0),
      paymentMethod: event.paymentMethod || null,
      reference: event.reference || null,
      note: event.note || null,
      createdAt: event.createdAt,
      dataEntrantId: entrant.id || null,
      dataEntrantName: entrant.name || null,
      dataEntrantEmail: entrant.email || null,
      dataEntrant: entrant.label || null,
    };
  });
  const returns = (order.returns || []).map((entry) => {
    const entrant = adminDisplay(db, entry.createdByAdminUserId, entry.dataEntrant);
    return {
      id: entry.id,
      orderId: entry.orderId || order.id,
      items: Array.isArray(entry.items) ? entry.items : [],
      restoreStock: entry.restoreStock !== false,
      refundAmount: Number(entry.refundAmount || 0),
      refundMethod: entry.refundMethod || null,
      reference: entry.reference || null,
      reason: entry.reason || null,
      createdAt: entry.createdAt,
      dataEntrantId: entrant.id || null,
      dataEntrantName: entrant.name || null,
      dataEntrantEmail: entrant.email || null,
      dataEntrant: entrant.label || null,
    };
  });

  return {
    id: order.id,
    status: normalizeOrderStatus(db, order),
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    transactionReference: order.transactionReference || null,
    subtotalAmount,
    vatRate: Number(order.vatRate || 0),
    vatAmount: totalVatAmount,
    discountAmount,
    otherCharges,
    totalAmount: effectiveTotalAmount,
    totalSourcePrice,
    totalSellingPrice,
    grossProfit: totalSellingPrice - totalSourcePrice,
    paymentSummary,
    paymentEvents,
    returns,
    deliveryName: order.deliveryName,
    deliveryPhone: order.deliveryPhone,
    deliveryEmail: order.deliveryEmail,
    deliveryAddress: order.deliveryAddress,
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    isWalkInCustomer,
    isPosSale: Boolean(order.isPosSale),
    createdByAdminUserId: order.createdByAdminUserId || null,
    createdByName: entrant.name || null,
    createdByEmail: entrant.email || null,
    dataEntrantId: entrant.id || order.createdByAdminUserId || order.dataEntrant || null,
    dataEntrantName: entrant.name || null,
    dataEntrantEmail: entrant.email || null,
    dataEntrant: entrant.label || order.dataEntrant || null,
    issues: buildOrderIssues(db, order),
    customer: customer ? {
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
    } : undefined,
    items,
  };
}
router.get("/", async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const db = await readDb();

    const startDate = parseDateBoundary(query.start, "start");
    const endDate = parseDateBoundary(query.end, "end");

    let items = sortByDateDesc(db.orders).filter((item) =>
      (!query.status || normalizeOrderStatus(db, item) === query.status) &&
      (!query.paymentStatus || item.paymentStatus === query.paymentStatus) &&
      (!query.paymentMethod || item.paymentMethod === query.paymentMethod) &&
      (!query.financeIssue || orderMatchesFinanceIssue(db, item, query.financeIssue)) &&
      isOrderInDateWindow(item, startDate, endDate)
    );

    if (!hasAdminPermission(req.adminUser, "orders:view_all")) {
      items = items.filter((order) => isOwnAdminRecord(req, order));
    }

    if (query.q) {
      items = items.filter((order) => {
        const customer = findCustomerByOrder(db, order);
        const entrant = adminDisplay(db, order.createdByAdminUserId, order.dataEntrant, order.createdBy);
        return [order.id, order.deliveryName, order.deliveryPhone, order.deliveryEmail, order.transactionReference, entrant.name, entrant.email, entrant.id, entrant.label, customer?.email, customer?.fullName]
          .some((value) => contains(value, query.q));
      });
    }

    const total = items.length;
    const start = (query.page - 1) * query.limit;
    const paged = items.slice(start, start + query.limit);

    res.json({
      data: paged.map((item) => formatOrder(db, item)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const db = await readDb();
    const order = db.orders.find((item) => item.id === String(req.params.id));
    if (!order) throw new AppError(404, "Order not found");
    if (!hasAdminPermission(req.adminUser, "orders:view_all") && !isOwnAdminRecord(req, order)) {
      throw new AppError(403, "You can only view orders tied to your admin activity");
    }
    res.json(formatOrder(db, order));
  } catch (e) {
    next(e);
  }
});

function appendPaymentEvent(order, data, req, db) {
  const now = nowIso();
  const event = {
    id: createId(),
    orderId: order.id,
    eventType: data.eventType || "payment",
    amount: Number(data.amount || 0),
    paymentMethod: data.paymentMethod || order.paymentMethod || null,
    reference: normalizeTransactionReference(data.reference),
    note: data.note || null,
    createdByAdminUserId: adminEntrantId(req, db),
    dataEntrant: adminEntrantId(req, db),
    entryDate: now,
    createdAt: now,
  };
  order.paymentEvents = [event, ...(order.paymentEvents || [])];
  return event;
}

function updateOrderPaymentStatusFromEvents(order) {
  const inferred = inferPaymentStatus(order);
  order.paymentStatus = inferred;
  return inferred;
}

router.post("/:id/payment-events", async (req, res, next) => {
  try {
    const data = paymentEventSchema.parse(req.body || {});
    const requiredPermission = data.eventType === "refund" ? "orders:refund" : "orders:record_payment";
    if (!hasAdminPermission(req.adminUser, requiredPermission)) {
      throw new AppError(403, "You do not have permission to perform this admin action");
    }
    const db = await readDb();
    const order = db.orders.find((item) => item.id === String(req.params.id));
    if (!order) throw new AppError(404, "Order not found");
    if (!hasAdminPermission(req.adminUser, "orders:view_all") && !isOwnAdminRecord(req, order)) {
      throw new AppError(403, "You can only update orders tied to your admin activity");
    }
    if (normalizeOrderStatus(db, order) === "cancelled" && data.eventType !== "refund") {
      throw new AppError(400, "Only refund records can be added to cancelled orders");
    }
    if (["payment", "partial_payment"].includes(data.eventType) && Number(data.amount || 0) <= 0) {
      throw new AppError(400, "Payment amount must be greater than zero");
    }
    if (data.eventType === "refund" && Number(data.amount || 0) <= 0) {
      throw new AppError(400, "Refund amount must be greater than zero");
    }
    if (paymentNeedsTransactionReference(data.paymentMethod || order.paymentMethod, data.eventType === "refund" ? "paid" : "paid") && !normalizeTransactionReference(data.reference)) {
      throw new AppError(400, "Transaction reference is required for this payment method");
    }

    appendPaymentEvent(order, data, req, db);
    updateOrderPaymentStatusFromEvents(order);
    if (data.eventType !== "refund" && data.paymentMethod) order.paymentMethod = data.paymentMethod;
    if (data.reference) order.transactionReference = normalizeTransactionReference(data.reference);
    order.updatedAt = nowIso();

    await writeDb(db);
    res.status(201).json(formatOrder(db, order));
  } catch (e) {
    next(e);
  }
});

router.post("/:id/returns", requireAdminPermission("orders:return_items"), async (req, res, next) => {
  try {
    const data = orderReturnSchema.parse(req.body || {});
    const db = await readDb();
    const order = db.orders.find((item) => item.id === String(req.params.id));
    if (!order) throw new AppError(404, "Order not found");
    if (!hasAdminPermission(req.adminUser, "orders:view_all") && !isOwnAdminRecord(req, order)) {
      throw new AppError(403, "You can only update orders tied to your admin activity");
    }

    const orderStatus = normalizeOrderStatus(db, order);
    if (!["confirmed", "processing", "completed", "delivered"].includes(orderStatus)) {
      throw new AppError(400, "Only confirmed, processing, completed, or delivered orders can receive returned stock");
    }

    const returnedTotals = returnedQuantityByOrderItem(order);
    const now = nowIso();
    const normalizedReturnItems = [];

    for (const returnItem of data.items) {
      const orderItem = (order.items || []).find((item) => String(item.id) === String(returnItem.orderItemId));
      if (!orderItem) throw new AppError(400, "Return contains an invalid order item");

      const alreadyReturned = Number(returnedTotals.get(String(orderItem.id)) || 0);
      const remaining = Math.max(0, Number(orderItem.quantity || 0) - alreadyReturned);
      if (returnItem.quantity > remaining) {
        throw new AppError(400, `Cannot return ${returnItem.quantity} unit(s) for ${orderItem.productName || "item"}; only ${remaining} unit(s) remain returnable`);
      }

      const requestedSerials = normalizeSerialList(returnItem.serialNumbers || []);
      const existingSerials = normalizeSerialList(orderItem.serialNumbers || []);
      if (existingSerials.length && requestedSerials.length !== returnItem.quantity) {
        throw new AppError(400, `${orderItem.productName || "Item"} requires ${returnItem.quantity} returned serial number(s)`);
      }
      for (const serial of requestedSerials) {
        if (!existingSerials.map((value) => value.toLowerCase()).includes(serial.toLowerCase())) {
          throw new AppError(400, `Serial number ${serial} is not assigned to this order item`);
        }
      }

      normalizedReturnItems.push({
        orderItemId: orderItem.id,
        productId: orderItem.productId,
        productName: orderItem.productName || null,
        quantity: Number(returnItem.quantity),
        serialNumbers: requestedSerials,
      });

      if (data.restoreStock) {
        const product = findProductById(db, orderItem.productId);
        if (product) {
          const before = Number(product.stockQuantity || 0);
          const after = before + Number(returnItem.quantity);
          product.stockQuantity = after;
          product.inStock = after > 0;

          if (requestedSerials.length) {
            orderItem.serialNumbers = existingSerials.filter((serial) => !requestedSerials.map((value) => value.toLowerCase()).includes(serial.toLowerCase()));
          } else if (Number(returnItem.quantity) >= Number(orderItem.quantity || 0)) {
            orderItem.serialNumbers = [];
          }

          db.inventoryMovements.push({
            id: createId(),
            productId: product.id,
            orderId: order.id,
            adminUserId: adminEntrantId(req, db),
            type: "order_returned",
            quantityChange: Number(returnItem.quantity),
            quantityBefore: before,
            quantityAfter: after,
            note: data.reason || "Stock restored from returned order item",
            dataEntrant: adminEntrantId(req, db),
            entryDate: now,
            createdAt: now,
          });
        }
      }
    }

    const returnRecord = {
      id: createId(),
      orderId: order.id,
      items: normalizedReturnItems,
      restoreStock: data.restoreStock,
      refundAmount: Number(data.refundAmount || 0),
      refundMethod: data.refundMethod || null,
      reference: normalizeTransactionReference(data.reference),
      reason: data.reason || null,
      createdByAdminUserId: adminEntrantId(req, db),
      dataEntrant: adminEntrantId(req, db),
      entryDate: now,
      createdAt: now,
    };
    order.returns = [returnRecord, ...(order.returns || [])];

    if (Number(data.refundAmount || 0) > 0) {
      appendPaymentEvent(order, {
        eventType: "refund",
        amount: Number(data.refundAmount || 0),
        paymentMethod: data.refundMethod || order.paymentMethod,
        reference: data.reference,
        note: data.reason || "Refund recorded with returned item",
      }, req, db);
      updateOrderPaymentStatusFromEvents(order);
    }

    order.updatedAt = now;
    await writeDb(db);
    res.status(201).json(formatOrder(db, order));
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", requireAdminPermission("orders:update_status"), async (req, res, next) => {
  try {
    const data = updateOrderSchema.parse(req.body);
    const db = await readDb();
    const order = db.orders.find((item) => item.id === String(req.params.id));
    if (!order) throw new AppError(404, "Order not found");
    if (!hasAdminPermission(req.adminUser, "orders:view_all") && !isOwnAdminRecord(req, order)) {
      throw new AppError(403, "You can only update orders tied to your admin activity");
    }

    const currentStatus = normalizeOrderStatus(db, order);
    const currentPaymentStatus = order.paymentStatus;
    const nextStatus = data.status ?? currentStatus;
    const nextPaymentStatus = data.paymentStatus ?? order.paymentStatus;
    const nextTransactionReference = data.transactionReference !== undefined
      ? normalizeTransactionReference(data.transactionReference)
      : normalizeTransactionReference(order.transactionReference);

    if (isWalkInOrder(db, order) && nextStatus === "delivered") {
      throw new AppError(400, "Walk-in customer orders cannot be marked as delivered");
    }

    if (paymentNeedsTransactionReference(order.paymentMethod, nextPaymentStatus) && !nextTransactionReference) {
      throw new AppError(400, "Transaction reference is required before marking this payment as paid");
    }

    if (shouldDeductInventory(currentStatus, nextStatus)) {
      const serialAssignmentAt = nowIso();
      const reservedSerialKeys = new Set();
      const alreadyDeducted = orderAlreadyHasStockDeduction(db, order.id);

      for (const item of order.items || []) {
        const product = findProductById(db, item.productId);
        if (!product) throw new AppError(400, "Order contains an invalid product");

        if (!alreadyDeducted && product.stockQuantity < item.quantity) {
          throw new AppError(400, `Not enough stock to confirm order for ${product.name}`);
        }

        assignOrderItemSerials(db, product, order, item, data.itemSerialNumbers?.[item.id], serialAssignmentAt, reservedSerialKeys);

        if (alreadyDeducted) continue;

        const before = Number(product.stockQuantity || 0);
        const after = before - Number(item.quantity);
        product.stockQuantity = after;
        product.inStock = after > 0;

        db.inventoryMovements.push({
          id: createId(),
          productId: product.id,
          orderId: order.id,
          adminUserId: adminEntrantId(req, db),
          type: "order_deducted",
          quantityChange: -Number(item.quantity),
          quantityBefore: before,
          quantityAfter: after,
          note: data.note || "Stock deducted on order confirmation",
          dataEntrant: adminEntrantId(req, db),
          entryDate: nowIso(),
          createdAt: nowIso(),
        });
      }
    }

    if (shouldRestoreInventory(currentStatus, nextStatus) || (currentStatus === "pending" && nextStatus === "cancelled" && orderAlreadyHasStockDeduction(db, order.id))) {
      releaseOrderSerials(db, order);
      for (const item of order.items || []) {
        const product = findProductById(db, item.productId);
        if (!product) continue;

        const before = Number(product.stockQuantity || 0);
        const after = before + Number(item.quantity);
        product.stockQuantity = after;
        product.inStock = after > 0;

        db.inventoryMovements.push({
          id: createId(),
          productId: product.id,
          orderId: order.id,
          adminUserId: adminEntrantId(req, db),
          type: "order_restored",
          quantityChange: Number(item.quantity),
          quantityBefore: before,
          quantityAfter: after,
          note: data.note || "Stock restored after order cancellation",
          dataEntrant: adminEntrantId(req, db),
          entryDate: nowIso(),
          createdAt: nowIso(),
        });
      }
    }

    order.status = nextStatus;
    order.paymentStatus = nextPaymentStatus;
    if (data.paymentStatus !== undefined && data.paymentStatus !== currentPaymentStatus) {
      appendPaymentEvent(order, {
        eventType: "payment_status_change",
        amount: 0,
        paymentMethod: order.paymentMethod,
        reference: nextTransactionReference,
        note: data.note || `Payment status manually changed to ${nextPaymentStatus}`,
      }, req, db);
    }
    if (data.transactionReference !== undefined) order.transactionReference = nextTransactionReference;
    order.updatedAt = nowIso();

    await writeDb(db);
    res.json(formatOrder(db, order));
  } catch (e) {
    next(e);
  }
});

export default router;
