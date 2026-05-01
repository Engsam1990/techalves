"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsletterSchema = void 0;
const zod_1 = require("zod");
exports.newsletterSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email("Invalid email").max(255),
    source: zod_1.z.string().trim().max(50).optional(),
});
//# sourceMappingURL=newsletter.js.map