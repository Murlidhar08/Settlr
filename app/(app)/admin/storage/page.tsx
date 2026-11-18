import type { Metadata } from "next";
import { StorageView } from "./components/storage-view";

export const metadata: Metadata = {
  title: "System Storage | PlayArena Admin",
  description: "Manage uploaded assets, documents, and media files.",
};

export default function AdminStoragePage() {
  return (
    <div className="flex-1 px-4 pb-32 pt-6 max-w-7xl mx-auto w-full">
      <StorageView />
    </div>
  );
}
