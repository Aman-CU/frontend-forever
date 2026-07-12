"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, ChevronDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import { CHALLENGE_DIFFICULTIES, type ChallengeDifficulty } from "@/lib/constants";
import { ChallengeListRow } from "@/features/practice/components/ChallengeListRow";
import type { PracticeChallengeSummary } from "@/features/practice/lib/queries";

type DifficultyFilter = "all" | ChallengeDifficulty;
type StatusFilter = "all" | "solved" | "unsolved";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "solved", label: "Solved" },
  { value: "unsolved", label: "Unsolved" },
];

type Props = {
  challenges: PracticeChallengeSummary[];
};

// Filters the (mock, for now) challenge list client-side — this is still a
// UI-first pass per Rule 1: pure local array filtering, no data-fetching
// logic. A follow-up pass swaps MockChallenge[] for a real query result and
// this component's filtering logic carries over unchanged.
export function ChallengeListClient({ challenges }: Props) {
  const reduceMotion = useSafeReducedMotion();
  const [search, setSearch] = useState("");
  // Deferred, not the raw keystroke value: with a category running into the
  // hundreds of rows (see Practice's javascript-runtime category), the
  // filtered re-render below is expensive enough (each row is a Framer
  // Motion layout-animated element) that recomputing it on every keystroke
  // makes typing feel laggy. useDeferredValue lets the input stay instantly
  // responsive while React deprioritizes the filtered list's re-render.
  const deferredSearch = useDeferredValue(search);
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [companies, setCompanies] = useState<Set<string>>(new Set());

  const availableCompanies = useMemo(
    () => Array.from(new Set(challenges.flatMap((c) => c.companies))).sort(),
    [challenges],
  );

  const filtered = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return challenges.filter((challenge) => {
      if (query && !challenge.title.toLowerCase().includes(query)) return false;
      if (difficulty !== "all" && challenge.difficulty !== difficulty) return false;
      if (status === "solved" && !challenge.completed) return false;
      if (status === "unsolved" && challenge.completed) return false;
      if (companies.size > 0 && !challenge.companies.some((c) => companies.has(c))) return false;
      return true;
    });
  }, [challenges, deferredSearch, difficulty, status, companies]);

  function toggleCompany(company: string) {
    setCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(company)) next.delete(company);
      else next.add(company);
      return next;
    });
  }

  if (challenges.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary/40 px-6 py-12 text-center">
        <p className="text-sm text-text-secondary">Challenges for this category are coming soon.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search — full width, its own row */}
      <div className="relative mb-3">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search challenges…"
          className="h-11 w-full pl-10 text-sm"
        />
      </div>

      {/* Filters — below the search bar, all on one row */}
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
        <div className="h-4 w-px bg-border" aria-hidden />
        <CompanyFilterDropdown
          availableCompanies={availableCompanies}
          selected={companies}
          onToggle={toggleCompany}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary/40 px-6 py-12 text-center">
          <p className="text-sm text-text-secondary">No challenges match those filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false} mode="popLayout">
            {filtered.map((challenge, i) => (
              <motion.div
                key={challenge.slug}
                // "position" (not the default full layout animation): skips
                // measuring each row's size on every re-render and only
                // animates its position, which is the only thing that
                // actually changes when filtering reorders/removes rows.
                // Meaningfully cheaper at the row counts this list can hit.
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.15 }}
              >
                <ChallengeListRow index={i + 1} {...challenge} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function CompanyFilterDropdown({
  availableCompanies,
  selected,
  onToggle,
}: {
  availableCompanies: string[];
  selected: Set<string>;
  onToggle: (company: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary",
          selected.size > 0 && "border-accent text-accent",
        )}
      >
        <Building2 className="h-3.5 w-3.5" aria-hidden />
        Company
        {selected.size > 0 && <span className="font-semibold">({selected.size})</span>}
        <ChevronDown className="h-3 w-3" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-72 w-48">
        {availableCompanies.map((company) => (
          <DropdownMenuCheckboxItem
            key={company}
            checked={selected.has(company)}
            onCheckedChange={() => onToggle(company)}
            onSelect={(e) => e.preventDefault()}
          >
            {company}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
