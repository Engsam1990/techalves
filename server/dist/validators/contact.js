"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactSchema = void 0;
const zod_1 = require("zod");
exports.contactSchema = zod_1.z.object({
    fullName: zod_1.z.string().trim().min(1, "Name is required").max(100),
    email: zod_1.z.string().trim().email("Invalid email").max(255),
    phone: zod_1.z.string().trim().max(20).optional(),
    subject: zod_1.z.string().trim().min(1, "Subject is required").max(200),
    message: zod_1.z.string().trim().min(1, "Message is required").max(5000),
});
//# sourceMappingURL=contact.js.map