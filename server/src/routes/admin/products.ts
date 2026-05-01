// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdminPermission, hasAdminPermission } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import { deleteUploadedFileByUrl } from "../../utils/uploads";
import {
  readDb,
  writeDb,
  queryDb,
  executeDb,
  createId,
  nowIso,
  findProductById,
  findProductByBarcode,
  findCategoryById,
  findBrand,
  findSubcategory,
  findSpecification,
  findSpecificationValue,
  resolveProductSpecs,
  normalizeSerialNumber,
  findSerialNumber,
  getProductSerialNumbers,
  getAvailableSerialNumbers,
} from "../../lib/db";

const router = Router();
router.use(requireAuth);

const PRODUCT_SECTION_FIELD_PERMISSIONS = [
  { permission: "products:edit_basic", fields: ["name", "slug", "categoryId", "subcategory", "brand", "barcode", "condition", "description", "specs"] },
  { permission: "products:edit_serials", fields: ["serialNumbers"] },
  { permission: "products:edit_pricing_stock", fields: ["price", "originalPrice", "stockQuantity", "warrantyText", "featured", "premium"] },
  { permission: "products:edit_sources", fields: ["sourceId", "sourcedFrom", "sourcedBy", "sourceDate", "sourcePrice"] },
  { permission: "sourcing_payments:update", fields: ["sourcePaymentStatus", "sourcingPaymentStatus"] },
  { permission: "products:edit_images", fields: ["images"] },
];

function requiredProductUpdatePermissions(body) {
  const payload = body && typeof body === "object" ? body : {};
  const keys = Object.keys(payload);
  const required = new Set();

  for (const group of PRODUCT_SECTION_FIELD_PERMISSIONS) {
    if (group.fields.some((field) => keys.includes(field))) {
      required.add(group.permission);
    }
  }

  if (!required.size) required.add("products:edit");
  return Array.from(required);
}

function canEditProductSection(req, permission) {
  if (permission === "sourcing_payments:update") {
    return hasAdminPermission(req.adminUser, permission);
  }
  return hasAdminPermission(req.adminUser, "products:edit") || hasAdminPermission(req.adminUser, permission);
}

function requireProductUpdatePermission(req, _res, next) {
  try {
    const missing = requiredProductUpdatePermissions(req.body).filter((permission) => !canEditProductSection(req, permission));
    if (missing.length) {
      throw new AppError(403, "You do not have permission to edit this product section");
    }
    next();
  } catch (error) {
    next(error);
  }
}

function isUploadUrl(value) {
  return String(value || "").startsWith("/uploads/");
}

function isImageUsedByOtherProduct(db, productId, url) {
  return (db.products || []).some((item) => String(item.id || "") !== String(productId || "") && Array.isArray(item.images) && item.images.includes(url));
}

function deleteRemovedProductImageFiles(db, productId, previousImages, nextImages) {
  const nextSet = new Set((Array.isArray(nextImages) ? nextImages : []).map(String));
  for (const url of Array.isArray(previousImages) ? previousImages : []) {
    const imageUrl = String(url || "");
    if (!imageUrl || nextSet.has(imageUrl) || !isUploadUrl(imageUrl)) continue;
    if (isImageUsedByOtherProduct(db, productId, imageUrl)) continue;
    deleteUploadedFileByUrl(imageUrl);
  }
}


const imageValueSchema = z.string().min(1).max(1000);

const productSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  categoryId: z.string().uuid(),
  subcategory: z.string().optional().nullable(),
  brand: z.string().min(1).max(100),
  sourceId: z.string().optional().nullable(),
  barcode: z.string().trim().max(120).optional().nullable(),
  price: z.number().int().min(0),
  originalPrice: z.number().int().min(0).optional().nullable(),
  condition: z.enum(["new", "refurbished", "ex-uk"]),
  description: z.string().min(1),
  specs: z.record(z.string()).default({}),
  warrantyText: z.string().optional().nullable(),
  stockQuantity: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  premium: z.boolean().default(false),
  images: z.array(imageValueSchema).default([]),
  serialNumbers: z.array(z.string().trim().min(1).max(191)).default([]),
  sourcedFrom: z.string().trim().max(191).optional().nullable(),
  sourcedBy: z.string().trim().max(191).optional().nullable(),
  sourceDate: z.string().trim().max(20).optional().nullable(),
  sourcePrice: z.coerce.number().min(0).max(999999999).optional().default(0),
  sourcePaymentStatus: z.enum(["pending", "paid", "partial", "waived"]).optional().default("pending"),
  sourcingPaymentStatus: z.enum(["paid", "pay_later"]).optional().default("pay_later"),
  salesChannel: z.enum(["catalog", "pos_only"]).optional().default("catalog"),
  isCatalogVisible: z.boolean().optional().default(true),
});

