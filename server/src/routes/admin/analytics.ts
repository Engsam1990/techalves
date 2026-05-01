// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdminPermission } from "../../middleware/auth";
import { readDb, sortByDateDesc, findProductById } from "../../lib/db";

const router = Router();
router.use(requireAuth);

const financeReportQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional(),
  start: z.string().trim().optional(),
  end: z.string().trim().optional(),
});

const transactionReferenceRequiredMethods = new Set(["mpesa", "card", "bank_transfer"]);
const lowStockThreshold = 5;
const overstockThreshold = 50;
const dormantDaysThreshold = 30;

function isProductInquiry(message) {
  return String(message?.subject || "").startsWith("[Product Inquiry]");
}

function isWalkInOrder(db, order) {
  const hasRegisteredCustomer = db.customerUsers.some((item) => item.id === order.customerId);
  return !hasRegisteredCustomer && String(order.deliveryAddress || "").trim() === "In-store POS sale";
}

function normalizeOrderStatus(db, order) {
  return isWalkInOrder(db, order) && order.status === "delivered" ? "completed" : order.status;
}

function normalizeOrderForReport(db, order) {
  return {
    ...order,
    status: normalizeOrderStatus(db, order),
    isWalkInCustomer: isWalkInOrder(db, order),
  };
}

function looksLikeRawId(value) {
  const text = String(value || "").trim();
  return /^\d+$/.test(text) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(text);
}

function resolveBrandName(db, value) {
  const text = String(value || "").trim();
  if (!text) return null;

  const normalized = text.toLowerCase();
  const brand = (db.brands || []).find((item) =>
    String(item.id || "").toLowerCase() === normalized ||
    String(item.slug || "").toLowerCase() === normalized ||
    String(item.name || "").toLowerCase() === normalized
  );

  if (brand?.name) return brand.name;

  // Do not export a raw numeric/UUID brand key when we cannot resolve it.
  // Returning an empty cell is safer than printing an internal ID as the brand name.
  if (looksLikeRawId(text)) return null;

  return text;
}

function resolveOrderItemBrandName(db, item, product) {
  return (
    resolveBrandName(db, item?.productBrand) ||
    resolveBrandName(db, item?.brand) ||
    resolveBrandName(db, item?.product_brand) ||
    resolveBrandName(db, product?.brand) ||
    null
  );
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
  const name = String(admin?.name || "").trim();
  const email = String(admin?.email || "").trim();
  return {
    id: admin?.id || fallback,
    name: name && name !== email && !name.includes("@") ? name : null,
    email: email || (fallback && fallback.includes("@") ? fallback : null),
    label: admin ? (name && name !== email && !name.includes("@") ? name : email || admin.id) : (looksLikeRawId(fallback) ? null : fallback),
  };
}

function parseDateInput(value, boundary) {
  const text = String(value || "").trim();
  if (!text) return null;

  let parsed;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    parsed = new Date(`${text}T${boundary === "start" ? "00:00:00.000" : "23:59:59.999"}Z`);
  } else {
    parsed = new Date(text);
  }

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildFinanceRange(query) {
  const startInput = parseDateInput(query.start, "start");
  const endInput = parseDateInput(query.end, "end");

  if (startInput || endInput) {
    const start = startInput ? new Date(startInput) : new Date(endInput);
    const end = endInput ? new Date(endInput) : new Date(startInput);

    if (!startInput) start.setUTCHours(0, 0, 0, 0);
    if (!endInput) end.setUTCHours(23, 59, 59, 999);

    if (start.getTime() > end.getTime()) {
      const swappedStart = new Date(end);
      swappedStart.setUTCHours(0, 0, 0, 0);
      const swappedEnd = new Date(start);
      swappedEnd.setUTCHours(23, 59, 59, 999);
      const days = Math.max(1, Math.ceil((swappedEnd.getTime() - swappedStart.getTime() + 1) / 86400000));
      return { start: swappedStart, end: swappedEnd, days, isCustom: true };
    }

    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime() + 1) / 86400000));
    return { start, end, days, isCustom: true };
  }

  const days = Number(query.days || 30);
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);
  return { start, end, days, isCustom: false };
}

function isInRange(value, range) {
  const timestamp = new Date(value).getTime();
  return !Number.isNaN(timestamp) && timestamp >= range.start.getTime() && timestamp <= range.end.getTime();
}

