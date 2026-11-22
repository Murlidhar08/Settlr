"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { tran } from "@/lib/languages/i18n";
import { getFileUrl } from "@/lib/utils";
import { useRemoveUserProfile, useUploadProfileImage } from "@/tanstacks/user";
import { getInitials } from "@/utility/common-function";

interface EditProfileAvatarProps {
  user?: {
    id?: string;
    name?: string | null;
    image?: string | null;
  } | null;
}

export function EditProfileAvatar({ user }: EditProfileAvatarProps) {
  const router = useRouter();
  const uploadImageMutation = useUploadProfileImage();
  const removeAvatarMutation = useRemoveUserProfile();

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadImageMutation.mutateAsync({ formData, userId: user?.id });
      toast.success(tran("profile.edit.msg.profile_updated_successfully"));
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to upload profile picture.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (isUploading || !user?.id) return;
    setIsUploading(true);
    try {
      await removeAvatarMutation.mutateAsync(user.id);
      toast.success("Profile picture removed successfully!");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.section className="flex flex-col items-center py-8 sm:py-10 relative">
      <div className="relative group">
        <Avatar
          className="h-28 w-28 sm:h-32 sm:w-32 ring-4 ring-background shadow-2xl transition-transform duration-500 group-hover:scale-105 cursor-pointer relative overflow-hidden"
          onClick={handleAvatarClick}
        >
          <AvatarImage src={getFileUrl(user?.image)} className="object-cover" />
          <AvatarFallback className="text-2xl sm:text-3xl font-black bg-primary/10 text-primary">
            {getInitials(user?.name)}
          </AvatarFallback>
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </Avatar>
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleAvatarClick}
          disabled={isUploading}
          className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg cursor-pointer border-4 border-background"
        >
          <Camera className="h-5 w-5" />
        </motion.button>
        <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10" />
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-primary/60">
        {tran("profile.edit.upload_new_avatar")}
      </p>
      {user?.image && (
        <button
          type="button"
          onClick={handleRemoveAvatar}
          disabled={isUploading}
          className="mt-3 text-xs font-black uppercase tracking-widest text-destructive hover:underline cursor-pointer transition-all duration-300 disabled:opacity-50"
        >
          Remove Photo
        </button>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </motion.section>
  );
}

