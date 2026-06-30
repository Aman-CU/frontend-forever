import { DebounceDemo } from "./DebounceDemo";

// Per-challenge interactive playground (Feature 24). Returns the bespoke
// neal.fun-style demo for challenges that have one, or null otherwise (those
// just show the editor + tests). Switching on slug and returning JSX directly
// keeps the demo component static rather than created-during-render.
type Props = {
  slug: string;
  code: string;
};

export function ChallengePlayground({ slug, code }: Props) {
  switch (slug) {
    case "implement-debounce":
      return <DebounceDemo code={code} />;
    default:
      return null;
  }
}
