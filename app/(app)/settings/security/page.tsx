import type { Metadata } from "next";
import { SecurityView } from "./components/security-view";

export const metadata: Metadata = {
  title: "Security & Access | PlayArena",
  description: "Manage your passwords, two-factor authentication, and hardware passkeys.",
};

export default function SecurityPage() {
  return <SecurityView />;
}
