"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, getFileUrl } from "@/lib/utils";
import { getInitials } from "@/utility/common-function";
import { getRoleConfig } from "@/utility/users-fn";
import { motion } from "framer-motion";
import {
    Mail,
    Phone
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface Agent {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    contactNo?: string | null;
    occupation?: string | null;
    roles?: string[];
}

interface AgentListProps {
    user: Agent
    delay: number
}

export function UserCard({ user, delay }: AgentListProps) {
    const router = useRouter();

    const mailTo = (e: React.MouseEvent, email: string) => {
        e.stopPropagation();
        window.location.href = `mailto:${email}`;
    }

    const callTo = (e: React.MouseEvent, contactNo?: string | null) => {
        e.stopPropagation();
        if (!contactNo) return;

        window.location.href = `tel:${contactNo}`;
    }

    const getBadge = (role: string) => {
        if (!role || role.toLowerCase() === "user") return null;
        const config = getRoleConfig(role);
        return (
            <Badge
                key={config.id}
                className={cn(
                    config.colors.badge,
                    "backdrop-blur-md text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 shadow-sm rounded-full"
                )}
            >
                {config.label}
            </Badge>
        );
    }

    return (
        <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.2,
                delay: Math.min(delay * 0.025, 0.15),
                ease: "easeOut"
            }}
            whileHover={{ y: -6 }}
            className="cursor-pointer select-none"
            onClick={() => router.push(`/user/${user.id}` as any)}
        >
            <Card className="relative overflow-hidden p-0 w-full rounded-[2rem] border border-border/80 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-shadow duration-300 group">
                {/* Header Banner with Animated Gradient */}
                <div className="relative h-24 w-full overflow-hidden rounded-t-[2rem]">
                    <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-indigo-500/10 to-purple-500/5 group-hover:scale-110 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />

                    {/* Floating Roles on Top Right */}
                    <div className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end z-10">
                        {user.roles?.map((role) => {
                            return getBadge(role)
                        })}
                    </div>
                </div>

                <div className="px-6 pb-8 relative">
                    {/* Avatar & Contact Buttons row */}
                    <div className="relative -mt-20 mb-4 flex justify-between items-end">
                        <div className="relative group/avatar">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-xl group-hover:scale-105 transition-transform duration-500 ease-out">
                                <AvatarImage src={getFileUrl(user.image)} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex gap-2.5 mb-2">
                            {user.email && (
                                <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        onClick={(e) => mailTo(e, user.email)}
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full h-10 w-10 bg-background/80 hover:bg-primary/10 shadow-sm border border-border text-primary hover:text-primary transition-colors duration-300"
                                    >
                                        <Mail size={16} />
                                    </Button>
                                </motion.div>
                            )}
                            {user.contactNo && (
                                <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        onClick={(e) => callTo(e, user.contactNo)}
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full h-10 w-10 bg-background/80 hover:bg-emerald-500/10 shadow-sm border border-border text-emerald-500 hover:text-emerald-600 transition-colors duration-300"
                                    >
                                        <Phone size={16} />
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* user Details */}
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold tracking-tight text-foreground/90 group-hover:text-primary transition-colors duration-300">
                            {user.name}
                        </h3>
                        {user.occupation ? (
                            <div className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                {user.occupation}
                            </div>
                        ) : (
                            <div className="h-5" /> // Keep spacing consistent
                        )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-border/50 flex flex-col gap-1">
                        <p className="text-[10px] font-bold tracking-widest text-muted-foreground/60">Direct Contact</p>
                        <p className="text-sm font-medium text-foreground/80 truncate group-hover:text-foreground transition-colors duration-300">
                            {user.contactNo || "N/A"}
                        </p>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
