"use client";

import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/providers/confirm-provider";
import { containerVariants, itemVariants } from "@/lib/animations";
import { authClient } from "@/lib/auth/auth-client";
import { motion } from "framer-motion";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import SessionList from "./session-list";

export default function LogoutPage() {
    const router = useRouter();
    const confirm = useConfirm();
    const [isSigningOutAll, setIsSigningOutAll] = useState(false);

    const handleSignOutAll = async () => {
        const confirmed = await confirm({
            title: "Sign out from all accounts?",
            description: "You will be signed out from every active account on this device and redirected to the login page.",
            confirmText: "Sign out all",
            cancelText: "Cancel",
            destructive: true,
        });

        if (!confirmed) return;

        setIsSigningOutAll(true);
        try {
            await authClient.signOut();
            toast.success("Signed out from all accounts");
            router.push("/login");
        } catch (error) {
            console.error("Failed to sign out all accounts:", error);
            toast.error("Failed to sign out from all accounts");
            setIsSigningOutAll(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20 select-none">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mx-auto max-w-lg p-4 sm:p-6 mt-4 space-y-6"
            >
                {/* Header Title */}
                <motion.div variants={itemVariants} className="text-center space-y-2 py-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                        Select account to sign out
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Manage your active device sessions or sign out from all accounts at once.
                    </p>
                </motion.div>

                {/* Account List Card */}
                <motion.div variants={itemVariants}>
                    <SessionList isSigningOutAll={isSigningOutAll} />
                </motion.div>

                {/* Sign Out From All Accounts Button */}
                <motion.div variants={itemVariants}>
                    <Button
                        variant="outline"
                        disabled={isSigningOutAll}
                        onClick={handleSignOutAll}
                        className="w-full h-14 rounded-2xl border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/40 font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 group active:scale-[0.99]"
                    >
                        {isSigningOutAll ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                                <span>Signing out all accounts...</span>
                            </>
                        ) : (
                            <>
                                <LogOut className="w-4 h-4 text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                                <span>Sign out from all accounts</span>
                            </>
                        )}
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
}
