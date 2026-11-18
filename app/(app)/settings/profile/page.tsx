import type { Metadata } from "next";
import { ProfileView } from "./components/profile-view";

export const metadata: Metadata = {
  title: "Profile | PlayArena",
  description: "View and manage your player profile, contact number, and credentials.",
};

export default function ProfilePage() {
  return <ProfileView />;
}
