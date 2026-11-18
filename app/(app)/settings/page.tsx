import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsSkeleton } from "./components/settings-skeleton";
import { SettingsView } from "./components/settings-view";

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
