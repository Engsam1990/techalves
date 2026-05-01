import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  source: z.string().trim().max(50).optional(),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