const receiveStockSchema = z.object({
  quantity: z.coerce.number().int().min(1),
  unitSourcePrice: z.coerce.number().min(0).default(0),
  sellingPrice: z.coerce.number().int().min(0).optional(),
  sourceId: z.string().optional().nullable(),
  sourcedBy: z.string().trim().max(191).optional().nullable(),
  sourceDate: z.string().trim().max(20).optional().nullable(),
  paymentStatus: z.enum(["pending", "paid", "partial", "waived"]).optional(),
  paymentMethod: z.string().trim().max(80).optional().nullable(),
  reference: z.string().trim().max(191).optional().nullable(),
  receiptUrl: z.string().trim().max(1000).optional().nullable(),
  note: z.string().trim().max(1000).optional().nullable(),
  serialNumbers: z.array(z.string().trim().min(1).max(191)).default([]),
  images: z.array(imageValueSchema).default([]),
});

function normalizeBarcodeValue(value) {
  const barcode = String(value ?? "").trim();
  return barcode || null;
}

function normalizeSerialNumberList(values) {
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
    record?.updatedByAdminUserId,
    record?.dataEntrant,
    record?.createdBy,
    record?.updatedBy,
    ...extraRefs,
  ].map((value) => String(value || "").trim().toLowerCase());
  return refs.some((ref) => ref && scopeValues.includes(ref));
}

function resolveAdminName(db, adminIdOrLabel) {
  const entrant = adminDisplay(db, adminIdOrLabel);
  return entrant.label;
}

