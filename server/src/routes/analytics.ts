// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler";
import { readDb, writeDb, createId, nowIso, findProductById } from "../lib/db";
const router = Router();
const trackSchema = z.object({ productId: z.string().uuid(), event: z.enum(["view", "click", "inquiry", "add_to_compare"]), metadata: z.record(z.any()).optional() });
router.post("/track", async (req, res, next) => { try { const data = trackSchema.parse(req.body); const db = await readDb(); if (!findProductById(db, data.productId)) throw new AppError(404, "Product not found"); db.productAnalytics.push({ id: createId(), productId: data.productId, event: data.event, metadata: data.metadata || {}, ipAddress: req.headers["x-forwarded-for"] || req.ip, userAgent: req.headers["user-agent"] || null, createdAt: nowIso() }); await writeDb(db); res.json({ success: true }); } catch (e) { next(e); } });
export default router;
