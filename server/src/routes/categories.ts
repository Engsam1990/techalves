// @ts-nocheck
import { Router } from "express";
import { AppError } from "../middleware/errorHandler";
import { readDb } from "../lib/db";
const router = Router();
router.get("/", async (_req, res, next) => {
  try {
    const db = await readDb();
    const categories = db.categories.filter((item) => item.isActive !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((item) => ({ id: item.id, slug: item.slug, name: item.name, description: item.description, image: item.imageUrl, icon: item.icon, productCount: db.products.filter((product) => product.categoryId === item.id).length }));
    res.json(categories);
  } catch (e) { next(e); }
});
router.get("/:slug", async (req, res, next) => {
  try {
    const db = await readDb();
    const category = db.categories.find((item) => item.slug === String(req.params.slug));
    if (!category) throw new AppError(404, "Category not found");
    res.json({ id: category.id, slug: category.slug, name: category.name, description: category.description, image: category.imageUrl, icon: category.icon, productCount: db.products.filter((product) => product.categoryId === category.id).length });
  } catch (e) { next(e); }
});
export default router;
