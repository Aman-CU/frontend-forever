// A small, intentionally duplicated copy of Practice's category display
// labels (features/practice/lib/practiceCategories.ts's PRACTICE_CATEGORY_LABELS)
// — features never import other features (architecture.md's invariant), so
// CompanyGuideContentRow's "Practice Challenges" section needs its own local
// lookup rather than importing that one. Falls back to a capitalized raw
// category string for any value not in this small map.
const PRACTICE_CATEGORY_DISPLAY_LABELS: Record<string, string> = {
  "javascript-runtime": "JavaScript",
  react: "React",
  css: "CSS",
  typescript: "TypeScript",
  "system-design": "System Design",
};

export function getPracticeCategoryDisplayLabel(category: string): string {
  return (
    PRACTICE_CATEGORY_DISPLAY_LABELS[category] ??
    category
      .split("-")
      .map((word) => word[0]?.toUpperCase() + word.slice(1))
      .join(" ")
  );
}
