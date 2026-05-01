"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../../middleware/auth");
const uploads_1 = require("../../utils/uploads");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.use((0, auth_1.requireAdminPermission)("uploads:manage"));
const uploadSchema = zod_1.z.object({
    filename: zod_1.z.string().min(1).max(255),
    contentType: zod_1.z.string().min(1).max(100),
    data: zod_1.z.string().min(20),
});
router.post("/", async (req, res, next) => {
    try {
        const payload = uploadSchema.parse(req.body ?? {});
        const result = (0, uploads_1.saveBase64Upload)(payload);
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=uploads.js.map