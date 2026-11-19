"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface StorageRenameDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newName: string;
  onNewNameChange: (val: string) => void;
  onSave: () => void;
  isPending: boolean;
}

export function StorageRenameDialog({
  isOpen,
  onOpenChange,
  newName,
  onNewNameChange,
  onSave,
  isPending,
}: StorageRenameDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-border bg-card shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tight">
            Rename Item
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <Input
            value={newName}
            onChange={(e) => onNewNameChange(e.target.value)}
            className="h-12 rounded-xl border-border bg-muted/20 font-bold px-4"
            disabled={isPending}
            autoFocus
          />
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1 rounded-xl"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl font-black"
              onClick={onSave}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Name"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

