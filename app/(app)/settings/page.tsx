import { Suspense } from "react";
import { SettingsSkeleton } from "./components/settings-skeleton";
import { SettingsView } from "./components/settings-view";

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsView />
    </Suspense>
  );
}
