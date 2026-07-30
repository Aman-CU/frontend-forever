// Renders when this slot has no active intercepted route — i.e. on every
// page except a client-side navigation to /settings/[section]. Required by
// Next.js's Parallel Routes convention: without it, every other route in
// the app (this slot lives at the shared root, not nested in (app) — see
// app/layout.tsx and progress-tracker.md's Feature 55 entry) would 404 for
// this slot on a hard navigation/refresh.
export default function Default() {
  return null;
}
