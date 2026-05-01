// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdminPermission } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import { readDb, writeDb, executeDb, contains, sortByDateDesc } from "../../lib/db";
const router = Router();
router.use(requireAuth);
router.use(requireAdminPermission("messages:view"));
const statusSchema = z.object({ status: z.enum(["new", "in_progress", "resolved", "archived"]) });
router.get("/", async (req, res, next) => { try { const q = String(req.query.q || "").trim(); const status = String(req.query.status || "").trim(); const db = await readDb(); const items = sortByDateDesc(db.contactMessages).filter((item) => (!status || item.status === status) && (!q || [item.fullName, item.email, item.subject, item.message].some((value) => contains(value, q)))); res.json(items); } catch (e) { next(e); } });
router.patch("/:id", requireAdminPermission("messages:manage"), async (req, res, next) => { try { const data = statusSchema.parse(req.body); const db = await readDb(); const message = db.contactMessages.find((item) => item.id === String(req.params.id)); if (!message) throw new AppError(404, "Contact message not found"); message.status = data.status; await writeDb(db); res.json(message); } catch (e) { next(e); } });
router.delete("/:id", requireAdminPermission("messages:manage"), async (req, res, next) => { try { const db = await readDb(); const exists = db.contactMessages.some((item) => item.id === String(req.params.id)); if (!exists) throw new AppError(404, "Contact message not found"); await executeDb("DELETE FROM `contact_messages` WHERE `id` = ?", [String(req.params.id)]); res.json({ message: "Message deleted" }); } catch (e) { next(e); } });
export default router;
