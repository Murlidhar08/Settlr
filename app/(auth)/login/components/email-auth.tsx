"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
export default function EmailAuth({ lastLogin, loading }: { lastLogin: string, loading: boolean }) {

    return (
        <Button
            type="submit"
            tabIndex={3}
            disabled={loading}
            className="relative rounded-2xl h-14 w-full text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 active:scale-[0.98] mt-2"
        >
            {loading ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Authenticating...
                </div>
            ) : "Sign In"}

            {lastLogin === "email" && (
                <Badge variant="secondary" className="absolute -top-3 -right-2 px-3 py-1 bg-background border-primary/20 text-primary shadow-md">Last used</Badge>
            )}
        </Button>
    )
}