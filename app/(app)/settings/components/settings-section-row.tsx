"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 pl-2">
        {title}
      </h3>
      <div className="rounded-2xl bg-card border shadow-xs divide-y divide-border/40">
        {children}
      </div>
    </div>
  );
}

export function SettingsRow({
  icon: Icon,
  label,
  labelClassName,
  iconContainerClassName,
  href,
  children,
}: {
  icon: React.ElementType;
  label: string;
  labelClassName?: string;
  iconContainerClassName?: string;
  href?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="flex flex-row sm:items-center justify-between gap-3 px-4 py-3 sm:py-0 sm:h-16 group cursor-pointer rounded-xl hover:bg-primary/5 transition-colors"
      onClick={() => {
        if (href) router.push(href as any);
      }}
    >
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 flex-wrap">
        <div
          className={cn(
            "h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all shrink-0",
            iconContainerClassName
          )}
        >
          <Icon size={16} />
        </div>
        <p className={cn("font-semibold text-base sm:text-lg", labelClassName)}>{label}</p>
      </div>

      <div className="flex items-center self-end sm:self-auto shrink-0">
        {href ? (
          <ChevronRight className="text-muted-foreground" size={18} />
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
}

