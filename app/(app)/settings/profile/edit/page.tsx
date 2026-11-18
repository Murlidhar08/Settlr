import type { Metadata } from "next";
import { EditProfileView } from "./components/edit-profile-view";

export const metadata: Metadata = {
  title: "Edit Profile | PlayArena",
  description: "Update your name, username, contact number, and profile picture.",
};

export default function EditProfilePage() {
  return <EditProfileView />;
}
