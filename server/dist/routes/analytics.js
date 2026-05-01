"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const zod_1 = require("zod");
const errorHandler_1 = require("../middleware/errorHandler");
const db_1 = require("../lib/db");
const router = (0, express_1.Router)();
const trackSchema = zod_1.z.object({ productId: zod_1.z.string().uuid(), event: zod_1.z.enum(["view", "click", "inquiry", "add_to_compare"]), metadata: zod_1.z.record(zod_1.z.any()).optional() });
router.post("/track", async (req, res, next) => { try {
    const data = trackSchema.parse(req.body);
    const db = await (0, db_1.readDb)();
    if (!(0, db_1.findProductById)(db, data.productId))
        throw new errorHandler_1.AppError(404, "Product not found");
    db.productAnalytics.push({ id: (0, db_1.createId)(), productId: data.productId, event: data.event, metadata: data.metadata || {}, ipAddress: req.headers["x-forwarded-for"] || req.ip, userAgent: req.headers["user-agent"] || null, createdAt: (0, db_1.nowIso)() });
    await (0, db_1.writeDb)(db);
    res.json({ success: true });
}
catch (e) {
    next(e);
} });
exports.default = router;
//# sourceMappingURL=analytics.js.map