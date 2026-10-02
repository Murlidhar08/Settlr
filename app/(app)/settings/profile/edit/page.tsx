'use client'

import { motion } from 'framer-motion'
import { AtSign, Camera, Check, CheckCircle2, Edit3, Loader2, Mail, Phone, User, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm, UseFormRegisterReturn } from 'react-hook-form'
import { toast } from 'sonner'

import { FooterButtons } from '@/components/footer-buttons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSwap } from '@/components/ui/loading-swap'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { authClient } from '@/lib/auth/auth-client'
import { tran } from '@/lib/languages/i18n'
import { getFileUrl } from '@/lib/utils'
import { useCurrentUser, useRemoveUserProfile, useUploadProfileImage } from '@/tanstacks/user'
import { getInitials } from '@/utility/common-function'

type ProfileFormValues = {
  name: string
  username: string
  email: string
  contactNo?: string
}

export default function EditProfilePage() {
  const router = useRouter()
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const uploadImageMutation = useUploadProfileImage();
  const removeAvatarMutation = useRemoveUserProfile();

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
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

  const { register, handleSubmit, formState: { isSubmitting }, reset, watch, setValue } = useForm<ProfileFormValues>({
    defaultValues: {
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || '',
      contactNo: user?.contactNo || '',
    },
  })

  const watchedUsername = watch('username')

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? '',
        username: user.username ?? '',
        email: user.email ?? '',
        contactNo: user?.contactNo || '',
      })
    }
  }, [user, reset])

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
        setUsernameAvailable(!!result.data?.available);
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

      const promises = []

      promises.push(
        authClient.updateUser({
          name: data.name,
          username: data.username,
          contactNo: data.contactNo,
        })
      )

      if (data.email !== user?.email) {
        promises.push(
          authClient.changeEmail({
            newEmail: data.email,
            callbackURL: '/settings/profile',
          })
        )
      }

      const res = await Promise.all(promises)

      const updateUserResult = res[0]
      const emailResult = res[1] ?? { error: false }

      if (updateUserResult?.error) {
        toast.error(updateUserResult.error.message || tran("profile.edit.msg.failed_to_update_profile"))
        return
      }

      if (emailResult?.error) {
        toast.error(emailResult.error.message || tran("profile.edit.msg.failed_to_change_email"))
        return
      }

      if (data.email !== user?.email) {
        toast.success(tran("profile.edit.msg.verify_email_notice"))
      } else {
        toast.success(tran("profile.edit.msg.profile_updated_successfully"))
      }

      router.refresh()
      router.push('/settings/profile' as any)
    } catch (error) {
      toast.error(tran("profile.edit.msg.something_went_wrong"));
      console.error('Something went wrong', error);
    }
  }

  return (
    <div className="w-full bg-background pb-34">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-4xl mt-6 space-y-8 px-6"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Avatar Section */}
          <motion.section variants={itemVariants} className="flex flex-col items-center py-10 relative">
            <div className="relative group">
              <Avatar
                className="h-32 w-32 ring-4 ring-background shadow-2xl transition-transform duration-500 group-hover:scale-105 cursor-pointer relative overflow-hidden"
                onClick={handleAvatarClick}
              >
                <AvatarImage src={getFileUrl(user?.image)} className="object-cover" />
                <AvatarFallback className="text-3xl font-black bg-primary/10 text-primary">
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
            <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-primary/60">{tran("profile.edit.upload_new_avatar")}</p>
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

          {/* Form Fields */}
          <motion.section variants={itemVariants} className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6">
            <Field
              label={tran("profile.edit.name_label")}
              icon={User}
              registration={register('name', { required: tran("profile.edit.msg.name_required") })}
            />

            <Field
              label="Username"
              icon={AtSign}
              registration={register('username', {
                required: "Username is required",
                onChange: (e) => {
                  setValue('username', e.target.value.toLowerCase().replace(/\s+/g, ""));
                }
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

            <Field
              label={tran("profile.phone_number")}
              icon={Phone}
              registration={register('contactNo')}
              placeholder={tran("profile.edit.phone_placeholder")}
            />

            <Field
              label={tran("profile.email_address")}
              icon={Mail}
              type="email"
              disabled={true}
              registration={register('email', { required: tran("profile.edit.msg.email_required") })}
            />
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-muted/30 border border-dashed border-muted-foreground/20">
              <CheckCircle2 size={16} className="text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{tran("profile.edit.msg.email_verification_notice")}</p>
            </div>
          </motion.section>

          {/* Submit */}
          <FooterButtons>
            <Button
              type="submit"
              className="h-14 w-auto p-8 rounded-full gap-3 font-semibold uppercase bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 py-2"
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
  )
}

function EditProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col items-center py-10 space-y-4">
        <Skeleton className="h-32 w-32 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="mx-auto max-w-lg space-y-6 px-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}

function Field({
  label,
  icon: Icon,
  registration,
  type = "text",
  disabled = false,
  placeholder = "",
  rightElement,
}: {
  label: string
  icon: React.ElementType
  registration: UseFormRegisterReturn
  type?: string
  disabled?: boolean
  placeholder?: string
  rightElement?: React.ReactNode
}) {
  return (
    <div className={`flex flex-col gap-2 ${disabled ? "opacity-60 grayscale-[0.5]" : ""}`}>
      <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="relative group">
        <Input
          disabled={disabled}
          type={type}
          placeholder={placeholder}
          {...registration}
          className="h-14 rounded-2xl pr-12 bg-muted/10 border-muted-foreground/10 focus:bg-background transition-all duration-300 font-bold"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-transparent flex items-center justify-center text-muted-foreground transition-colors group-focus-within:text-primary">
          {rightElement || <Icon size={18} />}
        </div>
      </div>
    </div>
  )
}
