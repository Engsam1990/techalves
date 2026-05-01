// @ts-nocheck
import { Router } from "express";
import { contactSchema } from "../validators/contact";
import { readDb, writeDb, createId, nowIso } from "../lib/db";
const router = Router();
router.post("/", async (req, res, next) => { try { const data = contactSchema.parse(req.body); const db = await readDb(); db.contactMessages.push({ id: createId(), ...data, status: "new", createdAt: nowIso() }); await writeDb(db); res.status(201).json({ message: "Message sent successfully" }); } catch (e) { next(e); } });
export default router;
