"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import { CHALLENGE_DIFFICULTIES, type ChallengeDifficulty } from "@/lib/constants";
import { CollectionQuestionListRow } from "@/features/interview-prep/components/CollectionQuestionListRow";
import type { InterviewPrepRouteCollection } from "@/features/interview-prep/lib/collectionRoutes";
import type { CollectionQuestionListItem } from "@/features/interview-prep/lib/queries";

type DifficultyFilter = "all" | ChallengeDifficulty;
type StatusFilter = "all" | "completed" | "not-started";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "not-started", label: "Not started" },
];

type Props = {
  routeCollection: InterviewPrepRouteCollection;
  questions: CollectionQuestionListItem[];
};

// Same filtering approach as Practice's ChallengeListClient (search + pill
// filters, client-side over an already-fetched array — small enough dataset
// per collection that this needs no pagination).
export function CollectionQuestionListClient({ routeCollection, questions }: Props) {
  const reduceMotion = useSafeReducedMotion();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return questions.filter((q) => {
      if (query && !q.question.toLowerCase().includes(query)) return false;
      if (difficulty !== "all" && q.difficulty !== difficulty) return false;
      if (status === "completed" && !q.completed) return false;
      if (status === "not-started" && q.completed) return false;
      return true;
    });
  }, [questions, deferredSearch, difficulty, status]);

  if (questions.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary/40 px-6 py-12 text-center">
        <p className="text-sm text-text-secondary">Questions for this collection are coming soon.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-3">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions…"
          aria-label="Search questions"
          className="h-11 w-full pl-10 text-sm"
        />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <FilterPillGroup
          value={difficulty}
          onChange={setDifficulty}
          options={[
            { value: "all", label: "All" },
            ...CHALLENGE_DIFFICULTIES.map((d) => ({ value: d, label: capitalize(d) })),
          ]}
        />
        <div className="h-4 w-px bg-border" aria-hidden />
        <FilterPillGroup value={status} onChange={setStatus} options={STATUS_FILTERS} />
      </div>

      {filtered.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary/40 px-6 py-12 text-center">
          <p className="text-sm text-text-secondary">No questions match those filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false} mode="popLayout">
            {filtered.map((q, i) => (
              <motion.div
                key={q.slug}
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.15 }}
              >
                <CollectionQuestionListRow routeCollection={routeCollection} index={i + 1} {...q} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function FilterPillGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-surface-secondary p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            value === option.value
              ? "bg-surface text-text-primary shadow-sm"
              : "text-text-muted hover:text-text-primary",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
