"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth/client";
import { isSessionNotFreshError, REAUTH_MESSAGE } from "@/features/settings/lib/authErrorMessages";

type Props = {
  username: string;
};

// Type-to-confirm (must match the account's own username exactly, same
// friction level as GitHub's repo-delete flow) rather than a plain confirm
// dialog — the deliberately-chosen extra step for an irreversible action.
export function DeleteAccountDialog({ username }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setConfirmText("");
      setError(null);
    }
  }

  async function handleDelete() {
    setSubmitting(true);
    setError(null);
    try {
      const { error: deleteError } = await authClient.deleteUser();
      if (deleteError) {
        setError(
          isSessionNotFreshError(deleteError.code)
            ? REAUTH_MESSAGE
            : (deleteError.message ?? "Could not delete your account. Please try again."),
        );
        return;
      }
      // The session cookie is already cleared server-side by this point — a
      // hard navigation (not router.push) gives a fresh, fully logged-out load.
      window.location.replace("/");
    } catch {
      setError("Could not delete your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" variant="destructive" size="sm" />}>
        Delete account
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            This permanently deletes your profile, streak, XP, and all saved progress. This
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div>
          <label htmlFor="delete-confirm" className="mb-1 block text-xs font-medium text-text-primary">
            Type <span className="font-mono">{username}</span> to confirm
          </label>
          <Input
            id="delete-confirm"
            type="text"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            autoComplete="off"
          />
        </div>

        {error && <p className="text-xs text-error">{error}</p>}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={confirmText !== username || submitting}
            onClick={handleDelete}
          >
            Delete account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
