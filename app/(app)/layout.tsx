import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Lib
import { getUserSession } from "@/lib/auth/auth";
import { isSetupRequired } from "@/lib/setup";

// Components
import { ImpersonationIndicator } from "@/components/auth/impersonation-indicator";
import { LayoutTransitions } from "@/components/layout-transitions";
import { NavBar } from "@/components/navbar/nav-bar";
import { AppHeader } from "@/components/header/app-header";
import { AppContentScrollArea } from "@/components/app-content-scroll-area";
import { HeaderProvider } from "@/components/providers/header-provider";
import { UserConfigProvider } from "@/components/providers/user-config-provider";
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

  // Handle Redirection based on status
  if (session.user.banned) redirect("/banned");
  if (session.user.status === UserStatus.pendingapproval) redirect("/pending-approval");
  if (session.user.status === UserStatus.suspended) redirect("/suspended");

  // User Config
  const userConfig = (await getUserConfig()) ?? getDefaultConfig();

  return (
    <UserConfigProvider config={userConfig}>
      <HeaderProvider>
        <div className="h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
          <div className="flex h-full">
            <NavBar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
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

          {/* Only when admin is impersonating */}
          <ImpersonationIndicator />
        </div>
      </HeaderProvider>
    </UserConfigProvider>
  );
}
