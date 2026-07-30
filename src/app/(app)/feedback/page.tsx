import type { Metadata } from "next";
import { Mail } from "lucide-react";

const FEEDBACK_EMAIL = "feedback@frontendforever.dev";

export const metadata: Metadata = {
  title: "Feedback | Frontend Forever",
  description: "Share feedback, report a bug, or suggest an idea for Frontend Forever.",
};

export default function FeedbackPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-6 py-16 text-center">
      <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-accent-muted">
        <Mail className="size-5 text-accent" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold text-text-primary">We&apos;d love to hear from you</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Found a bug, have an idea, or just want to say hi? Send it straight to the person building
        Frontend Forever — every message gets read.
      </p>

      <a
        href={`mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent("Frontend Forever feedback")}`}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
      >
        <Mail className="size-4" aria-hidden />
        Email your feedback
      </a>

      <p className="mt-4 text-xs text-text-muted">
        Or copy the address directly:{" "}
        <a href={`mailto:${FEEDBACK_EMAIL}`} className="font-medium text-text-secondary underline">
          {FEEDBACK_EMAIL}
        </a>
      </p>
    </div>
  );
}
