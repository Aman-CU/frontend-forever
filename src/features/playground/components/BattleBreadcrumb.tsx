import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  title: string;
};

// Kept Playground-local rather than reusing Practice's PracticeBreadcrumb —
// features never import other features. Simple 2-level trail (no category
// level like Practice has), same borderless circular back-button pattern.
export function BattleBreadcrumb({ title }: Props) {
  return (
    <div className="flex items-center gap-5">
      <Link
        href="/playground/battles"
        aria-label="Back to UI Battles"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
      </Link>
      <nav className="flex min-w-0 items-center gap-1.5 text-sm text-text-secondary">
        <Link href="/playground/battles" className="shrink-0 hover:text-text-primary">
          UI Battles
        </Link>
        <span aria-hidden>/</span>
        <span className="truncate font-medium text-text-primary">{title}</span>
      </nav>
    </div>
  );
}
