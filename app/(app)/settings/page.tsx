import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsView } from "./components/settings-view";
import { SettingsSkeleton } from "./components/settings-skeleton";

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsView />
    </Suspense>
  );
}
