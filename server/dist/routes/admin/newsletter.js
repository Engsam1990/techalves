"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const db_1 = require("../../lib/db");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.use((0, auth_1.requireAdminPermission)("newsletter:view"));
router.get("/", async (req, res, next) => { try {
    const q = String(req.query.q || "").trim();
    const db = await (0, db_1.readDb)();
    const subscribers = (0, db_1.sortByDateDesc)(db.newsletterSubscribers).filter((item) => !q || (0, db_1.contains)(item.email, q) || (0, db_1.contains)(item.source, q));
    res.json(subscribers);
}
catch (e) {
    next(e);
} });
router.delete("/:id", (0, auth_1.requireAdminPermission)("newsletter:manage"), async (req, res, next) => { try {
    const db = await (0, db_1.readDb)();
    const exists = db.newsletterSubscribers.some((item) => item.id === String(req.params.id));
    if (!exists)
        throw new errorHandler_1.AppError(404, "Subscriber not found");
    await (0, db_1.executeDb)("DELETE FROM `newsletter_subscribers` WHERE `id` = ?", [String(req.params.id)]);
    res.json({ message: "Subscriber removed" });
}
catch (e) {
    next(e);
} });
exports.default = router;
//# sourceMappingURL=newsletter.js.map