function normalizeSourceDate(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function formatSerial(serial) {
  return {
    id: serial.id,
    serialNumber: serial.serialNumber,
    status: serial.status || "available",
    orderId: serial.orderId || null,
    soldAt: serial.soldAt || null,
  };
}

function syncProductSerialNumbers(db, product, incomingSerialNumbers) {
  const nextSerialNumbers = normalizeSerialNumberList(incomingSerialNumbers);
  const existingForProduct = getProductSerialNumbers(db, product.id);
  const nextKeys = new Set(nextSerialNumbers.map((item) => item.toLowerCase()));

  for (const serialNumber of nextSerialNumbers) {
    const globalExisting = findSerialNumber(db, serialNumber);
    if (globalExisting && globalExisting.productId !== product.id) {
      throw new AppError(400, `Serial number ${serialNumber} is already assigned to another product`);
    }
  }

  for (const serial of existingForProduct) {
    const key = normalizeSerialNumber(serial.serialNumber).toLowerCase();
    if (nextKeys.has(key)) continue;
    if (serial.status !== "available") {
      throw new AppError(400, `Sold serial number ${serial.serialNumber} cannot be removed from this product`);
    }
  }

  product.serialNumbers = nextSerialNumbers;
}

function ensureUniqueBarcode(db, barcodeValue, excludeProductId) {
  const barcode = normalizeBarcodeValue(barcodeValue);
  if (!barcode) return;

  const existing = findProductByBarcode(db, barcode);
  if (existing && existing.id !== excludeProductId) {
    throw new AppError(400, "Barcode is already assigned to another product");
  }
}

function normalizeSpecsPayload(db, subcategoryValue, rawSpecs) {
  const source = rawSpecs && typeof rawSpecs === "object" && !Array.isArray(rawSpecs) ? rawSpecs : {};
  if (!subcategoryValue) {
    return Object.fromEntries(
      Object.entries(source)
        .map(([key, value]) => [String(key), String(value ?? "")])
        .filter(([key, value]) => key.trim() && value.trim())
    );
  }

  const subcategory = findSubcategory(db, subcategoryValue);
  if (!subcategory) throw new AppError(400, "Subcategory not found");

  const nextSpecs = {};
  for (const [key, value] of Object.entries(source)) {
    const specification = findSpecification(db, String(key), subcategory.id);
    if (!specification) throw new AppError(400, `Unknown specification: ${String(key)}`);

    const option = findSpecificationValue(db, String(value), specification.id);
    if (!option) throw new AppError(400, `Invalid specification value for ${specification.name}`);

    nextSpecs[specification.id] = option.id;
  }

  return nextSpecs;
}

function formatProduct(db, product) {
  const category = findCategoryById(db, product.categoryId);
  const brand = findBrand(db, product.brand);
  const subcategory = findSubcategory(db, product.subcategory, product.categoryId);
  const resolvedSpecs = resolveProductSpecs(db, product.specs, subcategory?.id ?? product.subcategory);
  const entrant = adminDisplay(db, product.dataEntrant, product.createdByAdminUserId, product.createdBy);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    category: category?.slug ?? product.categoryId,
    categoryName: category?.name,
    subcategory: subcategory?.name ?? product.subcategory,
    subcategoryId: subcategory?.id ?? null,
    brand: brand?.name ?? product.brand,
    brandId: brand?.id ?? null,
    sourceId: product.sourceId || null,
    sourceName: (db.productSources || []).find((item) => item.id === product.sourceId)?.name || null,
    barcode: normalizeBarcodeValue(product.barcode),
    price: product.price,
    originalPrice: product.originalPrice,
    condition: product.condition,
    description: product.description,
    specs: resolvedSpecs.display,
    specSelections: resolvedSpecs.selections,
    images: product.images || [],
    inStock: product.inStock,
    stockQuantity: product.stockQuantity,
    totalStockReceived: Number(product.totalStockReceived ?? product.stockQuantity ?? 0),
    featured: product.featured,
    premium: Boolean(product.premium),
    rating: Number(product.rating || 0),
    reviewCount: Number(product.reviewCount || 0),
    warranty: product.warrantyText,
    sourcedFrom: product.sourcedFrom || null,
    sourcedBy: product.sourcedBy || null,
    sourceDate: product.sourceDate || null,
    sourcePrice: Number(product.sourcePrice || 0),
    sourcePaymentStatus: product.sourcePaymentStatus || (product.sourcingPaymentStatus === "paid" ? "paid" : "pending"),
    salesChannel: product.salesChannel || "catalog",
    isCatalogVisible: product.isCatalogVisible !== false,
    sourcingPaymentStatus: product.sourcingPaymentStatus || "pay_later",
    sourcingPaidAt: product.sourcingPaidAt || null,
    sourcingPaidBy: product.sourcingPaidBy || null,
    dataEntrantId: entrant.id || product.dataEntrant || product.createdByAdminUserId || null,
    dataEntrantName: entrant.name || null,
    dataEntrantEmail: entrant.email || null,
    dataEntrant: entrant.label || null,
    entryDate: product.entryDate || product.createdAt,
    createdAt: product.createdAt,
    serialNumbers: getProductSerialNumbers(db, product.id).map(formatSerial),
    availableSerialNumbers: getAvailableSerialNumbers(db, product.id).map((serial) => serial.serialNumber),
  };
}

router.get("/", requireAdminPermission("products:view"), async (req, res, next) => {
  try {
    const db = await readDb();
    const includePosOnly = String(req.query.includePosOnly || "").trim() === "1";
    let products = includePosOnly
      ? db.products
      : db.products.filter((item) => item.salesChannel !== "pos_only" && item.isCatalogVisible !== false);
    if (!hasAdminPermission(req.adminUser, "products:view_all")) {
      products = products.filter((item) => isOwnAdminRecord(req, item, item.sourcingPaidBy));
    }
    res.json(products.map((item) => formatProduct(db, item)));
  } catch (e) {
    next(e);
  }
});


router.get("/sourcing/payments", requireAdminPermission("sourcing_payments:view"), async (req, res, next) => {
  try {
    const db = await readDb();
    const status = String(req.query.status || "pay_later");
    const products = db.products
      .filter((product) => Number(product.sourcePrice || 0) > 0 || product.sourcedFrom || product.sourcedBy)
      .filter((product) => status === "all" ? true : String(product.sourcingPaymentStatus || "pay_later") === status)
      .sort((a, b) => new Date(b.sourceDate || b.createdAt).getTime() - new Date(a.sourceDate || a.createdAt).getTime());
    res.json(products.map((product) => formatProduct(db, product)));
  } catch (e) {
    next(e);
  }
});

