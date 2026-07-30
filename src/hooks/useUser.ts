"use client";

import { useSyncExternalStore } from "react";

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

function subscribeNoop() {
  return () => {};
}
function getHasMountedSnapshot() {
  return true;
}
function getHasMountedServerSnapshot() {
  return false;
}

export function useUser(initialUser?: SessionUser | null): UseUserResult {
  const { data: session, isPending } = authClient.useSession();
  // authClient's session store is a module-level singleton shared across
  // client-side navigations — it can already hold a stale or still-settling
  // result (e.g. left over from before this page loaded, or a refetch that
  // got aborted) by the time this component mounts, independent of what the
  // server just rendered. Trusting isPending on the very first client render
  // caused a real hydration mismatch: SSR rendered the signed-in
  // UserDropdown from a fresh initialUser while the client's first render
  // read the stale store and rendered the logged-out Login link instead.
  // Forcing the first render to always equal initialUser, then only
  // switching to the live store post-mount, guarantees the first client
  // render is byte-for-byte what the server sent. A naive useState+useEffect
  // flag here would trip the react-hooks/set-state-in-effect lint rule and
  // is the wrong tool for this anyway — same reasoning as
  // useSafeReducedMotion.ts: getServerSnapshot (always false) vs getSnapshot
  // (always true once called on the client) gives the same "false on first
  // render, true right after" behavior with no manual setState.
  const hasMounted = useSyncExternalStore(
    subscribeNoop,
    getHasMountedSnapshot,
    getHasMountedServerSnapshot,
  );

  if (!hasMounted) {
    return { user: initialUser ?? null, isLoading: initialUser === undefined };
  }

  const rawUser = session?.user;
  // Once mounted, isPending distinguishes "still checking" (fall back to
  // initialUser) from "checked, no session" (null is correct, e.g. after
  // sign-out).
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
