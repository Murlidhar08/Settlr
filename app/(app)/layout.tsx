import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Lib
import { getUserSession } from "@/lib/auth/auth";
import { setActiveLanguage } from "@/lib/languages/i18n";
import { isSetupRequired } from "@/lib/setup";

// Components
import { AppContentScrollArea } from "@/components/app-content-scroll-area";
import { ImpersonationIndicator } from "@/components/auth/impersonation-indicator";
import { AppHeader, HeaderProvider } from "@/components/header";
import { LayoutTransitions } from "@/components/layout/layout-transitions";
import { NavBar } from "@/components/navbar/nav-bar";
import { SidebarProvider } from "@/components/providers";
import { UserConfigProvider } from "@/components/providers/user-config-provider";
import { AppMobileTab, MobileTabProvider } from "@/components/tab";
import { DEFAULT_CONFIG } from "@/lib/config/repo";
import { UserStatus } from "@/lib/generated/prisma/enums";
import { getDefaultConfig, getUserConfig } from "@/lib/user-config";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Check if setup is needed
  if (await isSetupRequired()) {
    redirect("/setup");
  }

  // Session check
  const session = await getUserSession();
  if (!session?.user) {
    redirect("/login" as any);
  }

  // Handle Redirection based on status (enforcing banned enum and boolean status)
  if (session.user.banned || session.user.status === UserStatus.banned) redirect("/banned");
  if (session.user.status === UserStatus.pendingapproval) redirect("/pending-approval");
  if (session.user.status === UserStatus.suspended) redirect("/suspended");

  // User Config
  const userConfig = (await getUserConfig()) ?? getDefaultConfig();
  if (userConfig?.language) {
    setActiveLanguage(userConfig.language);
  }

  return (
    <UserConfigProvider config={userConfig}>
      <HeaderProvider>
        <SidebarProvider>
          <MobileTabProvider>
            <div className="h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
              <div className="flex h-full">
                {/* Desktop NavBar */}
                <NavBar />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                  {/* Header is persistent and always visible on all pages and loading screens */}
                  <AppHeader />

                  {/* Scrollable Center Content Area */}
                  <AppContentScrollArea>
                    <LayoutTransitions>
                      {children}
                    </LayoutTransitions>
                  </AppContentScrollArea>
                </div>
              </div>

              {/* Persistent Mobile Tab */}
              {DEFAULT_CONFIG.BOTTOM_NAV && <AppMobileTab />}

              {/* Only when admin is impersonating */}
              <ImpersonationIndicator />
            </div>
          </MobileTabProvider>
        </SidebarProvider>
      </HeaderProvider>
    </UserConfigProvider>
  );
}
