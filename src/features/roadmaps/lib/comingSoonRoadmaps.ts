// Frontend Developer (the pure roadmap.sh mirror) and the 4 skill roadmaps
// are seeded and fully built, but shipped as "Coming soon" per direct user
// request — only the Frontend Forever Roadmap (the platform tour) is live
// for now. Their node content stays in the seed/DB rather than being
// deleted, so flipping this list is the only step needed to launch them
// later.
const COMING_SOON_ROADMAP_SLUGS = ["frontend-developer", "javascript", "css", "react", "typescript"] as const;

export function isRoadmapComingSoon(slug: string): boolean {
  return (COMING_SOON_ROADMAP_SLUGS as readonly string[]).includes(slug);
}
