"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productQuerySchema = void 0;
const zod_1 = require("zod");
exports.productQuerySchema = zod_1.z.object({
    category: zod_1.z.string().optional(),
    q: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    subcategory: zod_1.z.string().optional(),
    specs: zod_1.z.string().optional(),
    condition: zod_1.z.string().optional(),
    featured: zod_1.z.string().optional(),
    premium: zod_1.z.string().optional(),
    minPrice: zod_1.z.coerce.number().int().min(0).optional(),
    maxPrice: zod_1.z.coerce.number().int().min(0).optional(),
    sort: zod_1.z.enum(["price-asc", "price-desc", "newest", "rating"]).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=products.js.map