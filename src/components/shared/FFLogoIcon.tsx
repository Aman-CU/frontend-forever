import { cn } from "@/lib/utils";

type Props = { className?: string };

// The navbar's own "FF" wordmark (Navbar.tsx), redrawn as a scalable SVG
// glyph so it can sit in the same icon slot every other roadmap card icon
// uses (devicon marks / lucide's Code2 — see roadmapMeta.ts) — sized via
// className like any of them, not a fixed-size <span>. Defaults to h-5 w-5
// (merged, not overridden, via cn/tailwind-merge) same as the devicon
// components, so a caller that forgets to pass a size doesn't get an
// unsized/oversized raw SVG.
export function FFLogoIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} aria-hidden>
      <text x="12" y="17" textAnchor="middle" fontSize="13" fontWeight="800" fill="currentColor">
        FF
      </text>
    </svg>
  );
}
