"use client";

import { authClient } from "@/lib/auth/client";

export type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
};

type UseUserResult = {
  user: SessionUser | null;
  isLoading: boolean;
};

export function useUser(initialUser?: SessionUser | null): UseUserResult {
  const { data: session, isPending } = authClient.useSession();
  // Prefer live session data; fall back to server-provided initialUser when the
  // session is pending or resolved to null (e.g. after an aborted fetch). This
  // ensures the first client render always matches the SSR output.
  const rawUser = session?.user;
  const user: SessionUser | null = rawUser
    ? { id: rawUser.id, name: rawUser.name ?? null, email: rawUser.email, image: rawUser.image }
    : (initialUser ?? null);
  return {
    user,
    isLoading: isPending && initialUser === undefined,
  };
}
