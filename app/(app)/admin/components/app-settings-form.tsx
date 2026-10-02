"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateAppConfig } from "@/tanstacks/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Fingerprint, Globe, Mail, PenLine } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const appConfigSchema = z.object({
    smtpHost: z.string().optional().nullable(),
    smtpPort: z.coerce.number().int().optional().nullable(),
    smtpUser: z.string().optional().nullable(),
    smtpPass: z.string().optional().nullable(),
    smtpSecure: z.boolean().default(false),
    fromEmail: z.string().refine((val) => !val || emailRegex.test(val), {
        message: "Invalid email format. Use 'email@example.com' or 'Name <email@example.com>'",
    }).optional().nullable().or(z.literal("")),
    googleClientId: z.string().optional().nullable(),
    googleClientSecret: z.string().optional().nullable(),
    discordClientId: z.string().optional().nullable(),
    discordClientSecret: z.string().optional().nullable(),
});

type AppConfigValues = z.infer<typeof appConfigSchema>;

import { FooterButtons } from "@/components/footer-buttons";
import { emailRegex } from "@/lib/constants/regex-list";
import { tran } from "@/lib/languages/i18n";
import { SendMail } from "./send-mail";

interface AppSettingsFormProps {
    initialData: any;
}

export function AppSettingsForm({ initialData }: AppSettingsFormProps) {
    const [loading, setLoading] = useState(false);
    const updateAppConfigMutation = useUpdateAppConfig();

    const appConfigSchema = z.object({
        smtpHost: z.string().optional().nullable(),
        smtpPort: z.coerce.number().int().optional().nullable(),
        smtpUser: z.string().optional().nullable(),
        smtpPass: z.string().optional().nullable(),
        smtpSecure: z.boolean().default(false),
        fromEmail: z.string().refine((val) => !val || emailRegex.test(val), {
            message: tran("admin.app_config.msg.invalid_email_format"),
        }).optional().nullable().or(z.literal("")),
        googleClientId: z.string().optional().nullable(),
        googleClientSecret: z.string().optional().nullable(),
        discordClientId: z.string().optional().nullable(),
        discordClientSecret: z.string().optional().nullable(),
    });

    const form = useForm<AppConfigValues>({
        resolver: zodResolver(appConfigSchema) as any,
        defaultValues: {
            smtpHost: initialData.smtpHost || "",
            smtpPort: initialData.smtpPort || 587,
            smtpUser: initialData.smtpUser || "",
            smtpPass: initialData.smtpPass || "",
            smtpSecure: !!initialData.smtpSecure,
            fromEmail: initialData.fromEmail || "",
            googleClientId: initialData.googleClientId || "",
            googleClientSecret: initialData.googleClientSecret || "",
            discordClientId: initialData.discordClientId || "",
            discordClientSecret: initialData.discordClientSecret || ""
        },
    });

    const onSubmit = async (data: AppConfigValues) => {
        setLoading(true);
        try {
            await updateAppConfigMutation.mutateAsync(data as any);
            toast.success(tran("admin.app_config.msg.settings_updated_success"));
        } catch (error: any) {
            toast.error(error.message || tran("admin.app_config.msg.settings_update_failed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-10">
            {/* Email Server Card */}
            <ConfigCard
                title={tran("admin.app_config.email_server")}
                description={tran("admin.app_config.email_server_desc")}
                icon={<Mail className="w-5 h-5" />}
            >
                <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">{tran("admin.app_config.support_email")}</Label>
                    <Input
                        {...form.register("fromEmail")}
                        className="h-12 rounded-2xl border-none bg-muted/40 shadow-inner focus-visible:ring-primary/20 transition-all font-bold"
                        placeholder="App <noreply@example.com>"
                    />
                </div>
                <div className="grid gap-6 sm:grid-cols-3">
                    <div className="sm:col-span-2 space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">{tran("admin.app_config.host")}</Label>
                        <Input
                            {...form.register("smtpHost")}
                            className="h-12 rounded-2xl border-none bg-muted/40 shadow-inner focus-visible:ring-primary/20 transition-all font-bold"
                            placeholder="smtp.example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">{tran("admin.app_config.port")}</Label>
                        <Input
                            type="number"
                            {...form.register("smtpPort")}
                            className="h-12 rounded-2xl border-none bg-muted/40 shadow-inner focus-visible:ring-primary/20 transition-all font-bold"
                        />
                    </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">{tran("admin.app_config.user")}</Label>
                        <Input
                            {...form.register("smtpUser")}
                            className="h-12 rounded-2xl border-none bg-muted/40 shadow-inner focus-visible:ring-primary/20 transition-all font-bold"
                            placeholder="example@gmail.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">{tran("admin.app_config.password")}</Label>
                        <Input
                            type="password"
                            {...form.register("smtpPass")}
                            className="h-12 rounded-2xl border-none bg-muted/40 shadow-inner focus-visible:ring-primary/20 transition-all font-bold"
                            placeholder="******"
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <Checkbox
                        id="smtpSecure"
                        checked={form.watch("smtpSecure")}
                        onCheckedChange={(checked) => form.setValue("smtpSecure", !!checked)}
                        className="rounded-lg h-6 w-6 border-primary/20 data-[state=checked]:bg-primary"
                    />
                    <div className="grid gap-1">
                        <Label htmlFor="smtpSecure" className="text-sm font-black">{tran("admin.app_config.secure_connection")}</Label>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">{tran("admin.app_config.secure_connection_desc")}</p>
                    </div>
                </div>

                {/* Test Email Section */}
                <SendMail form={form} />
            </ConfigCard>

            {/* Email Auth Card (OAuth) */}
            <ConfigCard
                title={tran("admin.app_config.email_auth")}
                description={tran("admin.app_config.email_auth_desc")}
                icon={<Fingerprint className="w-5 h-5" />}
                hidden={true}
            >
                <div className="space-y-6">
                    {/* Google */}
                    <div className="p-5 rounded-2xl border-2 border-dashed border-muted-foreground/10 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                                <Globe className="w-4 h-4 text-rose-500" />
                            </div>
                            <h4 className="font-black text-[11px] uppercase tracking-widest">{tran("admin.app_config.google_auth")}</h4>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input
                                {...form.register("googleClientId")}
                                className="h-11 rounded-xl border-none bg-background shadow-inner text-xs font-bold"
                                placeholder={tran("admin.app_config.client_id")}
                            />
                            <Input
                                type="password"
                                {...form.register("googleClientSecret")}
                                className="h-11 rounded-xl border-none bg-background shadow-inner text-xs font-bold"
                                placeholder={tran("admin.app_config.client_secret")}
                            />
                        </div>
                    </div>

                    {/* Discord */}
                    <div className="p-5 rounded-2xl border-2 border-dashed border-muted-foreground/10 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                <Globe className="w-4 h-4 text-indigo-500" />
                            </div>
                            <h4 className="font-black text-[11px] uppercase tracking-widest">{tran("admin.app_config.discord_auth")}</h4>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input
                                {...form.register("discordClientId")}
                                className="h-11 rounded-xl border-none bg-background shadow-inner text-xs font-bold"
                                placeholder={tran("admin.app_config.client_id")}
                            />
                            <Input
                                type="password"
                                {...form.register("discordClientSecret")}
                                className="h-11 rounded-xl border-none bg-background shadow-inner text-xs font-bold"
                                placeholder={tran("admin.app_config.client_secret")}
                            />
                        </div>
                    </div>
                </div>
            </ConfigCard>

            <FooterButtons bottomSpace={true}>
                <Button
                    type="submit"
                    disabled={loading}
                    className="h-14 w-14 md:w-auto md:px-12 rounded-full md:gap-3 font-semibold uppercase bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 p-0 md:py-2"
                >
                    <PenLine className="size-5 md:size-6" />
                    <span className="hidden md:block text-center font-black tracking-[0.2em] text-sm">
                        {loading ? tran("admin.app_config.msg.saving_settings") : tran("admin.app_config.sync_config_button")}
                    </span>
                </Button>
            </FooterButtons>
        </form>
    );
}

function ConfigCard({ title, description, icon, children, hidden = false }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    hidden?: boolean;
}) {
    if (hidden) return null;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative rounded-[2.5rem] border-2 border-primary/5 bg-card p-6 sm:p-10 shadow-xl shadow-primary/5 transition-all hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:rotate-12">
                    {icon}
                </div>
                <div>
                    <h3 className="text-xl font-black tracking-tight">{title}</h3>
                    <p className="text-sm font-bold text-muted-foreground/60">{description}</p>
                </div>
            </div>
            <div className="space-y-6">
                {children}
            </div>
        </motion.div>
    );
}
