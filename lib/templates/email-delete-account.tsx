import { envServer } from "../env.server";

export function getDeleteAccountEmailHtml(
  email: string,
  deleteUrl: string
): string {
  const primaryColor = "#dc2626"; // Vibrant danger red
  const appName = envServer.NEXT_PUBLIC_APP_NAME;
  const appUrl = envServer.BETTER_AUTH_URL;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Confirm Account Deletion</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; padding:40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#ffffff; border-radius:16px; border:1px solid #fee2e2; box-shadow:0 10px 25px -5px rgba(220, 38, 38, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);">
            <!-- Header -->
            <tr>
              <td style="padding:40px 40px 20px 40px; text-align:center;">
                <img src="${appUrl}/images/logo/light_logo.png" alt="${appName} Logo" style="height:48px; width:auto; display:inline-block; margin-bottom:16px;" />
                <div style="font-size:24px; font-weight:800; color:${primaryColor}; letter-spacing:-0.5px;">
                  ${appName}
                </div>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:0 40px 40px 40px;">
                <h1 style="margin:0 0 16px 0; font-size:24px; font-weight:800; color:#0f172a; text-align:center;">
                  Confirm Account Deletion
                </h1>
                <p style="margin:0 0 16px 0; font-size:16px; line-height:24px; color:#475569;">
                  Hello,
                </p>
                <p style="margin:0 0 20px 0; font-size:16px; line-height:24px; color:#475569;">
                  We received a request to permanently delete the ${appName} account associated with <strong>${email}</strong>.
                </p>

                <!-- Danger Warning Card -->
                <div style="margin:0 0 24px 0; padding:16px; background-color:#fef2f2; border:1px solid #fecaca; border-radius:12px; text-align:left;">
                  <div style="font-size:14px; font-weight:700; color:#991b1b; margin-bottom:6px;">
                    ⚠️ Permanent & Irreversible Action
                  </div>
                  <p style="margin:0; font-size:13px; line-height:20px; color:#b91c1c;">
                    Once confirmed, your account, personal data, uploaded documents, active sessions, and configurations will be permanently deleted and cannot be recovered.
                  </p>
                </div>

                <p style="margin:0 0 24px 0; font-size:15px; line-height:22px; color:#475569; text-align:center;">
                  If you are certain you want to proceed with permanent deletion, click the button below:
                </p>

                <!-- Button -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding:10px 0 28px 0;">
                      <a href="${deleteUrl}" style="display:inline-block; padding:14px 32px; background-color:${primaryColor}; color:#ffffff; text-decoration:none; border-radius:12px; font-size:15px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; box-shadow:0 4px 14px rgba(220, 38, 38, 0.35);">
                        Permanently Delete Account
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 12px 0; font-size:13px; color:#64748b; text-align:center;">
                  Or copy and paste this link into your browser:
                </p>
                <div style="padding:12px; background-color:#fef2f2; border:1px solid #fee2e2; border-radius:8px; font-size:12px; color:${primaryColor}; word-break:break-all; text-align:center; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
                  ${deleteUrl}
                </div>
                
                <p style="margin:28px 0 0 0; font-size:13px; line-height:20px; color:#94a3b8; text-align:center;">
                  This link will expire in 24 hours. If you did not make this request, please ignore this email and your account will remain safe.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:28px 40px; background-color:#fff1f2; border-top:1px solid #fee2e2; border-bottom-left-radius:16px; border-bottom-right-radius:16px; text-align:center;">
                <p style="margin:0; font-size:12px; color:#e11d48; line-height:18px; font-weight:600;">
                  Security & Privacy Alert
                </p>
                <p style="margin:6px 0 0 0; font-size:12px; color:#94a3b8; line-height:18px;">
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
