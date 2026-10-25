import type { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/legal/legal-page-layout";
import { envClient } from "@/lib/env.client";

export const metadata: Metadata = {
  title: `Terms & Services - ${envClient.NEXT_PUBLIC_APP_NAME}`,
  description: `Terms and conditions governing the access, use, and security responsibilities for ${envClient.NEXT_PUBLIC_APP_NAME}.`,
};

export default function TermsAndServicesPage() {
  const appName = envClient.NEXT_PUBLIC_APP_NAME;

  const sections: LegalSection[] = [
    {
      id: "agreement",
      title: "Agreement to Terms & Eligibility",
      content: (
        <>
          <p>
            These Terms &amp; Services (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot;, &quot;you&quot;) and <strong>{appName}</strong> (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;). By creating an account, accessing, or using {appName}, you agree to be bound by these Terms and our Privacy Policy.
          </p>
          <p>
            You represent and warrant that you are at least 18 years of age (or the legal age of majority in your jurisdiction) and possess the full legal authority to enter into these Terms on behalf of yourself or the entity you represent.
          </p>
        </>
      ),
    },
    {
      id: "account-security",
      title: "User Accounts & Security Responsibilities",
      content: (
        <>
          <p>
            When registering an account with {appName}, you agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Provide accurate, current, and complete registration details, and promptly update your information if changes occur.
            </li>
            <li>
              Maintain the absolute confidentiality of your login credentials, passkeys, and two-factor authentication devices.
            </li>
            <li>
              Assume full responsibility for all activities, data transactions, and interactions performed under your credentials.
            </li>
            <li>
              Promptly notify our security response team if you detect any unauthorized access, loss of a passkey device, or account compromise.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "acceptable-use",
      title: "Acceptable Use & Platform Conduct",
      content: (
        <>
          <p>
            You agree to use {appName} only for lawful, authorized purposes. You strictly agree NOT to:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
              <h4 className="font-bold text-foreground mb-1 text-sm">Security Interference</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Attempting to bypass origin checks, CSRF guards, rate limits, access controls, or conducting unauthorized penetration testing.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
              <h4 className="font-bold text-foreground mb-1 text-sm">Malicious Disruption</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Distributing malware, viruses, automated bots, scrapers, or attempting denial-of-service (DoS/DDoS) against our infrastructure.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
              <h4 className="font-bold text-foreground mb-1 text-sm">Unauthorized Impersonation</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Misrepresenting your affiliation, attempting unauthorized privilege escalation, or accessing other users&apos; accounts without explicit consent.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
              <h4 className="font-bold text-foreground mb-1 text-sm">Illegal Activity</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Engaging in fraudulent financial transactions, intellectual property theft, or violating applicable domestic or international trade regulations.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "enforcement-termination",
      title: "Account Suspension, Banning & Termination",
      content: (
        <>
          <p>
            We take platform security and compliance seriously. {appName} administrators reserve the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Temporary Account Suspension:</strong> Place accounts on temporary administrative hold pending identity review, security verification, or policy investigation.
            </li>
            <li>
              <strong>Permanent Banning:</strong> Permanently ban and terminate accounts found to have engaged in severe terms violations, fraud, abuse, or unauthorized exploitation.
            </li>
            <li>
              <strong>User-Initiated Deletion:</strong> Users have the right to permanently terminate their account and erase their data at any time via the self-service account deletion workflow.
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            If you believe an enforcement action was taken in error, you may file an appeal by contacting our support team as outlined on the enforcement notification page.
          </p>
        </>
      ),
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property Rights",
      content: (
        <>
          <p>
            The software, user interface design, logos, brand assets, source code, and systems powering {appName} are the exclusive intellectual property of {appName} and its licensors, protected by copyright, trademark, and trade secret laws.
          </p>
          <p>
            You retain all rights to the proprietary business data, files, and content you upload to {appName}. You grant us a limited, non-exclusive license solely to host, process, and secure your data as necessary to provide platform services to you.
          </p>
        </>
      ),
    },
    {
      id: "disclaimers",
      title: "Disclaimer of Warranties",
      content: (
        <>
          <p>
            {appName} is provided on an <strong>&quot;AS IS&quot;</strong> and <strong>&quot;AS AVAILABLE&quot;</strong> basis without warranties of any kind, whether express, statutory, or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
          </p>
          <p>
            While we strive for 99.9% service uptime and employ industry-leading cybersecurity practices, we do not guarantee that platform access will be uninterrupted, error-free, or completely immune to zero-day vulnerabilities or external network failures.
          </p>
        </>
      ),
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      content: (
        <>
          <p>
            To the maximum extent permitted by applicable law, in no event shall {appName}, its directors, employees, partners, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, goodwill, or business opportunities, arising out of or related to your use of or inability to use the platform.
          </p>
          <p>
            Our total cumulative liability for any claim arising out of these Terms shall not exceed the amount paid by you to {appName} during the twelve (12) months preceding the incident.
          </p>
        </>
      ),
    },
    {
      id: "governing-law",
      title: "Governing Law & Dispute Resolution",
      content: (
        <>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which {appName} is registered, without giving effect to conflict of law principles.
          </p>
          <p>
            In the event of any dispute, claim, or controversy arising out of these Terms, the parties agree to first attempt informal resolution in good faith for a period of at least thirty (30) days prior to initiating formal arbitration or court proceedings.
          </p>
        </>
      ),
    },
    {
      id: "modifications",
      title: "Modifications to Terms & Inquiries",
      content: (
        <>
          <p>
            We may revise these Terms from time to time. When material modifications occur, we will post the updated Terms with a revised effective date and provide appropriate notice. Continued use of {appName} following the publication of revised Terms signifies your acceptance.
          </p>
          <div className="p-4 rounded-2xl bg-card border border-border/50 text-sm font-medium space-y-1">
            <p><strong>{appName} Legal &amp; Governance Office</strong></p>
            <p className="text-muted-foreground">Email: <a href="mailto:legal@example.app" className="text-primary hover:underline">legal@example.app</a></p>
            <p className="text-muted-foreground">Platform Terms Version: 1.0 (Enterprise Release)</p>
          </div>
        </>
      ),
    },
  ];

  return (
    <LegalPageLayout
      type="terms"
      title="Terms & Services"
      subtitle={`The fundamental rules, security protocols, rights, and responsibilities governing your use of the ${appName} platform.`}
      badge="Terms of Service & Agreement"
      lastUpdated="October 26, 2026"
      effectiveDate="October 26, 2026"
      sections={sections}
    />
  );
}