router.get("/:id", requireAdminPermission("products:view"), async (req, res, next) => {
  try {
    const db = await readDb();
    const product = findProductById(db, String(req.params.id));
    if (!product) throw new AppError(404, "Product not found");
    if (!hasAdminPermission(req.adminUser, "products:view_all") && !isOwnAdminRecord(req, product, product.sourcingPaidBy)) {
      throw new AppError(403, "You can only view products tied to your admin activity");
    }
    res.json(formatProduct(db, product));
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAdminPermission("products:create"), async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);
    const db = await readDb();
    if (!findCategoryById(db, data.categoryId)) throw new AppError(400, "Category not found");
    if (!findBrand(db, data.brand)) throw new AppError(400, "Brand not found");
    ensureUniqueBarcode(db, data.barcode);
    if (data.subcategory) {
      const subcategory = findSubcategory(db, data.subcategory, data.categoryId);
      if (!subcategory) throw new AppError(400, "Subcategory not found for selected category");
    }

    const now = nowIso();
    const product = {
      id: createId(),
      name: data.name,
      slug: data.slug,
      categoryId: data.categoryId,
      subcategory: data.subcategory || null,
      brand: data.brand,
      sourceId: data.sourceId || null,
      barcode: normalizeBarcodeValue(data.barcode),
      price: data.price,
      originalPrice: data.originalPrice || null,
      condition: data.condition,
      description: data.description,
      specs: normalizeSpecsPayload(db, data.subcategory, data.specs),
      warrantyText: data.warrantyText || null,
      stockQuantity: data.stockQuantity,
      totalStockReceived: data.stockQuantity,
      inStock: data.stockQuantity > 0,
      featured: data.featured,
      premium: data.premium,
      rating: 0,
      reviewCount: 0,
      images: data.images,
      sourcedFrom: data.sourcedFrom || null,
      sourcedBy: data.sourcedBy || null,
      sourceDate: normalizeSourceDate(data.sourceDate),
      sourcePrice: Number(data.sourcePrice || 0),
      sourcePaymentStatus: data.sourcePaymentStatus || (data.sourcingPaymentStatus === "paid" ? "paid" : "pending"),
      salesChannel: data.salesChannel || "catalog",
      isCatalogVisible: data.isCatalogVisible !== false,
      createdByAdminUserId: adminEntrantId(req, db),
      updatedByAdminUserId: adminEntrantId(req, db),
      sourcingPaymentStatus: data.sourcingPaymentStatus === "paid" ? "paid" : "pay_later",
      sourcingPaidAt: data.sourcingPaymentStatus === "paid" ? now : null,
      sourcingPaidBy: data.sourcingPaymentStatus === "paid" ? adminEntrantId(req, db) : null,
      dataEntrant: adminEntrantId(req, db),
      entryDate: now,
      createdAt: now,
    };

    db.products.push(product);
    syncProductSerialNumbers(db, product, data.serialNumbers);
    if (data.stockQuantity > 0) {
      db.inventoryMovements.push({
        id: createId(),
        productId: product.id,
        orderId: null,
        adminUserId: adminEntrantId(req, db),
        type: "initial_stock",
        quantityChange: data.stockQuantity,
        quantityBefore: 0,
        quantityAfter: data.stockQuantity,
        note: "Initial stock on product creation",
        dataEntrant: adminEntrantId(req, db),
        entryDate: now,
        createdAt: now,
      });
    }

    await writeDb(db);
    res.status(201).json(formatProduct(db, product));
  } catch (e) {
    next(e);
  }
});