function getDateKey(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function sumOrderAmounts(orders) {
  return orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
}

function summarizeOrderPayments(order) {
  const events = Array.isArray(order.paymentEvents) ? order.paymentEvents : [];
  const paidAmount = events
    .filter((event) => ["payment", "partial_payment"].includes(String(event.eventType || event.event_type || "")))
    .reduce((sum, event) => sum + Number(event.amount || 0), 0);
  const refundedAmount = events
    .filter((event) => String(event.eventType || event.event_type || "") === "refund")
    .reduce((sum, event) => sum + Number(event.amount || 0), 0);
  const totalDue = Number(order.totalAmount || 0);
  const fallbackNetPaid = order.paymentStatus === "paid" ? totalDue : 0;
  const netPaidAmount = Math.max(0, events.length ? paidAmount - refundedAmount : fallbackNetPaid);
  return {
    totalDue,
    paidAmount,
    refundedAmount,
    netPaidAmount,
    balanceAmount: Math.max(0, totalDue - netPaidAmount),
  };
}

function sumCollectedOrderAmounts(orders) {
  return orders.reduce((sum, order) => sum + summarizeOrderPayments(order).netPaidAmount, 0);
}

function sumOutstandingOrderAmounts(orders) {
  return orders.reduce((sum, order) => sum + summarizeOrderPayments(order).balanceAmount, 0);
}

function getOrderCostOfGoods(order) {
  return (order.items || []).reduce((sum, item) => {
    const quantity = Number(item.quantity || 0);
    const unitSourcePrice = Number(item.unitSourcePrice ?? item.sourcePrice ?? 0);
    const totalSourcePrice = Number(item.totalSourcePrice ?? unitSourcePrice * quantity);
    return sum + totalSourcePrice;
  }, 0);
}

function getProductAcquisitionValue(product) {
  const unitCost = Number(product.sourcePrice || 0);
  const receivedUnits = Math.max(1, Number(product.totalStockReceived ?? product.stockQuantity ?? 1));
  return unitCost * receivedUnits;
}

function isSupplierExpense(expense) {
  return String(expense.category || "").toLowerCase() === "supplier" || String(expense.categoryId || "") === "expense-cat-supplier";
}

function isActiveExpense(expense) {
  return String(expense.paymentStatus || "paid").toLowerCase() !== "cancelled" && !expense.voidedAt;
}

function buildTimelineBuckets(range) {
  const items = [];
  const cursor = new Date(range.start);
  cursor.setUTCHours(0, 0, 0, 0);

  while (cursor.getTime() <= range.end.getTime()) {
    items.push({
      date: cursor.toISOString().slice(0, 10),
      revenue: 0,
      paidRevenue: 0,
      pendingRevenue: 0,
      orders: 0,
      paidOrders: 0,
      pendingOrders: 0,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return items;
}

function buildPaymentBreakdown(orders) {
  const order = ["paid", "partial", "pending", "failed", "refunded"];
  const grouped = new Map();

  for (const item of orders) {
    const key = String(item.paymentStatus || "unknown");
    if (!grouped.has(key)) grouped.set(key, { status: key, count: 0, value: 0 });
    const group = grouped.get(key);
    group.count += 1;
    group.value += Number(item.totalAmount || 0);
  }

  return [...grouped.values()].sort((a, b) => {
    const aIndex = order.indexOf(a.status);
    const bIndex = order.indexOf(b.status);
    if (aIndex === -1 && bIndex === -1) return a.status.localeCompare(b.status);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

function buildOrderBreakdown(orders) {
  const order = ["pending", "confirmed", "processing", "completed", "delivered", "cancelled"];
  const grouped = new Map();

  for (const item of orders) {
    const key = String(item.status || "unknown");
    if (!grouped.has(key)) grouped.set(key, { status: key, count: 0, value: 0 });
    const group = grouped.get(key);
    group.count += 1;
    group.value += Number(item.totalAmount || 0);
  }

  return [...grouped.values()].sort((a, b) => {
    const aIndex = order.indexOf(a.status);
    const bIndex = order.indexOf(b.status);
    if (aIndex === -1 && bIndex === -1) return a.status.localeCompare(b.status);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

function buildTopProducts(db, orders) {
  const grouped = new Map();

  for (const order of orders) {
    for (const item of order.items || []) {
      if (!grouped.has(item.productId)) {
        const product = findProductById(db, item.productId);
        grouped.set(item.productId, {
          id: item.productId,
          name: product?.name || "Unknown product",
          slug: product?.slug || null,
          revenue: 0,
          quantity: 0,
          orderIds: new Set(),
        });
      }

      const group = grouped.get(item.productId);
      group.revenue += Number(item.totalPrice || 0);
      group.quantity += Number(item.quantity || 0);
      group.orderIds.add(order.id);
    }
  }

  return [...grouped.values()]
    .map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      revenue: item.revenue,
      quantity: item.quantity,
      orders: item.orderIds.size,
    }))
    .sort((a, b) => b.revenue - a.revenue || b.quantity - a.quantity || a.name.localeCompare(b.name))
    .slice(0, 8);
}

function formatFinanceOrderRows(db, orders) {
  return sortByDateDesc(orders).map((order) => {
    const entrant = adminDisplay(db, order.createdByAdminUserId, order.dataEntrant, order.createdBy);
    return {
      id: order.id,
      createdAt: order.createdAt,
      dataEntrantName: entrant.name || null,
      dataEntrantEmail: entrant.email || null,
      dataEntrant: entrant.label || null,
      entryDate: order.entryDate || order.createdAt,
      deliveryName: order.deliveryName,
      deliveryPhone: order.deliveryPhone,
      deliveryEmail: order.deliveryEmail,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      transactionReference: order.transactionReference || null,
      paymentSummary: summarizeOrderPayments(order),
      discountAmount: Number(order.discountAmount || 0),
      otherCharges: Number(order.otherCharges || 0),
      subtotalAmount: Number(order.subtotalAmount || 0),
      vatRate: Number(order.vatRate || 0),
      vatAmount: Number(order.vatAmount || 0),
      isWalkInCustomer: !!order.isWalkInCustomer,
      isPosSale: !!order.isPosSale,
      totalAmount: Number(order.totalAmount || 0),
      items: (order.items || []).map((item) => {
        const product = findProductById(db, item.productId);
        const sourceId = item.sourceId || product?.sourceId || null;
        const source = sourceId ? (db.productSources || []).find((row) => row.id === sourceId) : null;
        const quantity = Number(item.quantity || 0);
        const unitSellingPrice = Number(item.unitSellingPrice ?? item.unitPrice ?? product?.price ?? 0);
        const totalSellingPrice = Number(item.totalSellingPrice ?? unitSellingPrice * quantity);
        const unitSourcePrice = Number(item.unitSourcePrice ?? product?.sourcePrice ?? 0);
        const totalSourcePrice = Number(item.totalSourcePrice ?? unitSourcePrice * quantity);
        const vatAmount = Number(item.vatAmount || 0);
        return {
          id: item.id,
          productId: item.productId,
          productName: item.productName || product?.name || "Unknown product",
          brand: resolveOrderItemBrandName(db, item, product),
          barcode: item.barcode || item.productBarcode || product?.barcode || null,
          quantity,
          unitPrice: unitSellingPrice,
          totalPrice: Number(item.totalPrice ?? totalSellingPrice + vatAmount),
          sourcePrice: unitSourcePrice,
          sourceCost: totalSourcePrice,
          unitSourcePrice,
          totalSourcePrice,
          unitSellingPrice,
          totalSellingPrice,
          vatRate: Number(item.vatRate || order.vatRate || 0),
          vatAmount,
          grossProfit: totalSellingPrice - totalSourcePrice,
          sourceId,
          sourceName: item.sourceName || source?.name || null,
          sourcedFrom: item.sourceName || source?.name || product?.sourcedFrom || null,
          sourcedBy: product?.sourcedBy || null,
          sourceDate: product?.sourceDate || null,
          sourcePaymentStatus: item.sourcePaymentStatus || product?.sourcePaymentStatus || product?.sourcingPaymentStatus || "pending",
          serialNumbers: Array.isArray(item.serialNumbers) ? item.serialNumbers : [],
        };
      }),
    };
  });
}

function formatIssueOrders(orders) {
  return sortByDateDesc(orders)
    .slice(0, 5)
    .map((order) => ({
      id: order.id,
      deliveryName: order.deliveryName,
      totalAmount: Number(order.totalAmount || 0),
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      transactionReference: order.transactionReference || null,
      isWalkInCustomer: !!order.isWalkInCustomer,
      createdAt: order.createdAt,
    }));
}

function buildPendingIssues(orders) {
  const activeOrders = orders.filter((item) => item.status !== "cancelled");
  const pendingPaymentOrders = activeOrders.filter((item) => item.paymentStatus === "pending");
  const partialPaymentOrders = activeOrders.filter((item) => item.paymentStatus === "partial");
  const fulfillmentBacklog = activeOrders.filter((item) => ["pending", "confirmed", "processing"].includes(item.status));
  const failedPaymentOrders = orders.filter((item) => item.paymentStatus === "failed");
  const refundedOrders = orders.filter((item) => item.paymentStatus === "refunded");
  const missingReferenceOrders = activeOrders.filter((item) =>
    item.paymentStatus === "paid" &&
    transactionReferenceRequiredMethods.has(String(item.paymentMethod || "")) &&
    !String(item.transactionReference || "").trim()
  );
  const paidUnfulfilledOrders = activeOrders.filter((item) =>
    item.paymentStatus === "paid" &&
    !["completed", "delivered"].includes(item.status)
  );

  const issues = [
    {
      key: "pending_payments",
      title: "Pending Payments",
      description: "Orders that still need payment collection or confirmation.",
      severity: "warning",
      orders: pendingPaymentOrders,
    },
    {
      key: "fulfillment_backlog",
      title: "Fulfilment Backlog",
      description: "Orders that are still waiting for confirmation, processing, or completion.",
      severity: "info",
      orders: fulfillmentBacklog,
    },
    {
      key: "failed_payments",
      title: "Failed Payments",
      description: "Orders with failed payment attempts that need customer follow-up.",
      severity: "destructive",
      orders: failedPaymentOrders,
    },
    {
      key: "missing_references",
      title: "Missing References",
      description: "Paid digital-payment orders without a recorded transaction reference.",
      severity: "destructive",
      orders: missingReferenceOrders,
    },
    {
      key: "paid_not_completed",
      title: "Paid But Not Completed",
      description: "Paid orders that still have outstanding fulfilment work.",
      severity: "warning",
      orders: paidUnfulfilledOrders,
    },
    {
      key: "refunded_orders",
      title: "Refunded Orders",
      description: "Orders already marked as refunded during the selected period.",
      severity: "info",
      orders: refundedOrders,
    },
  ];

  return issues
    .filter((issue) => issue.orders.length > 0)
    .map((issue) => ({
      key: issue.key,
      title: issue.title,
      description: issue.description,
      severity: issue.severity,
      count: issue.orders.length,
      amount: sumOrderAmounts(issue.orders),
      orders: formatIssueOrders(issue.orders),
    }));
}

function expenseDateValue(expense) {
  return expense?.date || expense?.createdAt || expense?.entryDate;
}

function productSourceDateValue(product) {
  return product?.sourceDate || product?.entryDate || product?.createdAt;
}

function formatExpenseRows(db, expenses) {
  return sortByDateDesc(expenses.map((expense) => ({ ...expense, createdAt: expenseDateValue(expense) || expense.createdAt }))).map((expense) => {
    const order = (db.orders || []).find((item) => item.id === expense.orderId);
    const product = expense.productId ? findProductById(db, expense.productId) : null;
    const source = expense.sourceId ? (db.productSources || []).find((item) => item.id === expense.sourceId) : null;
    const entrant = adminDisplay(db, expense.createdByAdminUserId, expense.dataEntrant, expense.createdBy);
    return {
      id: expense.id,
      details: expense.details || expense.description || null,
      description: expense.description || expense.details || null,
      category: expense.categoryName || expense.category || "other",
      categoryName: expense.categoryName || expense.category || "Other",
      categorySlug: expense.category || null,
      amount: Number(expense.amount || 0),
      date: expense.date || expense.expenseDate || null,
      expenseDate: expense.expenseDate || expense.date || null,
      orderId: expense.orderId || null,
      orderCustomer: order?.deliveryName || null,
      productId: expense.productId || null,
      productName: product?.name || null,
      sourceId: expense.sourceId || null,
      sourceName: source?.name || expense.sourceName || null,
      paymentStatus: expense.paymentStatus || "paid",
      paymentMethod: expense.paymentMethod || "",
      reference: expense.reference || "",
      dataEntrantName: entrant.name || null,
      dataEntrantEmail: entrant.email || null,
      dataEntrant: entrant.label || null,
      entryDate: expense.entryDate || expense.createdAt,
      createdAt: expense.createdAt,
    };
  });
}

function formatSourcedProducts(db, products) {
  return sortByDateDesc(products.map((product) => ({ ...product, createdAt: productSourceDateValue(product) || product.createdAt }))).map((product) => {
    const source = product.sourceId ? (db.productSources || []).find((item) => item.id === product.sourceId) : null;
    const entrant = adminDisplay(db, product.dataEntrant, product.createdByAdminUserId, product.createdBy);
    const paidBy = adminDisplay(db, product.sourcingPaidBy);
    return {
      id: product.id,
      name: product.name,
      brand: resolveBrandName(db, product.brand) || product.brand,
      sourceId: product.sourceId || null,
      sourceName: source?.name || product.sourcedFrom || null,
      sourcedFrom: source?.name || product.sourcedFrom || null,
      sourcedBy: product.sourcedBy || null,
      sourceDate: product.sourceDate || null,
      sourcePrice: Number(product.sourcePrice || 0),
      paymentStatus: product.sourcePaymentStatus || product.sourcingPaymentStatus || "pending",
      paidAt: product.sourcingPaidAt || null,
      paidBy: paidBy.label || paidBy.email || null,
      stockQuantity: Number(product.stockQuantity || 0),
      totalStockReceived: Number(product.totalStockReceived ?? product.stockQuantity ?? 0),
      dataEntrantName: entrant.name || null,
      dataEntrantEmail: entrant.email || null,
      dataEntrant: entrant.label || null,
      entryDate: product.entryDate || product.createdAt,
    };
  });
}

function buildFinanceReport(db, range) {
  const filteredOrders = sortByDateDesc(
    db.orders
      .filter((item) => isInRange(item.createdAt, range))
      .map((item) => normalizeOrderForReport(db, item))
  );

  const activeOrders = filteredOrders.filter((item) => item.status !== "cancelled");
  const paidOrders = activeOrders.filter((item) => item.paymentStatus === "paid");
  const partialPaymentOrders = activeOrders.filter((item) => item.paymentStatus === "partial");
  const collectedOrders = activeOrders.filter((item) => ["paid", "partial"].includes(item.paymentStatus));
  const pendingPaymentOrders = activeOrders.filter((item) => item.paymentStatus === "pending");
  const pendingStatusOrders = activeOrders.filter((item) => item.status === "pending");
  const confirmedOrders = activeOrders.filter((item) => item.status === "confirmed");
  const processingOrders = activeOrders.filter((item) => item.status === "processing");
  const completedOrders = activeOrders.filter((item) => ["completed", "delivered"].includes(item.status));
  const cancelledOrders = filteredOrders.filter((item) => item.status === "cancelled");
  const failedPaymentOrders = filteredOrders.filter((item) => item.paymentStatus === "failed");
  const refundedOrders = filteredOrders.filter((item) => item.paymentStatus === "refunded");
  const backlogOrders = activeOrders.filter((item) => ["pending", "confirmed", "processing"].includes(item.status));

  const totalRevenue = sumOrderAmounts(activeOrders);
  const paidRevenue = sumCollectedOrderAmounts(activeOrders);
  const pendingRevenue = sumOutstandingOrderAmounts(activeOrders.filter((item) => ["pending", "partial"].includes(item.paymentStatus)));
  const filteredExpenses = (db.expenses || []).filter((item) => isInRange(expenseDateValue(item), range) && isActiveExpense(item));
  const totalExpenses = filteredExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const supplierExpenses = filteredExpenses.filter(isSupplierExpense).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const operatingExpenses = filteredExpenses.filter((item) => !isSupplierExpense(item)).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const sourcedProductsInRange = (db.products || []).filter((product) => {
    const hasSource = Number(product.sourcePrice || 0) > 0 || product.sourceId || product.sourcedFrom || product.sourcedBy;
    return hasSource && isInRange(productSourceDateValue(product), range);
  });
  const sourcingCost = sourcedProductsInRange.reduce((sum, product) => sum + getProductAcquisitionValue(product), 0);
  const paidSourcingCost = sourcedProductsInRange
    .filter((product) => ((product.sourcePaymentStatus || product.sourcingPaymentStatus) === "paid"))
    .reduce((sum, product) => sum + getProductAcquisitionValue(product), 0);
  const unpaidSourcingCost = sourcedProductsInRange
    .filter((product) => ((product.sourcePaymentStatus || product.sourcingPaymentStatus) !== "paid"))
    .reduce((sum, product) => sum + getProductAcquisitionValue(product), 0);
  const costOfGoodsSold = collectedOrders.reduce((sum, order) => sum + getOrderCostOfGoods(order), 0);
  const grossProfit = paidRevenue - costOfGoodsSold;
  const netProfit = grossProfit - operatingExpenses;
  const estimatedGrossProfit = grossProfit;
  const timelineBuckets = buildTimelineBuckets(range);
  const timelineByDate = new Map(timelineBuckets.map((bucket) => [bucket.date, bucket]));

  for (const order of filteredOrders) {
    const key = getDateKey(order.createdAt);
    const bucket = timelineByDate.get(key);
    if (!bucket) continue;

    bucket.orders += 1;
    if (order.status !== "cancelled") {
      bucket.revenue += Number(order.totalAmount || 0);
    }
    if (["paid", "partial"].includes(order.paymentStatus)) {
      bucket.paidRevenue += summarizeOrderPayments(order).netPaidAmount;
      if (order.paymentStatus === "paid") bucket.paidOrders += 1;
    }
    if (["pending", "partial"].includes(order.paymentStatus) && order.status !== "cancelled") {
      bucket.pendingRevenue += summarizeOrderPayments(order).balanceAmount;
      bucket.pendingOrders += 1;
    }
  }

  return {
    period: {
      start: range.start.toISOString(),
      end: range.end.toISOString(),
      days: range.days,
      isCustom: range.isCustom,
    },
    summary: {
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      totalExpenses,
      supplierExpenses,
      operatingExpenses,
      costOfGoodsSold,
      grossProfit,
      netProfit,
      sourcingCost,
      paidSourcingCost,
      unpaidSourcingCost,
      estimatedGrossProfit,
      sourceProducts: sourcedProductsInRange.length,
      totalOrders: filteredOrders.length,
      activeOrders: activeOrders.length,
      paidOrders: paidOrders.length,
      partialOrders: partialPaymentOrders.length,
      pendingOrders: pendingPaymentOrders.length,
      pendingStatusOrders: pendingStatusOrders.length,
      confirmedOrders: confirmedOrders.length,
      processingOrders: processingOrders.length,
      completedOrders: completedOrders.length,
      backlogOrders: backlogOrders.length,
      cancelledOrders: cancelledOrders.length,
      failedPayments: failedPaymentOrders.length,
      refundedOrders: refundedOrders.length,
      averageOrderValue: activeOrders.length ? Number((totalRevenue / activeOrders.length).toFixed(2)) : 0,
      collectionRate: totalRevenue > 0 ? Number(((paidRevenue / totalRevenue) * 100).toFixed(1)) : 0,
    },
    timeline: timelineBuckets,
    paymentBreakdown: buildPaymentBreakdown(filteredOrders),
    orderBreakdown: buildOrderBreakdown(filteredOrders),
    topProducts: buildTopProducts(db, activeOrders),
    pendingIssues: buildPendingIssues(filteredOrders),
    expenses: formatExpenseRows(db, filteredExpenses),
    sourcedProducts: formatSourcedProducts(db, sourcedProductsInRange),
    orderDetails: formatFinanceOrderRows(db, filteredOrders),
  };
}

function formatInventoryMovementType(type) {
  return String(type || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildInventoryBuckets(range) {
  const items = [];
  const cursor = new Date(range.start);
  cursor.setUTCHours(0, 0, 0, 0);

  while (cursor.getTime() <= range.end.getTime()) {
    items.push({
      date: cursor.toISOString().slice(0, 10),
      inboundUnits: 0,
      outboundUnits: 0,
      adjustmentUnits: 0,
      netUnits: 0,
      movementCount: 0,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return items;
}

function classifyStockStatus(quantity) {
  const stockQuantity = Number(quantity || 0);
  if (stockQuantity <= 0) return "out_of_stock";
  if (stockQuantity <= lowStockThreshold) return "low_stock";
  if (stockQuantity >= overstockThreshold) return "overstock";
  return "healthy";
}

function createInventoryProductSnapshot(db, product, movementMeta) {
  const category = db.categories.find((item) => item.id === product.categoryId);
  const stockQuantity = Number(product.stockQuantity || 0);
  const inventoryValue = stockQuantity * Number(product.price || 0);
  const lastMovementAt = movementMeta?.lastMovementAt || null;
  const lastMovementType = movementMeta?.lastMovementType || null;
  const daysSinceLastMovement = lastMovementAt
    ? Math.floor((Date.now() - new Date(lastMovementAt).getTime()) / 86400000)
    : null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    barcode: product.barcode || null,
    categoryId: product.categoryId,
    categoryName: category?.name || "Uncategorized",
    stockQuantity,
    totalStockReceived: Number(product.totalStockReceived ?? product.stockQuantity ?? 0),
    price: Number(product.price || 0),
    inventoryValue,
    inStock: stockQuantity > 0,
    status: classifyStockStatus(stockQuantity),
    lastMovementAt,
    lastMovementType,
    daysSinceLastMovement,
    movementInPeriod: {
      inboundUnits: movementMeta?.inboundUnits || 0,
      outboundUnits: movementMeta?.outboundUnits || 0,
      adjustmentUnits: movementMeta?.adjustmentUnits || 0,
      netUnits: movementMeta?.netUnits || 0,
      movementCount: movementMeta?.movementCount || 0,
    },
  };
}

function buildInventoryReport(db, range) {
  const movements = sortByDateDesc(
    db.inventoryMovements.filter((item) => isInRange(item.createdAt, range))
  );
  const movementTimeline = buildInventoryBuckets(range);
  const movementTimelineByDate = new Map(movementTimeline.map((item) => [item.date, item]));
  const movementByProduct = new Map();
  const lastMovementByProduct = new Map();

  for (const movement of movements) {
    const quantityChange = Number(movement.quantityChange || 0);
    const key = getDateKey(movement.createdAt);
    const bucket = movementTimelineByDate.get(key);
    if (bucket) {
      bucket.movementCount += 1;
      bucket.netUnits += quantityChange;
      if (String(movement.type) === "manual_adjustment") {
        bucket.adjustmentUnits += Math.abs(quantityChange);
      } else if (quantityChange > 0) {
        bucket.inboundUnits += quantityChange;
      } else if (quantityChange < 0) {
        bucket.outboundUnits += Math.abs(quantityChange);
      }
    }

    if (!movementByProduct.has(movement.productId)) {
      movementByProduct.set(movement.productId, {
        inboundUnits: 0,
        outboundUnits: 0,
        adjustmentUnits: 0,
        netUnits: 0,
        movementCount: 0,
      });
    }

    const productMovement = movementByProduct.get(movement.productId);
    productMovement.netUnits += quantityChange;
    productMovement.movementCount += 1;
    if (String(movement.type) === "manual_adjustment") {
      productMovement.adjustmentUnits += Math.abs(quantityChange);
    } else if (quantityChange > 0) {
      productMovement.inboundUnits += quantityChange;
    } else if (quantityChange < 0) {
      productMovement.outboundUnits += Math.abs(quantityChange);
    }

    if (!lastMovementByProduct.has(movement.productId)) {
      lastMovementByProduct.set(movement.productId, {
        lastMovementAt: movement.createdAt,
        lastMovementType: movement.type,
      });
    }
  }

  const products = db.products.map((product) =>
    createInventoryProductSnapshot(db, product, {
      ...(movementByProduct.get(product.id) || {}),
      ...(lastMovementByProduct.get(product.id) || {}),
    })
  );

  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, item) => sum + item.stockQuantity, 0);
  const totalStockReceived = products.reduce((sum, item) => sum + Number(item.totalStockReceived || 0), 0);
  const inventoryValue = products.reduce((sum, item) => sum + item.inventoryValue, 0);
  const inStockProducts = products.filter((item) => item.inStock);
  const lowStockProducts = products.filter((item) => item.status === "low_stock");
  const outOfStockProducts = products.filter((item) => item.status === "out_of_stock");
  const overstockProducts = products.filter((item) => item.status === "overstock");
  const healthyProducts = products.filter((item) => item.status === "healthy");
  const dormantProducts = products.filter((item) =>
    item.stockQuantity > 0 &&
    (item.lastMovementAt === null || Number(item.daysSinceLastMovement || 0) >= dormantDaysThreshold)
  );
  const missingBarcodeProducts = products.filter((item) => item.stockQuantity > 0 && !String(item.barcode || "").trim());

  const inboundUnits = movementTimeline.reduce((sum, item) => sum + item.inboundUnits, 0);
  const outboundUnits = movementTimeline.reduce((sum, item) => sum + item.outboundUnits, 0);
  const adjustmentUnits = movementTimeline.reduce((sum, item) => sum + item.adjustmentUnits, 0);
  const netUnits = movementTimeline.reduce((sum, item) => sum + item.netUnits, 0);
  const movementCount = movementTimeline.reduce((sum, item) => sum + item.movementCount, 0);

  const stockStatusBreakdown = [
    {
      status: "out_of_stock",
      count: outOfStockProducts.length,
      units: outOfStockProducts.reduce((sum, item) => sum + item.stockQuantity, 0),
      value: outOfStockProducts.reduce((sum, item) => sum + item.inventoryValue, 0),
    },
    {
      status: "low_stock",
      count: lowStockProducts.length,
      units: lowStockProducts.reduce((sum, item) => sum + item.stockQuantity, 0),
      value: lowStockProducts.reduce((sum, item) => sum + item.inventoryValue, 0),
    },
    {
      status: "healthy",
      count: healthyProducts.length,
      units: healthyProducts.reduce((sum, item) => sum + item.stockQuantity, 0),
      value: healthyProducts.reduce((sum, item) => sum + item.inventoryValue, 0),
    },
    {
      status: "overstock",
      count: overstockProducts.length,
      units: overstockProducts.reduce((sum, item) => sum + item.stockQuantity, 0),
      value: overstockProducts.reduce((sum, item) => sum + item.inventoryValue, 0),
    },
  ];

  const categoryBreakdown = [...db.categories, { id: "uncategorized", name: "Uncategorized" }]
    .map((category) => {
      const items = products.filter((product) =>
        category.id === "uncategorized" ? !product.categoryId : product.categoryId === category.id
      );
      return {
        categoryId: category.id,
        categoryName: category.name,
        skuCount: items.length,
        inStockCount: items.filter((item) => item.inStock).length,
        lowStockCount: items.filter((item) => item.status === "low_stock").length,
        outOfStockCount: items.filter((item) => item.status === "out_of_stock").length,
        units: items.reduce((sum, item) => sum + item.stockQuantity, 0),
        value: items.reduce((sum, item) => sum + item.inventoryValue, 0),
      };
    })
    .filter((item) => item.skuCount > 0)
    .sort((a, b) => b.value - a.value || b.units - a.units || a.categoryName.localeCompare(b.categoryName));

  const topOutgoing = products
    .filter((item) => item.movementInPeriod.outboundUnits > 0)
    .sort((a, b) => b.movementInPeriod.outboundUnits - a.movementInPeriod.outboundUnits || b.inventoryValue - a.inventoryValue)
    .slice(0, 8);

  const topIncoming = products
    .filter((item) => item.movementInPeriod.inboundUnits > 0)
    .sort((a, b) => b.movementInPeriod.inboundUnits - a.movementInPeriod.inboundUnits || b.inventoryValue - a.inventoryValue)
    .slice(0, 8);

  const recentMovements = movements.slice(0, 20).map((movement) => {
    const product = findProductById(db, movement.productId);
    const category = product ? db.categories.find((item) => item.id === product.categoryId) : null;
    const adminUser = db.adminUsers.find((item) => item.id === movement.adminUserId);
    return {
      id: movement.id,
      productId: movement.productId,
      productName: product?.name || "Unknown product",
      productSlug: product?.slug || null,
      brand: product?.brand || null,
      categoryName: category?.name || "Uncategorized",
      type: movement.type,
      typeLabel: formatInventoryMovementType(movement.type),
      quantityChange: Number(movement.quantityChange || 0),
      quantityBefore: Number(movement.quantityBefore || 0),
      quantityAfter: Number(movement.quantityAfter || 0),
      note: movement.note || null,
      orderId: movement.orderId || null,
      adminName: adminUser?.name || null,
      adminEmail: adminUser?.email || null,
      createdAt: movement.createdAt,
    };
  });

  return {
    period: {
      start: range.start.toISOString(),
      end: range.end.toISOString(),
      days: range.days,
    },
    thresholds: {
      lowStock: lowStockThreshold,
      overstock: overstockThreshold,
      dormantDays: dormantDaysThreshold,
    },
    summary: {
      totalProducts,
      inStockProducts: inStockProducts.length,
      lowStockProducts: lowStockProducts.length,
      outOfStockProducts: outOfStockProducts.length,
      overstockProducts: overstockProducts.length,
      dormantProducts: dormantProducts.length,
      missingBarcodeProducts: missingBarcodeProducts.length,
      totalUnits,
      totalStockReceived,
      inventoryValue,
      averageUnitsPerSku: totalProducts ? Number((totalUnits / totalProducts).toFixed(1)) : 0,
      averageValuePerSku: totalProducts ? Number((inventoryValue / totalProducts).toFixed(2)) : 0,
      movementCount,
      inboundUnits,
      outboundUnits,
      adjustmentUnits,
      netUnits,
    },
    stockStatusBreakdown,
    categoryBreakdown,
    movementTimeline,
    topOutgoing,
    topIncoming,
    recentMovements,
    issues: {
      lowStockProducts: lowStockProducts
        .sort((a, b) => a.stockQuantity - b.stockQuantity || b.movementInPeriod.outboundUnits - a.movementInPeriod.outboundUnits)
        .slice(0, 10),
      outOfStockProducts: outOfStockProducts
        .sort((a, b) => b.inventoryValue - a.inventoryValue || a.name.localeCompare(b.name))
        .slice(0, 10),
      overstockProducts: overstockProducts
        .sort((a, b) => b.inventoryValue - a.inventoryValue || b.stockQuantity - a.stockQuantity)
        .slice(0, 10),
      dormantProducts: dormantProducts
        .sort((a, b) => b.inventoryValue - a.inventoryValue || b.stockQuantity - a.stockQuantity)
        .slice(0, 10),
      missingBarcodeProducts: missingBarcodeProducts
        .sort((a, b) => b.inventoryValue - a.inventoryValue || b.stockQuantity - a.stockQuantity)
        .slice(0, 10),
    },
  };
}

router.get("/overview", requireAdminPermission("dashboard:view"), async (_req, res, next) => {
  try {
    const db = await readDb();
    const totalProducts = db.products.length;
    const inStockCount = db.products.filter((item) => item.inStock).length;
    const featuredCount = db.products.filter((item) => item.featured).length;
    const trackedViews = db.productAnalytics.filter((item) => item.event === "view").length;
    const totalClicks = db.productAnalytics.filter((item) => item.event === "click").length;
    const trackedInquiries = db.productAnalytics.filter((item) => item.event === "inquiry").length;
    const productInquiries = sortByDateDesc(db.contactMessages.filter((item) => isProductInquiry(item)));
    const activeOrders = db.orders.filter((item) => item.status !== "cancelled");
    const totalRevenue = activeOrders.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    const paidOrders = activeOrders.filter((item) => item.paymentStatus === "paid");
    const paidRevenue = paidOrders.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    const pendingOrders = db.orders.filter((item) => item.status === "pending").length;
    const pendingRevenue = activeOrders
      .filter((item) => item.paymentStatus === "pending")
      .reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);

    res.json({
      totalProducts,
      inStockCount,
      soldOutCount: totalProducts - inStockCount,
      featuredCount,
      totalCategories: db.categories.length,
      totalViews: trackedViews,
      totalClicks,
      totalInquiries: productInquiries.length,
      conversionRate: trackedViews > 0 ? Number(((trackedInquiries / trackedViews) * 100).toFixed(2)) : 0,
      finance: {
        totalOrders: db.orders.length,
        pendingOrders,
        paidOrders: paidOrders.length,
        cancelledOrders: db.orders.filter((item) => item.status === "cancelled").length,
        totalRevenue,
        paidRevenue,
        pendingRevenue,
        averageOrderValue: activeOrders.length ? Number((totalRevenue / activeOrders.length).toFixed(2)) : 0,
      },
      recentInquiries: productInquiries.slice(0, 6).map((item) => ({
        id: item.id,
        fullName: item.fullName,
        email: item.email,
        phone: item.phone,
        subject: item.subject,
        message: item.message,
        status: item.status,
        createdAt: item.createdAt,
      })),
      recentOrders: sortByDateDesc(db.orders)
        .slice(0, 5)
        .map((item) => ({
          id: item.id,
          deliveryName: item.deliveryName,
          status: normalizeOrderStatus(db, item),
          paymentStatus: item.paymentStatus,
          totalAmount: Number(item.totalAmount || 0),
          createdAt: item.createdAt,
        })),
    });
  } catch (e) {
    next(e);
  }
});

router.get("/finance-report", requireAdminPermission("finance:view"), async (req, res, next) => {
  try {
    const query = financeReportQuerySchema.parse(req.query);
    const range = buildFinanceRange(query);
    const db = await readDb();
    res.json(buildFinanceReport(db, range));
  } catch (e) {
    next(e);
  }
});

router.get("/inventory-report", requireAdminPermission("inventory:view"), async (req, res, next) => {
  try {
    const query = financeReportQuerySchema.parse(req.query);
    const range = buildFinanceRange(query);
    const db = await readDb();
    res.json(buildInventoryReport(db, range));
  } catch (e) {
    next(e);
  }
});

router.get("/products", requireAdminPermission("analytics:view"), async (req, res, next) => {
  try {
    const days = parseInt(String(req.query.days || 30), 10) || 30;
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);
    const db = await readDb();
    const result = db.products.map((product) => {
      const analytics = db.productAnalytics.filter((item) => item.productId === product.id && new Date(item.createdAt).getTime() >= since);
      const category = db.categories.find((item) => item.id === product.categoryId);
      return { id: product.id, name: product.name, slug: product.slug, category: category?.name, image: product.images?.[0] || null, inStock: product.inStock, featured: product.featured, price: product.price, views: analytics.filter((item) => item.event === "view").length, clicks: analytics.filter((item) => item.event === "click").length, inquiries: analytics.filter((item) => item.event === "inquiry").length, comparisons: analytics.filter((item) => item.event === "add_to_compare").length };
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get("/timeline", requireAdminPermission("analytics:view"), async (req, res, next) => {
  try {
    const days = parseInt(String(req.query.days || 30), 10) || 30;
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);
    const db = await readDb();
    const grouped = {};
    db.productAnalytics.filter((item) => new Date(item.createdAt).getTime() >= since).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).forEach((item) => { const date = String(item.createdAt).split("T")[0]; if (!grouped[date]) grouped[date] = { date, views: 0, clicks: 0, inquiries: 0 }; if (item.event === "view") grouped[date].views += 1; else if (item.event === "click") grouped[date].clicks += 1; else if (item.event === "inquiry") grouped[date].inquiries += 1; });
    res.json(Object.values(grouped));
  } catch (e) {
    next(e);
  }
});

export default router;
