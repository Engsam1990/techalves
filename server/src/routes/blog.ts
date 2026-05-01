// @ts-nocheck
import { Router } from "express";
import { AppError } from "../middleware/errorHandler";
import { readDb, sortByDateDesc } from "../lib/db";
const router = Router();
function formatPost(post) { return { id: post.id, slug: post.slug, title: post.title, excerpt: post.excerpt, content: post.contentHtml, image: post.imageUrl, author: post.author, date: String(post.publishedAt || "").split("T")[0], category: post.category, readTime: post.readTime }; }
router.get("/", async (_req, res, next) => { try { const db = await readDb(); const posts = sortByDateDesc(db.blogPosts.filter((item) => item.isPublished !== false), "publishedAt"); res.json(posts.map(formatPost)); } catch (e) { next(e); } });
router.get("/:slug", async (req, res, next) => { try { const db = await readDb(); const post = db.blogPosts.find((item) => item.slug === String(req.params.slug) && item.isPublished !== false); if (!post) throw new AppError(404, "Blog post not found"); res.json(formatPost(post)); } catch (e) { next(e); } });
export default router;