router.put("/:id", requireProductUpdatePermission, async (req, res, next) => {
  try {
    const data = productSchema.partial().parse(req.body);
    const db = await readDb();
    const product = findProductById(db, String(req.params.id));
    if (!product) throw new AppError(404, "Product not found");

    const nextCategoryId = data.categoryId ?? product.categoryId;
    const nextSubcategory = data.subcategory !== undefined ? data.subcategory : product.subcategory;
    const nextBrand = data.brand ?? product.brand;
    const nextBarcode = data.barcode !== undefined ? normalizeBarcodeValue(data.barcode) : normalizeBarcodeValue(product.barcode);

    if (!findCategoryById(db, nextCategoryId)) throw new AppError(400, "Category not found");
    if (!findBrand(db, nextBrand)) throw new AppError(400, "Brand not found");
    ensureUniqueBarcode(db, nextBarcode, product.id);
    if (nextSubcategory) {
      const resolvedSubcategory = findSubcategory(db, nextSubcategory, nextCategoryId);
      if (!resolvedSubcategory) throw new AppError(400, "Subcategory not found for selected category");
    }

    const previousImages = Array.isArray(product.images) ? [...product.images] : [];
    const prevStock = Number(product.stockQuantity || 0);
    const hasStockUpdate = data.stockQuantity !== undefined;
    const nextStockQuantity = hasStockUpdate ? Number(data.stockQuantity || 0) : prevStock;
    const stockDelta = nextStockQuantity - prevStock;
    const prevTotalStockReceived = Number(product.totalStockReceived || prevStock || 0);
    const nextTotalStockReceived = hasStockUpdate && stockDelta > 0 ? prevTotalStockReceived + stockDelta : prevTotalStockReceived;

    Object.assign(product, {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
      ...(data.subcategory !== undefined ? { subcategory: data.subcategory || null } : {}),
      ...(data.brand !== undefined ? { brand: data.brand } : {}),
      ...(data.sourceId !== undefined ? { sourceId: data.sourceId || null } : {}),
      ...(data.barcode !== undefined ? { barcode: nextBarcode } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.originalPrice !== undefined ? { originalPrice: data.originalPrice || null } : {}),
      ...(data.condition !== undefined ? { condition: data.condition } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.specs !== undefined ? { specs: normalizeSpecsPayload(db, nextSubcategory, data.specs) } : {}),
      ...(data.warrantyText !== undefined ? { warrantyText: data.warrantyText || null } : {}),
      ...(hasStockUpdate ? { stockQuantity: nextStockQuantity, inStock: nextStockQuantity > 0, totalStockReceived: nextTotalStockReceived } : {}),
      ...(data.featured !== undefined ? { featured: data.featured } : {}),
      ...(data.premium !== undefined ? { premium: data.premium } : {}),
      ...(data.images !== undefined ? { images: data.images } : {}),
      ...(data.sourcedFrom !== undefined ? { sourcedFrom: data.sourcedFrom || null } : {}),
      ...(data.sourcedBy !== undefined ? { sourcedBy: data.sourcedBy || null } : {}),
      ...(data.sourceDate !== undefined ? { sourceDate: normalizeSourceDate(data.sourceDate) } : {}),
      ...(data.sourcePrice !== undefined ? { sourcePrice: Number(data.sourcePrice || 0) } : {}),
      ...(data.sourcePaymentStatus !== undefined ? { sourcePaymentStatus: data.sourcePaymentStatus || "pending" } : {}),
      ...(data.salesChannel !== undefined ? { salesChannel: data.salesChannel || "catalog" } : {}),
      ...(data.isCatalogVisible !== undefined ? { isCatalogVisible: data.isCatalogVisible !== false } : {}),
      updatedByAdminUserId: adminEntrantId(req, db),
      ...(data.sourcingPaymentStatus !== undefined
        ? {
            sourcingPaymentStatus: data.sourcingPaymentStatus === "paid" ? "paid" : "pay_later",
            sourcingPaidAt: data.sourcingPaymentStatus === "paid" ? (product.sourcingPaidAt || nowIso()) : null,
            sourcingPaidBy: data.sourcingPaymentStatus === "paid" ? (product.sourcingPaidBy || adminEntrantId(req, db)) : null,
          }
        : {}),
    });

    if (hasStockUpdate && stockDelta !== 0) {
      db.inventoryMovements.push({
        id: createId(),
        productId: product.id,
        orderId: null,
        adminUserId: adminEntrantId(req, db),
        type: "manual_adjustment",
        quantityChange: stockDelta,
        quantityBefore: prevStock,
        quantityAfter: nextStockQuantity,
        note: stockDelta > 0 ? "Stock increased from admin product form" : "Stock reduced from admin product form",
        dataEntrant: adminEntrantId(req, db),
        entryDate: nowIso(),
        createdAt: nowIso(),
      });
    }

    if (data.serialNumbers !== undefined) {
      syncProductSerialNumbers(db, product, data.serialNumbers);
    }

    await writeDb(db);

    if (data.images !== undefined) {
      deleteRemovedProductImageFiles(db, product.id, previousImages, product.images || []);
    }

    res.json(formatProduct(db, product));
  } catch (e) {
    next(e);
  }
});

