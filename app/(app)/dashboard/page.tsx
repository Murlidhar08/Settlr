import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserSession } from "@/lib/auth/auth";
import { ClientCan } from "@/lib/auth/can-client";
import { ServerCan } from "@/lib/auth/can-server";
import { Laptop, Lock, Server, ShieldCheck, Unlock } from "lucide-react";

import { DashboardClient } from "./components/dashboard-client";
import { DashboardInteractions } from "./components/dashboard-interactions";

export default async function Page() {
  const session = await getUserSession();
  const firstName = session?.user.name?.split(" ")[0] || "User";
  const userRole = session?.user.role || "user";

  return (
    <div className="flex-1 px-4 space-y-6 sm:space-y-8 pb-34 max-w-5xl mx-auto w-full">
      <DashboardClient firstName={firstName} email={session?.user.email} />

      {/* Permission Gate Testing Suite */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/40">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Permission Gates Verification
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Testing ServerCan (Server Component) and ClientCan (Client Component) with role &amp; resource access control.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Current Role:</span>
            <Badge variant="outline" className="font-mono text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 border-primary/30 text-primary bg-primary/5">
              {userRole}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SERVER COMPONENT GATE (ServerCan) */}
          <Card className="border-border/60 shadow-xs bg-linear-to-b from-card to-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Server className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Server-Side Gate</CardTitle>
                    <CardDescription className="text-xs font-mono">{"<ServerCan />"}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                  Async RSC
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Server Check 1: storage read */}
              <div className="rounded-lg border border-border/50 p-3 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">storage : read</span>
                  <span className="text-[11px] text-muted-foreground">(Moderator / Admin)</span>
                </div>
                <ServerCan
                  resource="storage"
                  action="read"
                  fallback={
                    <div className="flex items-center gap-2 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-md p-2">
                      <Lock className="size-3.5 shrink-0" />
                      <span>Access Denied: Missing storage:read permission.</span>
                    </div>
                  }
                >
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md p-2">
                    <Unlock className="size-3.5 shrink-0" />
                    <span>Access Granted: Server authorized storage:read for this role.</span>
                  </div>
                </ServerCan>
              </div>

              {/* Server Check 2: config update */}
              <div className="rounded-lg border border-border/50 p-3 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">config : update</span>
                  <span className="text-[11px] text-muted-foreground">(Admin only)</span>
                </div>
                <ServerCan
                  resource="config"
                  action="update"
                  fallback={
                    <div className="flex items-center gap-2 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-md p-2">
                      <Lock className="size-3.5 shrink-0" />
                      <span>Access Denied: Admin role required for config:update.</span>
                    </div>
                  }
                >
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md p-2">
                    <Unlock className="size-3.5 shrink-0" />
                    <span>Access Granted: Admin confirmed. Config updates permitted.</span>
                  </div>
                </ServerCan>
              </div>
            </CardContent>
          </Card>

          {/* CLIENT COMPONENT GATE (ClientCan) */}
          <Card className="border-border/60 shadow-xs bg-linear-to-b from-card to-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Laptop className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Client-Side Gate</CardTitle>
                    <CardDescription className="text-xs font-mono">{"<ClientCan />"}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                  useSession Reactive
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Client Check 1: storage read */}
              <div className="rounded-lg border border-border/50 p-3 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">storage : read</span>
                  <span className="text-[11px] text-muted-foreground">(Moderator / Admin)</span>
                </div>
                <ClientCan
                  resource="storage"
                  action="read"
                  fallback={
                    <div className="flex items-center gap-2 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-md p-2">
                      <Lock className="size-3.5 shrink-0" />
                      <span>Client Guarded: Read access hidden.</span>
                    </div>
                  }
                >
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md p-2">
                    <Unlock className="size-3.5 shrink-0" />
                    <span>Client Authorized: Reactive UI display enabled.</span>
                  </div>
                </ClientCan>
              </div>

              {/* Client Check 2: user create */}
              <div className="rounded-lg border border-border/50 p-3 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">user : create</span>
                  <span className="text-[11px] text-muted-foreground">(Admin only)</span>
                </div>
                <ClientCan
                  resource="user"
                  action="create"
                  fallback={
                    <div className="flex items-center gap-2 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-md p-2">
                      <Lock className="size-3.5 shrink-0" />
                      <span>Client Guarded: Create user actions restricted.</span>
                    </div>
                  }
                >
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md p-2">
                    <Unlock className="size-3.5 shrink-0" />
                    <span>Client Authorized: Create user button unlocked.</span>
                  </div>
                </ClientCan>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <DashboardInteractions />

      {session.session.userSettings.debug && (
        <div className="z-50">
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 backdrop-blur-sm shadow-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">
                DEVELOPER MODE ENABLED
              </span>
            </div>
            <p className="text-xs font-mono text-muted-foreground">
              You are in developer mode, This is useful for
              testing purposes. To disable this, set debug to false in your
              user settings.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
