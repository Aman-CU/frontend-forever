import { ImageResponse } from "next/og";

import { isPracticeCategory, PRACTICE_CATEGORY_LABELS } from "@/features/practice/lib/practiceCategories";
import { getChallengeBySlug } from "@/features/practice/lib/queries";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Static PNG only — link-preview images on X/Facebook/Instagram can't be
// animated, so this is a single, deliberately well-designed frame (FF mark,
// category, question number + title). See progress-tracker.md's Feature 29
// share-image decision.
//
// Colors below are literal hex, not var(--color-...) references: `next/og`'s
// ImageResponse renders through satori, which has no CSS engine and cannot
// resolve custom properties or Tailwind classes — only inline style objects
// with literal values. Every value here is the literal of an existing
// globals.css token (named in the comment) so this stays in sync with the
// app theme by convention; there's no way to enforce that link at build time
// without a shared JS token module, which this Tailwind-v4/CSS-first project
// doesn't have.
const BRAND = {
  background: "#FAFAF9", // --color-background
  markBg: "#0D9488", // --color-accent
  markFg: "#FFFFFF", // --color-accent-foreground
  titlePrimary: "#111827", // --color-text-primary
  textSecondary: "#6B7280", // --color-text-secondary
  categoryPillBg: "#F3F4F6", // --color-surface-tertiary
};
const DIFFICULTY_COLORS: Record<string, { bg: string; fg: string }> = {
  easy: { bg: "#DCFCE7", fg: "#15803D" }, // --color-success-light / --color-success-dark
  medium: { bg: "#F0FDFA", fg: "#0F766E" }, // --color-accent-muted / --color-accent-dark
  hard: { bg: "#FEE2E2", fg: "#DC2626" }, // --color-error-light / --color-error
};

export default async function Image({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;

  const challenge = isPracticeCategory(category) ? await getChallengeBySlug(category, slug) : null;
  const title = challenge?.title ?? "Practice Challenge";
  const label = challenge ? PRACTICE_CATEGORY_LABELS[challenge.category] : "Practice";
  const difficulty = challenge?.difficulty ?? "easy";
  const questionNumber = challenge?.questionNumber ?? 0;
  const diffColors = DIFFICULTY_COLORS[difficulty] ?? DIFFICULTY_COLORS.easy;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: BRAND.background,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: BRAND.markBg,
              color: BRAND.markFg,
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            FF
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: BRAND.titlePrimary }}>
            Frontend Forever
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {questionNumber > 0 && (
            <div style={{ display: "flex", fontSize: 28, fontWeight: 600, color: BRAND.textSecondary }}>
              Question #{questionNumber}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 800,
              color: BRAND.titlePrimary,
              lineHeight: 1.15,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                display: "flex",
                borderRadius: 999,
                padding: "8px 20px",
                background: BRAND.categoryPillBg,
                color: BRAND.textSecondary,
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
            <div
              style={{
                display: "flex",
                borderRadius: 999,
                padding: "8px 20px",
                background: diffColors.bg,
                color: diffColors.fg,
                fontSize: 22,
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {difficulty}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