router.post("/:id/receive-stock", requireAdminPermission("inventory:receive_stock"), async (req, res, next) => {
  try {
    const data = receiveStockSchema.parse(req.body || {});
    const db = await readDb();
    const product = findProductById(db, String(req.params.id));
    if (!product) throw new AppError(404, "Product not found");

    const serialNumbers = normalizeSerialNumberList(data.serialNumbers);
    if (serialNumbers.length > data.quantity) {
      throw new AppError(400, "Serial numbers cannot be more than received quantity");
    }
    for (const serialNumber of serialNumbers) {
      const existing = findSerialNumber(db, serialNumber);
      if (existing && existing.productId !== product.id) {
        throw new AppError(400, `Serial number ${serialNumber} is already assigned to another product`);
      }
    }

    if (data.sourceId) {
      const source = (db.productSources || []).find((item) => item.id === data.sourceId);
      if (!source) throw new AppError(400, "Supplier/source not found");
    }

    const before = Number(product.stockQuantity || 0);
    const after = before + data.quantity;
    const now = nowIso();
    const entrantId = adminEntrantId(req, db);
    const nextSerialNumbers = normalizeSerialNumberList([...(product.serialNumbers || []), ...serialNumbers]);
    const nextPaymentStatus = data.paymentStatus || product.sourcePaymentStatus || (product.sourcingPaymentStatus === "paid" ? "paid" : "pending");

    Object.assign(product, {
      stockQuantity: after,
      inStock: after > 0,
      totalStockReceived: Number(product.totalStockReceived || 0) + data.quantity,
      ...(data.sellingPrice !== undefined ? { price: data.sellingPrice } : {}),
      ...(data.sourceId !== undefined ? { sourceId: data.sourceId || null } : {}),
      ...(data.sourcedBy !== undefined ? { sourcedBy: data.sourcedBy || null } : {}),
      ...(data.sourceDate !== undefined ? { sourceDate: normalizeSourceDate(data.sourceDate) } : {}),
      sourcePrice: Number(data.unitSourcePrice || 0),
      ...(canUpdateSourcePayments && data.paymentStatus !== undefined
        ? {
            sourcePaymentStatus: nextPaymentStatus,
            sourcingPaymentStatus: nextPaymentStatus === "paid" ? "paid" : "pay_later",
            sourcingPaidAt: nextPaymentStatus === "paid" ? now : null,
            sourcingPaidBy: nextPaymentStatus === "paid" ? entrantId : null,
          }
        : {}),
      serialNumbers: nextSerialNumbers,
      updatedByAdminUserId: entrantId,
      dataEntrant: entrantId,
    });

    const movement = {
      id: createId(),
      productId: product.id,
      orderId: null,
      adminUserId: entrantId,
      type: "stock_received",
      quantityChange: data.quantity,
      quantityBefore: before,
      quantityAfter: after,
      unitSourcePrice: Number(data.unitSourcePrice || 0),
      sourceId: data.sourceId || null,
      sourceDate: normalizeSourceDate(data.sourceDate) || now.slice(0, 10),
      paymentStatus: data.paymentStatus || "pending",
      paymentMethod: data.paymentMethod || null,
      reference: data.reference || null,
      receiptUrl: data.receiptUrl || null,
      images: data.images,
      note: data.note || "Stock received",
      dataEntrant: entrantId,
      entryDate: now,
      createdAt: now,
    };
    db.inventoryMovements.push(movement);

    await writeDb(db);
    res.status(201).json({ product: formatProduct(db, product), movement });
  } catch (e) {
    next(e);
  }
});


