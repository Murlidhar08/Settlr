import type { Metadata } from "next";
import { SignOutView } from "./components/signout-view";

export const metadata: Metadata = {
  title: "Sign Out | PlayArena",
  description: "Sign out of your account or manage active sessions on this device.",
};

export default function SignOutPage() {
  return <SignOutView />;
}
