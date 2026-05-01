"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../../middleware/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const db_1 = require("../../lib/db");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.use((0, auth_1.requireAdminPermission)("messages:view"));
const statusSchema = zod_1.z.object({ status: zod_1.z.enum(["new", "in_progress", "resolved", "archived"]) });
router.get("/", async (req, res, next) => { try {
    const q = String(req.query.q || "").trim();
    const status = String(req.query.status || "").trim();
    const db = await (0, db_1.readDb)();
    const items = (0, db_1.sortByDateDesc)(db.contactMessages).filter((item) => (!status || item.status === status) && (!q || [item.fullName, item.email, item.subject, item.message].some((value) => (0, db_1.contains)(value, q))));
    res.json(items);
}
catch (e) {
    next(e);
} });
router.patch("/:id", (0, auth_1.requireAdminPermission)("messages:manage"), async (req, res, next) => { try {
    const data = statusSchema.parse(req.body);
    const db = await (0, db_1.readDb)();
    const message = db.contactMessages.find((item) => item.id === String(req.params.id));
    if (!message)
        throw new errorHandler_1.AppError(404, "Contact message not found");
    message.status = data.status;
    await (0, db_1.writeDb)(db);
    res.json(message);
}
catch (e) {
    next(e);
} });
router.delete("/:id", (0, auth_1.requireAdminPermission)("messages:manage"), async (req, res, next) => { try {
    const db = await (0, db_1.readDb)();
    const exists = db.contactMessages.some((item) => item.id === String(req.params.id));
    if (!exists)
        throw new errorHandler_1.AppError(404, "Contact message not found");
    await (0, db_1.executeDb)("DELETE FROM `contact_messages` WHERE `id` = ?", [String(req.params.id)]);
    res.json({ message: "Message deleted" });
}
catch (e) {
    next(e);
} });
exports.default = router;
//# sourceMappingURL=contact-messages.js.map