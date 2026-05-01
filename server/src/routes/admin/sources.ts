// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdminPermission } from "../../middleware/auth";
import { readDb, executeDb, queryDb, createId, nowIso, contains } from "../../lib/db";
import { AppError } from "../../middleware/errorHandler";

const router = Router();
router.use(requireAuth);

const sourceSchema = z.object({
  name: z.string().trim().min(1).max(191),
  type: z.enum(["supplier", "source", "marketplace", "walk_in", "other"]).default("supplier"),
  contactPerson: z.string().trim().max(191).optional().nullable(),
  phone: z.string().trim().max(60).optional().nullable(),
  email: z.string().trim().email().max(191).optional().nullable().or(z.literal("")),
  location: z.string().trim().max(191).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  isActive: z.boolean().default(true),
});

function adminId(req) { return req.adminUser?.id || null; }
function formatSource(source) { return { ...source, isActive: source.isActive !== false }; }

router.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    const db = await readDb();
    const items = (db.productSources || [])
      .filter((item) => String(req.query.active || "").toLowerCase() === "all" ? true : item.isActive !== false)
      .filter((item) => !q || [item.name, item.type, item.phone, item.email, item.location, item.contactPerson].some((value) => contains(value, q)))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)))
      .map(formatSource);
    res.json(items);
  } catch (e) { next(e); }
});

router.post("/", requireAdminPermission("sources:manage"), async (req, res, next) => {
  try {
    const data = sourceSchema.parse(req.body);
    const db = await readDb();
    const now = nowIso();
    if ((db.productSources || []).some((item) => String(item.name).trim().toLowerCase() === data.name.toLowerCase())) {
      throw new AppError(400, "A supplier/source with this name already exists");
    }
    const source = {
      id: createId(),
      name: data.name,
      type: data.type,
      contactPerson: data.contactPerson || null,
      phone: data.phone || null,
      email: data.email || null,
      location: data.location || null,
      notes: data.notes || null,
      isActive: data.isActive !== false,
      createdByAdminUserId: adminId(req),
      createdAt: now,
      updatedAt: now,
    };
    await executeDb(
      "INSERT INTO `product_sources` (`id`, `name`, `type`, `contact_person`, `phone`, `email`, `location`, `notes`, `is_active`, `created_by_admin_user_id`, `created_at`, `updated_at`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [source.id, source.name, source.type, source.contactPerson, source.phone, source.email, source.location, source.notes, source.isActive ? 1 : 0, source.createdByAdminUserId, source.createdAt.replace("T", " ").replace("Z", ""), source.updatedAt.replace("T", " ").replace("Z", "")]
    );
    res.status(201).json(formatSource(source));
  } catch (e) { next(e); }
});

router.put("/:id", requireAdminPermission("sources:manage"), async (req, res, next) => {
  try {
    const data = sourceSchema.partial().parse(req.body);
    const db = await readDb();
    const source = (db.productSources || []).find((item) => item.id === String(req.params.id));
    if (!source) throw new AppError(404, "Supplier/source not found");
    Object.assign(source, {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.contactPerson !== undefined ? { contactPerson: data.contactPerson || null } : {}),
      ...(data.phone !== undefined ? { phone: data.phone || null } : {}),
      ...(data.email !== undefined ? { email: data.email || null } : {}),
      ...(data.location !== undefined ? { location: data.location || null } : {}),
      ...(data.notes !== undefined ? { notes: data.notes || null } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive !== false } : {}),
      updatedAt: nowIso(),
    });
    await executeDb(
      "UPDATE `product_sources` SET `name` = ?, `type` = ?, `contact_person` = ?, `phone` = ?, `email` = ?, `location` = ?, `notes` = ?, `is_active` = ?, `updated_at` = ? WHERE `id` = ?",
      [source.name, source.type || "supplier", source.contactPerson || null, source.phone || null, source.email || null, source.location || null, source.notes || null, source.isActive === false ? 0 : 1, source.updatedAt.replace("T", " ").replace("Z", ""), source.id]
    );
    res.json(formatSource(source));
  } catch (e) { next(e); }
});

router.delete("/:id", requireAdminPermission("sources:manage"), async (req, res, next) => {
  try {
    const db = await readDb();
    const id = String(req.params.id);
    const source = (db.productSources || []).find((item) => item.id === id);
    if (!source) throw new AppError(404, "Supplier/source not found");
    const [{ count: productCount = 0 } = {}] = await queryDb("SELECT COUNT(*) AS count FROM `products` WHERE `source_id` = ?", [id]);
    const [{ count: orderItemCount = 0 } = {}] = await queryDb("SELECT COUNT(*) AS count FROM `order_items` WHERE `source_id` = ?", [id]);
    const [{ count: expenseCount = 0 } = {}] = await queryDb("SELECT COUNT(*) AS count FROM `expenses` WHERE `source_id` = ? AND COALESCE(`payment_status`, '') <> 'cancelled'", [id]);
    const isUsed = Number(productCount) > 0 || Number(orderItemCount) > 0 || Number(expenseCount) > 0;
    if (isUsed) {
      const updatedAt = nowIso();
      source.isActive = false;
      source.updatedAt = updatedAt;
      await executeDb("UPDATE `product_sources` SET `is_active` = 0, `updated_at` = ? WHERE `id` = ?", [updatedAt.replace("T", " ").replace("Z", ""), id]);
      return res.json({ message: "Supplier/source is used by records, so it was deactivated instead of deleted", source: formatSource(source) });
    }
    await executeDb("DELETE FROM `product_sources` WHERE `id` = ?", [id]);
    res.json({ message: "Supplier/source deleted" });
  } catch (e) { next(e); }
});

export default router;
