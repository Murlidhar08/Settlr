"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AtSign, Check, CheckCircle2, Edit3, Loader2, Mail, Phone, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FooterButtons } from "@/components/footer-buttons";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { containerVariants, itemVariants } from "@/lib/animations";
import { authClient } from "@/lib/auth/auth-client";
import { tran } from "@/lib/languages/i18n";
import { useCurrentUser } from "@/tanstacks/user";
import { EditProfileAvatar } from "./edit-profile-avatar";
import { EditProfileFormField } from "./edit-profile-form-field";
import { EditProfileSkeleton } from "./edit-profile-skeleton";

type ProfileFormValues = {
  name: string;
  username: string;
  email: string;
  contactNo?: string;
};

export function EditProfileView() {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ProfileFormValues>({
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
      contactNo: user?.contactNo || "",
    },
  });

  const watchedUsername = watch("username");

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? "",
        username: user.username ?? "",
        email: user.email ?? "",
        contactNo: user?.contactNo || "",
      });
    }
  }, [user, reset]);

  // Debounced check for username availability in edit profile
  useEffect(() => {
    if (!watchedUsername) {
      setUsernameAvailable(null);
      return;
    }

    if (user && watchedUsername === user.username) {
      setUsernameAvailable(true);
      return;
    }

    if (watchedUsername.length < 3) {
      setUsernameAvailable(false);
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(watchedUsername)) {
      setUsernameAvailable(false);
      return;
    }

    const checkAvailability = async () => {
      setCheckingUsername(true);
      try {
        const result = await authClient.isUsernameAvailable({ username: watchedUsername });
        setUsernameAvailable(Boolean(result.data?.available));
      } catch (err) {
        console.error("Error checking username availability:", err);
        setUsernameAvailable(false);
      } finally {
        setCheckingUsername(false);
      }
    };

    const delayDebounceFn = setTimeout(checkAvailability, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [watchedUsername, user]);

  if (isUserLoading) return <EditProfileSkeleton />;

  async function onSubmit(data: ProfileFormValues) {
    try {
      if (user && data.username !== user.username && usernameAvailable === false) {
        toast.error("Please choose a valid and available username");
        return;
      }

      const cleanCurrentContact = (user?.contactNo || "").trim().replace(/\D/g, "");
      const cleanNewContact = (data.contactNo || "").trim().replace(/\D/g, "");
      const isContactChanged = cleanCurrentContact !== cleanNewContact;

      // 1. Update Better Auth profile
      const updateUserResult = await authClient.updateUser({
        name: data.name,
        username: data.username,
        contactNo: cleanNewContact || null,
        ...(isContactChanged ? { contactVerified: false } : {}),
      } as any);

      if (updateUserResult?.error) {
        toast.error(updateUserResult.error.message || tran("profile.edit.msg.failed_to_update_profile"));
        return;
      }

      // 2. If email changed, trigger email change verification
      if (data.email !== user?.email) {
        const emailResult = await authClient.changeEmail({
          newEmail: data.email,
          callbackURL: "/settings/profile",
        });
        if (emailResult?.error) {
          toast.error(emailResult.error.message || tran("profile.edit.msg.failed_to_change_email"));
          return;
        }
      }

      if (data.email !== user?.email) {
        toast.success(tran("profile.edit.msg.verify_email_notice"));
      } else {
        toast.success(tran("profile.edit.msg.profile_updated_successfully"));
      }

      router.refresh();
      router.push("/settings/profile");
    } catch (error) {
      toast.error(tran("profile.edit.msg.something_went_wrong"));
      console.error("Something went wrong", error);
    }
  }

  return (
    <div className="w-full bg-background pb-32">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-4xl space-y-6 sm:space-y-8 px-4 sm:px-6"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Avatar Section */}
          <motion.div variants={itemVariants}>
            <EditProfileAvatar user={user} />
          </motion.div>

          {/* Form Fields */}
          <motion.section variants={itemVariants} className="mx-auto flex w-full max-w-lg flex-col gap-5 sm:gap-6 px-2 sm:px-6">
            <EditProfileFormField
              label={tran("profile.edit.name_label")}
              icon={User}
              registration={register("name", { required: tran("profile.edit.msg.name_required") })}
            />

            <EditProfileFormField
              label="Username"
              icon={AtSign}
              registration={register("username", {
                required: "Username is required",
                onChange: (e) => {
                  setValue("username", e.target.value.toLowerCase().replace(/\s+/g, ""));
                },
              })}
              rightElement={
                checkingUsername ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : usernameAvailable === true ? (
                  <Check className="w-5 h-5 text-emerald-500" />
                ) : usernameAvailable === false ? (
                  <X className="w-5 h-5 text-destructive" />
                ) : (
                  <AtSign size={18} />
                )
              }
            />
            {watchedUsername && watchedUsername !== user?.username && (
              <div className="text-xs ml-1 -mt-4 transition-all duration-200">
                {checkingUsername && <span className="text-muted-foreground animate-pulse">Checking availability...</span>}
                {!checkingUsername && usernameAvailable === true && (
                  <span className="text-emerald-500 font-medium">Username is available!</span>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <span className="text-destructive font-medium">
                    {watchedUsername.length < 3
                      ? "Username must be at least 3 characters"
                      : !/^[a-zA-Z0-9_-]+$/.test(watchedUsername)
                        ? "Only alphanumeric characters, underscores, and hyphens allowed"
                        : "Username is already taken"}
                  </span>
                )}
              </div>
            )}

            <EditProfileFormField
              label={tran("profile.phone_number")}
              icon={Phone}
              registration={register("contactNo", {
                onChange: (e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setValue("contactNo", digits);
                },
              })}
              placeholder={tran("profile.edit.phone_placeholder")}
              maxLength={10}
              onKeyDown={(e) => {
                if (
                  !/[0-9]/.test(e.key) &&
                  !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"].includes(e.key) &&
                  !e.ctrlKey &&
                  !e.metaKey
                ) {
                  e.preventDefault();
                }
              }}
            />

            <EditProfileFormField
              label={tran("profile.email_address")}
              icon={Mail}
              type="email"
              disabled={true}
              registration={register("email", { required: tran("profile.edit.msg.email_required") })}
            />

            <div className="flex items-center gap-2 p-4 rounded-2xl bg-muted/30 border border-dashed border-muted-foreground/20">
              <CheckCircle2 size={16} className="text-muted-foreground shrink-0" />
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {tran("profile.edit.msg.email_verification_notice")}
              </p>
            </div>
          </motion.section>

          {/* Submit */}
          <FooterButtons>
            <Button
              type="submit"
              className="h-14 w-auto px-8 rounded-full gap-3 font-semibold uppercase bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 py-2 cursor-pointer"
            >
              <LoadingSwap isLoading={isSubmitting}>
                <div className="flex items-center gap-2">
                  <Edit3 size={18} />
                  <span className="hidden md:block">{tran("profile.edit.update_profile_button")}</span>
                </div>
              </LoadingSwap>
            </Button>
          </FooterButtons>
        </form>
      </motion.div>
    </div>
  );
}

