// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler";
import { requireCustomerAuth } from "../middleware/auth";
import { readDb, writeDb, createId, nowIso, recalcProductReviewStats, findProductBySlug } from "../lib/db";
const router = Router();
const reviewSchema = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().min(10).max(1500) });
function formatReview(db, review) { const customer = db.customerUsers.find((item) => item.id === review.customerId); return { id: review.id, rating: review.rating, comment: review.comment, createdAt: review.createdAt, reviewerName: customer?.fullName ?? "Verified customer" }; }
router.get("/product/:slug", async (req, res, next) => { try { const db = await readDb(); const product = findProductBySlug(db, String(req.params.slug)); if (!product) throw new AppError(404, "Product not found"); const reviews = db.reviews.filter((item) => item.productId === product.id && item.isApproved !== false).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); res.json(reviews.map((item) => formatReview(db, item))); } catch (e) { next(e); } });
router.post("/product/:slug", requireCustomerAuth, async (req, res, next) => { try { const data = reviewSchema.parse(req.body); const db = await readDb(); const product = findProductBySlug(db, String(req.params.slug)); if (!product) throw new AppError(404, "Product not found"); const existing = db.reviews.find((item) => item.productId === product.id && item.customerId === req.customerUser.id); if (existing) { existing.rating = data.rating; existing.comment = data.comment; existing.isApproved = true; existing.updatedAt = nowIso(); } else { db.reviews.push({ id: createId(), productId: product.id, customerId: req.customerUser.id, rating: data.rating, comment: data.comment, isApproved: true, createdAt: nowIso(), updatedAt: nowIso() }); } recalcProductReviewStats(db, product.id); await writeDb(db); res.status(201).json({ message: "Your review has been saved successfully." }); } catch (e) { next(e); } });
export default router;
