// @ts-nocheck
import { Router } from "express";
import { newsletterSchema } from "../validators/newsletter";
import { readDb, writeDb, createId, nowIso } from "../lib/db";
const router = Router();
router.post("/subscribe", async (req, res, next) => { try { const data = newsletterSchema.parse(req.body); const db = await readDb(); const email = String(data.email).toLowerCase(); const existing = db.newsletterSubscribers.find((item) => String(item.email).toLowerCase() == email); if (existing) return res.status(200).json({ message: "Already subscribed" }); db.newsletterSubscribers.push({ id: createId(), email, source: data.source || null, createdAt: nowIso() }); await writeDb(db); res.status(201).json({ message: "Subscribed successfully" }); } catch (e) { next(e); } });
export default router;
