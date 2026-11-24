import { envServer } from "../env.server";
import { APP } from "@/lib/config/repo";

export function getPasswordResetSuccessEmailHtml(
  email: string,
  loginUrl: string
): string {
  const primaryColor = "#7c3aed";
  const appName = APP.NAME;
  const appUrl = envServer.BETTER_AUTH_URL;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Password reset successful</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; padding:40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#ffffff; border-radius:16px; border:1px solid #e2e8f0; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <!-- Header -->
            <tr>
              <td style="padding:40px 40px 20px 40px; text-align:center;">
                <img src="${appUrl}/images/logo/light_logo.png" alt="${appName} Logo" style="height:48px; width:auto; display:inline-block; margin-bottom:16px;" />
                <div style="font-size:24px; font-weight:700; color:${primaryColor}; letter-spacing:-0.5px;">
                  ${appName}
                </div>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:0 40px 40px 40px;">
                <h1 style="margin:0 0 16px 0; font-size:24px; font-weight:700; color:#0f172a; text-align:center;">
                  Password reset successful
                </h1>
                <p style="margin:0 0 18px 0; font-size:16px; line-height:24px; color:#475569;">
                  Hello,
                </p>
                <p style="margin:0 0 24px 0; font-size:16px; line-height:24px; color:#475569;">
                  The password for your ${appName} account <strong>${email}</strong> has been successfully changed. You can now sign in with your new password.
                </p>

                <!-- Button -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding:10px 0 30px 0;">
                      <a href="${loginUrl}/login" style="display:inline-block; padding:14px 32px; background-color:${primaryColor}; color:#ffffff; text-decoration:none; border-radius:12px; font-size:16px; font-weight:600; box-shadow:0 4px 10px rgba(124, 58, 237, 0.25);">
                        Sign In Now
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 0 0; font-size:14px; line-height:20px; color:#94a3b8; text-align:center;">
                  If you did not request this change, please contact our support team immediately.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:32px 40px; background-color:#f8fafc; border-top:1px solid #e2e8f0; border-bottom-left-radius:16px; border-bottom-right-radius:16px; text-align:center;">
                <p style="margin:0; font-size:12px; color:#94a3b8; line-height:18px;">
                  © ${new Date().getFullYear()} ${appName}. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `.trim();
}
