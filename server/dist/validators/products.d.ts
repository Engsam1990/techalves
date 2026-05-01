import { z } from "zod";
export declare const productQuerySchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
    q: z.ZodOptional<z.ZodString>;
    brand: z.ZodOptional<z.ZodString>;
    subcategory: z.ZodOptional<z.ZodString>;
    specs: z.ZodOptional<z.ZodString>;
    condition: z.ZodOptional<z.ZodString>;
    featured: z.ZodOptional<z.ZodString>;
    premium: z.ZodOptional<z.ZodString>;
    minPrice: z.ZodOptional<z.ZodNumber>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
    sort: z.ZodOptional<z.ZodEnum<["price-asc", "price-desc", "newest", "rating"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    category?: string | undefined;
    q?: string | undefined;
    brand?: string | undefined;
    subcategory?: string | undefined;
    specs?: string | undefined;
    condition?: string | undefined;
    featured?: string | undefined;
    premium?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    sort?: "price-asc" | "price-desc" | "newest" | "rating" | undefined;
}, {
    category?: string | undefined;
    q?: string | undefined;
    brand?: string | undefined;
    subcategory?: string | undefined;
    specs?: string | undefined;
    condition?: string | undefined;
    featured?: string | undefined;
    premium?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    sort?: "price-asc" | "price-desc" | "newest" | "rating" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
//# sourceMappingURL=products.d.ts.map