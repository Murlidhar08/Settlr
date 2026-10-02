import { envServer } from "../env.server";

export interface TestEmailDetails {
    toEmail: string;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUser: string;
}

export function getTestEmailHtml(details: TestEmailDetails): string {
    const primaryColor = "#7c3aed";
    const appName = envServer.NEXT_PUBLIC_APP_NAME;
    const appUrl = envServer.BETTER_AUTH_URL;

    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>SMTP Configuration Verified</title>
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
                <div style="text-align:center; margin-bottom:24px;">
                  <h1 style="margin:0 0 8px 0; font-size:24px; font-weight:700; color:#0f172a; text-align:center;">
                    SMTP Connected Successfully!
                  </h1>
                  <p style="margin:0; font-size:16px; line-height:24px; color:#475569; text-align:center;">
                    Your mail server configuration has been verified and is operational.
                  </p>
                </div>

                <!-- Connection Details -->
                <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin:24px 0;">
                  <div style="margin:0 0 12px 0; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">
                    Connection Details
                  </div>
                  <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                    <tr>
                      <td style="padding:8px 0; color:#64748b; border-bottom:1px solid #edf2f7;">Recipient:</td>
                      <td style="padding:8px 0; color:#0f172a; font-weight:600; text-align:right; border-bottom:1px solid #edf2f7;">${details.toEmail}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0; color:#64748b; border-bottom:1px solid #edf2f7;">Host:</td>
                      <td style="padding:8px 0; color:#0f172a; font-weight:600; text-align:right; border-bottom:1px solid #edf2f7; font-family:monospace;">${details.smtpHost}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0; color:#64748b; border-bottom:1px solid #edf2f7;">Port:</td>
                      <td style="padding:8px 0; color:#0f172a; font-weight:600; text-align:right; border-bottom:1px solid #edf2f7; font-family:monospace;">${details.smtpPort}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0; color:#64748b; border-bottom:1px solid #edf2f7;">Security:</td>
                      <td style="padding:8px 0; color:#0f172a; font-weight:600; text-align:right; border-bottom:1px solid #edf2f7;">${details.smtpSecure ? "SSL/TLS (Port 465)" : "STARTTLS (Port 587)"}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0; color:#64748b;">Username:</td>
                      <td style="padding:8px 0; color:#0f172a; font-weight:600; text-align:right; font-family:monospace;">${details.smtpUser}</td>
                    </tr>
                  </table>
                </div>

                <!-- Button -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding:10px 0 20px 0;">
                      <a href="${appUrl}/admin" style="display:inline-block; padding:14px 32px; background-color:${primaryColor}; color:#ffffff; text-decoration:none; border-radius:12px; font-size:16px; font-weight:600; box-shadow:0 4px 10px rgba(124, 58, 237, 0.25);">
                        Admin Settings
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:20px 0 0 0; font-size:13px; line-height:18px; color:#94a3b8; text-align:center;">
                  Sent automatically from ${appName} to verify your outgoing mail configuration on ${new Date().toUTCString()}.
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