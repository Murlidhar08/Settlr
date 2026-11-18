import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsView } from "./components/settings-view";
import { SettingsSkeleton } from "./components/settings-skeleton";

export const metadata: Metadata = {
  title: "Settings | PlayArena",
  description: "Manage your preferences, language, appearance, and account security.",
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsView />
    </Suspense>
  );
}
