"use client";

import { motion } from "framer-motion";
import {
    AtSign,
    Edit3,
    LogOut,
    Mail,
    Phone,
    User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DocumentPreview } from "@/components/document-preview";
import { FooterButtons } from "@/components/footer-buttons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { containerVariants, itemVariants } from "@/lib/animations";
import { signOut } from "@/lib/auth/auth-client";
import { tran } from "@/lib/languages/i18n";
import { cn, getFileUrl } from "@/lib/utils";
import { useCurrentUser } from "@/tanstacks/user";
import { getInitials } from "@/utility/common-function";

export default function ProfilePage() {
    const router = useRouter();
    const { data: user, isLoading } = useCurrentUser();
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handleLogout = () => {
        router.push("/logout");
    };

    if (isLoading) return <ProfileSkeleton />;

    return (
        <div className="w-full bg-background pb-34">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mx-auto max-w-4xl mt-6 space-y-8 px-6"
            >
                {/* Profile Card */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col items-center gap-4 p-8 rounded-[2.5rem] bg-card border shadow-sm relative overflow-hidden group"
                >
                    <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-br from-primary/10 to-transparent" />

                    <div 
                        className={cn(
                            "relative group",
                            user?.image && "cursor-pointer"
                        )}
                        onClick={() => user?.image && setIsPreviewOpen(true)}
                    >
                        <Avatar className="h-28 w-28 ring-4 ring-background shadow-xl transition-transform duration-500 group-hover:scale-105">
                            <AvatarImage
                                src={getFileUrl(user?.image)}
                                alt={user?.name ?? "User"}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-3xl font-black">
                                {getInitials(user?.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
                    </div>

                    <div className="text-center space-y-1 relative z-10">
                        <h1 className="text-3xl font-black tracking-tight">{user?.name}</h1>
                        <p className="text-muted-foreground font-medium opacity-70 italic">@{user?.username || user?.name?.toLowerCase().replace(/\s+/g, '')}</p>
                    </div>
                </motion.div>

                {/* Details Section */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <DetailRow
                        icon={User}
                        label={tran("profile.full_name")}
                        value={user?.name || tran("profile.not_set")}
                    />
                    <DetailRow
                        icon={AtSign}
                        label="Username"
                        value={user?.username ? `@${user?.username}` : tran("profile.not_set")}
                    />
                    <DetailRow
                        icon={Mail}
                        label={tran("profile.email_address")}
                        value={user?.email || tran("profile.not_set")}
                    />
                    <DetailRow
                        icon={Phone}
                        label={tran("profile.phone_number")}
                        value={user?.contactNo || tran("profile.not_set")}
                    />
                </motion.div>

                {/* Actions Section */}
                <FooterButtons>
                    {/* Edit Profile */}
                    <Button
                        onClick={() => router.push("profile/edit" as any)}
                        className="h-14 w-14 md:w-auto md:px-12 rounded-full md:gap-3 font-semibold uppercase bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 p-0 md:py-2"
                    >
                        <Edit3 size={18} />
                        <span className="hidden md:block">{tran("profile.edit.title")}</span>
                    </Button>

                    {/* Logout */}
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="h-14 w-14 md:w-auto md:px-12 rounded-full md:gap-3 font-semibold uppercase text-rose-600 shadow-lg shadow-rose-600/30 hover:text-white hover:bg-rose-900 hover:shadow-xl p-0 md:py-2"
                    >
                        <LogOut size={18} />
                        <span className="hidden md:block">{tran("profile.logout")}</span>
                    </Button>
                </FooterButtons>
            </motion.div>

            {/* Document Preview for Profile Picture */}
            {user?.image && (
                <DocumentPreview
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    url={getFileUrl(user.image)}
                    fileName={`${user.name}-profile-picture`}
                />
            )}
        </div>
    );
}

function DetailRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-center gap-4 p-5 rounded-3xl bg-card/50 border shadow-xs group hover:bg-card hover:shadow-md transition-all duration-300">
            <div className="h-12 w-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <Icon size={20} />
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/60">{label}</p>
                <p className="font-bold text-base leading-tight">{value}</p>
            </div>
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-lg px-6 mt-8 space-y-8">
                <div className="h-64 w-full animate-pulse rounded-[2.5rem] bg-muted" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 w-full animate-pulse rounded-3xl bg-muted" />
                    ))}
                </div>
            </div>
        </div>
    );
}
