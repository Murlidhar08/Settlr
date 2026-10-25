import type { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/legal/legal-page-layout";
import { envClient } from "@/lib/env.client";

export const metadata: Metadata = {
  title: `Privacy Policy - ${envClient.NEXT_PUBLIC_APP_NAME}`,
  description: `Learn how ${envClient.NEXT_PUBLIC_APP_NAME} collects, protects, encrypts, and handles your personal information and authentication credentials.`,
};

export default function PrivacyPolicyPage() {
  const appName = envClient.NEXT_PUBLIC_APP_NAME;

  const sections: LegalSection[] = [
    {
      id: "overview",
      title: "Overview & Commitment",
      content: (
        <>
          <p>
            Welcome to <strong>{appName}</strong>. We are committed to safeguarding your privacy and protecting the confidentiality of your personal and authentication data. This Privacy Policy details how we collect, process, store, and protect your information when you access our platform, use our authentication services, or interact with our system.
          </p>
          <p>
            We adhere to global privacy principles, including the European Union General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA). By registering, signing in, or using {appName}, you acknowledge and agree to the practices described in this policy.
          </p>
        </>
      ),
    },
    {
      id: "information-collected",
      title: "Information We Collect",
      content: (
        <>
          <p>
            We strictly limit the data we collect to information essential for providing secure authentication, account integrity, and core platform capabilities:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Profile &amp; Identity Information:</strong> When creating an account, we collect your full name, email address, username, and encrypted password credentials.
            </li>
            <li>
              <strong>Passkey &amp; WebAuthn Credentials:</strong> If you enable Passkey authentication, we store your public key identifier and credential ID. <em>Your biometric data (Face ID, Touch ID, Windows Hello) never leaves your physical device and is never transmitted or accessible to {appName}.</em>
            </li>
            <li>
              <strong>Multi-Factor Authentication (MFA/2FA):</strong> Encrypted TOTP secret seeds or hashed single-use backup recovery codes generated to secure your login sessions.
            </li>
            <li>
              <strong>Security &amp; Audit Logs:</strong> Timestamped records of authentication attempts, active sessions, IP addresses, user-agent details, and security events used solely to protect your account against unauthorized access.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "how-we-use-data",
      title: "How We Use Your Information",
      content: (
        <>
          <p>
            We do not sell, rent, or trade your personal data to advertisers or data brokers. Your data is used exclusively for:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
              <h4 className="font-bold text-foreground mb-1 text-sm">Identity &amp; Authentication</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Authenticating credentials, issuing secure cryptographically signed session tokens, and validating multi-factor verification.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
              <h4 className="font-bold text-foreground mb-1 text-sm">Threat Prevention</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Detecting anomalous logins, thwarting brute-force attacks, enforcing rate limits, and investigating malicious activities.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
              <h4 className="font-bold text-foreground mb-1 text-sm">Critical Communications</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Transmitting critical transactional emails including password resets, account deletion confirmations, and security notifications.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
              <h4 className="font-bold text-foreground mb-1 text-sm">Regulatory Compliance</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Maintaining minimum audit trails and compliance records required under financial and cybersecurity laws.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "security-encryption",
      title: "Security & Encryption Architecture",
      content: (
        <>
          <p>
            {appName} employs defense-in-depth security standards across all layers of our application stack:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Data in Transit:</strong> All web traffic and API calls are strictly encrypted using Transport Layer Security (TLS 1.3) with HSTS enforcement.
            </li>
            <li>
              <strong>Password Hashing:</strong> Passwords are cryptographically salted and hashed using state-of-the-art memory-hard algorithms before storage in PostgreSQL. Plaintext passwords are never saved or logged.
            </li>
            <li>
              <strong>CSRF &amp; Origin Defense:</strong> All state-changing mutation requests are verified against allowed origin domains to defend against Cross-Site Request Forgery (CSRF).
            </li>
            <li>
              <strong>Session Lifecycle Management:</strong> Users can inspect and terminate active sessions across devices at any time with immediate cryptographic invalidation.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "third-party-integrations",
      title: "Third-Party Subprocessors & Integrations",
      content: (
        <>
          <p>
            We only partner with trusted service providers who adhere to strict data protection standards:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Cloudflare Turnstile:</strong> We use privacy-preserving Turnstile verification to stop automated bots without harvesting personal data, cookies, or browsing history.
            </li>
            <li>
              <strong>OAuth Providers (Google, Discord, Facebook):</strong> If you choose social login, we receive basic verified identity attributes (email, name, provider ID) strictly to link your account.
            </li>
            <li>
              <strong>Database &amp; Cloud Infrastructure:</strong> Managed enterprise PostgreSQL infrastructure with automated encrypted backups and network isolation.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "data-retention-deletion",
      title: "Data Retention & Permanent Deletion",
      content: (
        <>
          <p>
            We store your personal data only as long as your account remains active or as required by law.
          </p>
          <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20 my-3">
            <h4 className="font-bold text-destructive text-sm mb-1">Your Right to Permanent Account Erasure</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You can initiate permanent account deletion at any time from your security settings. Upon confirmation via token verification, your profile, sessions, documents, and credentials will be permanently erased from our active database.
            </p>
          </div>
        </>
      ),
    },
    {
      id: "user-rights",
      title: "Your Privacy Rights (GDPR & CCPA)",
      content: (
        <>
          <p>
            Depending on your jurisdiction, you enjoy the following enforceable rights:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Right of Access:</strong> Request a full copy of the personal information we hold about you.</li>
            <li><strong>Right to Rectification:</strong> Update inaccurate or incomplete account details directly through your settings.</li>
            <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Request immediate deletion of your personal data.</li>
            <li><strong>Right to Data Portability:</strong> Export your account data in a structured, machine-readable format.</li>
            <li><strong>Right to Object:</strong> Restrict or object to specific processing of your information.</li>
          </ul>
        </>
      ),
    },
    {
      id: "cookies",
      title: "Cookies & Local Storage",
      content: (
        <>
          <p>
            {appName} uses only strictly necessary cookies required for platform functionality and session authentication:
          </p>
          <div className="overflow-x-auto my-3">
            <table className="w-full text-left text-xs border border-border/50 rounded-xl overflow-hidden">
              <thead className="bg-muted/60 text-foreground font-bold">
                <tr>
                  <th className="p-3">Cookie Name</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-muted-foreground">
                <tr>
                  <td className="p-3 font-mono font-medium text-foreground">better-auth.session_token</td>
                  <td className="p-3">HttpOnly cryptographic authentication token</td>
                  <td className="p-3">Session or 30 days</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-medium text-foreground">better-auth.two_factor</td>
                  <td className="p-3">Temporary challenge token for 2FA verification</td>
                  <td className="p-3">5 minutes</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-medium text-foreground">theme</td>
                  <td className="p-3">Stores your dark/light appearance preference</td>
                  <td className="p-3">Persistent</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs">
            We do not use invasive third-party tracking, cross-site profiling, or advertising cookies.
          </p>
        </>
      ),
    },
    {
      id: "contact",
      title: "Policy Updates & Contact Information",
      content: (
        <>
          <p>
            We may update this Privacy Policy periodically to reflect technical enhancements, security audits, or regulatory requirements. Any material changes will be announced via platform notification or email prior to taking effect.
          </p>
          <p>
            If you have questions, feedback, or wish to exercise your rights, contact our Data Protection Officer at:
          </p>
          <div className="p-4 rounded-2xl bg-card border border-border/50 text-sm font-medium space-y-1">
            <p><strong>{appName} Privacy &amp; Compliance Team</strong></p>
            <p className="text-muted-foreground">Email: <a href="mailto:privacy@example.app" className="text-primary hover:underline">privacy@example.app</a></p>
            <p className="text-muted-foreground">Address: Security &amp; Data Operations, Enterprise Plaza</p>
          </div>
        </>
      ),
    },
  ];

  return (
    <LegalPageLayout
      type="privacy"
      title="Privacy Policy"
      subtitle={`Our comprehensive commitment to your privacy, cryptographic security, and the transparent handling of your personal data across ${appName}.`}
      badge="Data Protection & Privacy"
      lastUpdated="October 26, 2026"
      effectiveDate="October 26, 2026"
      sections={sections}
    />
  );
}
