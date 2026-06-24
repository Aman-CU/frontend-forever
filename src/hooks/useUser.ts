"use client";

import { authClient } from "@/lib/auth/client";

export type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
};

export function useUser(initialUser?: SessionUser | null) {
  const { data: session, isPending } = authClient.useSession();
  const user: SessionUser | null = isPending
    ? (initialUser ?? null)
    : (session?.user ?? null);
  return {
    user,
    isLoading: isPending && initialUser === undefined,
  };
}
