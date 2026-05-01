import { z } from "zod";
export declare const contactSchema: z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    subject: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    email: string;
    fullName: string;
    subject: string;
    phone?: string | undefined;
}, {
    message: string;
    email: string;
    fullName: string;
    subject: string;
    phone?: string | undefined;
}>;
export type ContactInput = z.infer<typeof contactSchema>;
//# sourceMappingURL=contact.d.ts.map