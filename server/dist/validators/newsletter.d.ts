import { z } from "zod";
export declare const newsletterSchema: z.ZodObject<{
    email: z.ZodString;
    source: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    source?: string | undefined;
}, {
    email: string;
    source?: string | undefined;
}>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
//# sourceMappingURL=newsletter.d.ts.map