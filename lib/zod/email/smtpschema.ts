import z from "zod";

export const testSmtpSchema = z.object({
    smtpHost: z.string().min(1, "SMTP host is required"),
    smtpPort: z.coerce.number().int().positive("Invalid SMTP port"),
    smtpUser: z.string().min(1, "SMTP user is required"),
    smtpPass: z.string(),
    smtpSecure: z.boolean().default(false),
    fromEmail: z.string().optional().nullable().or(z.literal("")),
    toEmail: z.string().email("Valid recipient email is required"),
});