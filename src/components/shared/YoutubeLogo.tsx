import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

// YouTube brand glyph — lucide-react ships no brand icons (same reason
// XLogo.tsx is hand-inlined), so the official play-button mark is inlined
// here. Uses currentColor for the outer shape so it can be recolored, with
// the inner triangle punched out via --color-accent-foreground (the real
// mark is two-tone regardless of surrounding text color; that token is
// theme-invariant white, same value as the hardcoded fill it replaces).
export function YoutubeLogo({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("size-4", className)}>
      <path
        fill="currentColor"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814Z"
      />
      <path fill="var(--color-accent-foreground)" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
    </svg>
  );
}
