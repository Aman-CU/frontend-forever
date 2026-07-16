import type { CollectionQuestionSeed } from "../types";

// 2 of the 6 approved pilot answers (interview-prep-content-guide.md, approved
// 2026-07-14) — the remaining ~97 FF React questions are a separate
// content-authoring pass, tracked in that same file's Status section.
//
// orderIndex corrected to 22 and 9 (not the pilot's original 1 and 2) to
// stay consistent with the full React collection's already-seeded DB state
// from content/ff-react-questions, since the Supabase database is shared
// across local branches (not branch-scoped) — same fix already applied on
// that branch, needed here too so this branch's own seed run doesn't hit a
// `(collection, order_index)` unique-constraint collision. Also carries the
// same React-20 factual fix already made on that branch (there is no
// "React 20" — React Compiler went stable at v1.0, October 2025; it's
// independently versioned from React itself, and officially supports
// React 17+, not just React 19).
export const FF_REACT_COLLECTION_QUESTIONS: CollectionQuestionSeed[] = [
  {
    collection: "ff-react",
    slug: "controlled-vs-uncontrolled-components",
    question: "What is the difference between controlled and uncontrolled components?",
    answer: `A controlled component's value lives in React state — you set it via a \`value\` prop and update it via \`onChange\`, so React is the single source of truth. An uncontrolled component manages its own value internally in the DOM, and you read it on demand with a \`ref\` instead of tracking every keystroke in state.

### Controlled

\`\`\`jsx
function ControlledInput() {
  const [value, setValue] = useState('');
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}
\`\`\`

React re-renders on every keystroke. You always know the current value, can validate/transform it live, and can drive other UI off it immediately.

### Uncontrolled

\`\`\`jsx
function UncontrolledInput() {
  const ref = useRef(null);
  const handleSubmit = () => console.log(ref.current.value);
  return <input ref={ref} defaultValue="" />;
}
\`\`\`

The DOM owns the value; React only reads it when asked (\`ref.current.value\`). No re-render per keystroke.

### When to reach for which

| | Controlled | Uncontrolled |
|---|---|---|
| Live validation / formatting as you type | Yes | No |
| Disabling a submit button until valid | Yes | No (only knows value on read) |
| Large forms, performance-sensitive | re-renders per field | Yes — fewer re-renders |
| Simple "read it once on submit" forms | overkill | Yes — simplest option |
| File inputs | can't be controlled (browser-owned) | Yes — only option |

Most real forms end up controlled for validation UX, but file inputs are always uncontrolled — the browser refuses to let you set a \`value\` on \`<input type="file">\` programmatically for security reasons, which is itself a common follow-up question.

**Related:** How do you handle forms in React? · What is the difference between state and props? · [Forms: Controlled vs. Uncontrolled](/learn/react/controlled-vs-uncontrolled-forms) (Learn concept)`,
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 22,
  },
  {
    collection: "ff-react",
    slug: "usememo-when-to-use",
    question: "What is `useMemo` and when should you use it?",
    answer: `\`useMemo(fn, deps)\` caches the return value of an expensive computation across renders, only recomputing it when one of the values in \`deps\` changes. **As of the React Compiler (stable since v1.0, October 2025 — independently versioned from React itself, officially supporting React 17+; there is no "React 20"), this is worth answering carefully** — the compiler now auto-memoizes most component output, so manual \`useMemo\` has shifted from routine practice to a targeted escape hatch.

### The classic pre-compiler use case

\`\`\`jsx
function ProductList({ products, query }) {
  const filtered = useMemo(
    () => products.filter((p) => p.name.includes(query)),
    [products, query]
  );
  return filtered.map((p) => <Product key={p.id} {...p} />);
}
\`\`\`

Without \`useMemo\`, \`.filter()\` re-runs on *every* render of this component, even ones triggered by unrelated state elsewhere. \`useMemo\` skips that work unless \`products\` or \`query\` actually changed.

### What changed with React Compiler

The compiler statically analyzes component code and inserts the equivalent of \`useMemo\`/\`useCallback\`/\`React.memo\` automatically, for most cases, without you writing them. Two real consequences worth stating precisely, not just "it's obsolete now":

- **It's not gone, it's optional for the common case.** Existing \`useMemo\` calls still work — the compiler respects them, and if you leave one in place, you get double-memoization (harmless, just a small per-render overhead), not a conflict.
- **Manual \`useMemo\` is still the right tool when you need to guarantee referential stability for something the compiler can't see through** — most commonly, when a memoized value feeds an \`useEffect\` dependency array and you need to be certain it doesn't change identity between renders for reasons the compiler's static analysis can't infer (e.g. an object built from external, non-reactive data).

### The current, accurate rule (2026)

Write plain code first and let the compiler handle memoization. Reach for \`useMemo\` explicitly only when: (1) you're in a codebase without the compiler enabled, or (2) you need precise, guaranteed control over a value's identity — most often for an effect dependency — that the compiler's inference can't be trusted to get right.

**Related:** What is useCallback and how does it prevent re-renders? · What is React.memo and how does it work? · What is the React Compiler (React Forget)? · [Render Performance: memo, useMemo, useCallback](/learn/react/render-performance-memoization) (Learn concept)

**Sources checked:** react.dev/reference/react/useMemo, react.dev — React Compiler introduction`,
    difficulty: "hard",
    companies: ["Meta", "Stripe"],
    orderIndex: 9,
  },
];
