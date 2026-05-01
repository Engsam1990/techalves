import { z } from "zod";

export const productQuerySchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  brand: z.string().optional(),
  subcategory: z.string().optional(),
  specs: z.string().optional(),
  condition: z.string().optional(),
  featured: z.string().optional(),
  premium: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  sort: z.enum(["price-asc", "price-desc", "newest", "rating"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;
