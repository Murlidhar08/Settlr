import type { Metadata } from "next";
import { SessionManagementView } from "./components/session-management-view";

export const metadata: Metadata = {
  title: "Active Sessions | PlayArena",
  description: "Monitor and revoke active device logins and authenticated browser sessions.",
};

export default function SessionManagementPage() {
  return <SessionManagementView />;
}
