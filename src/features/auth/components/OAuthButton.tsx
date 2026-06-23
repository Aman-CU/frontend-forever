"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { GoogleIcon } from "@/features/auth/components/GoogleIcon";
import { GithubIcon } from "@/features/auth/components/GithubIcon";

type Provider = "google" | "github";

type Props = {
  provider: Provider;
};

const PROVIDER_CONFIG: Record<
  Provider,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  google: { label: "Continue with Google", icon: GoogleIcon },
  github: { label: "Continue with GitHub", icon: GithubIcon },
};

export function OAuthButton({ provider }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const { label, icon: Icon } = PROVIDER_CONFIG[provider];

  const handleClick = async () => {
    setIsPending(true);
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: "/learn",
      errorCallbackURL: "/login",
    });
    // A successful call navigates the browser away to the provider, so we
    // only ever reach here if the request failed before that redirect.
    if (error) {
      setIsPending(false);
      router.push(`/login?error=${encodeURIComponent(error.code ?? "unknown")}`);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      disabled={isPending}
      onClick={handleClick}
      className="h-auto w-full gap-2.5 py-3 text-sm font-medium"
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Icon className="size-4" />
      )}
      {label}
    </Button>
  );
}
