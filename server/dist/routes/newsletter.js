"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const newsletter_1 = require("../validators/newsletter");
const db_1 = require("../lib/db");
const router = (0, express_1.Router)();
router.post("/subscribe", async (req, res, next) => { try {
    const data = newsletter_1.newsletterSchema.parse(req.body);
    const db = await (0, db_1.readDb)();
    const email = String(data.email).toLowerCase();
    const existing = db.newsletterSubscribers.find((item) => String(item.email).toLowerCase() == email);
    if (existing)
        return res.status(200).json({ message: "Already subscribed" });
    db.newsletterSubscribers.push({ id: (0, db_1.createId)(), email, source: data.source || null, createdAt: (0, db_1.nowIso)() });
    await (0, db_1.writeDb)(db);
    res.status(201).json({ message: "Subscribed successfully" });
}
catch (e) {
    next(e);
} });
exports.default = router;
//# sourceMappingURL=newsletter.js.map