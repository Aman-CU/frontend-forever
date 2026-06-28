import type { ComponentPropsWithoutRef } from "react";

// Token-styled renderers for MDX elements so concept prose matches the design
// system without any hardcoded colors. Passed to <MDXRemote components={...} />.
export const mdxComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="mt-8 mb-3 text-xl font-bold text-text-primary" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-6 mb-2 text-lg font-semibold text-text-primary" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="my-4 text-sm leading-7 text-text-secondary" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="my-4 list-disc space-y-1.5 pl-5 text-sm leading-7 text-text-secondary" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="my-4 list-decimal space-y-1.5 pl-5 text-sm leading-7 text-text-secondary" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <li className="pl-1" {...props} />,
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-text-primary" {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a className="text-accent underline underline-offset-2 hover:text-accent-dark" {...props} />
  ),
  // Inline code (block code is handled by `pre`).
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded bg-surface-secondary px-1.5 py-0.5 font-mono text-[0.85em] text-text-primary"
      {...props}
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="my-5 overflow-x-auto rounded-xl border border-border bg-surface-secondary p-4 font-mono text-xs leading-6 text-text-primary [&_code]:bg-transparent [&_code]:p-0"
      {...props}
    />
  ),
};
