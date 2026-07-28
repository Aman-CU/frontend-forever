// Renders when this slot has no active intercepted route — i.e. on every
// page except a client-side navigation to /settings/[section]. Required by
// Next.js's Parallel Routes convention: without it, any other page under
// (app) would 404 for this slot on a hard navigation/refresh.
export default function Default() {
  return null;
}
