import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { auth } from "@/lib/auth/server";
import { Separator } from "@/components/ui/separator";
import { OAuthButton } from "@/features/auth/components/OAuthButton";
import { getLoginErrorMessage } from "@/features/auth/lib/getLoginErrorMessage";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  let session = null;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    // Fall through — render login page
  }
  if (session?.user) redirect("/");

  const { error } = await searchParams;
  const errorMessage = getLoginErrorMessage(error ?? null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 dark:bg-background">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2"
        >
          <span className="text-4xl font-extrabold tracking-tight text-text-primary">
            FF
          </span>
          <span className="text-sm font-semibold tracking-tight text-text-primary">
            Frontend Forever
          </span>
        </Link>

        <div className="rounded-2xl border border-border-light bg-surface p-8 shadow-xl dark:bg-surface-secondary">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Sign in to continue learning
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2 rounded-lg bg-error-muted px-3 py-2.5 text-sm text-error"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-4">
            <OAuthButton provider="google" />
            <Separator className="my-0" />
            <OAuthButton provider="github" />
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-text-secondary">
          <Link href="/" className="font-medium text-accent hover:underline">
            Back to homepage
          </Link>
        </p>
      </div>
    </main>
  );
}
