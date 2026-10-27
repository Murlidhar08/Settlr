import { tran } from "@/lib/languages/i18n";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export function Restricted() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-in fade-in zoom-in duration-500 my-16">
            <div className="relative">
                <div className="absolute -inset-8 bg-rose-500/10 rounded-full blur-3xl" />
                <div className="relative p-6 bg-rose-500/5 rounded-2xl border border-rose-500/20 shadow-sm">
                    <ShieldAlert className="text-rose-500 h-12 w-12" strokeWidth={1.5} />
                </div>
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{tran("admin.access_restricted")}</h2>
                <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
                    {tran("admin.restricted_description")}
                </p>
            </div>
            <Link href="/dashboard">
                <button className="px-10 py-3 bg-foreground text-background font-semibold rounded-xl hover:shadow-lg transition-all active:scale-[0.98] text-[11px] uppercase tracking-widest cursor-pointer">
                    {tran("admin.return_to_dashboard")}
                </button>
            </Link>
        </div>
    );
}

