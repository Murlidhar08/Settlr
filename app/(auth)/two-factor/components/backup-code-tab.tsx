"use client";

import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";

type BackupCodeFormValues = {
  code: string;
};

export function BackupCodeTab() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BackupCodeFormValues>();

  async function onSubmit(values: BackupCodeFormValues) {
    await authClient.twoFactor.verifyBackupCode(
      { code: values.code },
      {
        onSuccess: () => {
          toast.success("Security bypass successful!");
          router.push("/");
        },
        onError: (error) => {
          toast.error(error?.error?.message ?? "Invalid backup code");
        },
      }
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="space-y-3">
        <label className="text-sm font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" /> Backup Code
        </label>
        <div className="relative group">
          <Input
            {...register("code", {
              required: "Backup code is required",
            })}
            placeholder="XXXX-XXXX"
            className="h-14 rounded-2xl pl-4 transition-all duration-300 bg-background border-muted-foreground/10 focus:ring-2 focus:ring-primary/20 focus:border-primary text-center font-mono text-lg uppercase"
          />
        </div>
        {errors.code && (
          <p className="text-xs font-medium text-destructive">
            {errors.code.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="outline"
        className="rounded-2xl h-14 w-full font-bold border-muted-foreground/10 hover:bg-muted/50 transition-colors cursor-pointer"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Verifying...
          </div>
        ) : "Verify Backup Code"}
      </Button>
    </form>
  );
}
