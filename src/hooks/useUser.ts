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
  const rawUser = session?.user;
  // While the session is still loading, fall back to the SSR-provided
  // initialUser so the first client render matches the server output.
  // Once isPending is false we trust the live session result — returning null
  // when there is no session (e.g. after sign-out) is correct behaviour.
  const user: SessionUser | null = rawUser
    ? { id: rawUser.id, name: rawUser.name ?? null, email: rawUser.email, image: rawUser.image }
    : isPending
      ? (initialUser ?? null)
      : null;
  return {
    user,
    isLoading: isPending && initialUser === undefined,
  };
}
