"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFileUrl } from "@/lib/utils";
import { getInitials } from "@/utility/common-function";

interface SettingsUserCardProps {
  sessionUser?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    username?: string | null;
    image?: string | null;
  } | null;
}

export function SettingsUserCard({ sessionUser }: SettingsUserCardProps) {
  const router = useRouter();

  return (
    <motion.div
      onClick={() => {
        router.push("/settings/profile");
      }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-4 p-4 sm:p-5 rounded-3xl bg-card border shadow-xs cursor-pointer transition-shadow hover:shadow-md"
    >
      <div className="relative group shrink-0">
        <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-4 ring-background transition-transform duration-500 group-hover:scale-105">
          <AvatarImage
            src={getFileUrl(sessionUser?.image)}
            alt={sessionUser?.name ?? "User avatar"}
          />
          <AvatarFallback className="bg-primary/10 text-primary font-black text-lg sm:text-xl">
            {getInitials(sessionUser?.name)}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-black text-lg sm:text-xl tracking-tight truncate">
            {sessionUser?.name ?? "Unknown"}
          </p>
          {sessionUser?.username && (
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              @{sessionUser.username}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground opacity-70 truncate">
          {sessionUser?.email ?? "Unknown"}
        </p>
      </div>

      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
        <ChevronRight className="text-muted-foreground" size={18} />
      </div>
    </motion.div>
  );
}

