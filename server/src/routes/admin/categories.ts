// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdminPermission } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import { readDb, writeDb, executeDb, createId, nowIso } from "../../lib/db";

const router = Router();
router.use(requireAuth);
router.use(requireAdminPermission("catalog:view"));

const categorySchema = z.object({
  slug: z.string().min(2).max(120),
  name: z.string().min(2).max(120),
  description: z.string().optional().nullable(),
  imageUrl: z.string().max(1000).optional().or(z.literal("")).nullable(),
  icon: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

function formatCategory(db, category) {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    imageUrl: category.imageUrl,
    icon: category.icon,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    createdAt: category.createdAt,
    productCount: db.products.filter((product) => product.categoryId === category.id).length,
  };
}

router.get("/", async (_req, res, next) => {
  try {
    const db = await readDb();
    const categories = [...db.categories].sort(
      (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || String(a.name).localeCompare(String(b.name))
    );
    res.json(categories.map((item) => formatCategory(db, item)));
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const db = await readDb();
    const category = db.categories.find((item) => item.id === String(req.params.id));
    if (!category) throw new AppError(404, "Category not found");
    res.json(formatCategory(db, category));
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAdminPermission("catalog:manage"), async (req, res, next) => {
  try {
    const data = categorySchema.parse(req.body);
    const db = await readDb();
    const category = {
      id: createId(),
      slug: data.slug,
      name: data.name,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      icon: data.icon || null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      createdAt: nowIso(),
    };
    db.categories.push(category);
    await writeDb(db);
    res.status(201).json(formatCategory(db, category));
  } catch (e) {
    next(e);
  }
});

router.put("/:id", requireAdminPermission("catalog:manage"), async (req, res, next) => {
  try {
    const data = categorySchema.parse(req.body);
    const db = await readDb();
    const category = db.categories.find((item) => item.id === String(req.params.id));
    if (!category) throw new AppError(404, "Category not found");
    Object.assign(category, {
      slug: data.slug,
      name: data.name,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      icon: data.icon || null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    });
    await writeDb(db);
    res.json(formatCategory(db, category));
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireAdminPermission("catalog:manage"), async (req, res, next) => {
  try {
    const db = await readDb();
    const category = db.categories.find((item) => item.id === String(req.params.id));
    if (!category) throw new AppError(404, "Category not found");
    const productCount = db.products.filter((product) => product.categoryId === category.id).length;
    if (productCount > 0) throw new AppError(400, "Cannot delete a category that still has products");
    await executeDb("DELETE FROM `categories` WHERE `id` = ?", [category.id]);
    res.json({ message: "Category deleted" });
  } catch (e) {
    next(e);
  }
});

export default router;
