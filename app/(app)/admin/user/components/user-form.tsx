"use client";

import { checkUsernameUnique } from "@/actions/user.actions";
import { FooterButtons } from "@/components/footer-buttons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DocumentList } from "@/components/user/document-list";
import { DocumentUpload } from "@/components/user/document-upload";
import { emailVerifiedOptions, userStatusList } from "@/lib/constants/common";
import { UserStatus } from "@/lib/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { useCreateUser, useUpdateUser } from "@/tanstacks/user";
import { getUniqueUserName } from "@/utility/common-function";
import { ALL_ROLES, parseRoles, Role, USER_ROLE_OPTIONS } from "@/utility/users-fn";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
    AtSign,
    Briefcase,
    FileText,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    Sparkles,
    User
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const userSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    emailVerified: z.boolean(),
    contactNo: z.string().optional().or(z.literal("")),
    username: z.string().min(3, "Username must be at least 3 characters"),
    status: z.string(),
    occupation: z.string().optional(),
    address: z.string().optional(),
    description: z.string().optional(),
    role: z.string()
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
    initialData?: any;
    backUrl?: Route
}

export default function UserForm({ initialData, backUrl }: UserFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const isEdit = !!initialData;
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();

    const initialRoleString = initialData
        ? Array.isArray(initialData.roleTypes)
            ? initialData.roleTypes.join(",")
            : initialData.role || "user"
        : "user";

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: initialData ? {
            name: initialData.name || "",
            email: initialData.email || "",
            emailVerified: initialData.emailVerified ?? false,
            contactNo: initialData.contactNo || "",
            username: initialData.username || getUniqueUserName(initialData.name),
            status: initialData.status || UserStatus.pendingapproval,
            occupation: initialData.occupation || "",
            address: initialData.address || "",
            description: initialData.description || "",
            role: initialRoleString
        } : {
            status: UserStatus.pendingapproval,
            emailVerified: false,
            role: "user",
            username: getUniqueUserName()
        }
    });

    const name = watch("name");
    const selectedRoles = watch("role");
    const currentRolesList = parseRoles(selectedRoles);

    const toggleRole = (role: Role) => {
        let updated: Role[];
        if (currentRolesList.includes(role)) {
            updated = currentRolesList.filter((r) => r !== role);
            if (updated.length === 0) {
                updated = ["user"];
            }
        } else {
            updated = [...currentRolesList, role];
        }
        setValue("role", updated.join(","), { shouldValidate: true });
    };

    const handleBack = () => {
        if (!backUrl) {
            router.back()
        } else {
            router.push(backUrl)
            return;
        }
    }

    const onSubmit = async (values: UserFormValues) => {
        setLoading(true);
        try {
            // Check username uniqueness
            const isUnique = await checkUsernameUnique(values.username, initialData?.id);
            if (!isUnique) {
                toast.error("Username already taken. Please choose another.");
                setLoading(false);
                return;
            }

            if (isEdit) {
                await updateUserMutation.mutateAsync({ id: initialData.id, data: values });
                toast.success("User updated successfully");
                router.push(`/admin/user/${initialData.id}` as any);
            } else {
                await createUserMutation.mutateAsync(values);
                toast.success("User created successfully");
                router.push("/admin");
            }
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error(isEdit ? "Failed to update user" : "Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-32">
            {/* Basic Information */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="p-8 rounded-[2rem] border-border/50 bg-card shadow-sm backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20" />
                    <h3 className="text-lg font-black mb-8 flex items-center gap-3">
                        <User className="text-primary" size={24} />
                        Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                            <div className="relative group">
                                <Input {...register("name")} placeholder="John Doe" className="pl-12 rounded-2xl h-14 bg-muted/30 border-none transition-all focus-visible:ring-primary/20" />
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary" size={20} />
                            </div>
                            {errors.name && <p className="text-xs text-destructive ml-1">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Username</Label>
                            <div className="relative group">
                                <Input {...register("username")} placeholder="john_doe_123" className="pl-12 rounded-2xl h-14 bg-muted/30 border-none transition-all focus-visible:ring-primary/20" />
                                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary" size={20} />
                                <button
                                    type="button"
                                    onClick={() => setValue("username", getUniqueUserName(name), { shouldValidate: true, shouldDirty: true })}
                                    title="Generate unique username"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors focus:outline-hidden cursor-pointer"
                                >
                                    <Sparkles size={18} />
                                </button>
                            </div>
                            {errors.username && <p className="text-xs text-destructive ml-1">{errors.username.message}</p>}
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                            <div className="relative group">
                                <Input {...register("email")} type="email" placeholder="john@example.com" className="pl-12 rounded-2xl h-14 bg-muted/30 border-none transition-all focus-visible:ring-primary/20" />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary" size={20} />
                            </div>
                            {errors.email && <p className="text-xs text-destructive ml-1">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Contact Number</Label>
                            <div className="relative group">
                                <Input {...register("contactNo")} placeholder="+91 98765 43210" className="pl-12 rounded-2xl h-14 bg-muted/30 border-none transition-all focus-visible:ring-primary/20" />
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary" size={20} />
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Profile & Category */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="p-8 rounded-[2rem] border-border/50 bg-card shadow-sm backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500/20" />
                    <h3 className="text-lg font-black mb-8 flex items-center gap-3">
                        <ShieldCheck className="text-indigo-500" size={24} />
                        Profile & Category
                    </h3>
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Initial Status</Label>

                                <Select
                                    items={userStatusList}
                                    defaultValue={watch("status")}
                                    onValueChange={(val: any) => setValue("status", val || "pendingapproval")}
                                >
                                    <SelectTrigger className="w-45 h-10 rounded-xl border-2 font-bold focus:ring-primary/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl shadow-2xl">
                                        {userStatusList.map((item) => (
                                            <SelectItem key={item.value} value={item.value} className="rounded-lg font-medium">
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Account Verified</Label>

                                <Select
                                    items={emailVerifiedOptions}
                                    defaultValue={watch("emailVerified") ? "true" : "false"}
                                    onValueChange={(val: any) => setValue("emailVerified", val === "true")}
                                >
                                    <SelectTrigger className="w-45 h-10 rounded-xl border-2 font-bold focus:ring-primary/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl shadow-2xl">
                                        {emailVerifiedOptions.map((item) => (
                                            <SelectItem key={item.value} value={item.value} className="rounded-lg font-medium">
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3 sm:col-span-2 lg:col-span-1">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Occupation</Label>
                                <div className="relative group">
                                    <Input {...register("occupation")} placeholder="Real Estate Developer" className="pl-12 rounded-2xl h-14 bg-muted/30 border-none transition-all focus-visible:ring-primary/20" />
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary" size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Assigned Roles</Label>
                            <div className="flex flex-wrap gap-4 p-6 bg-muted/20 rounded-[2rem] border border-border/50">
                                {USER_ROLE_OPTIONS.map((roleConfig) => {
                                    const role = roleConfig.id as Role;
                                    const Icon = roleConfig.icon;
                                    const isChecked = currentRolesList.includes(role);
                                    return (
                                        <div
                                            key={role}
                                            className={cn(
                                                "flex items-center gap-3 bg-card px-5 py-3 rounded-2xl border shadow-xs cursor-pointer transition-all duration-300",
                                                isChecked ? "border-primary/50 bg-primary/5" : "border-border/50 hover:border-border"
                                            )}
                                            onClick={() => toggleRole(role)}
                                        >
                                            <Checkbox
                                                id={role}
                                                checked={isChecked}
                                                onCheckedChange={() => toggleRole(role)}
                                                className="h-5 w-5 rounded-md"
                                            />
                                            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs", roleConfig.accent)}>
                                                <Icon size={14} />
                                            </div>
                                            <Label htmlFor={role} className="cursor-pointer text-sm font-black text-foreground/80 tracking-tight">
                                                {roleConfig.label}
                                            </Label>
                                        </div>
                                    );
                                })}
                            </div>
                            {errors.role && <p className="text-xs text-destructive ml-1">{errors.role.message}</p>}
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Additional Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="p-8 rounded-[2rem] border-border/50 bg-card shadow-sm backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500/20" />
                    <h3 className="text-lg font-black mb-8 flex items-center gap-3">
                        <MapPin className="text-amber-500" size={24} />
                        Additional Details
                    </h3>
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Office/Home Address</Label>
                            <div className="relative group">
                                <Textarea {...register("address")} placeholder="123 Street, City, State, ZIP" className="pl-12 rounded-2xl min-h-30 bg-muted/30 border-none transition-all focus-visible:ring-primary/20 pt-4" />
                                <MapPin className="absolute left-4 top-6 transition-colors group-focus-within:text-primary" size={20} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Bio / Long Description</Label>
                            <div className="relative group">
                                <Textarea {...register("description")} placeholder="Describe the user's role or notes..." className="pl-12 rounded-2xl min-h-37.5 bg-muted/30 border-none transition-all focus-visible:ring-primary/20 pt-4" />
                                <FileText className="absolute left-4 top-6 transition-colors group-focus-within:text-primary" size={20} />
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {isEdit && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                    <div className="space-y-10">
                        <div className="flex items-center gap-4 px-2">
                            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
                                <FileText size={20} />
                            </div>
                            <h3 className="text-xl font-black tracking-tight uppercase">User Documents</h3>
                        </div>

                        <DocumentUpload userId={initialData.id} />

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Existing Documents</h4>
                            <DocumentList userId={initialData.id} isEditable={true} />
                        </div>
                    </div>
                </motion.div>
            )}

            <FooterButtons>
                <Button
                    variant="outline"
                    type="button"
                    onClick={handleBack}
                    className="rounded-full px-10 h-14 font-black border-border shadow-xs hover:bg-muted transition-all"
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={loading} className="rounded-full px-16 h-14 font-black shadow-xl shadow-primary/30 transition-all hover:scale-105">
                    {loading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update User" : "Create User")}
                </Button>
            </FooterButtons>
        </form>
    );
}
