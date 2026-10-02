import { UserProfileHeader } from "@/components/user/user-profile-header";
import UserForm from "../components/user-form";

export default function UserAddPage() {
    return (
        <div className="flex-1 min-h-screen bg-background/50 p-4 sm:p-8 lg:p-12 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">
                    {/* Header Section */}
                    <UserProfileHeader user={null} isEditing={false} />

                    {/* Form Section */}
                    <UserForm backUrl="/admin" />
                </div>
            </div>
    );
}
