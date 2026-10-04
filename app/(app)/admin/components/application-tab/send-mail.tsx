"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth-client";
import { tran } from "@/lib/languages/i18n";
import { useTestSmtpConfig } from "@/tanstacks/admin";
import { Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SendMailProps {
    form: any
}

export function SendMail({ form }: SendMailProps) {
    const [testingEmail, setTestingEmail] = useState(false);
    const [testRecipient, setTestRecipient] = useState("");
    const testSmtpConfigMutation = useTestSmtpConfig();
    const { data: session } = authClient.useSession();

    useEffect(() => {
        if (!testRecipient && session?.user?.email) {
            setTestRecipient(session.user.email);
        }
    }, [session?.user?.email, testRecipient]);

    const handleSendTestEmail = async () => {
        const values = form.getValues();
        const recipient = testRecipient.trim();

        if (!recipient) {
            toast.error(tran("admin.app_config.msg.recipient_email_required"));
            return;
        }

        if (!values.smtpHost || !values.smtpPort || !values.smtpUser) {
            toast.error(tran("admin.app_config.msg.smtp_required_for_test"));
            return;
        }

        setTestingEmail(true);

        try {
            await testSmtpConfigMutation.mutateAsync({
                smtpHost: values.smtpHost,
                smtpPort: Number(values.smtpPort),
                smtpUser: values.smtpUser,
                smtpPass: values.smtpPass || null,
                smtpSecure: !!values.smtpSecure,
                fromEmail: values.fromEmail || null,
                toEmail: recipient,
            });
            toast.success(tran("admin.app_config.msg.test_email_success"));
        } catch (error: any) {
            toast.error(error.message || tran("admin.app_config.msg.test_email_failed"));
        } finally {
            setTestingEmail(false);
        }
    };

    return (
        <div className="p-5 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Send className="w-4 h-4" />
                </div>
                <div>
                    <h4 className="font-black text-xs uppercase tracking-widest">{tran("admin.app_config.test_email_title")}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground/70">{tran("admin.app_config.test_email_desc")}</p>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
                <Input
                    type="email"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder={tran("admin.app_config.test_email_recipient_placeholder")}
                    className="h-11 rounded-xl border-none bg-background shadow-inner text-xs font-bold flex-1"
                />
                <Button
                    type="button"
                    variant="secondary"
                    disabled={testingEmail}
                    onClick={handleSendTestEmail}
                    className="h-11 px-5 rounded-xl font-black text-xs uppercase tracking-wider gap-2 shrink-0 shadow-sm transition-all"
                >
                    {testingEmail ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{tran("admin.app_config.sending_test_email")}</span>
                        </>
                    ) : (
                        <>
                            <Send className="w-3.5 h-3.5" />
                            <span>{tran("admin.app_config.send_test_email")}</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
