import { MDXRemote } from "next-mdx-remote/rsc";
import { BookOpen } from "lucide-react";

import type { ConceptContent } from "@/lib/mdx";
import { mdxComponents } from "@/components/shared/mdxComponents";
import { InfoCards } from "./InfoCards";
import { MarkUnderstoodButton } from "./MarkUnderstoodButton";

type Props = {
  content: ConceptContent | null;
  conceptId: string;
  isLoggedIn: boolean;
  initialUnderstood: boolean;
};

export function UnderstandTab({ content, conceptId, isLoggedIn, initialUnderstood }: Props) {
  if (!content) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary/40 px-6 py-12 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-secondary text-text-muted">
          <BookOpen className="h-6 w-6" aria-hidden />
        </div>
        <h2 className="text-base font-semibold text-text-primary">Guide coming soon</h2>
        <p className="mt-1.5 max-w-sm text-sm text-text-secondary">
          The written guide for this concept hasn&apos;t been published yet. Try the other tabs in
          the meantime.
        </p>
      </div>
    );
  }

  return (
    <div>
      <article>
        <MDXRemote source={content.content} components={mdxComponents} />
      </article>
      <InfoCards frontmatter={content.frontmatter} />
      <MarkUnderstoodButton
        conceptId={conceptId}
        isLoggedIn={isLoggedIn}
        initialUnderstood={initialUnderstood}
      />
    </div>
  );
}
