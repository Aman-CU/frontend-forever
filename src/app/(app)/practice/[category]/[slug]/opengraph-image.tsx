import { ImageResponse } from "next/og";

import { isPracticeCategory, PRACTICE_CATEGORY_LABELS } from "@/features/practice/lib/practiceCategories";
import { getChallengeBySlug } from "@/features/practice/lib/queries";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Static PNG only — link-preview images on X/Facebook/Instagram can't be
// animated, so this is a single, deliberately well-designed frame (FF mark,
// category, question number + title). See progress-tracker.md's Feature 29
// share-image decision.
const DIFFICULTY_COLORS: Record<string, { bg: string; fg: string }> = {
  easy: { bg: "#DCFCE7", fg: "#15803D" },
  medium: { bg: "#F0FDFA", fg: "#0F766E" },
  hard: { bg: "#FEE2E2", fg: "#DC2626" },
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
          background: "#FAFAF9",
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
              background: "#0D9488",
              color: "#FFFFFF",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            FF
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#111827" }}>
            Frontend Forever
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {questionNumber > 0 && (
            <div style={{ display: "flex", fontSize: 28, fontWeight: 600, color: "#6B7280" }}>
              Question #{questionNumber}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 800,
              color: "#111827",
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
                background: "#F3F4F6",
                color: "#6B7280",
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