router.patch("/:id/sourcing-payment", requireAdminPermission("sourcing_payments:update"), async (req, res, next) => {
  try {
    const data = z.object({ paymentStatus: z.enum(["paid", "pay_later"]).default("paid") }).parse(req.body || {});
    const db = await readDb();
    const product = findProductById(db, String(req.params.id));
    if (!product) throw new AppError(404, "Product not found");

    const now = nowIso();
    const entrantId = adminEntrantId(req, db);
    product.sourcingPaymentStatus = data.paymentStatus;
    product.sourcePaymentStatus = data.paymentStatus === "paid" ? "paid" : "pending";
    product.sourcingPaidAt = data.paymentStatus === "paid" ? now : null;
    product.sourcingPaidBy = data.paymentStatus === "paid" ? entrantId : null;
    product.updatedByAdminUserId = entrantId;
    product.dataEntrant = entrantId;
    product.entryDate = product.entryDate || now;

    // Source Payments now updates only the product acquisition-payment status.
    // Do not create supplier/acquisition expenses here.


    await writeDb(db);
    res.json(formatProduct(db, product));
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireAdminPermission("products:delete"), async (req, res, next) => {
  try {
    const db = await readDb();
    const product = findProductById(db, String(req.params.id));
    if (!product) throw new AppError(404, "Product not found");

    const [{ count: orderItemCount = 0 } = {}] = await queryDb("SELECT COUNT(*) AS count FROM `order_items` WHERE `product_id` = ?", [product.id]);
    const [{ count: movementCount = 0 } = {}] = await queryDb("SELECT COUNT(*) AS count FROM `inventory_movements` WHERE `product_id` = ?", [product.id]);
    const [{ count: expenseCount = 0 } = {}] = await queryDb("SELECT COUNT(*) AS count FROM `expenses` WHERE `product_id` = ?", [product.id]);
    const hasBusinessHistory = Number(orderItemCount) > 0 || Number(movementCount) > 0 || Number(expenseCount) > 0;

    await executeDb("DELETE FROM `cart_items` WHERE `product_id` = ?", [product.id]);

    if (hasBusinessHistory) {
      Object.assign(product, {
        salesChannel: "pos_only",
        isCatalogVisible: false,
        featured: false,
        premium: false,
        updatedByAdminUserId: adminEntrantId(req, db),
        dataEntrant: adminEntrantId(req, db),
        updatedAt: nowIso(),
      });
      await writeDb(db);
      return res.json({
        message: "Product has order/inventory/expense history, so it was archived instead of permanently deleted",
        product: formatProduct(db, product),
      });
    }

    const productImagesToDelete = Array.isArray(product.images) ? [...product.images] : [];

    await executeDb("DELETE FROM `product_images` WHERE `product_id` = ?", [product.id]);
    await executeDb("DELETE FROM `product_analytics` WHERE `product_id` = ?", [product.id]);
    await executeDb("DELETE FROM `reviews` WHERE `product_id` = ?", [product.id]);
    await executeDb("DELETE FROM `products` WHERE `id` = ?", [product.id]);

    deleteRemovedProductImageFiles(db, product.id, productImagesToDelete, []);

    res.json({ message: "Product deleted" });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id/toggle-featured", requireAdminPermission("products:toggle_featured"), async (req, res, next) => {
  try {
    const db = await readDb();
    const product = findProductById(db, String(req.params.id));
    if (!product) throw new AppError(404, "Product not found");
    product.featured = !product.featured;
    await writeDb(db);
    res.json(formatProduct(db, product));
  } catch (e) {
    next(e);
  }
});

router.patch("/:id/toggle-premium", requireAdminPermission("products:toggle_premium"), async (req, res, next) => {
  try {
    const db = await readDb();
    const product = findProductById(db, String(req.params.id));
    if (!product) throw new AppError(404, "Product not found");
    product.premium = !Boolean(product.premium);
    await writeDb(db);
    res.json(formatProduct(db, product));
  } catch (e) {
    next(e);
  }
});

router.patch("/:id/toggle-stock", requireAdminPermission("inventory:adjust"), async (req, res, next) => {
  try {
    const db = await readDb();
    const product = findProductById(db, String(req.params.id));
    if (!product) throw new AppError(404, "Product not found");
    if (product.stockQuantity > 0) {
      product.stockQuantity = 0;
      product.inStock = false;
    } else {
      product.stockQuantity = 1;
      product.inStock = true;
      product.totalStockReceived = Number(product.totalStockReceived || 0) + 1;
    }
    await writeDb(db);
    res.json(formatProduct(db, product));
  } catch (e) {
    next(e);
  }
});

export default router;
