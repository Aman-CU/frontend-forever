"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Code2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ExperimentSource } from "@/lib/experimentSource";
import { ExperimentStage } from "./ExperimentStage";
import { ExperimentCodeView } from "./ExperimentCodeView";
import { ExperimentShareRow } from "./ExperimentShareRow";

type Props = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  sources: ExperimentSource[];
};

export function ExperimentWorkspace({ slug, title, description, tags, sources }: Props) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 lg:px-8">
      {/* Breadcrumb — Playground-local, same pattern as BattleBreadcrumb. */}
      <div className="flex items-center gap-5">
        <Link
          href="/playground/experiments"
          aria-label="Back to Experiments"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <nav className="flex min-w-0 items-center gap-1.5 text-sm text-text-secondary">
          <Link href="/playground/experiments" className="shrink-0 hover:text-text-primary">
            Experiments
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate font-medium text-text-primary">{title}</span>
        </nav>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          <div className="flex items-center gap-3">
            <ExperimentShareRow title={title} slug={slug} />
            <button
              type="button"
              onClick={() => setShowCode((prev) => !prev)}
              aria-pressed={showCode}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                showCode
                  ? "border-accent bg-accent-muted text-accent-dark"
                  : "border-border bg-surface text-text-primary hover:bg-surface-secondary",
              )}
            >
              {showCode ? <X className="size-4" aria-hidden /> : <Code2 className="size-4" aria-hidden />}
              {showCode ? "Hide Code" : "View Code"}
            </button>
          </div>
        </div>

        <p className="max-w-3xl text-sm leading-relaxed text-text-secondary">{description}</p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs font-medium text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <ExperimentStage slug={slug} title={title} />

      {showCode && <ExperimentCodeView sources={sources} />}
    </div>
  );
}
