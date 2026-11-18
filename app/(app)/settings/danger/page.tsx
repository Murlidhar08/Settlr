import type { Metadata } from "next";
import { DangerView } from "./components/danger-view";

export const metadata: Metadata = {
  title: "Danger Zone | PlayArena",
  description: "Permanently delete account, data, documents, and credentials.",
};

export default function DangerPage() {
  return <DangerView />;
}
