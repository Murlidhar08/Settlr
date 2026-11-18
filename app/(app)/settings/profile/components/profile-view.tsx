"use client";

import { motion } from "framer-motion";
import { Edit3, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { FooterButtons } from "@/components/footer-buttons";
import { Button } from "@/components/ui/button";
import { containerVariants, itemVariants } from "@/lib/animations";
import { tran } from "@/lib/languages/i18n";
import { useCurrentUser } from "@/tanstacks/user";
import { ProfileCard } from "./profile-card";
import { ProfileDetailsList } from "./profile-details-list";
import { ProfileSkeleton } from "./profile-skeleton";

export function ProfileView() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  const handleSignOut = () => {
    router.push("/signout");
  };

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="w-full bg-background pb-32">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-4xl mt-6 space-y-6 sm:space-y-8 px-4 sm:px-6"
      >
        {/* Profile Card */}
        <motion.div variants={itemVariants}>
          <ProfileCard user={user} />
        </motion.div>

        {/* Details Section */}
        <motion.div variants={itemVariants}>
          <ProfileDetailsList user={user} />
        </motion.div>

        {/* Actions Section */}
        <FooterButtons>
          {/* Edit Profile */}
          <Button
            onClick={() => router.push("/settings/profile/edit")}
            className="h-14 w-14 md:w-auto md:px-12 rounded-full md:gap-3 font-semibold uppercase bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 p-0 md:py-2"
          >
            <Edit3 size={18} />
            <span className="hidden md:block">{tran("profile.edit.title")}</span>
          </Button>

          {/* Sign out */}
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="h-14 w-14 md:w-auto md:px-12 rounded-full md:gap-3 font-semibold uppercase text-rose-600 shadow-lg shadow-rose-600/30 hover:text-white hover:bg-rose-900 hover:shadow-xl p-0 md:py-2"
          >
            <LogOut size={18} />
            <span className="hidden md:block">{tran("profile.signout")}</span>
          </Button>
        </FooterButtons>
      </motion.div>
    </div>
  );
}

