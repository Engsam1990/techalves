// @ts-nocheck
import { Router } from "express";
import { requireAuth, requireAdminPermission } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import { readDb, writeDb, executeDb, contains, sortByDateDesc } from "../../lib/db";
const router = Router();
router.use(requireAuth);
router.use(requireAdminPermission("newsletter:view"));
router.get("/", async (req, res, next) => { try { const q = String(req.query.q || "").trim(); const db = await readDb(); const subscribers = sortByDateDesc(db.newsletterSubscribers).filter((item) => !q || contains(item.email, q) || contains(item.source, q)); res.json(subscribers); } catch (e) { next(e); } });
router.delete("/:id", requireAdminPermission("newsletter:manage"), async (req, res, next) => { try { const db = await readDb(); const exists = db.newsletterSubscribers.some((item) => item.id === String(req.params.id)); if (!exists) throw new AppError(404, "Subscriber not found"); await executeDb("DELETE FROM `newsletter_subscribers` WHERE `id` = ?", [String(req.params.id)]); res.json({ message: "Subscriber removed" }); } catch (e) { next(e); } });
export default router;
