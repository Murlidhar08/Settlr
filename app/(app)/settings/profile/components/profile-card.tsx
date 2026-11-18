"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DocumentPreview } from "@/components/document-preview";
import { cn, getFileUrl } from "@/lib/utils";
import { getInitials } from "@/utility/common-function";

interface ProfileCardProps {
  user?: {
    name?: string | null;
    username?: string | null;
    image?: string | null;
  } | null;
}

export function ProfileCard({ user }: ProfileCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center gap-4 p-6 sm:p-8 rounded-[2.5rem] bg-card border shadow-xs relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-br from-primary/10 to-transparent" />

        <div
          className={cn(
            "relative group",
            user?.image && "cursor-pointer"
          )}
          onClick={() => user?.image && setIsPreviewOpen(true)}
        >
          <Avatar className="h-24 w-24 sm:h-28 sm:w-28 ring-4 ring-background shadow-xl transition-transform duration-500 group-hover:scale-105">
            <AvatarImage
              src={getFileUrl(user?.image)}
              alt={user?.name ?? "User"}
            />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl sm:text-3xl font-black">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
        </div>

        <div className="text-center space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.name}</h1>
          <p className="text-muted-foreground font-medium opacity-70 italic text-sm">
            @{user?.username || user?.name?.toLowerCase().replace(/\s+/g, "")}
          </p>
        </div>
      </div>

      {user?.image && (
        <DocumentPreview
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          url={getFileUrl(user.image)}
          fileName={`${user.name}-profile-picture`}
        />
      )}
    </>
  );
}

