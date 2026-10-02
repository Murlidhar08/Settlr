import { createTransport, SentMessageInfo } from "nodemailer";
import { getAppConfig } from "./app-config";
import { hasRole } from "./auth/permissions";
import { getUserSession } from "./auth/auth";
import z from "zod";
import { testSmtpSchema } from "./zod/email/smtpschema";
import { getTestEmailHtml } from "./templates/email-test";

async function getSmtpTransporter() {
  const config = await getAppConfig();

  // If SMTP is not enabled, return null
  if (!config.smtpHost || !config.smtpPort || !config.smtpUser || !config.smtpPass) {
    throw new Error("SMTP is not enabled");
  }

  return createTransport({
    host: config.smtpHost,
    port: Number(config.smtpPort),
    secure: !!config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
}

// Optional: test SMTP config
export async function verifySMTP(): Promise<{
  success: boolean;
  error: string | undefined;
}> {
  try {
    const transporter = await getSmtpTransporter();
    await transporter.verify();
    console.log("SMTP server ready to send emails");
    return { success: true, error: undefined };
  } catch (err: any) {
    console.error("SMTP verification failed", err);
    return { success: false, error: err.message };
  }
}

interface sendMailProp {
  sendTo: string
  subject: string
  htmlContent: string
}

export async function sendMail({ sendTo, subject, htmlContent }: sendMailProp):
  Promise<{
    success: boolean;
    messageId?: string;
    data: SentMessageInfo | null;
    error?: string;
  }> {
  try {
    const config = await getAppConfig();
    const transporter = await getSmtpTransporter();

    // Build email options
    const mailOptions = {
      from: config.fromEmail ?? "",
      to: sendTo,
      subject,
      html: htmlContent,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      data: info
    }
  }
  catch (error: any) {
    console.error("SMTP send error:", error);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
}

// Custom config
export async function testSmtpConfig(data: z.infer<typeof testSmtpSchema>) {
  const session = await getUserSession();

  if (!hasRole(session?.user?.role, "admin")) {
    throw new Error("Unauthorized");
  }

  const validated = testSmtpSchema.parse(data);

  const transporter = createTransport({
    host: validated.smtpHost,
    port: validated.smtpPort,
    secure: validated.smtpSecure,
    auth: {
      user: validated.smtpUser,
      pass: validated.smtpPass,
    },
  });

  // Verify connection first
  await transporter.verify();

  // Send a test email
  const from = validated.fromEmail || validated.smtpUser;
  const emailHtml = getTestEmailHtml(validated);
  await transporter.sendMail({
    from,
    to: validated.toEmail,
    subject: "Test Email - SMTP Configuration Verified",
    html: emailHtml,
  });

  return { success: true };
}
