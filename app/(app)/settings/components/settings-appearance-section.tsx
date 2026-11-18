"use client";

import { Laptop, Moon, PaintbrushIcon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeMode } from "@/lib/generated/prisma/enums";
import { tran } from "@/lib/languages/i18n";
import { cn } from "@/lib/utils";
import { SettingsRow, SettingsSection } from "./settings-section-row";

interface SettingsAppearanceSectionProps {
  theme?: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  updateConfig: (patch: Record<string, any>) => void;
  upsertSettingsMutation: {
    mutateAsync: (data: any) => Promise<any>;
  };
}

export function SettingsAppearanceSection({
  theme,
  setTheme,
  updateConfig,
  upsertSettingsMutation,
}: SettingsAppearanceSectionProps) {
  return (
    <SettingsSection title={tran("settings.appearance")}>
      <SettingsRow icon={PaintbrushIcon} label={tran("settings.theme_mode")}>
        <div className="flex gap-1 bg-muted/50 rounded-2xl p-1.5 border-2 focus-within:border-primary/10">
          {[
            { id: ThemeMode.AUTO, icon: Laptop, label: tran("settings.auto") },
            { id: ThemeMode.LIGHT, icon: Sun, label: tran("settings.light") },
            { id: ThemeMode.DARK, icon: Moon, label: tran("settings.dark") },
          ].map((mode) => (
            <Button
              key={mode.id}
              variant={theme === mode.id ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "gap-1.5 sm:gap-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all px-3 sm:px-4 h-9",
                theme === mode.id && "bg-background shadow-lg scale-100 text-primary",
                theme !== mode.id && "opacity-60 hover:opacity-100"
              )}
              onClick={async () => {
                setTheme(mode.id);
                updateConfig({ theme: mode.id });
                await upsertSettingsMutation.mutateAsync({ theme: mode.id });
              }}
            >
              <mode.icon size={15} />
              <span className="hidden sm:inline">{mode.label}</span>
            </Button>
          ))}
        </div>
      </SettingsRow>
    </SettingsSection>
  );
}

