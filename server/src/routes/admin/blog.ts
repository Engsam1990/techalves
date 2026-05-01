// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdminPermission } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import { readDb, writeDb, executeDb, createId, nowIso, sortByDateDesc } from "../../lib/db";

const router = Router();
router.use(requireAuth);
router.use(requireAdminPermission("blog:view"));

const blogBaseSchema = z.object({
  slug: z.string().min(2).max(200),
  title: z.string().min(3).max(200),
  excerpt: z.string().min(10),
  contentHtml: z.string().min(20),
  imageUrl: z.string().max(1000).optional().or(z.literal("")).nullable(),
  author: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  readTime: z.string().optional().nullable(),
  publishedAt: z.string().datetime().optional(),
  isPublished: z.boolean().default(true),
});

const blogCreateSchema = blogBaseSchema;
const blogUpdateSchema = blogBaseSchema.partial();

function normalizePostInput(data) {
  return {
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    contentHtml: data.contentHtml,
    imageUrl: data.imageUrl || null,
    author: data.author || null,
    category: data.category || null,
    readTime: data.readTime || null,
    publishedAt: data.publishedAt || nowIso(),
    isPublished: data.isPublished ?? true,
  };
}

function formatPost(post) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    contentHtml: post.contentHtml,
    imageUrl: post.imageUrl,
    author: post.author,
    category: post.category,
    readTime: post.readTime,
    isPublished: post.isPublished,
    publishedAt: post.publishedAt,
  };
}

router.get("/", async (_req, res, next) => {
  try {
    const db = await readDb();
    res.json(sortByDateDesc(db.blogPosts, "publishedAt").map(formatPost));
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const db = await readDb();
    const post = db.blogPosts.find((item) => item.id === String(req.params.id));
    if (!post) throw new AppError(404, "Blog post not found");
    res.json(formatPost(post));
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAdminPermission("blog:manage"), async (req, res, next) => {
  try {
    const data = blogCreateSchema.parse(req.body ?? {});
    const db = await readDb();
    const post = { id: createId(), ...normalizePostInput(data) };
    db.blogPosts.push(post);
    await writeDb(db);
    res.status(201).json(formatPost(post));
  } catch (e) {
    next(e);
  }
});

router.put("/:id", requireAdminPermission("blog:manage"), async (req, res, next) => {
  try {
    const patch = blogUpdateSchema.parse(req.body ?? {});
    const db = await readDb();
    const post = db.blogPosts.find((item) => item.id === String(req.params.id));
    if (!post) throw new AppError(404, "Blog post not found");

    const merged = blogCreateSchema.parse({
      slug: patch.slug ?? post.slug,
      title: patch.title ?? post.title,
      excerpt: patch.excerpt ?? post.excerpt,
      contentHtml: patch.contentHtml ?? post.contentHtml,
      imageUrl: patch.imageUrl ?? post.imageUrl ?? "",
      author: patch.author ?? post.author ?? "",
      category: patch.category ?? post.category ?? "",
      readTime: patch.readTime ?? post.readTime ?? "",
      publishedAt: patch.publishedAt ?? post.publishedAt,
      isPublished: patch.isPublished ?? post.isPublished,
    });

    Object.assign(post, normalizePostInput(merged));
    await writeDb(db);
    res.json(formatPost(post));
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireAdminPermission("blog:manage"), async (req, res, next) => {
  try {
    const db = await readDb();
    const exists = db.blogPosts.some((item) => item.id === String(req.params.id));
    if (!exists) throw new AppError(404, "Blog post not found");
    await executeDb("DELETE FROM `blog_posts` WHERE `id` = ?", [String(req.params.id)]);
    res.json({ message: "Blog post deleted" });
  } catch (e) {
    next(e);
  }
});

export default router;
