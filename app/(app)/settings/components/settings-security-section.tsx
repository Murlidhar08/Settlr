"use client";

import { KeyRoundIcon, Link2Icon, LockKeyhole, Skull } from "lucide-react";
import { tran } from "@/lib/languages/i18n";
import { SettingsRow, SettingsSection } from "./settings-section-row";

export function SettingsSecuritySection() {
  return (
    <SettingsSection title={tran("settings.security_privacy")}>
      <SettingsRow
        icon={LockKeyhole}
        label={tran("settings.safety_security")}
        href="/settings/security"
      />
      <SettingsRow
        icon={KeyRoundIcon}
        label={tran("settings.active_sessions")}
        href="/settings/session-management"
      />
      <SettingsRow
        icon={Link2Icon}
        label={tran("settings.linked_accounts")}
        href="/settings/link-account"
      />
      <SettingsRow
        icon={Skull}
        label={tran("settings.danger_zone")}
        labelClassName="text-rose-600"
        iconContainerClassName="bg-rose-100 text-rose-600"
        href="/settings/danger"
      />
    </SettingsSection>
  );
}

