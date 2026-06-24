"use client";

import { authClient } from "@/lib/auth/client";

export function useUser() {
  const { data: session, isPending } = authClient.useSession();
  return {
    user: session?.user ?? null,
    isLoading: isPending,
  };
}
