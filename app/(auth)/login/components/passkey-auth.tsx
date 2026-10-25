"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { Fingerprint } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function PasskeyAuth({ lastLogin, loading, setLoading }: { lastLogin: string, loading: boolean, setLoading: (loading: boolean) => void }) {
    const router = useRouter();
    const [passkeyLoading, setPasskeyLoading] = useState(false);

    const handlePasskeySignIn = async () => {
        setLoading(true);
        setPasskeyLoading(true);

        try {
            const { error } = await authClient.signIn.passkey();
            if (error) {
                toast.error(error.message || "Passkey authentication failed");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            toast.error("An unexpected error occurred during passkey sign in");
            console.error(err);
        } finally {
            setLoading(false);
            setPasskeyLoading(false);
        }
    };

    return (
        <Button
            type="button"
            tabIndex={4}
            onClick={handlePasskeySignIn}
            disabled={loading}
            className="relative rounded-2xl h-14 w-full text-lg font-bold shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all duration-300 active:scale-[0.98] mt-2 bg-muted/40 border border-muted-foreground/10 text-foreground hover:bg-muted/60 group"
        >
            {passkeyLoading ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    Authenticating...
                </div>
            ) : (
                <div className="flex items-center justify-center gap-3">
                    <Fingerprint className="size-6 text-primary group-hover:scale-110 transition-transform" />
                    <span className="tracking-tight">Sign In with Passkey</span>
                </div>
            )}
            {lastLogin === "passkey" && (
                <Badge variant="secondary" className="absolute -top-3 -right-2 px-3 py-1 bg-background border-primary/20 text-primary shadow-md animate-in fade-in zoom-in duration-300">Last used</Badge>
            )}
        </Button>
    )
}