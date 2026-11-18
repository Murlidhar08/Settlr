import type { Metadata } from "next";
import { LinkAccountView } from "./components/link-account-view";

export const metadata: Metadata = {
  title: "Linked Accounts | PlayArena",
  description: "Manage connected social logins and third-party authentication providers.",
};

export default function LinkAccountPage() {
  return <LinkAccountView />;
}
