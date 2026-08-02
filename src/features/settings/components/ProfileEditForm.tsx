"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth/client";
import type { EditableProfile } from "@/features/settings/lib/queries";
import {
  validateProfileInput,
  type ProfileFieldErrors,
  type ProfileFormInput,
} from "@/features/settings/lib/validateProfileInput";

type Props = {
  initialProfile: EditableProfile;
};

type ProfileApiResponse = {
  success?: boolean;
  error?: string;
  fieldErrors?: ProfileFieldErrors;
};

function initialsFor(fullName: string, username: string): string {
  const source = fullName.trim() || username;
  return source.slice(0, 2).toUpperCase();
}

// The only client component in Settings → Profile — everything else on the
// page (the section header) stays a server component. Saving writes both
// `profiles` (authoritative) and mirrors name/image onto Better-Auth's own
// user table server-side (see the route), so router.refresh() here is enough
// to pick up the change everywhere else that reads session.user (Navbar,
// UserDropdown, Dashboard greeting) — not just this page.
export function ProfileEditForm({ initialProfile }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialProfile.fullName ?? "");
  const [username, setUsername] = useState(initialProfile.username);
  const [bio, setBio] = useState(initialProfile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl ?? "");
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;

    setFormError(null);
    setSaved(false);

    // Trim before validating/submitting — the route trims too (readField), so
    // validating raw, untrimmed state here could reject input (e.g. a valid
    // name with trailing whitespace pushing it just over the max length) that
    // the server would have happily accepted post-trim.
    const input: ProfileFormInput = {
      fullName: fullName.trim(),
      username: username.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim(),
    };
    const errors = validateProfileInput(input);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await res.json().catch(() => null)) as ProfileApiResponse | null;
      if (!res.ok) {
        setFieldErrors(data?.fieldErrors ?? {});
        setFormError(data?.error ?? "Could not save profile — please try again.");
        return;
      }

      // `profiles` (the authoritative row) is already saved above. Mirroring
      // name/image onto Better-Auth's own user table must happen via this
      // client call, not a server-side one — only the client's own $fetch
      // wrapper triggers Better Auth's automatic session-store refetch on an
      // /update-user response, which is what makes the Navbar/UserDropdown
      // (read from the live session, not `profiles`) update immediately
      // instead of waiting out the cookie-cache window (`auth.ts`'s
      // `cookieCache.maxAge`). Best-effort:
      // the profiles write already succeeded and is what the user asked to
      // save, so a failure here is logged, not surfaced as a save failure.
      try {
        await authClient.updateUser({
          name: input.fullName,
          image: input.avatarUrl.length > 0 ? input.avatarUrl : null,
        });
      } catch (mirrorError) {
        console.error("[ProfileEditForm] Session mirror update failed:", mirrorError);
      }

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setFormError("Could not save profile — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex items-center gap-4">
        <Avatar size="lg">
          <AvatarImage src={avatarUrl || undefined} alt="" />
          <AvatarFallback>{initialsFor(fullName, username)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <label htmlFor="avatarUrl" className="mb-1 block text-sm font-medium text-text-primary">
            Avatar URL
          </label>
          <Input
            id="avatarUrl"
            type="text"
            inputMode="url"
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="https://…"
            aria-invalid={Boolean(fieldErrors.avatarUrl)}
            aria-describedby={fieldErrors.avatarUrl ? "avatarUrl-error" : undefined}
          />
          {fieldErrors.avatarUrl && (
            <p id="avatarUrl-error" className="mt-1 text-xs text-error">
              {fieldErrors.avatarUrl}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-text-primary">
          Full name
        </label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          maxLength={80}
          aria-invalid={Boolean(fieldErrors.fullName)}
          aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
        />
        {fieldErrors.fullName && (
          <p id="fullName-error" className="mt-1 text-xs text-error">
            {fieldErrors.fullName}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="username" className="mb-1 block text-sm font-medium text-text-primary">
          Username
        </label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value.toLowerCase())}
          maxLength={24}
          aria-invalid={Boolean(fieldErrors.username)}
          aria-describedby={fieldErrors.username ? "username-error" : undefined}
        />
        {fieldErrors.username && (
          <p id="username-error" className="mt-1 text-xs text-error">
            {fieldErrors.username}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="bio" className="mb-1 block text-sm font-medium text-text-primary">
          Bio
        </label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          maxLength={280}
          rows={3}
          placeholder="Tell people a bit about yourself…"
          aria-invalid={Boolean(fieldErrors.bio)}
          aria-describedby={fieldErrors.bio ? "bio-error" : undefined}
        />
        {fieldErrors.bio && (
          <p id="bio-error" className="mt-1 text-xs text-error">
            {fieldErrors.bio}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
          Save changes
        </Button>
        {saved && <p className="text-xs font-medium text-success">Saved</p>}
        {formError && <p className="text-xs text-error">{formError}</p>}
      </div>
    </form>
  );
}
