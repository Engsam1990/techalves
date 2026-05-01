"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const contact_1 = require("../validators/contact");
const db_1 = require("../lib/db");
const router = (0, express_1.Router)();
router.post("/", async (req, res, next) => { try {
    const data = contact_1.contactSchema.parse(req.body);
    const db = await (0, db_1.readDb)();
    db.contactMessages.push({ id: (0, db_1.createId)(), ...data, status: "new", createdAt: (0, db_1.nowIso)() });
    await (0, db_1.writeDb)(db);
    res.status(201).json({ message: "Message sent successfully" });
}
catch (e) {
    next(e);
} });
exports.default = router;
//# sourceMappingURL=contact.js.map