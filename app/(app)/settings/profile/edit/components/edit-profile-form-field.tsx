"use client";

import type { UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";

interface EditProfileFormFieldProps {
  label: string;
  icon: React.ElementType;
  registration: UseFormRegisterReturn;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
  rightElement?: React.ReactNode;
  maxLength?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function EditProfileFormField({
  label,
  icon: Icon,
  registration,
  type = "text",
  disabled = false,
  placeholder = "",
  rightElement,
  maxLength,
  onKeyDown,
}: EditProfileFormFieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${disabled ? "opacity-60 grayscale-[0.5]" : ""}`}>
      <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <div className="relative group">
        <Input
          disabled={disabled}
          type={type}
          placeholder={placeholder}
          maxLength={maxLength}
          onKeyDown={onKeyDown}
          {...registration}
          className="h-14 rounded-2xl pr-12 bg-muted/10 border-muted-foreground/10 focus:bg-background transition-all duration-300 font-bold"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-transparent flex items-center justify-center text-muted-foreground transition-colors group-focus-within:text-primary">
          {rightElement || <Icon size={18} />}
        </div>
      </div>
    </div>
  );
}

