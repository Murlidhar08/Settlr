import { getUserById, getUserDocuments } from "@/actions/user.actions";
import AppTabs from "@/components/tab/app-tabs";
import { UserProfileHeader } from "@/components/user/user-profile-header";
import {
    FileText,
    User as UserIcon
} from "lucide-react";
import { notFound } from "next/navigation";
import GeneralTab from "./components/general-tab";
import { UserHeader } from "./components/user-header-action";
import dynamic from "next/dynamic";

export default async function UserDetailsPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const user = await getUserById(userId);

    if (!user) notFound();

    // Fetch user documents count
    const documents = await getUserDocuments(userId);
    const DocumentTab = dynamic(() => import("../components/document-tab"))

    const tabs = [
        {
            id: "general",
            label: "GENERAL",
            icon: <UserIcon size={18} />,
            content: (
                <GeneralTab user={user} />
            )
        },
        {
            id: "documents",
            label: "DOCUMENT",
            icon: <FileText size={18} />,
            badgeCount: documents.length,
            content: (
                <DocumentTab userId={userId} />
            )
        },
    ];

    return (
        <>
            <UserHeader userId={userId} hasImage={!!user.image} />

            <div className="min-h-full w-full bg-background p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto">
                {/* Header Section */}
                <UserProfileHeader user={user} />

                {/* Content Tabs */}
                <AppTabs
                    defaultTab="general"
                    tabs={tabs}
                />
            </div>
        </>
    );
}