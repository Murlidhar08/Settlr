"use client";

import { tran } from "@/lib/languages/i18n";
import { cn } from "@/lib/utils";
import { ShieldCheck, UserCheck, Users, UserX } from "lucide-react";

interface AdminStatsProps {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
    adminUsers: number;
}

export function AdminStats({ totalUsers, activeUsers, bannedUsers, adminUsers }: AdminStatsProps) {
    const stats = [
        {
            title: tran("admin.user_mng.total_users"),
            value: totalUsers,
            icon: <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />,
            bgColor: "bg-indigo-600 dark:bg-indigo-500/90 shadow-indigo-500/20",
            glowColor: "bg-white/20",
            description: tran("admin.user_mng.registered"),
        },
        {
            title: tran("admin.user_mng.active"),
            value: activeUsers,
            icon: <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-white" />,
            bgColor: "bg-emerald-600 dark:bg-emerald-500/90 shadow-emerald-500/20",
            glowColor: "bg-emerald-400/20",
            description: tran("admin.user_mng.non_banned"),
        },
        {
            title: tran("admin.user_mng.banned"),
            value: bannedUsers,
            icon: <UserX className="h-4 w-4 sm:h-5 sm:w-5 text-white" />,
            bgColor: "bg-rose-600 dark:bg-rose-500/90 shadow-rose-500/20",
            glowColor: "bg-rose-400/20",
            description: tran("admin.user_mng.restricted"),
        },
        {
            title: tran("admin.user_mng.admins"),
            value: adminUsers,
            icon: <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-white" />,
            bgColor: "bg-slate-900 dark:bg-slate-950 shadow-slate-900/20",
            glowColor: "bg-indigo-500/30",
            description: tran("admin.user_mng.privileged"),
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <div
                    key={stat.title}
                    className={cn(
                        "relative overflow-hidden rounded-2xl group p-4 sm:p-5 text-white transition-all hover:shadow-lg hover:-translate-y-1 border border-white/20 active:scale-[0.98]",
                        stat.bgColor
                    )}
                >
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">{stat.title}</p>
                            <p className="text-2xl sm:text-3xl font-black tracking-tight leading-none">
                                {stat.value}
                            </p>
                        </div>
                        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            {stat.icon}
                        </div>
                    </div>

                    <div className="relative z-10 mt-4 flex items-center">
                        <div className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10">
                            <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">{stat.description}</span>
                        </div>
                    </div>

                    {/* Vibration Glow */}
                    <div className={cn("absolute -bottom-6 -right-6 h-28 w-28 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity", stat.glowColor)} />
                </div>
            ))}
        </div>
    );
}
