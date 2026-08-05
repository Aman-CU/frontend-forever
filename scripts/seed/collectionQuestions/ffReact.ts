import type { CollectionQuestionSeed } from "../types";

// 2 of the 6 approved pilot answers (interview-prep-content-guide.md, approved
// 2026-07-14; orderIndex corrected to 9 and 22 to match the source PDF's own
// numbering, same convention as the JavaScript collection) plus Batch 1
// (#1-8, #10-20, skipping #9 which the pilot already covers) and Batch 2
// (#21, #23-40, skipping #22 which the pilot already covers) of the full
// 99-question run (source: the user's "React Interview Questions.pdf").
// Every React/Next.js-specific fact in this file is web-search-verified per
// interview-prep-content-guide.md's non-negotiable accuracy rule, not
// answered from training data alone — current stable is React 19.2 (October
// 2025); there is no "React 20" (an error caught and fixed in the pilot's
// useMemo answer during this batch). React Compiler v1.0 went stable in
// October 2025 — independently versioned from React itself, officially
// supporting React 17+, not tied to any specific React version line. Batch 2
// caught two more facts worth stating precisely: React.forwardRef and PropTypes are both on a
// deprecation path as of React 19 (ref is now a plain prop; propTypes/
// defaultProps checks on function components are silently ignored), and
// "Concurrent Mode" was dropped as a named concept before React 18 shipped
// — React 18 ships opt-in concurrent *features*, not a global mode toggle.
//
// profiler-api-in-react (#99) is written in this file's final batch below —
// no forward references remain outstanding.
//
// Batch 3 (#41-60, 2026-07-16) covers class/hook lifecycle equivalents, the
// stale closure problem, testing (Enzyme's lack of any React 18/19 adapter
// is a real, current fact — not a stylistic preference), Redux Toolkit/
// Zustand/TanStack Query/SWR, optimistic UI, Portals, and list
// virtualization. Real course-correction worth noting: react-window and
// react-virtualized are both mature-to-legacy as of 2026 — new projects are
// steered toward @tanstack/react-virtual or react-virtuoso instead, which
// the react-window-vs-react-virtualized answer states directly rather than
// implying react-window is simply "the modern choice."
//
// Batch 4 (#61-80, 2026-07-16) closes out defaultprops-and-typescript-
// defaults (#67), render-vs-commit-phases-in-react (#64), sharing-state-
// between-siblings (#69), lifting-state-up-in-react (#70), and ssr-vs-csr-
// vs-ssg (#78) — every forward reference queued for this range. Real facts
// verified rather than assumed: React 17 (not 18 or 19) removed event
// pooling entirely; React 18 removed the "state update on an unmounted
// component" warning itself (most causes weren't real leaks — subscriptions
// are the case that still matters); Framer Motion was renamed to Motion in
// 2025 (package: framer-motion → motion, import: motion/react); @dnd-kit is
// the 2026-standard drag-and-drop choice over react-dnd/react-beautiful-dnd
// (deprecated); React.Children is listed as a legacy API in React's own
// docs, not recommended for new code.
//
// Final batch (#81-99, 2026-07-16) completes the 99-question React
// collection. Real facts verified rather than assumed: use() is explicitly
// NOT a hook and doesn't follow the Rules of Hooks — it can be called
// conditionally, in loops, or after an early return, unlike every actual
// hook; React 17 (not 18/19) moved event delegation from document to the
// root container; and, most significantly, React Router v6 is now
// end-of-life as of 2026 — Remix merged into React Router (what would have
// been Remix v3 shipped as React Router v7), and React Router v8 is the
// current version, so the v6-and-its-changes question states v6's real
// historical changes but names the current EOL status directly rather than
// treating v6 as if it were still current.
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
    isPremium: true,
    companies: ["Meta", "Airbnb"],
    isFf75: true,
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
    isPremium: true,
    companies: ["Meta", "Stripe"],
    isFf75: true,
    orderIndex: 9,
  },
  {
    collection: "ff-react",
    slug: "what-is-react-and-virtual-dom",
    question: "What is React and how does the Virtual DOM work?",
    answer: `React is a JavaScript library for building user interfaces out of reusable components; the Virtual DOM is React's in-memory representation of the UI — a plain JavaScript object tree — that React diffs against the previous version on every update, computing the smallest possible set of real DOM changes instead of touching the DOM directly on every render.

\`\`\`jsx
function Counter({ count }) {
  return (
    <div>
      <h1>Hello</h1>
      <p>Count: {count}</p>
    </div>
  );
}
\`\`\`

### Why not update the real DOM directly?

Real DOM operations — creating or removing actual browser nodes, triggering layout and paint — are comparatively expensive. The Virtual DOM lets React figure out, in cheap plain JavaScript, exactly what needs to change before touching the real DOM at all, batching and minimizing those expensive operations.

### Diagram

Comparing the previous render's tree to the new one: unchanged nodes (like \`<div>\` and \`<h1>\`) pass through untouched, while the one node that actually changed (\`<p>\`'s text) produces a small, targeted patch — that patch is the only thing applied to the real DOM.

### Classic interview gotcha

The Virtual DOM isn't inherently "faster than the DOM" in some absolute sense — plain, hand-written DOM manipulation targeting exactly the right node can always outperform React's diffing overhead for a single, simple update. The real value of the Virtual DOM is developer ergonomics at scale: it lets you write declarative "here's what the UI should look like" code without manually tracking which specific DOM nodes need updating, while still avoiding the worst case of rebuilding the entire DOM tree on every change. A common interview follow-up is being asked to state this tradeoff precisely rather than reciting "Virtual DOM is faster."

**Related:** [JSX & the Virtual DOM](/learn/react/jsx-virtual-dom) (Learn concept) · [What is reconciliation in React?](/interview-prep/ff-react/what-is-reconciliation-in-react)`,
    difficulty: "easy",
    isPremium: true,
    companies: ["Meta", "Google"],
    isFf75: true,
    orderIndex: 1,
  },
  {
    collection: "ff-react",
    slug: "functional-vs-class-components",
    question: "What are the differences between functional and class components?",
    answer: `Functional components are plain JavaScript functions that use Hooks for state and lifecycle behavior; class components extend \`React.Component\` and manage state via \`this.state\`/\`this.setState\` and lifecycle methods. Functional components with Hooks are the standard, recommended way to write React today, with class components reserved almost entirely for Error Boundaries — still the one thing Hooks can't do.

\`\`\`jsx
class CounterClass extends React.Component {
  state = { count: 0 };
  componentDidMount() {
    console.log("mounted");
  }
  render() {
    return (
      <button onClick={() => this.setState({ count: this.state.count + 1 })}>
        {this.state.count}
      </button>
    );
  }
}

function CounterFunction() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log("mounted");
  }, []);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
\`\`\`

| | Class components | Functional components |
|---|---|---|
| State | \`this.state\` / \`this.setState\` | \`useState\` / \`useReducer\` |
| Lifecycle | Named methods (\`componentDidMount\`, ...) | \`useEffect\`/\`useLayoutEffect\` |
| \`this\` binding needed? | Yes — a common source of bugs | No |
| Can be an Error Boundary? | Yes | No — still requires a class |

### Classic interview gotcha

Error Boundaries are the one capability that still requires a class component — there's no official, stable hook equivalent as of React's current stable line (19.2), since the reconciler invokes \`componentDidCatch\`/\`getDerivedStateFromError\` at very specific points in the error-recovery path that Hooks don't have an entry point for. This is why almost every modern, Hooks-only codebase still keeps exactly one class component around, wrapped near the top of the app (see the Error Boundaries question).

**Related:** [What are Error Boundaries in React?](/interview-prep/ff-react/error-boundaries-in-react) · [Explain the React component lifecycle.](/interview-prep/ff-react/react-component-lifecycle-explained)`,
    difficulty: "medium",
    companies: ["Amazon", "Meta"],
    orderIndex: 2,
  },
  {
    collection: "ff-react",
    slug: "what-is-jsx-and-how-it-compiles",
    question: "What is JSX and how does it compile?",
    answer: `JSX is an HTML-like syntax extension for JavaScript that lets you describe UI declaratively inside component code. Browsers don't understand it directly — a compiler (Babel, or the toolchain built into most React setups) transforms it into plain function calls before the code ever runs.

\`\`\`jsx
// What you write
const element = <h1 className="title">Hello, {name}</h1>;

// What it compiles to (the modern "automatic" JSX runtime, default since React 17)
import { jsx as _jsx } from "react/jsx-runtime";
const element = _jsx("h1", { className: "title", children: \`Hello, \${name}\` });
\`\`\`

### Classic interview gotcha

The "automatic" JSX runtime (default since React 17) is why modern React files no longer need \`import React from "react"\` just to use JSX. Older code compiled JSX directly to \`React.createElement(...)\` calls, which genuinely required \`React\` to be in scope even if you never wrote \`React.\` anywhere yourself; the newer \`jsx()\` import from \`react/jsx-runtime\` is inserted automatically by the compiler instead. This "classic" vs. "automatic" JSX transform distinction is worth knowing when debugging a confusing "React is not defined" error in an unfamiliar or older codebase — it usually means the build tooling is still using the classic transform.

**Related:** [What is React and how does the Virtual DOM work?](/interview-prep/ff-react/what-is-react-and-virtual-dom) · [JSX & the Virtual DOM](/learn/react/jsx-virtual-dom) (Learn concept)`,
    difficulty: "easy",
    isPremium: true,
    companies: ["Google", "Adobe"],
    isFf75: true,
    orderIndex: 3,
  },
  {
    collection: "ff-react",
    slug: "usestate-hook-explained",
    question: "Explain useState hook with examples.",
    answer: `\`useState(initialValue)\` adds a piece of local state to a function component, returning a \`[value, setValue]\` pair — calling the setter schedules a re-render with the new value, and React preserves that state across re-renders (though not across unmounts) for as long as the component stays mounted at the same position in the tree.

\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// Lazy initial state — the function only runs once, on the first render
const [state, setState] = useState(() => expensiveComputation());

// Functional updates — safe when the next value depends on the previous one
setCount((prev) => prev + 1);
\`\`\`

### Classic interview gotcha

Calling the setter with a plain new value (\`setCount(count + 1)\`) inside a handler that fires multiple times within the same event — or inside a loop — uses the *same* stale \`count\` for every call, since \`count\` was captured once when that render happened:

\`\`\`jsx
function handleClick() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
  // net effect: +1, not +3 — all three reads see the same stale "count"
}
\`\`\`

The functional-update form (\`setCount(prev => prev + 1)\`) fixes this by always operating on the latest pending state rather than the value captured at render time — a very common real bug in code that calls a state setter more than once before the next render happens.

**Related:** [What is useReducer and when to prefer it over useState?](/interview-prep/ff-react/usereducer-vs-usestate) · [useState & useEffect Fundamentals](/learn/react/usestate-useeffect-fundamentals) (Learn concept)`,
    difficulty: "easy",
    isPremium: true,
    companies: ["Meta", "Netflix"],
    isFf75: true,
    orderIndex: 4,
  },
  {
    collection: "ff-react",
    slug: "useeffect-hook-and-dependency-array",
    question: "Explain useEffect hook and its dependency array.",
    answer: `\`useEffect(fn, deps)\` runs \`fn\` after React commits a render to the DOM, synchronizing the component with something outside React — a subscription, a timer, a fetch. The dependency array controls when it re-runs: omitted, it runs after every render; \`[]\`, only after the first; a list of values, whenever any of those values actually changed since the last render.

\`\`\`jsx
useEffect(() => {
  const id = setInterval(() => setCount((c) => c + 1), 1000);
  return () => clearInterval(id); // cleanup — runs before the next effect, and on unmount
}, []); // empty array — runs once, on mount only

useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]); // re-runs whenever "count" changes
\`\`\`

### Classic interview gotcha

The dependency array must include *every* reactive value the effect actually reads — the "exhaustive deps" rule, enforced by an ESLint rule (see the dedicated question). Leaving one out doesn't throw an error; it silently makes the effect close over a *stale* version of that value, reading whatever it was on the render the effect was last created from, not the current one.

React 19.2 added \`useEffectEvent\` specifically for the common case where an effect needs to *read* a value without wanting that value's changes to *re-trigger* the effect — cleanly splitting "always up to date, but doesn't cause a re-run" logic out from the reactive part, instead of the older workaround of stuffing the value into a ref just to read its latest version inside the effect:

\`\`\`jsx
const onMessage = useEffectEvent((message) => {
  showNotification(theme, message); // always reads the latest "theme" — never stale
});

useEffect(() => {
  connection.on("message", onMessage); // "theme" isn't a dependency — reading it here doesn't reconnect on theme change
  return () => connection.off("message", onMessage);
}, [roomId]); // only reconnects when roomId actually changes
\`\`\`

**Related:** [What is useRef and when would you use it?](/interview-prep/ff-react/what-is-useref-and-when-to-use-it) · [useState & useEffect Fundamentals](/learn/react/usestate-useeffect-fundamentals) (Learn concept)

**Sources checked:** react.dev/reference/react/useEffect, react.dev/blog/2025/10/01/react-19-2 (useEffectEvent)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Google", "Airbnb"],
    isFf75: true,
    orderIndex: 5,
  },
  {
    collection: "ff-react",
    slug: "what-is-useref-and-when-to-use-it",
    question: "What is useRef and when would you use it?",
    answer: `\`useRef(initialValue)\` returns a mutable \`{ current: value }\` object that persists across renders without ever causing a re-render when it changes — used both for holding a reference to a DOM node (\`<div ref={myRef} />\`) and for storing any mutable value a component needs to remember between renders that shouldn't trigger a re-render when it changes.

\`\`\`jsx
function TextInput() {
  const inputRef = useRef(null);
  const focusInput = () => inputRef.current.focus(); // direct DOM access
  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>Focus</button>
    </>
  );
}

function Timer() {
  const intervalRef = useRef(null); // storing a mutable value, not a DOM node
  useEffect(() => {
    intervalRef.current = setInterval(() => console.log("tick"), 1000);
    return () => clearInterval(intervalRef.current);
  }, []);
}
\`\`\`

### Classic interview gotcha

Mutating \`ref.current\` does **not** trigger a re-render, and reading it during render itself is unreliable — \`useRef\` is explicitly for values a component needs to remember but that shouldn't affect what's rendered on screen. A common mistake is storing something in a ref and expecting the UI to update when it changes — it won't, until something else (an unrelated state update) happens to cause a re-render, at which point the ref's *current* value happens to show up correctly, masking the bug until it doesn't.

**Related:** [What is the difference between useState and useRef for storing values?](/interview-prep/ff-react/usestate-vs-useref-for-values) · [useRef & Imperative Handles](/learn/react/useref-imperative-handles) (Learn concept)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Amazon", "Uber"],
    isFf75: true,
    orderIndex: 6,
  },
  {
    collection: "ff-react",
    slug: "usecontext-and-prop-drilling",
    question: "What is useContext and how does it solve prop drilling?",
    answer: `\`useContext(SomeContext)\` lets a component read a value from the nearest matching \`<SomeContext.Provider>\` above it in the tree directly, without that value being passed down explicitly through every intermediate component's props — solving "prop drilling," where a value has to be threaded through several layers of components that don't actually use it themselves, just to reach a deeply nested consumer.

\`\`\`jsx
const ThemeContext = createContext("light");

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar /> {/* doesn't need theme, but used to have to pass it through */}
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  return <ThemedButton />; // no "theme" prop needed anywhere in between
}

function ThemedButton() {
  const theme = useContext(ThemeContext); // reads directly from the nearest Provider
  return <button className={theme}>Click</button>;
}
\`\`\`

### Classic interview gotcha

Every component consuming a context re-renders whenever the Provider's value changes — even if that component only cares about one field of a larger context object, and even if the rest of the object is unchanged. Putting a large, frequently-changing object (or several unrelated pieces of state) into a single context is a very common real performance issue, since every consumer re-renders on every unrelated change — exactly why splitting state into multiple, narrowly-scoped contexts (or reaching for a dedicated state-management library) is standard advice once a context grows past a couple of tightly-related values.

**Related:** [What is the Context API and its limitations?](/interview-prep/ff-react/context-api-and-its-limitations) · [Context API & Prop Drilling](/learn/react/context-api-prop-drilling) (Learn concept)`,
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 7,
  },
  {
    collection: "ff-react",
    slug: "usereducer-vs-usestate",
    question: "What is useReducer and when to prefer it over useState?",
    answer: `\`useReducer(reducer, initialState)\` manages state via a \`(state, action) => newState\` reducer function and a \`dispatch(action)\` call, instead of a direct setter — it's the better fit once a component's state updates involve several related sub-values, or the *next* state genuinely depends on the *type* of update being performed, not just a single new value.

\`\`\`jsx
function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "reset":
      return { count: 0 };
    default:
      throw new Error(\`Unknown action: \${action.type}\`);
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return (
    <>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
      {state.count}
    </>
  );
}
\`\`\`

### Classic interview gotcha

\`useReducer\` doesn't inherently prevent unnecessary re-renders any more than \`useState\` does — dispatching an action that produces a state object that's \`Object.is\`-equal to the previous one bails out of re-rendering (React does this identically for both hooks), but a reducer that always returns a brand-new object reference, even when nothing meaningfully changed, re-renders exactly as often as the equivalent \`useState\` calls would. Reaching for \`useReducer\` is about organizing *update logic* clearly — especially once several related fields update together, or the logic is complex enough to want to unit-test in isolation — it isn't, by itself, a performance optimization.

**Related:** [Explain useState hook with examples.](/interview-prep/ff-react/usestate-hook-explained) · [State Management Tradeoffs](/learn/react/state-management-tradeoffs) (Learn concept)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Google", "Bloomberg"],
    isFf75: true,
    orderIndex: 8,
  },
  {
    collection: "ff-react",
    slug: "usecallback-and-re-renders",
    question: "What is useCallback and how does it prevent re-renders?",
    answer: `\`useCallback(fn, deps)\` returns the *same* function reference across renders as long as \`deps\` haven't changed, instead of a brand-new function identity every render — useful specifically for passing a stable callback to a memoized child (\`React.memo\`) or into another hook's dependency array, since a new function reference every render would otherwise defeat that memoization or re-trigger that effect.

\`\`\`jsx
function ParentWithoutCallback({ items }) {
  const handleClick = (id) => console.log(id); // a brand-new function every render
  return items.map((item) => <MemoizedItem key={item.id} onClick={handleClick} />); // memo defeated
}

function ParentWithCallback({ items }) {
  const handleClick = useCallback((id) => console.log(id), []); // same reference every render
  return items.map((item) => <MemoizedItem key={item.id} onClick={handleClick} />); // memo actually works
}
\`\`\`

### Classic interview gotcha

\`useCallback\` on its own doesn't skip any work or prevent a re-render by itself — it only prevents a function's *identity* from changing unnecessarily. Its entire value comes from pairing it with something that checks referential equality (\`React.memo\` on the child, or an effect's dependency array); with no such consumer downstream, wrapping a callback in \`useCallback\` does nothing except add a small amount of bookkeeping overhead. As of the React Compiler (stable since v1.0, October 2025), this exact pairing is one of the most common things the compiler now handles automatically, which is why manual \`useCallback\` has become a targeted escape hatch rather than routine practice — the same shift already covered in the \`useMemo\` question.

**Related:** [What is \`useMemo\` and when should you use it?](/interview-prep/ff-react/usememo-when-to-use) · [What is React.memo and how does it work?](/interview-prep/ff-react/react-memo-explained) · [Render Performance: memo, useMemo, useCallback](/learn/react/render-performance-memoization) (Learn concept)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Meta", "Stripe"],
    isFf75: true,
    orderIndex: 10,
  },
  {
    collection: "ff-react",
    slug: "uselayouteffect-vs-useeffect",
    question: "What is useLayoutEffect vs useEffect?",
    answer: `Both run after React commits changes to the DOM, but at different points relative to the browser's paint: \`useLayoutEffect\` runs synchronously, before the browser paints anything — blocking the paint until it finishes — while \`useEffect\` runs asynchronously, after the paint has already happened, off the critical path to what the user sees.

\`\`\`jsx
function Tooltip() {
  const [height, setHeight] = useState(0);
  const ref = useRef(null);

  useLayoutEffect(() => {
    const measured = ref.current.getBoundingClientRect().height;
    setHeight(measured); // measure and adjust BEFORE the user ever sees a flash of the wrong size
  }, []);

  return <div ref={ref} style={{ marginTop: -height }}>Tooltip content</div>;
}
\`\`\`

### Diagram

After render and commit, \`useLayoutEffect\` runs synchronously and blocks the browser from painting until it finishes; only once it's done does the browser paint the update on screen, and \`useEffect\` runs afterward, asynchronously, off that critical path.

### Classic interview gotcha

Reaching for \`useLayoutEffect\` when \`useEffect\` would do is a genuinely common performance mistake — since \`useLayoutEffect\` blocks the browser from painting until it finishes, any expensive work inside it (a slow computation, a large DOM measurement loop) directly delays the user seeing *anything* update, whereas the same work in \`useEffect\` would run without blocking the paint at all. \`useLayoutEffect\` should be reserved specifically for cases where the user would otherwise see a visible flash of incorrect layout — measuring a DOM node and synchronously adjusting styles before paint, like the tooltip-positioning example above — not used as a default "just in case" replacement for \`useEffect\`.

**Related:** [Explain useEffect hook and its dependency array.](/interview-prep/ff-react/useeffect-hook-and-dependency-array) · [What is React and how does the Virtual DOM work?](/interview-prep/ff-react/what-is-react-and-virtual-dom)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Google", "Netflix"],
    isFf75: true,
    orderIndex: 11,
  },
  {
    collection: "ff-react",
    slug: "custom-hooks-usedebounce-example",
    question: "What are custom hooks? Create a useDebounce hook.",
    answer: `A custom hook is just a regular JavaScript function, conventionally named starting with \`use\`, that calls other hooks internally to package up reusable stateful logic — extracting a pattern used in multiple components into one function any component can call, the same way extracting a regular function avoids duplicating plain logic.

\`\`\`jsx
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer); // cancel the pending update if "value" changes again first
  }, [value, delay]);

  return debouncedValue;
}

function SearchInput() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) fetchResults(debouncedQuery); // only fires 300ms after typing stops
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
\`\`\`

### Classic interview gotcha

A custom hook doesn't share *state* between the components that call it — each call to \`useDebounce\` gets its own completely independent \`debouncedValue\`/\`setDebouncedValue\` pair, the same way calling a regular function twice doesn't share local variables between the two calls. This surprises people who expect a custom hook to work like some kind of shared, global store — it's purely a way to reuse *logic*, not a mechanism for sharing state across components (that's what \`useContext\` or a dedicated state library is for).

**Related:** [What is useContext and how does it solve prop drilling?](/interview-prep/ff-react/usecontext-and-prop-drilling) · [Explain debouncing and throttling with examples.](/interview-prep/ff-javascript/debouncing-and-throttling) · [Custom Hooks & Composition](/learn/react/custom-hooks-composition) (Learn concept)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Airbnb", "Uber"],
    isFf75: true,
    orderIndex: 12,
  },
  {
    collection: "ff-react",
    slug: "react-memo-explained",
    question: "What is React.memo and how does it work?",
    answer: `\`React.memo(Component)\` wraps a component so it skips re-rendering when its props are shallowly equal to the previous render's props — a component-level analog to \`useMemo\`/\`useCallback\`, useful for a child that renders the same output given the same props but would otherwise re-render every time its parent does.

\`\`\`jsx
const ExpensiveRow = React.memo(function ExpensiveRow({ item }) {
  console.log("rendering", item.id); // only logs when "item" actually changes
  return <li>{item.name}</li>;
});
\`\`\`

### Classic interview gotcha

\`React.memo\`'s shallow prop comparison only helps if the props passed in are themselves referentially stable between renders — passing an inline object, array, or function literal as a prop (\`<ExpensiveRow config={{ sort: "asc" }} />\`) creates a brand-new reference on every parent render, so the shallow comparison always finds a "different" prop and re-renders anyway, completely defeating the memoization. This is exactly why \`React.memo\` is so often paired with \`useMemo\`/\`useCallback\` on the parent's side (to keep the props themselves stable) — as of the React Compiler, this pairing is one of the cases the compiler now handles automatically in most components.

**Related:** [What is useCallback and how does it prevent re-renders?](/interview-prep/ff-react/usecallback-and-re-renders) · [What causes unnecessary re-renders in React?](/interview-prep/ff-react/what-causes-unnecessary-re-renders) · [Render Performance: memo, useMemo, useCallback](/learn/react/render-performance-memoization) (Learn concept)`,
    difficulty: "medium",
    companies: ["Meta", "Adobe"],
    orderIndex: 13,
  },
  {
    collection: "ff-react",
    slug: "keys-in-react-explained",
    question: "What are keys in React and why are they important?",
    answer: `A \`key\` gives React a stable identity for each item in a list, letting it match up items between renders correctly — without keys (or with unstable ones, like an array index for a reorderable list), React can't reliably tell which rendered element corresponds to which piece of data, and ends up reusing or re-creating the wrong DOM nodes.

\`\`\`jsx
{items.map((item) => (
  <li key={item.id}>{item.name}</li> // a stable, unique id — survives reordering correctly
))}

{items.map((item, index) => (
  <li key={index}>{item.name}</li> // index as key — breaks if the list ever reorders
))}
\`\`\`

### Classic interview gotcha

Using the array index as a key is a very common real bug — it works fine for a list that's only ever appended to, but breaks silently the moment items can be reordered, inserted in the middle, or removed. React matches elements by key first, so if item positions shift, index-based keys make React think the *content* at each position changed rather than the *order* — which can attach form input state, focus, or animation state to the wrong row entirely, with no error thrown, just visibly wrong behavior that's easy to miss until users report it.

**Related:** [What is reconciliation in React?](/interview-prep/ff-react/what-is-reconciliation-in-react) · [Explain the difference between \`Array.map\`, \`Array.filter\`, and \`Array.reduce\`.](/interview-prep/ff-javascript/array-map-filter-reduce-differences)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Amazon", "Bloomberg"],
    isFf75: true,
    orderIndex: 14,
  },
  {
    collection: "ff-react",
    slug: "what-is-reconciliation-in-react",
    question: "What is reconciliation in React?",
    answer: `Reconciliation is the algorithm React uses to figure out what changed between two Virtual DOM trees and compute the minimal set of real DOM updates needed. Instead of a fully general (and prohibitively expensive) tree-diffing algorithm, React uses a heuristic, O(n) approach based on two rules: elements of a different type produce an entirely new subtree, and list items are matched by \`key\` rather than by position.

\`\`\`jsx
// Same element type — React reuses the existing DOM node, just updates its props
<div className="before" />
<div className="after" />

// Different element type — React tears down the whole old subtree and builds a new one
<div><Counter /></div>
<span><Counter /></span> // Counter's entire state is lost — a new instance is mounted
\`\`\`

### Diagram

The same node-by-node comparison already walked through in the Virtual DOM question: unchanged nodes are left alone, and only the nodes that actually differ produce a patch — reconciliation is the general name for that whole algorithm, keys included.

### Classic interview gotcha

Changing a component's *type* at the same position in the tree — even swapping \`<div>\` for \`<span>\`, or one component for a different one — throws away the *entire* subtree's state, including any Hooks' state and any child components' mounted instances, rather than trying to patch it. This is a real, common source of "why did my component's state reset for no reason" bugs — usually from conditionally rendering two different component types (or wrapper elements) at what looks like "the same place" in the JSX, when React actually sees it as two completely different types occupying that position across renders.

**Related:** [What is React and how does the Virtual DOM work?](/interview-prep/ff-react/what-is-react-and-virtual-dom) · [What are keys in React and why are they important?](/interview-prep/ff-react/keys-in-react-explained) · [React Rendering & Reconciliation](/learn/react/react-rendering) (Learn concept)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Google", "Meta"],
    isFf75: true,
    orderIndex: 15,
  },
  {
    collection: "ff-react",
    slug: "react-component-lifecycle-explained",
    question: "Explain the React component lifecycle.",
    answer: `Every component goes through three broad phases — mounting (created and inserted into the DOM for the first time), updating (re-rendered in response to new props, state, or context), and unmounting (removed from the DOM). Class components expose this via named lifecycle methods, while function components achieve the same timing purely through \`useEffect\`/\`useLayoutEffect\` and their cleanup functions.

| Phase | Class method | Hook equivalent |
|---|---|---|
| Mount | \`constructor\` / \`componentDidMount\` | \`useState\` initializer / \`useEffect(fn, [])\` |
| Update | \`componentDidUpdate\` | \`useEffect(fn, [deps])\` |
| Unmount | \`componentWillUnmount\` | the function returned from \`useEffect\` |
| Catch an error | \`componentDidCatch\` / \`getDerivedStateFromError\` | no hook equivalent — still class-only |

\`\`\`jsx
class Example extends React.Component {
  componentDidMount() {
    console.log("mounted");
  }
  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) console.log("id changed");
  }
  componentWillUnmount() {
    console.log("unmounting");
  }
}

function ExampleFn({ id }) {
  useEffect(() => {
    console.log("mounted");
    return () => console.log("unmounting");
  }, []);

  useEffect(() => {
    console.log("id changed");
  }, [id]);
}
\`\`\`

### Classic interview gotcha

A single \`useEffect\` with no dependency array actually combines *mount and every update* into one hook, which has no clean one-to-one class equivalent — \`componentDidMount\` and \`componentDidUpdate\` are two separate methods in a class, but the same effect body covers both in a function component. This is exactly why thinking in terms of "synchronize with X whenever these values change" (the Hooks mental model) rather than "map each class lifecycle method to a hook" (a common first instinct) avoids a lot of confusion.

**Related:** [What are the differences between functional and class components?](/interview-prep/ff-react/functional-vs-class-components) · [What are Error Boundaries in React?](/interview-prep/ff-react/error-boundaries-in-react)`,
    difficulty: "medium",
    companies: ["Microsoft", "Shopify"],
    orderIndex: 16,
  },
  {
    collection: "ff-react",
    slug: "error-boundaries-in-react",
    question: "What are Error Boundaries in React?",
    answer: `An Error Boundary is a component that catches JavaScript errors thrown anywhere in its child tree during rendering, in lifecycle methods, or in constructors, logs them, and renders a fallback UI instead of the whole app crashing to a blank screen — implemented via the class-only \`static getDerivedStateFromError()\` and \`componentDidCatch()\` lifecycle methods, since there's still no stable hook equivalent as of React 19.2.

\`\`\`jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true }; // render the fallback on the next render
  }

  componentDidCatch(error, info) {
    logErrorToService(error, info); // side effects (logging) happen here, not in getDerivedStateFromError
  }

  render() {
    if (this.state.hasError) return <FallbackUI />;
    return this.props.children;
  }
}

<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>
\`\`\`

### Classic interview gotcha

Error Boundaries do **not** catch errors in event handlers, asynchronous code (\`setTimeout\`, a Promise rejection), server-side rendering, or errors thrown in the boundary itself — they only catch errors thrown *during rendering* in the tree beneath them. An error thrown inside an \`onClick\` handler, for instance, doesn't trigger the nearest Error Boundary at all; it has to be handled with an ordinary \`try/catch\` right at the source — a genuinely common point of confusion for anyone expecting an Error Boundary to behave like a universal catch-all for anything that goes wrong in its subtree.

**Related:** [What are the differences between functional and class components?](/interview-prep/ff-react/functional-vs-class-components) · [Error Boundaries](/learn/react/error-boundaries) (Learn concept)

**Sources checked:** react.dev/reference/react/Component (error boundaries), react.dev/reference/eslint-plugin-react-hooks/lints/error-boundaries`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Google", "Netflix"],
    isFf75: true,
    orderIndex: 17,
  },
  {
    collection: "ff-react",
    slug: "code-splitting-and-react-lazy",
    question: "What is code splitting and React.lazy?",
    answer: `Code splitting breaks a JavaScript bundle into smaller chunks that load on demand instead of all up front, so users only download the code a given page or feature actually needs; \`React.lazy(() => import("./Component"))\` is React's built-in way to lazily load a component's code, paired with a \`<Suspense>\` boundary to show a fallback while that chunk is still downloading.

\`\`\`jsx
const HeavyChart = React.lazy(() => import("./HeavyChart"));

function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  );
}
\`\`\`

### Classic interview gotcha

\`React.lazy\` only supports **default exports** — it expects the dynamically imported module to have a \`default\` export. A component exported only as a named export needs an extra step (wrapping the import: \`.then((module) => ({ default: module.Named }))\`) since \`React.lazy\` doesn't accept named exports directly. This is a common "why isn't my lazy component working" issue for anyone converting an existing named-export component to lazy-loaded without adjusting the export.

**Related:** [What is Suspense in React?](/interview-prep/ff-react/what-is-suspense-in-react) · [Explain the concept of lazy loading.](/interview-prep/ff-javascript/lazy-loading-explained) · [Bundle Size & Code Splitting](/learn/performance/bundle-size-code-splitting) (Learn concept)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Amazon", "Vercel"],
    isFf75: true,
    orderIndex: 18,
  },
  {
    collection: "ff-react",
    slug: "what-is-suspense-in-react",
    question: "What is Suspense in React?",
    answer: `\`<Suspense fallback={...}>\` lets a component tree "wait" for something asynchronous — a lazily-loaded component's code, or (with a data-fetching library or framework that supports it) data still being fetched — showing the fallback UI in the meantime and swapping in the real content the instant it's ready, without the component itself needing to manage a loading boolean by hand.

\`\`\`jsx
<Suspense fallback={<Spinner />}>
  <ProfilePage /> {/* can suspend for its own lazy-loaded code, or for data it reads via "use" */}
</Suspense>
\`\`\`

### Classic interview gotcha

Suspense doesn't automatically make \`fetch()\` calls "suspend" — a component only suspends if whatever it's doing throws a Promise in a way React specifically understands (\`React.lazy\`'s dynamic import, reading a Promise via the \`use\` hook, or a framework/library built with Suspense support, like a Server Component's data fetching in Next.js). A plain \`useEffect\` + \`useState\`-based fetch — the pattern most existing code already uses — does **not** integrate with Suspense at all; it manages its own loading state manually and never triggers a Suspense fallback, which is a common misconception for anyone assuming wrapping existing fetch-in-effect code in \`<Suspense>\` will do something.

**Related:** [What is code splitting and React.lazy?](/interview-prep/ff-react/code-splitting-and-react-lazy) · [Concurrent React & Suspense](/learn/react/concurrent-react-suspense) (Learn concept)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Meta", "Vercel"],
    isFf75: true,
    orderIndex: 19,
  },
  {
    collection: "ff-react",
    slug: "context-api-and-its-limitations",
    question: "What is the Context API and its limitations?",
    answer: `The Context API (\`createContext\`, \`<Provider>\`, \`useContext\`) lets React share a value across a whole subtree without threading it through props manually — but it's a broadcast mechanism, not a full state-management solution: every consumer re-renders on any value change, there's no built-in way to select just part of the value, and it has no concept of derived state, middleware, or time-travel debugging the way a dedicated store does.

| | Context API | Dedicated store (Redux, Zustand) |
|---|---|---|
| Selective subscriptions (only re-render on the slice you use) | No | Yes |
| DevTools / time-travel debugging | No | Yes (with the right library) |
| Middleware (logging, persistence) | No, build it yourself | Yes, built in |
| Setup cost for a rarely-changing value | Minimal | Adds a dependency |

### Classic interview gotcha

Context is often reached for as a general-purpose global-state solution, but its all-or-nothing re-render behavior — every consumer re-renders on any change to the Provider's value, with no built-in selector mechanism — makes it a poor fit for frequently-changing, broadly-consumed state, exactly the case where a library like Zustand or Redux (which support subscribing to just a slice of state) genuinely outperforms it. Context is the right tool for rarely-changing, broadly-needed values (theme, authenticated user, locale) — not a wholesale replacement for a real state-management library once updates get frequent and consumers get numerous.

**Related:** [What is useContext and how does it solve prop drilling?](/interview-prep/ff-react/usecontext-and-prop-drilling) · [State Management Tradeoffs](/learn/react/state-management-tradeoffs) (Learn concept)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Meta", "Airbnb"],
    isFf75: true,
    orderIndex: 20,
  },
  {
    collection: "ff-react",
    slug: "redux-explained-when-to-use",
    question: "What is Redux and when should you use it?",
    answer: `Redux is a predictable state container: all application state lives in a single store, the only way to change it is by dispatching a plain object \`action\`, and a pure \`reducer\` function computes the next state from the current state and that action — making every state change traceable, replayable, and testable in isolation. Reach for it when several unrelated parts of a large app need to read and update the same frequently-changing state; it's overkill for state that's local to one component or one small subtree.

\`\`\`js
// Redux Toolkit — the officially recommended way to write Redux logic today
import { createSlice, configureStore } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] },
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload); // looks like a mutation — Immer makes it safe under the hood
    },
  },
});

const store = configureStore({ reducer: { cart: cartSlice.reducer } });
store.dispatch(cartSlice.actions.addItem({ id: 1, name: "Widget" }));
\`\`\`

### Diagram

Dispatching an action from the view flows through the reducer, into the store, and back out to re-render the view — a strict one-way loop, never a direct mutation of the store from the view.

### Classic interview gotcha

Redux is often reached for by default as "the" state management solution, but plenty of real state doesn't need it: server data is usually better served by a dedicated caching library (TanStack Query, SWR — see their dedicated questions) that already handles caching/refetching/invalidation, and state used by only one component or a small local subtree is simpler as plain \`useState\`/\`useContext\`. Redux's real strengths — a single source of truth, DevTools time-travel debugging, and predictable, traceable updates — matter most once state is genuinely complex, frequently updated, and read by many unrelated parts of the app.

**Related:** [What is Redux Toolkit and how is it different from Redux?](/interview-prep/ff-react/redux-toolkit-vs-redux) · [What is Zustand and how does it compare to Redux?](/interview-prep/ff-react/zustand-vs-redux) · [State Management Tradeoffs](/learn/react/state-management-tradeoffs) (Learn concept)

**Sources checked:** redux.js.org/introduction/getting-started, redux-toolkit.js.org (Redux Toolkit as the recommended standard)`,
    difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 21,
  },
  {
    collection: "ff-react",
    slug: "handling-forms-in-react",
    question: "How do you handle forms in React?",
    answer: `Most React forms are built as controlled components: each field's value lives in state, an \`onChange\` handler updates it on every keystroke, and \`onSubmit\` reads the current state — giving live validation and full control over what the user can type. For large, performance-sensitive forms, libraries like React Hook Form flip this around, keeping inputs uncontrolled (via refs) and only pulling values into React state on submit or validation.

\`\`\`jsx
function SignupForm() {
  const [values, setValues] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value })); // one handler, computed property name
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(values); }}>
      <input name="email" value={values.email} onChange={handleChange} />
      <input name="password" type="password" value={values.password} onChange={handleChange} />
    </form>
  );
}
\`\`\`

### Classic interview gotcha

A single controlled form re-renders the whole form component on every keystroke in every field, since they all share one state object — usually fine, but a real, measurable cost once a form has dozens of fields or the form component's render is otherwise expensive. This is exactly why React Hook Form's uncontrolled-by-default approach (fields register themselves via refs, and most re-renders are skipped entirely) is the standard choice for large production forms today, not just a stylistic preference.

**Related:** [What is the difference between controlled and uncontrolled components?](/interview-prep/ff-react/controlled-vs-uncontrolled-components) · [What is the difference between state and props?](/interview-prep/ff-react/state-vs-props) · [Forms: Controlled vs. Uncontrolled](/learn/react/controlled-vs-uncontrolled-forms) (Learn concept)`,
    difficulty: "medium",
    companies: ["Shopify", "Stripe"],
    orderIndex: 23,
  },
  {
    collection: "ff-react",
    slug: "react-forwardref-explained",
    question: "What is React.forwardRef?",
    answer: `\`React.forwardRef\` wraps a function component so it can receive a \`ref\` forwarded from its parent and attach it to one of its own children (typically a DOM node) — normally, function components can't receive a \`ref\` prop at all, since React reserves it. **As of React 19, \`forwardRef\` is on a deprecation path**: function components can now receive \`ref\` as a plain, ordinary prop, making the wrapper unnecessary for new code (it still works, unchanged, for backward compatibility).

\`\`\`jsx
// Pre-React-19: forwardRef required
const TextInput = React.forwardRef((props, ref) => (
  <input ref={ref} {...props} />
));

// React 19+: ref is just a prop, no wrapper needed
function TextInput({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
\`\`\`

### Classic interview gotcha

\`forwardRef\` isn't removed or broken in React 19 — it still works exactly as before, and plenty of production code (and every library supporting React 18) still uses it. The precise answer is "deprecated, not removed": the React team plans a codemod and an eventual removal, but existing \`forwardRef\`-wrapped components keep working unchanged. Assuming it's already gone, or conversely assuming it's still the recommended pattern for new React-19-only code, are both common mistakes worth avoiding.

**Related:** [What is useImperativeHandle?](/interview-prep/ff-react/useimperativehandle-explained) · [What is useRef and when would you use it?](/interview-prep/ff-react/what-is-useref-and-when-to-use-it) · [useRef & Imperative Handles](/learn/react/useref-imperative-handles) (Learn concept)

**Sources checked:** react.dev/reference/react/forwardRef, react.dev/blog/2024/04/25/react-19-upgrade-guide`,
    difficulty: "hard",
    companies: ["Meta", "Netflix"],
    orderIndex: 24,
  },
  {
    collection: "ff-react",
    slug: "useimperativehandle-explained",
    question: "What is useImperativeHandle?",
    answer: `\`useImperativeHandle(ref, createHandle)\` customizes exactly what a parent sees when it holds a \`ref\` to a child, letting the child expose a small, curated imperative API (like \`focus()\` or \`scrollIntoView()\`) instead of the raw DOM node itself — used alongside \`ref\` forwarding, restricting what the parent can actually do to that child.

\`\`\`jsx
function FancyInput({ ref, ...props }) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = ""; },
    // the raw DOM node itself is NOT exposed — only these two methods are
  }));

  return <input ref={inputRef} {...props} />;
}
\`\`\`

### Classic interview gotcha

Reaching for \`useImperativeHandle\` to let components "call methods on each other" is a common anti-pattern — it works against React's declarative, data-down model, and almost always indicates state or a callback prop should be lifted up instead. Legitimate uses stay narrow: focus management, media playback controls (\`play()\`/\`pause()\`), or triggering a specific animation — genuine escape hatches where the imperative API is the natural interface (matching how the underlying browser API itself works), not a general communication channel between sibling or parent/child components.

**Related:** [What is React.forwardRef?](/interview-prep/ff-react/react-forwardref-explained) · [What is useRef and when would you use it?](/interview-prep/ff-react/what-is-useref-and-when-to-use-it) · [useRef & Imperative Handles](/learn/react/useref-imperative-handles) (Learn concept)`,
    difficulty: "hard",
    companies: ["Google", "Airbnb"],
    orderIndex: 25,
  },
  {
    collection: "ff-react",
    slug: "proptypes-and-typescript-in-react",
    question: "Explain PropTypes and TypeScript in React.",
    answer: `\`PropTypes\` is a runtime library that validates a component's props during development, logging a console warning if they don't match the declared shape; TypeScript is a static type system that checks prop shapes at compile time, before the code ever runs. **As of React 19, \`propTypes\` (and \`defaultProps\` on function components) are silently ignored** — TypeScript is the standard way to type React props today.

\`\`\`tsx
// PropTypes — runtime-only, and ignored by React 19+ on function components
Greeting.propTypes = { name: PropTypes.string.isRequired };

// TypeScript — compile-time, works regardless of React version
interface GreetingProps {
  name: string;
}
function Greeting({ name }: GreetingProps) {
  return <p>Hello, {name}</p>;
}
\`\`\`

### Classic interview gotcha

Leaving \`propTypes\` in a React-19 function component doesn't produce a deprecation warning to alert you — the checks are simply **ignored**, silently, which can mislead a team into thinking prop validation is still active when it no longer runs at all. If runtime validation is genuinely still needed (e.g. validating props arriving from untyped JS, or from an external API at a real boundary), a schema library like Zod is the modern replacement for that specific need — TypeScript alone only checks at compile time and provides no runtime guarantee.

**Related:** [What is defaultProps and how to type defaults in TypeScript?](/interview-prep/ff-react/defaultprops-and-typescript-defaults) · [What is the difference between state and props?](/interview-prep/ff-react/state-vs-props)

**Sources checked:** react.dev/blog/2024/04/25/react-19-upgrade-guide (propTypes and defaultProps removed for function components)`,
    difficulty: "medium",
    companies: ["Microsoft", "Adobe"],
    orderIndex: 26,
  },
  {
    collection: "ff-react",
    slug: "higher-order-components-explained",
    question: "What are Higher Order Components (HOC)?",
    answer: `A Higher Order Component is a function that takes a component and returns a new component with extra behavior or props layered on — a pattern for reusing component logic that predates Hooks. \`react-redux\`'s \`connect()\` and the old \`withRouter\` are the classic real-world examples: both wrap a component to inject props it didn't declare itself.

\`\`\`jsx
function withLoading(Component) {
  return function WithLoading({ isLoading, ...props }) {
    if (isLoading) return <Spinner />;
    return <Component {...props} />;
  };
}

const UserProfileWithLoading = withLoading(UserProfile);
\`\`\`

### Classic interview gotcha

Stacking several HOCs produces "wrapper hell" — a component tree like \`WithLoading(WithAuth(WithRouter(UserProfile)))\` that's genuinely harder to read in React DevTools, plus real prop-naming collisions when two HOCs happen to inject a prop with the same name, silently overwriting one. Custom hooks solve the same reuse problem — sharing logic across components — without adding a wrapper layer to the tree or introducing naming collisions, which is exactly why they've replaced most HOC use cases in modern code.

**Related:** [What is the render props pattern?](/interview-prep/ff-react/render-props-pattern-explained) · [What are custom hooks? Create a useDebounce hook.](/interview-prep/ff-react/custom-hooks-usedebounce-example) · [Component Composition Patterns](/learn/react/component-composition-patterns) (Learn concept)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Meta", "Uber"],
    isFf75: true,
    orderIndex: 27,
  },
  {
    collection: "ff-react",
    slug: "render-props-pattern-explained",
    question: "What is the render props pattern?",
    answer: `A render prop is a prop whose value is a function that a component calls to determine what to render — the component owns some stateful logic and calls the render prop with the current values, while the caller decides exactly what UI those values produce. It's a way to share behavior without dictating the output, the same reuse goal as a Higher Order Component, just structured as a function-as-a-child instead of a wrapping component.

\`\`\`jsx
function MouseTracker({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  return (
    <div onMouseMove={(e) => setPosition({ x: e.clientX, y: e.clientY })}>
      {children(position)} {/* the caller decides what to render with this data */}
    </div>
  );
}

<MouseTracker>
  {({ x, y }) => <p>Mouse at {x}, {y}</p>}
</MouseTracker>
\`\`\`

### Classic interview gotcha

Render props sidestep HOCs' wrapper-hell and prop-naming collisions, but combining several of them nests JSX deeply — the visual equivalent of callback hell, just in markup instead of function calls. Custom hooks replaced most render-prop use cases specifically because extracting the same logic into a hook (\`const { x, y } = useMouseTracker()\`) avoids the nesting altogether — the logic-sharing goal is identical, but a hook call doesn't wrap or nest anything in the tree.

**Related:** [What are Higher Order Components (HOC)?](/interview-prep/ff-react/higher-order-components-explained) · [What is the Compound Component pattern?](/interview-prep/ff-react/compound-component-pattern-explained) · [Component Composition Patterns](/learn/react/component-composition-patterns) (Learn concept)`,
    difficulty: "hard",
    companies: ["Airbnb", "Bloomberg"],
    orderIndex: 28,
  },
  {
    collection: "ff-react",
    slug: "compound-component-pattern-explained",
    question: "What is the Compound Component pattern?",
    answer: `Compound components are a set of components designed to be composed together declaratively, sharing implicit state via context internally, so the consumer writes \`<Tabs><Tabs.Tab /><Tabs.Panel /></Tabs>\` instead of passing one large configuration object as props — the same relationship the native \`<select>\`/\`<option>\` elements have with each other.

\`\`\`jsx
function Tabs({ children, defaultIndex = 0 }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      {children}
    </TabsContext.Provider>
  );
}
Tabs.Tab = function Tab({ index, children }) {
  const { activeIndex, setActiveIndex } = useContext(TabsContext);
  return (
    <button onClick={() => setActiveIndex(index)} aria-selected={activeIndex === index}>
      {children}
    </button>
  );
};
\`\`\`

### Classic interview gotcha

Compound components rely on implicit context, not explicit props — so they silently break if a consumer renders a sub-component (\`Tabs.Tab\`) somewhere it isn't actually inside the parent's context provider, or wraps it in an intermediate component that changes its position relative to the provider. There's no compile error or obvious warning, just a component reading a missing or wrong context value — a real, common source of confusion with any pattern that leans on implicit tree position rather than props passed explicitly.

**Related:** [What is useContext and how does it solve prop drilling?](/interview-prep/ff-react/usecontext-and-prop-drilling) · [What is the render props pattern?](/interview-prep/ff-react/render-props-pattern-explained) · [Component Composition Patterns](/learn/react/component-composition-patterns) (Learn concept)`,
    difficulty: "hard",
    companies: ["Stripe", "Adobe"],
    orderIndex: 29,
  },
  {
    collection: "ff-react",
    slug: "state-vs-props",
    question: "What is the difference between state and props?",
    answer: `Props are read-only data a component receives from its parent — the component using them can't change them, only the parent that passed them down can. State is data a component owns and manages itself, via \`useState\`/\`useReducer\`; calling its setter **schedules** a re-render rather than updating anything immediately.

| | Props | State |
|---|---|---|
| Owned by | The parent | The component itself |
| Mutable by the component holding it? | No — read-only | Yes — via its own setter |
| Direction of flow | Passed down, one way | Local, unless lifted up |
| Triggers a re-render on change? | Yes, when the parent re-renders with new values | Scheduled, not immediate — and skipped entirely if the new value is the same as the old one |

### Classic interview gotcha

Mutating a prop directly (\`props.value = "new"\`) doesn't just fail silently to update the UI — it's a genuine violation of React's data flow, since a component must always treat its props as read-only. If a child needs to change something its parent passed down, the correct pattern is lifting the state up: the parent owns the state and passes both the value *and* a callback prop down, and the child calls that callback instead of mutating anything itself.

A second, separate gotcha: calling a setter doesn't re-render synchronously, and React **batches** multiple setter calls in the same event handler into a single re-render — plus, if the new value is \`Object.is\`-equal to the current value, React bails out of re-rendering that component entirely. Code that reads \`state\` immediately after calling its setter, expecting the updated value, is a common real bug that stems from assuming "immediately when set."

**Related:** [How do you share state between sibling components?](/interview-prep/ff-react/sharing-state-between-siblings) · [What is lifting state up in React?](/interview-prep/ff-react/lifting-state-up-in-react) · [What is the difference between controlled and uncontrolled components?](/interview-prep/ff-react/controlled-vs-uncontrolled-components)`,
    difficulty: "easy",
    isPremium: true,
    companies: ["Google", "Amazon"],
    isFf75: true,
    orderIndex: 30,
  },
  {
    collection: "ff-react",
    slug: "what-causes-unnecessary-re-renders",
    question: "What causes unnecessary re-renders in React?",
    answer: `A component re-renders whenever its own state changes, whenever its parent re-renders (by default — regardless of whether the child's own props actually changed), or whenever a context it subscribes to changes value. Most "unnecessary" re-renders trace back to that middle case: a parent re-rendering cascades to every child underneath it by default, unless something specifically interrupts that cascade.

| Cause | Why it happens | Fix |
|---|---|---|
| Parent re-renders | All children re-render by default, regardless of prop changes | Wrap the child in \`React.memo\` (with referentially stable props) |
| New object/array/function prop each render | Breaks \`React.memo\`'s shallow comparison and effect dependency checks | \`useMemo\`/\`useCallback\`, or let the React Compiler handle it |
| Context value changes | Every consumer re-renders, even ones reading only one unrelated field | Split into narrower contexts, or move the value out of context |
| Unstable \`key\` | Forces an unmount + remount, not just a re-render | Keep keys stable and tied to real item identity |

### Classic interview gotcha

Wrapping everything in \`React.memo\`/\`useMemo\`/\`useCallback\` "just in case" isn't free — each of these has its own small per-render cost, and if the props being compared are never referentially stable to begin with, the memoization never actually skips any work, so all that's left is pure overhead. The right first step for a *real, measured* re-render problem is the Profiler API (see the dedicated question), which shows exactly which components re-rendered and why — not scattering memoization speculatively across a codebase.

**Related:** [What is React.memo and how does it work?](/interview-prep/ff-react/react-memo-explained) · [What is useCallback and how does it prevent re-renders?](/interview-prep/ff-react/usecallback-and-re-renders) · [What is the Profiler API in React?](/interview-prep/ff-react/profiler-api-in-react) · [Render Performance: memo, useMemo, useCallback](/learn/react/render-performance-memoization) (Learn concept)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Meta", "Netflix"],
    isFf75: true,
    orderIndex: 31,
  },
  {
    collection: "ff-react",
    slug: "batching-in-react-18",
    question: "How does batching work in React 18?",
    answer: `Batching means React groups multiple state updates that happen within the same tick into a single re-render, instead of re-rendering once per \`setState\` call. Before React 18, this only happened automatically inside React's own event handlers — a \`setTimeout\` callback, a Promise \`.then\`, or a native event listener each triggered a separate render per update. **React 18's automatic batching extends this everywhere**, regardless of where the updates originate.

\`\`\`jsx
function handleClick() {
  setTimeout(() => {
    setCount((c) => c + 1); // before React 18: separate render
    setFlag((f) => !f);      // before React 18: another separate render
    // React 18: both updates batched into a single render
  }, 0);
}
\`\`\`

### Diagram

Two state setters called back-to-back inside the same \`setTimeout\` callback: before React 18, each one triggers its own render (two renders total); with React 18's automatic batching, both updates are collected first and applied together in a single render.

### Classic interview gotcha

\`flushSync\` is the deliberate escape hatch when you genuinely need a DOM update applied synchronously before the next line of code runs (for example, reading a layout measurement immediately after a state change) — it forces React to render and commit immediately, unbatched. It's a real, occasionally necessary tool, but reaching for it by default defeats the entire performance benefit automatic batching exists to provide, so it should stay rare and deliberate, not a habit.

**Related:** [How do you fetch data in React hooks?](/interview-prep/ff-react/fetching-data-in-react-hooks) · [What is React 18's concurrent mode?](/interview-prep/ff-react/react-18-concurrent-mode) · [Concurrent React & Suspense](/learn/react/concurrent-react-suspense) (Learn concept)

**Sources checked:** github.com/reactwg/react-18/discussions/21 (automatic batching), react.dev/blog/2022/03/29/react-v18`,
    difficulty: "hard",
    companies: ["Google", "Vercel"],
    orderIndex: 32,
  },
  {
    collection: "ff-react",
    slug: "react-18-concurrent-mode",
    question: "What is React 18's concurrent mode?",
    answer: `**"Concurrent Mode" isn't a real, current concept — the React team dropped that name and the all-or-nothing "mode" idea before React 18 even shipped.** What actually shipped is a mix of one behavior \`createRoot\` enables on its own (automatic batching, for *every* state update — not just inside React event handlers) plus a set of individually opt-in concurrent *features* (\`startTransition\`, \`useDeferredValue\`, improved \`Suspense\`) that only change anything further once you actually use one — there's no single switch that turns on a full "concurrent mode" for the whole app.

\`\`\`jsx
import { createRoot } from "react-dom/client";
createRoot(document.getElementById("root")).render(<App />); // automatic batching is already active here — this alone is a real behavior change from React 17

function SearchResults() {
  const [isPending, startTransition] = useTransition();
  // using startTransition here is what additionally opts this specific update into concurrent rendering
}
\`\`\`

### Classic interview gotcha

A common wrong answer treats "Concurrent Mode" as if it were still a real, nameable thing to switch on — the accurate mental model is "\`createRoot\` alone already changes real behavior (automatic batching), while genuinely concurrent rendering behavior only kicks in once you deliberately use a feature like \`startTransition\`." Conflating these two — claiming *nothing* changes with \`createRoot\` alone — is its own common overcorrection. This gradual, opt-in strategy for the concurrent-specific features was a deliberate response to community feedback on the original all-or-nothing "mode" proposal, specifically so existing apps could upgrade to React 18 with minimal behavior changes and adopt concurrent features incrementally, one call site at a time.

**Related:** [What are transitions in React 18 (useTransition)?](/interview-prep/ff-react/usetransition-and-react-18-transitions) · [What is useDeferredValue?](/interview-prep/ff-react/usedeferredvalue-explained) · [Concurrent React & Suspense](/learn/react/concurrent-react-suspense) (Learn concept)

**Sources checked:** github.com/reactwg/react-18/discussions/64 ("What happened to concurrent mode?"), react.dev/blog/2022/03/29/react-v18`,
    difficulty: "hard",
    companies: ["Meta", "Amazon"],
    orderIndex: 33,
  },
  {
    collection: "ff-react",
    slug: "usetransition-and-react-18-transitions",
    question: "What are transitions in React 18 (useTransition)?",
    answer: `\`useTransition\` lets you mark a state update as a low-priority "transition" instead of an urgent update — React renders it in the background, keeps the UI responsive to genuinely urgent updates (typing, clicks) in the meantime, and will interrupt or restart the transition's render if a more urgent update arrives before it finishes.

\`\`\`jsx
function SearchPage() {
  const [query, setQuery] = useState("");
  const [deferredQuery, setDeferredQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    setQuery(e.target.value); // urgent — the input stays responsive
    startTransition(() => {
      setDeferredQuery(e.target.value); // low-priority — the re-render this triggers can be interrupted
    });
  };

  const results = computeExpensiveResults(deferredQuery); // runs during the interruptible, low-priority render

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <Results data={results} />
    </>
  );
}
\`\`\`

### Classic interview gotcha

\`startTransition\`'s callback runs **synchronously** — it doesn't make code inside it non-blocking or chunk expensive work for you. Calling an expensive function directly inside \`startTransition(() => { ... })\` still blocks the main thread exactly as long as it would anywhere else; what actually becomes interruptible is the **re-render** triggered by the state update inside that callback. This is why the expensive computation belongs during render (derived from a state value set inside the transition), not executed directly inside the transition callback itself — a subtle but common source of "I used startTransition and it's still janky" confusion.

\`startTransition\` also doesn't make an update run *faster* — it can genuinely finish *later* than an un-transitioned update would, since it's explicitly deprioritized behind urgent work. The real value is keeping the *interface* responsive while an expensive re-render happens in the background, not speeding up the work itself; describing it as a general performance optimization, rather than a responsiveness/prioritization tool, is a common imprecision worth avoiding.

**Related:** [What is useDeferredValue?](/interview-prep/ff-react/usedeferredvalue-explained) · [What is React 18's concurrent mode?](/interview-prep/ff-react/react-18-concurrent-mode) · [Concurrent React & Suspense](/learn/react/concurrent-react-suspense) (Learn concept)`,
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 34,
  },
  {
    collection: "ff-react",
    slug: "usedeferredvalue-explained",
    question: "What is useDeferredValue?",
    answer: `\`useDeferredValue(value)\` returns a version of \`value\` that can "lag behind" during urgent updates, letting an expensive render based on it happen in the background without blocking more urgent UI work — the value-oriented counterpart to \`useTransition\`, useful specifically when you don't control the state update itself, such as when the value arrives as a prop.

\`\`\`jsx
function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query); // lags behind "query" during urgent updates
  const results = useMemo(() => computeExpensiveResults(deferredQuery), [deferredQuery]);
  return <ResultsList results={results} />;
}
\`\`\`

### Classic interview gotcha

Mixing up \`useTransition\` and \`useDeferredValue\` is the most common confusion: \`useTransition\` wraps the *update* — you call \`startTransition\` around the \`setState\` call you control. \`useDeferredValue\` wraps the *value* — for cases where you don't own the state setter at all, most often because the value came in as a prop from a parent that doesn't know or care about transitions. If you can call \`startTransition\` yourself, prefer \`useTransition\`; reach for \`useDeferredValue\` only when you can't.

**Related:** [What are transitions in React 18 (useTransition)?](/interview-prep/ff-react/usetransition-and-react-18-transitions) · [What is React 18's concurrent mode?](/interview-prep/ff-react/react-18-concurrent-mode)`,
    difficulty: "hard",
    companies: ["Google", "Netflix"],
    orderIndex: 35,
  },
  {
    collection: "ff-react",
    slug: "react-fiber-architecture-explained",
    question: "What is React Fiber architecture?",
    answer: `Fiber is React's reconciler, rewritten (React 16+) so each unit of rendering work is represented as a plain JavaScript object — a "fiber" — instead of relying on the native call stack. That's what lets React pause a render, resume it later, reprioritize it, or throw it away entirely if a more urgent update arrives, instead of being forced to finish one uninterruptible, synchronous walk of the whole tree once it starts.

### Diagram

Rendering splits into two phases: the render phase walks the tree unit of work by unit of work and can yield to the browser mid-way and resume — this is what makes it interruptible. The commit phase then applies every computed change to the real DOM in one synchronous, uninterruptible pass.

### Classic interview gotcha

"React 18 makes rendering non-blocking" is an oversimplification worth correcting precisely: it's specifically the **render phase** that can be interrupted, paused, or abandoned — the **commit phase**, where changes actually get applied to the DOM, is always synchronous and uninterruptible, in every React version. This has to be true: a half-applied DOM update would leave the page visibly broken mid-change, so React never yields control once it starts committing.

**Related:** [What are render phases in React (render vs commit)?](/interview-prep/ff-react/render-vs-commit-phases-in-react) · [What is reconciliation in React?](/interview-prep/ff-react/what-is-reconciliation-in-react) · [What is React 18's concurrent mode?](/interview-prep/ff-react/react-18-concurrent-mode)

**Sources checked:** github.com/acdlite/react-fiber-architecture (React core team reference), react.dev docs on render and commit phases`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Meta", "Google"],
    isFf75: true,
    orderIndex: 36,
  },
  {
    collection: "ff-react",
    slug: "server-side-rendering-in-react",
    question: "What is server-side rendering (SSR) in React?",
    answer: `Server-side rendering renders a component tree to an HTML string on the server (via \`react-dom/server\`'s \`renderToString\`/\`renderToPipeableStream\`) and sends that markup to the browser, which paints it immediately — rather than client-side rendering, where the browser first downloads a mostly-empty HTML shell and JavaScript builds the entire page after it loads. React then hydrates the server-rendered markup on the client to make it interactive.

\`\`\`jsx
// Server (simplified)
import { renderToPipeableStream } from "react-dom/server";
renderToPipeableStream(<App />, {
  onShellReady() {
    response.setHeader("content-type", "text/html");
    pipe(response); // streams HTML to the browser as soon as it's ready
  },
});
\`\`\`

### Classic interview gotcha

SSR doesn't make an app strictly "faster" in every sense — it improves perceived load time (visible content sooner) and lets crawlers see fully-rendered HTML immediately, but it doesn't reduce the total JavaScript that still has to download and hydrate, and it adds real per-request server compute cost. The precise framing is "faster first paint, not necessarily faster time-to-interactive" — not a blanket "SSR is faster than CSR."

**Related:** [What is hydration in React?](/interview-prep/ff-react/hydration-in-react-explained) · [What is the difference between SSR, CSR, and SSG?](/interview-prep/ff-react/ssr-vs-csr-vs-ssg) · [What is Suspense in React?](/interview-prep/ff-react/what-is-suspense-in-react)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Vercel", "Airbnb"],
    isFf75: true,
    orderIndex: 37,
  },
  {
    collection: "ff-react",
    slug: "hydration-in-react-explained",
    question: "What is hydration in React?",
    answer: `Hydration is the process where React takes server-rendered, already-visible HTML and "attaches" to it on the client — walking the existing markup, matching it against what the component tree would produce, reusing the real DOM nodes rather than recreating them, and adding the event listeners that make the page interactive.

\`\`\`jsx
import { hydrateRoot } from "react-dom/client";
hydrateRoot(document.getElementById("root"), <App />); // attaches to existing server HTML, doesn't re-create it
\`\`\`

### Diagram

The server sends static HTML the browser paints right away (visible but not yet interactive); React then downloads, walks that existing markup to attach event listeners and reuse the DOM nodes, and the page becomes interactive — without a flash of the content being torn down and rebuilt.

### Classic interview gotcha

React 18 (not a later version) shipped **selective hydration**: with \`Suspense\` boundaries in place, React can hydrate whichever part of the page the user actually interacts with first, ahead of unrelated siblings still waiting their turn, instead of blocking all interactivity until the entire tree finishes hydrating in one pass. Separately, a **hydration mismatch** — server and client producing different markup, commonly from \`Date.now()\`, \`Math.random()\`, or locale-dependent formatting run at render time — throws a real, common error in development, since \`hydrateRoot\` assumes the two outputs are identical.

**Related:** [What is server-side rendering (SSR) in React?](/interview-prep/ff-react/server-side-rendering-in-react) · [What is Suspense in React?](/interview-prep/ff-react/what-is-suspense-in-react)

**Sources checked:** react.dev/reference/react-dom/client/hydrateRoot, github.com/reactwg/react-18/discussions/130 (selective hydration, shipped in React 18)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Meta", "Vercel"],
    isFf75: true,
    orderIndex: 38,
  },
  {
    collection: "ff-react",
    slug: "optimizing-react-performance",
    question: "How do you optimize React performance?",
    answer: `React performance work falls into a few concrete categories: measure first with the Profiler to find what's actually slow, reduce how often things re-render (memoization, or letting the React Compiler handle it), reduce how much work each render does (virtualizing long lists, splitting bundles), and keep list keys stable so React doesn't unmount and remount things it should just be updating.

| Technique | What it targets |
|---|---|
| \`React.memo\` / React Compiler auto-memoization | Skipping re-renders when props didn't meaningfully change |
| \`useMemo\`/\`useCallback\` | Referential stability for memoized children or effect dependencies |
| Code splitting (\`React.lazy\`) | Smaller initial bundle, faster first paint |
| Virtualization (\`react-window\`) | Rendering only the visible rows of a huge list |
| Stable, identity-based \`key\`s | Preventing accidental unmount/remount of list items |
| Profiler API | Measuring which components are actually slow, before touching any of the above |

### Classic interview gotcha

Optimizing without measuring first is the single most common real mistake — \`React.memo\`, \`useMemo\`, and \`useCallback\` all carry their own small per-render overhead, so applying them speculatively to components that were never actually slow can make things marginally worse, not better. The Profiler API exists specifically to identify which components are genuinely expensive and why, before reaching for any memoization tool — "measure, then optimize" beats "memoize everything defensively."

**Related:** [What is the Profiler API in React?](/interview-prep/ff-react/profiler-api-in-react) · [What is React.memo and how does it work?](/interview-prep/ff-react/react-memo-explained) · [What is code splitting and React.lazy?](/interview-prep/ff-react/code-splitting-and-react-lazy) · [Render Performance: memo, useMemo, useCallback](/learn/react/render-performance-memoization) (Learn concept)`,
    difficulty: "hard",
    companies: ["Meta", "Bloomberg"],
    orderIndex: 39,
  },
  {
    collection: "ff-react",
    slug: "react-strictmode-explained",
    question: "What is React.StrictMode and what does it do?",
    answer: `\`<StrictMode>\` is a development-only wrapper that helps surface potential bugs early by intentionally double-invoking certain functions — component render bodies, state updater functions, and an effect's setup-then-cleanup-then-setup sequence — to catch side effects that shouldn't happen during render, or effect cleanup that isn't handled properly. It has zero effect on production builds.

\`\`\`jsx
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
\`\`\`

### Classic interview gotcha

Seeing console logs, component bodies, or effects run twice in development under \`StrictMode\` is not a bug — it's the intended behavior, deliberately simulating "mount → unmount → remount" to surface effects that don't clean up after themselves correctly. Production builds only ever run everything once. This genuinely surprises a lot of developers the first time they enable \`StrictMode\` and see doubled logging, especially if an effect's cleanup function was missing or wrong — which is exactly the bug \`StrictMode\` is designed to expose before it reaches production.

**Related:** [Explain useEffect hook and its dependency array.](/interview-prep/ff-react/useeffect-hook-and-dependency-array) · [What is the difference between React.Component and PureComponent?](/interview-prep/ff-react/react-component-vs-purecomponent)`,
    difficulty: "medium",
    companies: ["Google", "Shopify"],
    orderIndex: 40,
  },
  {
    collection: "ff-react",
    slug: "react-component-vs-purecomponent",
    question: "What is the difference between React.Component and PureComponent?",
    answer: `\`React.Component\` re-renders whenever its parent re-renders or \`setState\` is called, regardless of whether props or state actually changed; \`PureComponent\` implements \`shouldComponentUpdate\` with a shallow comparison of props and state, skipping the re-render entirely when nothing shallowly changed. It's the class-component equivalent of wrapping a function component in \`React.memo\`.

\`\`\`jsx
class Regular extends React.Component {
  render() { return <div>{this.props.value}</div>; } // re-renders every time, regardless
}

class Pure extends React.PureComponent {
  render() { return <div>{this.props.value}</div>; } // skips re-render if props are shallowly equal
}
\`\`\`

### Classic interview gotcha

\`PureComponent\`'s shallow comparison has the exact same failure mode as \`React.memo\`: passing a new object, array, or function literal as a prop every render defeats it completely, since the comparison always finds a "different" reference. It's also actively dangerous if state or props are ever mutated in place instead of replaced with a new reference — the shallow comparison would see the *same* reference and skip a render that genuinely should have happened, silently showing stale UI.

**Related:** [What is React.memo and how does it work?](/interview-prep/ff-react/react-memo-explained) · [What are the differences between functional and class components?](/interview-prep/ff-react/functional-vs-class-components)`,
    difficulty: "medium",
    companies: ["Microsoft", "Bloomberg"],
    orderIndex: 41,
  },
  {
    collection: "ff-react",
    slug: "componentdidmount-equivalent-in-hooks",
    question: "What is componentDidMount equivalent in hooks?",
    answer: `\`useEffect(fn, [])\` — an effect with an empty dependency array runs its setup function once per mount in production, immediately after the first render commits, matching the timing \`componentDidMount\` guarantees in a class component. (In development, under \`StrictMode\`, React 18+ deliberately runs an extra setup-then-cleanup cycle before the "real" one, specifically to surface effects that don't clean up after themselves properly — this doesn't happen in production.)

\`\`\`jsx
class Example extends React.Component {
  componentDidMount() {
    fetchData();
  }
}

function ExampleFn() {
  useEffect(() => {
    fetchData();
  }, []); // empty array — runs once, after the first commit
}
\`\`\`

### Classic interview gotcha

It's easy to assume any \`useEffect\` with a dependency array "is" \`componentDidMount\`, but only the *empty*-array form actually matches it — a populated dependency array re-runs the effect on every subsequent update where one of those values changed, which has no single one-to-one class lifecycle equivalent (see the full lifecycle question for why).

**Related:** [What is componentWillUnmount equivalent in hooks?](/interview-prep/ff-react/componentwillunmount-equivalent-in-hooks) · [Explain the React component lifecycle.](/interview-prep/ff-react/react-component-lifecycle-explained)`,
    difficulty: "medium",
    companies: ["Amazon", "Adobe"],
    orderIndex: 42,
  },
  {
    collection: "ff-react",
    slug: "componentwillunmount-equivalent-in-hooks",
    question: "What is componentWillUnmount equivalent in hooks?",
    answer: `The cleanup function returned from \`useEffect\` — whatever function an effect returns runs when the component unmounts, matching \`componentWillUnmount\`'s timing.

\`\`\`jsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // runs on unmount — and before every re-run of this effect
}, [delay]);
\`\`\`

### Classic interview gotcha

A common real bug is expecting the cleanup function to run *only* on unmount, the way \`componentWillUnmount\` does — for an effect with a non-empty dependency array, that same cleanup function also runs **before every subsequent re-run** of the effect, not just at the very end. This dual role is exactly why a subscription or timer set up in an effect needs to be torn down and re-established symmetrically every time a dependency changes, not treated as a one-time-at-the-end cleanup.

**Related:** [What is componentDidMount equivalent in hooks?](/interview-prep/ff-react/componentdidmount-equivalent-in-hooks) · [Explain useEffect hook and its dependency array.](/interview-prep/ff-react/useeffect-hook-and-dependency-array)`,
    difficulty: "medium",
    companies: ["Google", "Netflix"],
    orderIndex: 43,
  },
  {
    collection: "ff-react",
    slug: "fetching-data-in-react-hooks",
    question: "How do you fetch data in React hooks?",
    answer: `The plain-hooks pattern is \`useEffect\` + \`useState\`: kick off the request inside an effect, store the result (and loading/error state) with \`useState\`, and guard against updating state after the component unmounts or after a newer request has superseded an older one. In practice, most production code reaches for a dedicated data-fetching library (TanStack Query, SWR) instead, since caching, retries, and race conditions are exactly the problems those libraries exist to solve.

\`\`\`jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(\`/api/users/\${userId}\`, { signal: controller.signal })
      .then((res) => res.json())
      .then(setUser)
      .catch((err) => { if (err.name !== "AbortError") throw err; });
    return () => controller.abort(); // cancels a stale in-flight request on unmount or userId change
  }, [userId]);

  return user ? <Profile user={user} /> : <Spinner />;
}
\`\`\`

### Classic interview gotcha

A fetch started inside \`useEffect\` can resolve *after* the component unmounts, or after \`userId\` changed and a newer fetch already started — updating state from that stale response silently overwrites fresh data with outdated data that just happened to resolve later, a real race-condition bug with no console warning to catch it (React 18 removed the old "can't update state on an unmounted component" warning, since most of what it flagged wasn't an actual leak). The fix is an \`AbortController\` aborted in the cleanup function (shown above), or a local "ignore" flag set in cleanup and checked before the state setter runs.

**Related:** [What is the stale closure problem in hooks?](/interview-prep/ff-react/stale-closure-problem-in-hooks) · [What is React Query (TanStack Query)?](/interview-prep/ff-react/react-query-tanstack-query-explained) · [What is Suspense in React?](/interview-prep/ff-react/what-is-suspense-in-react)`,
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 44,
  },
  {
    collection: "ff-react",
    slug: "stale-closure-problem-in-hooks",
    question: "What is the stale closure problem in hooks?",
    answer: `A stale closure happens when a function created during one render — an effect callback, an event handler, a \`setTimeout\` callback — captures a variable's value from *that* render and keeps using it, even after state has since changed and a newer render (with a fresh value) has happened. The old function still "remembers" the old value because closures capture the variable as it existed in their own render's scope, not a live binding to the latest state.

\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count); // always logs 0 — this closure was created once, on the first render
      setCount(count + 1); // also always sets 0 + 1 — never actually increments past 1
    }, 1000);
    return () => clearInterval(id);
  }, []); // empty deps — the effect (and its closure over "count") never re-runs

  // Fix: functional update doesn't need to read the outer "count" at all
  // setCount((prev) => prev + 1);
}
\`\`\`

### Classic interview gotcha

Adding the stale variable to a \`useEffect\`'s dependency array is the direct fix when one is available — but it isn't always: an event handler passed down as a prop has no dependency array to add anything to. In those cases, either the functional-update form of a state setter (\`setCount(prev => prev + 1)\`, which never reads the outer variable at all) or a \`ref\` that's kept updated with the latest value on every render are the standard fixes, depending on whether the stale value is state you're updating or something else you just need to read fresh.

**Related:** [Explain useState hook with examples.](/interview-prep/ff-react/usestate-hook-explained) · [Explain useEffect hook and its dependency array.](/interview-prep/ff-react/useeffect-hook-and-dependency-array) · [What is useRef and when would you use it?](/interview-prep/ff-react/what-is-useref-and-when-to-use-it)`,
    difficulty: "hard",
    companies: ["Meta", "Uber"],
    orderIndex: 45,
  },
  {
    collection: "ff-react",
    slug: "exhaustive-deps-eslint-rule",
    question: "What is the exhaustive-deps ESLint rule?",
    answer: `\`react-hooks/exhaustive-deps\`, part of \`eslint-plugin-react-hooks\`, statically analyzes a \`useEffect\`/\`useMemo\`/\`useCallback\` call and warns when a reactive value the callback reads isn't listed in the dependency array — catching the exact class of stale-closure bugs described in the previous question at lint time, before they ship.

\`\`\`jsx
useEffect(() => {
  console.log(count); // ESLint warns: "count" is used but not in the dependency array
}, []); // missing "count"
\`\`\`

### Classic interview gotcha

Disabling the rule (or adding a suppression comment) for a dependency that seems inconvenient to include is almost always the wrong move — it's usually a sign the effect needs restructuring: a functional state update, extracting a stable reference with \`useMemo\`/\`useCallback\`, or React 19.2's \`useEffectEvent\` for a genuinely non-reactive read — not a false positive to silence. As of \`eslint-plugin-react-hooks\` v6+, the plugin also bundles the React Compiler's own generated lint rules (e.g. \`react-hooks/immutability\`, \`react-hooks/purity\`) under the same \`react-hooks/\` prefix, so "the hooks ESLint plugin" now covers more ground than just \`exhaustive-deps\` and \`rules-of-hooks\`.

**Related:** [What is the stale closure problem in hooks?](/interview-prep/ff-react/stale-closure-problem-in-hooks) · [Explain useEffect hook and its dependency array.](/interview-prep/ff-react/useeffect-hook-and-dependency-array)

**Sources checked:** react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps, npmjs.com/package/eslint-plugin-react-hooks (v7.1.1, React Compiler rule bundling since v6)`,
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 46,
  },
  {
    collection: "ff-react",
    slug: "react-devtools-explained",
    question: "What is React DevTools and how do you use it?",
    answer: `React DevTools is a browser extension (Chrome, Firefox, Edge) that adds "Components" and "Profiler" tabs to the browser's built-in developer tools — the Components tab lets you inspect the live component tree and view or edit a selected component's props, state, and hooks in real time; the Profiler tab records which components rendered during an interaction, and why.

### Classic interview gotcha

Whatever component is currently selected in the Components tab becomes accessible in the browser console as the \`$r\` global variable — letting you run arbitrary JavaScript against that live component instance directly (\`$r.props\`, or calling one of its methods) without adding a single \`console.log\` to the source. This console-integration trick is genuinely useful and frequently unknown even to developers who use the panel UI regularly.

**Related:** [What is the Profiler API in React?](/interview-prep/ff-react/profiler-api-in-react) · [How do you optimize React performance?](/interview-prep/ff-react/optimizing-react-performance)

**Sources checked:** react.dev/learn/react-developer-tools`,
    difficulty: "easy",
    companies: ["Meta", "Shopify"],
    orderIndex: 47,
  },
  {
    collection: "ff-react",
    slug: "lazy-loading-images-in-react",
    question: "How do you implement lazy loading of images in React?",
    answer: `The simplest approach is the native browser attribute \`loading="lazy"\` on an \`<img>\` — it defers the network request until the image nears the viewport, with zero JavaScript required. For finer control (a custom trigger distance, a blur-up placeholder, lazy-loading something other than a plain \`<img>\`), a custom hook built on the \`IntersectionObserver\` API gives you that control directly.

\`\`\`jsx
// Native — simplest, no JS needed
<img src="/photo.jpg" loading="lazy" alt="..." />

// Custom control via IntersectionObserver
function useInView(ref) {
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return isInView;
}
\`\`\`

### Classic interview gotcha

\`loading="lazy"\` alone gives you deferred loading, not a *loading experience* — there's no built-in placeholder or fade-in transition, so a genuinely smooth loading state (a blur-up preview, a skeleton) still requires tracking load state yourself, typically via the image's \`onLoad\` event. Reaching for the native attribute and expecting a polished loading UI "for free" is a common, easily-corrected misconception.

**Related:** [How do you implement infinite scroll in React?](/interview-prep/ff-react/infinite-scroll-in-react)`,
    difficulty: "medium",
    companies: ["Airbnb", "Vercel"],
    orderIndex: 48,
  },
  {
    collection: "ff-react",
    slug: "react-testing-library-and-testing-hooks",
    question: "What is the React Testing Library? How do you test hooks?",
    answer: `React Testing Library (RTL) tests components the way a user actually experiences them — rendering real DOM output and querying it by visible role, label, or text, rather than reaching into a component's internal implementation — which produces tests that keep passing through internal refactors as long as user-facing behavior doesn't change. For a hook specifically, \`renderHook\` (built directly into \`@testing-library/react\` itself for React 18+, no separate package needed) renders it in a minimal test harness and exposes its return value for assertions.

\`\`\`jsx
import { render, screen } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";

test("shows the greeting", () => {
  render(<Greeting name="Ada" />);
  expect(screen.getByText("Hello, Ada")).toBeInTheDocument(); // queries like a user would
});

test("useCounter increments", () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});
\`\`\`

### Classic interview gotcha

RTL's own guidance is to prefer testing a hook *through* the component that actually uses it, wherever practical — reaching for \`renderHook\` by default, even for simple hooks, produces tests coupled to the hook's internal return shape rather than its observable, user-facing behavior, and can miss bugs that only surface in how a real component actually consumes it. \`renderHook\` earns its place for genuinely hook-focused code — a library that only exports hooks, with no natural host component to render instead.

**Related:** [What is Enzyme vs React Testing Library?](/interview-prep/ff-react/enzyme-vs-react-testing-library) · [What are custom hooks? Create a useDebounce hook.](/interview-prep/ff-react/custom-hooks-usedebounce-example)

**Sources checked:** testing-library.com/docs/react-testing-library/api (renderHook merged into @testing-library/react for React 18+)`,
    difficulty: "medium",
    companies: ["Meta", "Netflix"],
    orderIndex: 49,
  },
  {
    collection: "ff-react",
    slug: "enzyme-vs-react-testing-library",
    question: "What is Enzyme vs React Testing Library?",
    answer: `Enzyme tests a component's internal implementation — shallow-rendering it and inspecting its instance, internal state, or specific child components directly; React Testing Library renders real DOM output and queries it the way a user would, deliberately making implementation details hard to reach. **Enzyme has no official adapter for React 18 or React 19, and its ecosystem is effectively frozen** — it never adapted to React's post-17 internals, which is the concrete reason React Testing Library is the standard choice for any current React codebase, not just a stylistic preference.

| | Enzyme | React Testing Library |
|---|---|---|
| Query style | Implementation details (\`wrapper.find\`, instance state) | User-facing (role, label, visible text) |
| React 18/19 support | None — unmaintained, no adapter | Full, actively maintained |
| Survives internal refactors? | No — breaks when internals change, even if behavior doesn't | Yes — decoupled from implementation |

### Classic interview gotcha

This question sometimes gets asked as if it's still a live, current choice between two viable options — it precisely isn't. Enzyme's lack of React 18+ support isn't a minor gap to work around, it's a hard blocker: teams still maintaining Enzyme-based suites are functionally stuck testing against React 16/17 behavior (or are mid-migration to RTL), regardless of what React version their actual app runs in production.

**Related:** [What is the React Testing Library? How do you test hooks?](/interview-prep/ff-react/react-testing-library-and-testing-hooks)

**Sources checked:** github.com/enzymejs/enzyme issue #2611 (no React 19 adapter), issue #2524 (no React 18 adapter)`,
    difficulty: "medium",
    companies: ["Google", "Microsoft"],
    orderIndex: 50,
  },
  {
    collection: "ff-react",
    slug: "handling-side-effects-with-redux",
    question: "How do you handle side effects with Redux?",
    answer: `Reducers must stay pure — no API calls, timers, or other side effects allowed inside them — so Redux handles side effects through middleware that sits between \`dispatch\` and the reducer. Redux Toolkit includes \`redux-thunk\` by default, letting an action creator return a *function* (instead of a plain object) that can run async logic and dispatch further actions itself; \`redux-saga\`, built on generator functions, is a more powerful but more complex alternative for apps with genuinely intricate async workflows.

\`\`\`js
// A thunk — an action creator that returns a function, not a plain object
function fetchUser(id) {
  return async (dispatch) => {
    dispatch({ type: "user/loading" });
    const user = await api.getUser(id);
    dispatch({ type: "user/loaded", payload: user });
  };
}

dispatch(fetchUser(42)); // Redux Toolkit's thunk middleware knows how to run this
\`\`\`

### Classic interview gotcha

Reaching for \`redux-saga\` by default is usually over-engineering for typical CRUD-style async logic — thunks, already bundled into Redux Toolkit, cover the vast majority of real cases with far less conceptual overhead. Sagas earn their added complexity specifically for things thunks handle awkwardly: cancelling in-flight requests, debouncing dispatched actions, or coordinating several long-running async flows against each other.

**Related:** [What is Redux and when should you use it?](/interview-prep/ff-react/redux-explained-when-to-use) · [What is Redux Toolkit and how is it different from Redux?](/interview-prep/ff-react/redux-toolkit-vs-redux)`,
    difficulty: "medium",
    companies: ["Amazon", "Bloomberg"],
    orderIndex: 51,
  },
  {
    collection: "ff-react",
    slug: "redux-toolkit-vs-redux",
    question: "What is Redux Toolkit and how is it different from Redux?",
    answer: `Redux Toolkit (RTK) is the officially recommended way to write Redux logic today: \`createSlice\` generates action creators and a reducer from a single object (using Immer internally, so "mutating" state inside a reducer is actually safe), \`configureStore\` sets up sensible defaults (including \`redux-thunk\` and DevTools support, already wired in), and RTK Query adds a built-in data-fetching and caching layer. Plain Redux — \`createStore\`, hand-written action type strings, manually combined reducers — still works, but is no longer how new Redux code gets written.

\`\`\`js
// Redux Toolkit — the standard way today
const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    incremented: (state) => { state.value += 1; }, // looks like a mutation — Immer makes it safe
  },
});

// Plain Redux — the same logic, hand-written
function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case "counter/incremented":
      return { ...state, value: state.value + 1 }; // must return a new object explicitly
    default:
      return state;
  }
}
\`\`\`

### Classic interview gotcha

The \`state.value += 1\` line inside a \`createSlice\` reducer looks like a direct mutation — and would be a serious, silent bug in plain Redux, which requires every reducer to return a brand-new object/array reference. RTK makes that exact code safe specifically because \`createSlice\` wraps reducers in Immer, which records "mutations" against a temporary draft and produces a proper immutable update behind the scenes. Writing that same line in a hand-written, non-RTK reducer would silently break Redux's change-detection.

**Related:** [What is Redux and when should you use it?](/interview-prep/ff-react/redux-explained-when-to-use) · [How do you handle side effects with Redux?](/interview-prep/ff-react/handling-side-effects-with-redux)`,
    difficulty: "medium",
    companies: ["Meta", "Shopify"],
    orderIndex: 52,
  },
  {
    collection: "ff-react",
    slug: "zustand-vs-redux",
    question: "What is Zustand and how does it compare to Redux?",
    answer: `Zustand is a minimal state-management library where \`create(...)\` returns a hook that directly holds both the state and the actions that update it — no \`Provider\`, no dispatched actions, no separate reducer function. A component calls that hook with a selector function to read just the slice of state it actually needs. Redux (even with Redux Toolkit) keeps state, actions, and reducers as distinct concepts, wrapped in a \`Provider\`, with more structure and a steeper learning curve.

\`\`\`js
// Zustand — the hook is the entire API
const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

function Counter() {
  const count = useCounterStore((state) => state.count); // selector — subscribes to just this slice
  const increment = useCounterStore((state) => state.increment);
  return <button onClick={increment}>{count}</button>;
}
\`\`\`

### Classic interview gotcha

Calling \`useCounterStore()\` with **no** selector subscribes a component to the *entire* store, re-rendering it on every single state change rather than just the slice it actually reads — a common, real source of unnecessary re-renders in Zustand code, since nothing forces you to pass a selector the way \`useSelector\` conventions do in Redux. Always select narrowly (\`useStore((state) => state.count)\`) — the same "subscribe to just what you use" discipline Redux's own \`useSelector\` encourages, just not enforced by the API itself.

**Related:** [What is Redux and when should you use it?](/interview-prep/ff-react/redux-explained-when-to-use) · [What is Redux Toolkit and how is it different from Redux?](/interview-prep/ff-react/redux-toolkit-vs-redux)

**Sources checked:** zustand.docs.pmnd.rs/learn/getting-started/comparison`,
    difficulty: "medium",
    companies: ["Airbnb", "Uber"],
    orderIndex: 53,
  },
  {
    collection: "ff-react",
    slug: "react-query-tanstack-query-explained",
    question: "What is React Query (TanStack Query)?",
    answer: `TanStack Query (formerly React Query) is a data-fetching and server-state library: \`useQuery\` wraps an async function, caches its result under a query key, automatically refetches it on a schedule or on window refocus, and deduplicates identical in-flight requests — solving a category of problems (caching, background refetching, request deduplication) that a plain \`useEffect\` + \`useState\` was never designed to handle well.

\`\`\`jsx
function UserProfile({ userId }) {
  const { data, isPending, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetch(\`/api/users/\${userId}\`).then((r) => r.json()),
  });

  if (isPending) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  return <Profile user={data} />;
}
\`\`\`

### Classic interview gotcha

Server data managed by \`useQuery\` isn't the same category of state as local component state — copying a query's \`data\` into a separate \`useState\` (so it can be edited locally, for instance) throws away all of TanStack Query's caching and refetching behavior for that copy, and the two can silently drift apart. The library's own mental model treats server state as fundamentally distinct from client state, with a \`useMutation\` call — not a manual \`setState\` — as the intended way to write changes back.

**Related:** [What is SWR and how does it work?](/interview-prep/ff-react/swr-explained) · [How do you fetch data in React hooks?](/interview-prep/ff-react/fetching-data-in-react-hooks)`,
    difficulty: "medium",
    companies: ["Vercel", "Stripe"],
    orderIndex: 54,
  },
  {
    collection: "ff-react",
    slug: "swr-explained",
    question: "What is SWR and how does it work?",
    answer: `SWR — named after "stale-while-revalidate," the HTTP caching strategy it implements — is a lightweight data-fetching hook: \`useSWR(key, fetcher)\` returns cached data immediately if any exists, while triggering a background refetch to revalidate it, so the UI shows something instantly even if it might be a moment stale, then updates seamlessly once the fresh response lands.

\`\`\`jsx
function UserProfile({ userId }) {
  const { data, isLoading } = useSWR(\`/api/users/\${userId}\`, (url) => fetch(url).then((r) => r.json()));
  if (isLoading) return <Spinner />;
  return <Profile user={data} />;
}
\`\`\`

### Classic interview gotcha

SWR does ship its own mutation tools — \`useSWRMutation\` for triggering a mutation, and the \`mutate\` function's \`optimisticData\`/\`rollbackOnError\` options for optimistic updates with automatic rollback — so "SWR has no mutation support" is an overstatement worth avoiding. The real, accurate tradeoff is that this surface is intentionally smaller and less feature-rich than TanStack Query's \`useMutation\` (fewer configuration knobs, less built-in retry/state-machine sophistication around the mutation lifecycle itself), not that it's missing entirely: SWR stays faster to learn and smaller in bundle size, at the cost of more manual wiring for a genuinely complex mutation flow.

**Related:** [What is React Query (TanStack Query)?](/interview-prep/ff-react/react-query-tanstack-query-explained)`,
    difficulty: "medium",
    companies: ["Vercel", "Netflix"],
    orderIndex: 55,
  },
  {
    collection: "ff-react",
    slug: "optimistic-vs-pessimistic-ui-updates",
    question: "What is the difference between optimistic and pessimistic UI updates?",
    answer: `A pessimistic update waits for the server to confirm an action before changing the UI at all; an optimistic update changes the UI immediately, assuming the request will succeed, and only rolls back if it actually fails — trading a small risk of a visible correction for an interface that feels instant.

### Diagram

For the same "like a post" action: pessimistic UI shows a loading state and only updates once the server confirms; optimistic UI updates immediately and simply rolls back in the rare case the request comes back as a failure.

\`\`\`jsx
async function handleLike() {
  setLiked(true); // optimistic — update immediately
  try {
    await api.likePost(postId);
  } catch {
    setLiked(false); // roll back only if the request actually failed
  }
}
\`\`\`

### Classic interview gotcha

Optimistic updates are only safe when a failure is genuinely rare *and* the rollback path is actually implemented — silently assuming success without a real rollback strategy is a common, real bug: a failed request then leaves the UI showing something that never actually happened on the server, with no correction shown to the user. TanStack Query's \`useMutation\` (\`onError\`, \`onSettled\`) gives this a structured, built-in home; a hand-rolled optimistic update needs that same rollback logic written manually, and it's easy to skip under time pressure.

**Related:** [What is React Query (TanStack Query)?](/interview-prep/ff-react/react-query-tanstack-query-explained)`,
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 56,
  },
  {
    collection: "ff-react",
    slug: "react-portal-explained",
    question: "What is React Portal and when would you use it?",
    answer: `\`createPortal(children, domNode)\` renders a component's output into a different DOM node than its parent, while keeping it in the exact same place in the React component tree for context, state, and event bubbling purposes — used for UI that needs to escape a parent's CSS constraints (\`overflow: hidden\`, a low \`z-index\` stacking context), like modals, tooltips, and dropdown menus.

\`\`\`jsx
function Modal({ children }) {
  return createPortal(
    <div className="modal">{children}</div>,
    document.body // rendered here in the DOM...
  ); // ...but still a child of whatever component rendered <Modal> in the React tree
}
\`\`\`

### Diagram

In the React component tree, Modal remains a child of Page and App — but the actual DOM node it renders into is appended directly to \`<body>\`, entirely outside the app's \`#root\` div.

### Classic interview gotcha

A Portal changes *where* a component renders in the DOM but not *where it sits* in the React tree — events dispatched inside the portaled content still bubble up through the React component hierarchy, reaching an \`onClick\` on a real ancestor component, even though, in the actual DOM, that content isn't nested inside that ancestor's DOM node at all. This surprises anyone expecting DOM-based event-bubbling rules to apply directly; React's synthetic event system follows the *component* tree, not the DOM tree.

**Related:** [What is React and how does the Virtual DOM work?](/interview-prep/ff-react/what-is-react-and-virtual-dom)`,
    difficulty: "hard",
    companies: ["Google", "Adobe"],
    orderIndex: 57,
  },
  {
    collection: "ff-react",
    slug: "infinite-scroll-in-react",
    question: "How do you implement infinite scroll in React?",
    answer: `The modern approach uses an \`IntersectionObserver\` watching a small sentinel element at the bottom of the list — when it enters the viewport, fetch and append the next page. This replaces the older, much noisier pattern of listening to the \`scroll\` event and manually computing \`scrollTop\`/\`scrollHeight\` math on every scroll tick.

\`\`\`jsx
function useInfiniteScroll(loadMore) {
  const sentinelRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore();
    });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);
  return sentinelRef;
}
\`\`\`

### Classic interview gotcha

Pairing infinite scroll with a very long, ever-growing list *without* virtualization is a common, real performance trap — every page appended adds more live DOM nodes, and the browser's per-scroll work keeps growing as the list gets longer, even though only a handful of rows are ever visible at once. For a genuinely long infinite-scroll list, combining it with list virtualization (see the dedicated question) keeps the DOM's size bounded no matter how many pages have loaded.

**Related:** [How do you implement a virtualized list in React?](/interview-prep/ff-react/virtualized-list-in-react) · [How do you implement lazy loading of images in React?](/interview-prep/ff-react/lazy-loading-images-in-react)`,
    difficulty: "hard",
    companies: ["Uber", "Netflix"],
    orderIndex: 58,
  },
  {
    collection: "ff-react",
    slug: "virtualized-list-in-react",
    question: "How do you implement a virtualized list in React?",
    answer: `List virtualization renders only the rows currently inside (or just outside, as a small overscan buffer) the visible viewport as real DOM nodes, while the rest of the list occupies correctly-sized empty space — keeping the DOM's size roughly constant regardless of whether the underlying list has hundreds or hundreds of thousands of items.

### Diagram

Of a list with thousands of rows, only the ones inside the visible viewport (plus a small buffer) are actually mounted as DOM nodes; everything above and below is empty, correctly-sized space with no corresponding DOM node until it scrolls into view.

\`\`\`jsx
import { List } from "react-window"; // v2's API — a rowComponent/rowCount/rowHeight shape

function Row({ index, style }) {
  return <div style={style}>Row {index}</div>;
}

<List rowComponent={Row} rowCount={100000} rowHeight={35} />
\`\`\`

### Classic interview gotcha

Virtualization requires knowing (or estimating) each row's height up front to correctly size the scroll container and position rows — variable-height content (text that wraps differently per row) is the genuinely hard part of implementing this from scratch, which is exactly why reaching for a maintained library rather than hand-rolling it is almost always the right call (see the dedicated react-window vs. react-virtualized question for which one).

**Related:** [What is react-window vs react-virtualized?](/interview-prep/ff-react/react-window-vs-react-virtualized) · [How do you implement infinite scroll in React?](/interview-prep/ff-react/infinite-scroll-in-react)`,
    difficulty: "hard",
    companies: ["Meta", "Bloomberg"],
    orderIndex: 59,
  },
  {
    collection: "ff-react",
    slug: "react-window-vs-react-virtualized",
    question: "What is react-window vs react-virtualized?",
    answer: `Both are virtualization libraries from the same author. \`react-virtualized\` came first and is feature-rich (grids, tables, multiple built-in layouts) but heavier and largely in maintenance mode today; \`react-window\` is a from-scratch rewrite focused on a much smaller bundle size and simpler API, and remains actively maintained — it shipped a v2 (a new \`List\`/\`Grid\` API, \`rowComponent\`/\`rowCount\`/\`rowHeight\`-shaped props) rather than sitting frozen. Even so, new projects increasingly reach for \`@tanstack/react-virtual\` (headless, minimal, part of the TanStack ecosystem) or \`react-virtuoso\` instead, mainly for their more modern, fully-headless API design rather than because react-window is unmaintained.

| | react-virtualized | react-window | @tanstack/react-virtual |
|---|---|---|---|
| Bundle size | Larger | Smaller | Smallest (fully headless) |
| Built-in components (Grid, Table, etc.) | Yes | No — list/grid primitives only | No — you build the markup |
| Active development (2026) | Largely maintenance mode | Actively maintained (v2 shipped) | Active, TanStack ecosystem |
| Best fit | Legacy codebases already using it | Simple, fixed-size lists — still a reasonable current pick | New projects, custom scroll behavior |

### Classic interview gotcha

This question is often asked expecting a simple "react-window is the newer, better version of react-virtualized" answer, which is directionally right but incomplete — \`react-virtualized\` is the one genuinely in maintenance mode; \`react-window\` is still actively developed, just with a smaller, more opinionated API surface than newer headless alternatives. Describing \`react-window\` itself as abandoned or frozen is a common overstatement worth avoiding — the more accurate framing is that \`@tanstack/react-virtual\`/\`react-virtuoso\` are the more modern *design* for new work, not that \`react-window\` is unmaintained.

**Related:** [How do you implement a virtualized list in React?](/interview-prep/ff-react/virtualized-list-in-react)

**Sources checked:** github.com/TanStack/virtual discussion #459, npm trends (@tanstack/react-virtual vs react-window vs react-virtualized), github.com/bvaughn/react-window (v2 release, active maintenance)`,
    difficulty: "hard",
    companies: ["Google", "Airbnb"],
    orderIndex: 60,
  },
  {
    collection: "ff-react",
    slug: "usestate-vs-useref-for-values",
    question: "What is the difference between useState and useRef for storing values?",
    answer: `\`useState\` triggers a re-render every time its setter is called, and the value you read during render is a snapshot as of that specific render — never "more current" than that. \`useRef\`'s \`.current\` mutates silently with no re-render at all, and holds a genuinely mutable box that survives across renders — but it should only be read or written from an effect or event handler, not during render itself (aside from one-time lazy initialization).

| | \`useState\` | \`useRef\` |
|---|---|---|
| Triggers a re-render on change | Yes | No |
| Safe to read/write during render? | Yes — that's the whole point | No — reserved for effects/event handlers (except one-time lazy init) |
| Use for | Anything that needs to appear in the rendered UI | Values a component tracks across renders that shouldn't affect the UI by themselves |

\`\`\`jsx
function Example() {
  const [count, setCount] = useState(0); // changes trigger a re-render
  const renderCountRef = useRef(0);       // changes do NOT trigger a re-render

  useEffect(() => {
    renderCountRef.current += 1; // updated from an effect, not during render itself
  });
}
\`\`\`

### Classic interview gotcha

A common mistake is using a ref to hold a value that should actually drive the UI — since mutating \`ref.current\` never triggers a re-render, the screen simply won't update even though the underlying value genuinely changed, silently diverging from what's displayed. A second, subtler mistake: mutating \`ref.current\` **directly inside the render body** (not an effect or event handler) — React's own docs call this out explicitly as something to avoid, since render is meant to be pure, and a component can genuinely render more than once for a single commit (Strict Mode's double-render in development being the most common case), which would silently double-count or corrupt a ref mutated this way. The opposite mistake is just as real: storing something in \`useState\` purely to avoid a stale closure, when the value never actually needs to appear in rendered output, causes unnecessary re-renders on every update that a ref would have avoided entirely.

**Related:** [What is useRef and when would you use it?](/interview-prep/ff-react/what-is-useref-and-when-to-use-it) · [What is the stale closure problem in hooks?](/interview-prep/ff-react/stale-closure-problem-in-hooks)`,
    difficulty: "hard",
    companies: ["Meta", "Netflix"],
    orderIndex: 61,
  },
  {
    collection: "ff-react",
    slug: "preventing-memory-leaks-in-react",
    question: "How do you prevent memory leaks in React?",
    answer: `Most React memory leaks come from an effect creating something — a subscription, timer, event listener, or in-flight request — that outlives the component. The fix is always the same shape: return a cleanup function from \`useEffect\` that undoes exactly what the effect's setup did, so nothing keeps running or holding a reference after the component unmounts.

| Leak source | Fix |
|---|---|
| \`setInterval\`/\`setTimeout\` never cleared | \`clearInterval\`/\`clearTimeout\` in the cleanup function |
| \`addEventListener\` never removed | \`removeEventListener\` in the cleanup function |
| Subscription/WebSocket left open | \`unsubscribe()\`/\`close()\` in the cleanup function |
| Async request resolving after unmount | \`AbortController\`, aborted in cleanup |

\`\`\`jsx
useEffect(() => {
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize); // undoes exactly what setup did
}, []);
\`\`\`

### Classic interview gotcha

**React 18 removed the "Can't perform a React state update on an unmounted component" warning entirely** — not just changed its wording. The React team found most triggers of that warning weren't real memory leaks at all, and the warning itself pushed people toward defensive "is mounted" checks that often made code worse. The practical implication: a *real* leak (a subscription or timer genuinely still running after unmount) no longer announces itself with a console warning today, making disciplined cleanup functions more important than ever, not less — there's no safety net catching the mistake for you anymore.

**Related:** [How do you fetch data in React hooks?](/interview-prep/ff-react/fetching-data-in-react-hooks) · [What is componentWillUnmount equivalent in hooks?](/interview-prep/ff-react/componentwillunmount-equivalent-in-hooks)

**Sources checked:** github.com/reactwg/react-18/discussions/82 (removal of the unmounted-component warning)`,
    difficulty: "hard",
    companies: ["Amazon", "Uber"],
    orderIndex: 62,
  },
  {
    collection: "ff-react",
    slug: "dependency-injection-pattern-in-react",
    question: "What is the dependency injection pattern in React?",
    answer: `Dependency injection means a component receives what it depends on — a service, an API client, a config object — from outside, rather than constructing it itself. In React, Context is the idiomatic mechanism: a Provider supplies a concrete implementation, and any descendant reads it via \`useContext\` without knowing (or caring) how that implementation was built.

\`\`\`jsx
const ApiClientContext = createContext(realApiClient);

function UserProfile() {
  const api = useContext(ApiClientContext); // doesn't know or care which client this is
  // ...
}

// In a test:
render(
  <ApiClientContext.Provider value={fakeApiClient}>
    <UserProfile />
  </ApiClientContext.Provider>
);
\`\`\`

### Classic interview gotcha

The real, practical benefit here isn't abstract "clean architecture" — it's testability: swapping in a mock implementation via a test-only Provider lets you test a component's actual behavior without hitting a real network or database, with zero test-specific code inside the component itself. This is precisely why "how would you test a component that depends on an API client" and "what is dependency injection in React" are often, in practice, the same interview question wearing two different names.

**Related:** [What is useContext and how does it solve prop drilling?](/interview-prep/ff-react/usecontext-and-prop-drilling) · [What is the Context API and its limitations?](/interview-prep/ff-react/context-api-and-its-limitations)`,
    difficulty: "hard",
    companies: ["Google", "Stripe"],
    orderIndex: 63,
  },
  {
    collection: "ff-react",
    slug: "render-vs-commit-phases-in-react",
    question: "What are render phases in React (render vs commit)?",
    answer: `Rendering splits into two phases. The **render phase** calls component functions and computes what changed — it's interruptible; React can pause it, throw the work away, and restart it if a higher-priority update arrives, all before anything reaches the screen. The **commit phase** actually applies those computed changes to the real DOM — it's always synchronous, and always runs to completion once started, never interrupted.

### Diagram

The same render-phase/commit-phase split already walked through in the Fiber architecture question: units of work processed one at a time, able to yield to the browser and resume, followed by one uninterruptible pass that applies everything to the real DOM.

### Classic interview gotcha

Only the **render phase** is ever affected by concurrent features like transitions — code with a side effect that must run exactly once, in order (an API call, a subscription) belongs in an effect, which runs *after* commit, not directly in a component's body. This is precisely because the render phase can genuinely run more than once for the same eventual output (React may throw away and redo a render before ever committing it) — a component body isn't a safe place for anything that shouldn't happen twice.

**Related:** [What is React Fiber architecture?](/interview-prep/ff-react/react-fiber-architecture-explained) · [What causes unnecessary re-renders in React?](/interview-prep/ff-react/what-causes-unnecessary-re-renders)`,
    difficulty: "hard",
    companies: ["Meta", "Google"],
    orderIndex: 64,
  },
  {
    collection: "ff-react",
    slug: "react-fragment-explained",
    question: "What is a fragment in React and why use it?",
    answer: `\`<React.Fragment>\` (or the \`<>...</>\` shorthand) lets a component return multiple sibling elements without wrapping them in an extra, real DOM node — JSX requires a single root element, and a Fragment satisfies that requirement invisibly, without adding an unnecessary wrapper \`<div>\` to the actual rendered page.

\`\`\`jsx
function UserInfo() {
  return (
    <>
      <dt>Name</dt>
      <dd>Ada Lovelace</dd>
    </>
  ); // no wrapper element added to the DOM
}
\`\`\`

### Classic interview gotcha

The \`<>...</>\` shorthand doesn't accept any props at all, including \`key\` — a list of Fragments that each need a stable key (say, wrapping a \`<dt>\`/\`<dd>\` pair per item in a \`.map()\`) must use the full \`<React.Fragment key={id}>\` form instead. Reaching for the shorthand there produces a "missing key" warning with genuinely no way to fix it without switching to the explicit form.

**Related:** [What are keys in React and why are they important?](/interview-prep/ff-react/keys-in-react-explained)`,
    difficulty: "easy",
    companies: ["Adobe", "Shopify"],
    orderIndex: 65,
  },
  {
    collection: "ff-react",
    slug: "react-children-api-explained",
    question: "What is the React.Children API?",
    answer: `\`React.Children\` (\`map\`, \`forEach\`, \`count\`, \`only\`, \`toArray\`) provides safe ways to iterate over \`props.children\`, which can be a single child, an array, or nested arrays depending on how a component was used — plain array methods break when called directly on \`props.children\` if it isn't already a flat array. **React's own current documentation lists \`Children\` among the legacy APIs and recommends avoiding it in new code** wherever an alternative composition pattern is available.

\`\`\`jsx
function List({ children }) {
  return React.Children.map(children, (child, index) =>
    React.cloneElement(child, { isFirst: index === 0 })
  );
}
\`\`\`

### Classic interview gotcha

\`React.Children\`-based components are fragile in a specific, common way: they typically only work correctly one level deep, so wrapping a child in an intermediate component — even one that just adds a bit of styling — breaks the parent's assumption that every immediate child is exactly the element type it expects to manipulate. This is the concrete reason React's own docs steer new code toward being explicit about what a component accepts (a named prop, a render prop) instead of reaching into and transforming whatever children happen to be passed.

**Related:** [What is the Compound Component pattern?](/interview-prep/ff-react/compound-component-pattern-explained)

**Sources checked:** react.dev/reference/react/Children (listed under Legacy React APIs), react.dev/reference/react/legacy`,
    difficulty: "hard",
    companies: ["Google", "Bloomberg"],
    orderIndex: 66,
  },
  {
    collection: "ff-react",
    slug: "defaultprops-and-typescript-defaults",
    question: "What is defaultProps and how to type defaults in TypeScript?",
    answer: `\`defaultProps\` let a component declare fallback values for props a caller didn't pass. **As of React 19, \`defaultProps\` is ignored entirely on function components** — the same removal as \`propTypes\`. The modern replacement is a plain JavaScript default parameter in the function's own destructuring, paired with an optional field in the TypeScript prop type.

\`\`\`tsx
// Old — silently ignored by React 19+ on function components
Greeting.defaultProps = { name: "Guest" };

// Current — a default parameter, with the prop typed as optional
interface GreetingProps {
  name?: string;
}
function Greeting({ name = "Guest" }: GreetingProps) {
  return <p>Hello, {name}</p>;
}
\`\`\`

### Classic interview gotcha

Leaving an old \`Component.defaultProps = { ... }\` assignment on a React-19 function component doesn't error or warn — it's just silently ignored, which can look like it's still working (if the destructuring separately happens to supply a fallback) while actually being pure dead code doing nothing at all. The default-parameter-plus-optional-type pattern shown above is the complete, current answer — no \`defaultProps\` involved or needed.

**Related:** [Explain PropTypes and TypeScript in React.](/interview-prep/ff-react/proptypes-and-typescript-in-react)`,
    difficulty: "medium",
    companies: ["Microsoft", "Airbnb"],
    orderIndex: 67,
  },
  {
    collection: "ff-react",
    slug: "displayname-property-in-react",
    question: "What is the displayName property in React?",
    answer: `\`Component.displayName\` is a string that overrides the name React DevTools (and error messages) show for a component — useful whenever a component's actual function or variable name would otherwise show up as something unhelpful, like an anonymous function returned from a Higher Order Component or a \`forwardRef\` call.

\`\`\`jsx
function withLoading(Component) {
  function WithLoading(props) {
    return props.isLoading ? <Spinner /> : <Component {...props} />;
  }
  WithLoading.displayName = \`withLoading(\${Component.displayName || Component.name})\`;
  return WithLoading;
}
\`\`\`

### Classic interview gotcha

Without an explicit \`displayName\`, a component created by a HOC or a dynamic factory function often shows up in React DevTools as a generic "Anonymous" or the wrapper's own internal name — a real, common papercut in codebases with several HOCs stacked, making the component tree far harder to navigate while debugging. Setting \`displayName\` explicitly on any HOC's returned component is a small habit with an outsized payoff in debugging speed.

**Related:** [What are Higher Order Components (HOC)?](/interview-prep/ff-react/higher-order-components-explained) · [What is React DevTools and how do you use it?](/interview-prep/ff-react/react-devtools-explained)`,
    difficulty: "medium",
    companies: ["Meta", "Adobe"],
    orderIndex: 68,
  },
  {
    collection: "ff-react",
    slug: "sharing-state-between-siblings",
    question: "How do you share state between sibling components?",
    answer: `Two sibling components can't reference each other's state directly — the state has to move up to their nearest common parent, which then passes the current value down to one sibling as a prop and a callback down to the other, so an action in one sibling updates state that flows back down into the other.

### Diagram

\`SearchBox\` and \`ResultsList\` never reference each other — the shared query state lives in their common parent, which passes the current value down to \`ResultsList\` and an update callback down to \`SearchBox\`.

\`\`\`jsx
function SearchPage() {
  const [query, setQuery] = useState("");
  return (
    <>
      <SearchBox onQueryChange={setQuery} />
      <ResultsList query={query} />
    </>
  );
}
\`\`\`

### Classic interview gotcha

Reaching for Context (or a global store) the moment two siblings need to share *anything* is often overkill — if the sharing is scoped to one small, nearby part of the tree, lifting state to the nearest common parent is simpler, more locally reasoned about, and doesn't add a dependency that components further down the tree have to be aware of. Context earns its place once state needs to reach many components at very different depths, not just two adjacent siblings.

**Related:** [What is lifting state up in React?](/interview-prep/ff-react/lifting-state-up-in-react) · [What is the difference between state and props?](/interview-prep/ff-react/state-vs-props)`,
    difficulty: "medium",
    companies: ["Amazon", "Netflix"],
    orderIndex: 69,
  },
  {
    collection: "ff-react",
    slug: "lifting-state-up-in-react",
    question: "What is lifting state up in React?",
    answer: `Lifting state up means moving a piece of state from a child component to its parent (or a shared ancestor) once more than one component needs to read or change it — the parent then owns the single source of truth and passes it back down as props to whichever children need it.

\`\`\`jsx
function TemperatureConverter() {
  const [celsius, setCelsius] = useState(0); // lifted up from either individual input
  return (
    <>
      <CelsiusInput value={celsius} onChange={setCelsius} />
      <FahrenheitInput value={celsius * 9 / 5 + 32} onChange={(f) => setCelsius((f - 32) * 5 / 9)} />
    </>
  );
}
\`\`\`

### Classic interview gotcha

Lifting state up too eagerly — "just in case something else might need it" — pushes state further from where it's actually used than necessary, forcing every component in between to pass props through that don't apply to them. The right point to lift to is the *nearest* common ancestor that genuinely needs the shared state, not automatically the very top of the tree; over-lifting is the mirror-image mistake of not lifting state at all.

**Related:** [How do you share state between sibling components?](/interview-prep/ff-react/sharing-state-between-siblings) · [What is the difference between state and props?](/interview-prep/ff-react/state-vs-props)`,
    difficulty: "medium",
    companies: ["Google", "Shopify"],
    orderIndex: 70,
  },
  {
    collection: "ff-react",
    slug: "global-state-without-redux",
    question: "How do you implement global state without Redux?",
    answer: `Combining \`useContext\` with \`useReducer\` — a Provider exposing both the current state and a \`dispatch\` function — gives you Redux's core shape (a single source of truth, updates via dispatched actions) without adding a library. For genuinely broad, frequently-read global state, a minimal library like Zustand gives the same result with less boilerplate and, critically, built-in selective subscriptions that Context's own consumers don't get for free.

\`\`\`jsx
const StoreContext = createContext(null);

function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

function useStore() {
  return useContext(StoreContext);
}
\`\`\`

### Classic interview gotcha

A Context-plus-\`useReducer\` "global store" inherits Context's all-or-nothing re-render behavior — every consumer re-renders on any dispatched action, not just the slice of state it actually reads — unless you deliberately split it into multiple, narrower contexts yourself. This is exactly the tradeoff that makes Zustand (or another external-store library) attractive once the store grows large: it gives selective subscriptions out of the box, without requiring you to hand-split contexts to get the same benefit.

**Related:** [What is useContext and how does it solve prop drilling?](/interview-prep/ff-react/usecontext-and-prop-drilling) · [What is Zustand and how does it compare to Redux?](/interview-prep/ff-react/zustand-vs-redux)`,
    difficulty: "medium",
    companies: ["Meta", "Uber"],
    orderIndex: 71,
  },
  {
    collection: "ff-react",
    slug: "provider-pattern-explained",
    question: "What is the Provider pattern?",
    answer: `The Provider pattern wraps part of a component tree in a component — typically backed by Context — that supplies a value (a theme, the authenticated user, a store) to every descendant that asks for it via \`useContext\`, without that value being threaded explicitly through every intermediate component's props.

\`\`\`jsx
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Page /> {/* reads theme and auth via useContext, no matter how deep */}
      </AuthProvider>
    </ThemeProvider>
  );
}
\`\`\`

### Classic interview gotcha

Nesting several unrelated Providers (theme, auth, locale, a data store) at the top of an app is a common, real source of "Provider pyramid" — a wall of nested wrapper components that's purely structural noise, with no behavioral purpose beyond composing several unrelated concerns. A small \`composeProviders\` helper, or a single \`AppProviders\` component that nests them internally, keeps the top of the tree readable without changing behavior at all.

**Related:** [What is useContext and how does it solve prop drilling?](/interview-prep/ff-react/usecontext-and-prop-drilling) · [How do you implement global state without Redux?](/interview-prep/ff-react/global-state-without-redux)`,
    difficulty: "medium",
    companies: ["Airbnb", "Bloomberg"],
    orderIndex: 72,
  },
  {
    collection: "ff-react",
    slug: "undo-redo-in-react",
    question: "How do you implement undo/redo in React?",
    answer: `The standard model keeps three pieces of state: a "past" stack of prior states, the single "present" state currently rendered, and a "future" stack of states that were undone. Undo moves the present state onto the front of future and pulls the most recent entry off past into present; redo does the mirror image; any new edit clears the future stack entirely, since you can't redo into a timeline that no longer exists.

### Diagram

Undo pops the top of the past stack into present and pushes the old present onto future; redo does the reverse. Making a fresh edit wipes the future stack completely.

\`\`\`jsx
function historyReducer(state, action) {
  switch (action.type) {
    case "SET":
      return { past: [...state.past, state.present], present: action.value, future: [] }; // clears future
    case "UNDO": {
      if (!state.past.length) return state;
      const previous = state.past[state.past.length - 1];
      return { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future] };
    }
    case "REDO": {
      if (!state.future.length) return state;
      const next = state.future[0];
      return { past: [...state.past, state.present], present: next, future: state.future.slice(1) };
    }
    default:
      return state;
  }
}
\`\`\`

### Classic interview gotcha

Forgetting to clear the future stack on a new edit is the most common real bug — without it, redoing after a fresh change can resurrect a state from a branch of history that's no longer consistent with what actually happened, producing a genuinely confusing UI bug that's hard to reproduce reliably. Every new edit must explicitly wipe \`future\`, not just push onto \`past\`.

**Related:** [What is useReducer and when to prefer it over useState?](/interview-prep/ff-react/usereducer-vs-usestate)`,
    difficulty: "hard",
    companies: ["Adobe", "Figma"],
    orderIndex: 73,
  },
  {
    collection: "ff-react",
    slug: "event-pooling-in-older-react-versions",
    question: "What is event pooling in older React versions?",
    answer: `In React 16 and earlier, \`SyntheticEvent\` objects were pooled — reused across multiple events and nulled out immediately after the handler receiving them finished running — as a performance optimization. This meant reading an event's properties asynchronously (inside a \`setTimeout\`, or after an \`await\`) silently returned \`null\`/\`undefined\` unless \`event.persist()\` was called first. **React 17 removed event pooling entirely** — every \`SyntheticEvent\` today is a fresh object, safe to read at any point, with \`event.persist()\` reduced to a no-op kept only for backward compatibility.

\`\`\`jsx
// Pre-React-17: required event.persist() to read the event asynchronously
function handleClick(e) {
  e.persist();
  setTimeout(() => console.log(e.target.value), 1000); // would be null without persist()
}

// React 17+: works with no extra step — pooling no longer exists
function handleClick(e) {
  setTimeout(() => console.log(e.target.value), 1000); // just works
}
\`\`\`

### Classic interview gotcha

This question sometimes gets asked expecting an explanation of how to correctly use \`event.persist()\` today — the precise, current answer is that it's unnecessary and does nothing in any actively-maintained React version, since pooling itself was removed in React 17. Presenting \`event.persist()\` as a relevant technique for writing new code is itself the outdated answer here.

**Sources checked:** legacy.reactjs.org/docs/legacy-event-pooling.html, blog.saeloun.com (React 17 removes event pooling in modern browsers)`,
    difficulty: "hard",
    companies: ["Google", "Netflix"],
    orderIndex: 74,
  },
  {
    collection: "ff-react",
    slug: "animating-elements-in-react",
    question: "How do you animate elements in React?",
    answer: `Options span simplest to most capable: plain CSS transitions/animations triggered by a class or inline style change (no library, best performance, limited to simple cases); \`react-transition-group\` for coordinating enter/exit animations with component mount/unmount; and Motion (the library formerly known as Framer Motion) for complex, physics-based, gesture-driven, or layout animations with a fully declarative React API.

\`\`\`jsx
// Plain CSS transition — no library
<div className={isOpen ? "panel panel--open" : "panel"} />

// Motion (formerly Framer Motion)
import { motion } from "motion/react";
<motion.div animate={{ opacity: isOpen ? 1 : 0 }} transition={{ duration: 0.2 }} />
\`\`\`

### Classic interview gotcha

Animating layout-affecting CSS properties (\`width\`, \`height\`, \`top\`/\`left\`, \`margin\`) forces the browser to recalculate layout on every single frame, which is measurably more expensive than animating \`transform\` and \`opacity\` — properties the browser can typically animate on the compositor thread without touching layout at all. A common, real performance mistake is animating \`top\`/\`left\` to move an element when \`transform: translate(...)\` would produce the identical visual result far more cheaply.

**Related:** [What is Framer Motion?](/interview-prep/ff-react/what-is-framer-motion-explained)`,
    difficulty: "medium",
    companies: ["Airbnb", "Figma"],
    orderIndex: 75,
  },
  {
    collection: "ff-react",
    slug: "what-is-framer-motion-explained",
    question: "What is Framer Motion?",
    answer: `**Framer Motion was renamed to Motion in 2025** when it became an independent project — the package moved from \`framer-motion\` to \`motion\` on npm, with the recommended import path now \`motion/react\` (the old \`framer-motion\` package still works but is no longer actively developed). It's a declarative animation library: wrapping an element in \`<motion.div>\` with \`initial\`/\`animate\`/\`exit\` props lets you describe target animation states rather than manually orchestrating keyframes or transitions, with built-in support for gestures, drag, and layout animations.

\`\`\`jsx
import { motion, AnimatePresence } from "motion/react";

<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>
\`\`\`

### Classic interview gotcha

A question phrased around "Framer Motion" today is quietly testing whether a candidate knows about the rename — confidently talking about "framer-motion" without acknowledging the current \`motion\` package name and \`motion/react\` import path is a real, visible signal of stale knowledge to an interviewer who's used the library recently, similar in spirit to still calling it "React Query" instead of "TanStack Query."

**Related:** [How do you animate elements in React?](/interview-prep/ff-react/animating-elements-in-react)

**Sources checked:** motion.dev (formerly framer.com/motion), fireup.pro coverage of the framer-motion → Motion rebrand (2025)`,
    difficulty: "medium",
    companies: ["Vercel", "Adobe"],
    orderIndex: 76,
  },
  {
    collection: "ff-react",
    slug: "drag-and-drop-in-react",
    question: "How do you implement drag and drop in React?",
    answer: `The browser's native HTML Drag and Drop API (\`draggable\`, \`onDragStart\`/\`onDragOver\`/\`onDrop\`) works but is famously awkward and inconsistent across browsers, especially for accessibility. **\`@dnd-kit\` is the standard current choice** for building drag-and-drop interfaces in React — it ships built-in keyboard and screen-reader support (arrow keys move a dragged item, Escape cancels) that native HTML drag-and-drop, and older libraries like \`react-dnd\` or the now-deprecated \`react-beautiful-dnd\`, don't provide out of the box.

\`\`\`jsx
import { DndContext } from "@dnd-kit/core";

function Board() {
  return (
    <DndContext onDragEnd={(event) => handleDrop(event.active.id, event.over?.id)}>
      <DraggableCard id="card-1" />
      <DroppableColumn id="column-a" />
    </DndContext>
  );
}
\`\`\`

### Classic interview gotcha

Choosing a drag-and-drop approach based purely on visual behavior and skipping accessibility entirely is a common, real oversight — native HTML drag-and-drop (and many older libraries) work fine with a mouse but are effectively unusable via keyboard alone, locking keyboard-only and screen-reader users out of an interaction pattern (reordering a list, moving a card between columns) that usually has no non-drag fallback. This is exactly why \`@dnd-kit\`'s built-in keyboard sensor is treated as a core feature of the library, not a nice-to-have add-on.

**Sources checked:** dndkit.com, pkgpulse.com's 2026 comparison of dnd-kit vs. react-beautiful-dnd vs. Pragmatic DnD (react-beautiful-dnd deprecated, uncertain React 19 compatibility)`,
    difficulty: "hard",
    companies: ["Notion", "Atlassian"],
    orderIndex: 77,
  },
  {
    collection: "ff-react",
    slug: "ssr-vs-csr-vs-ssg",
    question: "What is the difference between SSR, CSR, and SSG?",
    answer: `The three differ in **when** a page's HTML actually gets built. Client-Side Rendering (CSR) builds it in the browser, after a near-empty HTML shell and the JS bundle both download. Server-Side Rendering (SSR) builds it on the server, fresh, for every single request. Static Site Generation (SSG) builds it once, ahead of time, at build time, and serves that same pre-built file to every visitor.

### Diagram

CSR: browser requests the page, an empty shell plus JS downloads, then JS builds the page in the browser. SSR: the server renders HTML for that specific request before responding. SSG: the page was already built once, at build time — the server just serves the file.

| | CSR | SSR | SSG |
|---|---|---|---|
| When HTML is built | In the browser, after load | Per request, on the server | Once, at build time |
| First paint speed | Slowest (blank shell first) | Fast | Fastest (pre-built) |
| Data freshness | Always current | Always current | Fixed at build time (unless ISR) |
| Server load per request | None (static assets only) | One render per request | None (serves a static file) |

### Classic interview gotcha

Incremental Static Regeneration exists specifically to blur SSG's "fixed at build time" limitation — regenerating a static page on a schedule or on demand gives most of SSG's speed with data that doesn't go permanently stale. This is exactly why the real-world SSR-vs-SSG choice in a modern Next.js app is rarely as binary as this question's three-way framing suggests — ISR sits deliberately between the two.

**Related:** [What is server-side rendering (SSR) in React?](/interview-prep/ff-react/server-side-rendering-in-react) · [What is hydration in React?](/interview-prep/ff-react/hydration-in-react-explained)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Vercel", "Meta"],
    isFf75: true,
    orderIndex: 78,
  },
  {
    collection: "ff-react",
    slug: "react-server-components-explained",
    question: "What is React Server Components (RSC)?",
    answer: `Server Components run only on the server and never ship any JavaScript to the browser for themselves — they can read data directly (a database, the filesystem) and render straight to a special RSC payload format the client reconstructs into UI. Client Components — any file marked \`"use client"\` — are the only parts of the tree that actually hydrate and ship JavaScript, reserved for whatever genuinely needs interactivity, local state, or browser-only APIs.

### Diagram

\`Page\` and \`ProductList\` are Server Components — rendered entirely on the server, zero JS shipped for them. \`AddToCartButton\`, marked \`"use client"\`, is the only part of the tree that hydrates and becomes interactive in the browser.

\`\`\`jsx
// Server Component — reads data directly, ships no JS
async function ProductList() {
  const products = await db.query("SELECT * FROM products");
  return products.map((p) => <ProductCard key={p.id} product={p} />);
}

// Client Component — the interactive boundary
"use client";
function AddToCartButton({ productId }) {
  const [isAdding, setIsAdding] = useState(false);
  return <button onClick={() => setIsAdding(true)}>Add to cart</button>;
}
\`\`\`

### Classic interview gotcha

\`"use client"\` doesn't mean "this component only runs in the browser" — a Client Component still renders on the server for the initial HTML (for fast first paint and SEO), it's just *also* sent to and hydrated in the browser afterward, unlike a Server Component, which never ships its code to the client at all. The directive marks a **boundary** — everything below it in the tree can use browser APIs, state, and effects — not a statement about where rendering happens.

**Related:** [What is the difference between SSR, CSR, and SSG?](/interview-prep/ff-react/ssr-vs-csr-vs-ssg) · [What is hydration in React?](/interview-prep/ff-react/hydration-in-react-explained) · [What is server-side rendering (SSR) in React?](/interview-prep/ff-react/server-side-rendering-in-react)

**Sources checked:** react.dev Server Components documentation, Next.js App Router docs (RSC as the default, mainstream adoption by 2026)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Vercel", "Meta"],
    isFf75: true,
    orderIndex: 79,
  },
  {
    collection: "ff-react",
    slug: "rules-of-hooks-explained",
    question: "What are the rules of hooks?",
    answer: `Two rules, enforced by \`eslint-plugin-react-hooks\`'s \`rules-of-hooks\` lint rule: only call hooks at the top level of a component or another hook — never inside a condition, loop, or nested function — and only call hooks from React function components or custom hooks, never from a plain JavaScript function or a class component.

\`\`\`jsx
// Breaks the rule — a hook inside a condition
function Bad({ shouldTrack }) {
  if (shouldTrack) {
    useEffect(() => track(), []); // ESLint error
  }
}

// Fixed — the hook always runs; the condition moves inside it
function Good({ shouldTrack }) {
  useEffect(() => {
    if (shouldTrack) track();
  }, [shouldTrack]);
}
\`\`\`

### Classic interview gotcha

The top-level rule exists because React tracks each hook by **call order**, not by name — on every render, React matches the nth \`useState\` call to the nth \`useState\` call from the previous render. Wrapping a hook in a condition means it might run on some renders and not others, shifting every subsequent hook's position and silently associating the wrong stored state with the wrong hook call. This is exactly why the fix is always "move the condition inside the hook's own logic" — never "conditionally call the hook itself."

**Related:** [What is the exhaustive-deps ESLint rule?](/interview-prep/ff-react/exhaustive-deps-eslint-rule)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Meta", "Google"],
    isFf75: true,
    orderIndex: 80,
  },
  {
    collection: "ff-react",
    slug: "use-hook-in-react-19",
    question: "What is the use() hook in React 19?",
    answer: `\`use(resource)\` reads the value of a Promise or a Context at render time. Unlike every actual hook, \`use\` **isn't bound by the Rules of Hooks** — it can be called conditionally, inside a loop, or after an early return, because React tracks it by reference (the specific Promise or Context object passed in), not by call order the way \`useState\`/\`useEffect\` are tracked.

\`\`\`jsx
function Comments({ commentsPromise }) {
  if (!commentsPromise) return null;
  const comments = use(commentsPromise); // suspends until resolved; called after an early return — fine for use()
  return comments.map((c) => <Comment key={c.id} {...c} />);
}

function Message({ show }) {
  const theme = show ? use(ThemeContext) : "light"; // called conditionally — also fine for use()
}
\`\`\`

### Classic interview gotcha

A Promise passed to \`use()\` must be the **same Promise instance** across re-renders — creating a brand-new Promise directly inside the component body on every render (calling \`fetch()\` inline, for instance) causes React to suspend again on every single render, an infinite loop of showing the Suspense fallback. The Promise needs to be created once outside the component, cached by a library like TanStack Query, or passed down from a Server Component — never created fresh inline in a Client Component's render.

**Related:** [What is Suspense in React?](/interview-prep/ff-react/what-is-suspense-in-react) · [What are the rules of hooks?](/interview-prep/ff-react/rules-of-hooks-explained)

**Sources checked:** react.dev/reference/react/use`,
    difficulty: "hard",
    companies: ["Meta", "Vercel"],
    orderIndex: 81,
  },
  {
    collection: "ff-react",
    slug: "react-compiler-react-forget-explained",
    question: "What is the React Compiler (React Forget)?",
    answer: `The React Compiler — codenamed "React Forget" during its development, now shipped simply as "React Compiler" — is a build-time tool that statically analyzes component code and automatically inserts the equivalent of \`useMemo\`/\`useCallback\`/\`React.memo\` wherever it can prove doing so is safe. It went stable at v1.0 in October 2025 — independently versioned from React itself, and officially supports React 17+ (there is no "React 20", and the compiler isn't tied to the React 19.x line specifically).

\`\`\`jsx
// You write plain code — no manual memoization
function ProductList({ products, query }) {
  const filtered = products.filter((p) => p.name.includes(query));
  return filtered.map((p) => <Product key={p.id} {...p} />);
}
// The compiler inserts the equivalent of useMemo/React.memo automatically at build time
\`\`\`

### Classic interview gotcha

The compiler requires code to actually follow the Rules of Hooks and treat props/state as immutable in order to safely apply its optimizations — a component that mutates props or state directly, or breaks the rules of hooks, isn't safely optimizable, and the compiler is designed to simply **skip** memoizing anything it can't prove is safe, rather than silently producing incorrect behavior. This is exactly why "just enable the compiler" doesn't retroactively fix a codebase with existing mutation bugs — it declines to help until those are fixed, it doesn't paper over them.

**Related:** [What is useMemo and when should you use it?](/interview-prep/ff-react/usememo-when-to-use) · [What is useCallback and how does it prevent re-renders?](/interview-prep/ff-react/usecallback-and-re-renders) · [What is React.memo and how does it work?](/interview-prep/ff-react/react-memo-explained)

**Sources checked:** react.dev React Compiler documentation, react.dev/blog (React Compiler v1.0 stable, October 2025)`,
    difficulty: "hard",
    companies: ["Meta", "Vercel"],
    orderIndex: 82,
  },
  {
    collection: "ff-react",
    slug: "handling-authentication-in-react",
    question: "How do you handle authentication in React?",
    answer: `The common shape: an auth Provider (backed by Context) holds the current user/session and exposes \`login\`/\`logout\` functions, a token or session is stored appropriately, and protected routes or components check that auth state before rendering anything sensitive.

\`\`\`jsx
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const login = async (credentials) => setUser(await api.login(credentials));
  const logout = () => { api.logout(); setUser(null); };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
\`\`\`

### Classic interview gotcha

Storing a JWT or session token in \`localStorage\` — a very common pattern in tutorials — is directly readable by any JavaScript running on the page, meaning a single XSS vulnerability *anywhere* in the app can exfiltrate every user's auth token. An \`httpOnly\` cookie, which JavaScript can't read at all, is the standard defense against exactly that failure mode, at the cost of the server needing to set and manage it rather than the client.

**Related:** [What is the protected routes pattern in React Router?](/interview-prep/ff-react/protected-routes-pattern-in-react-router)`,
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 83,
  },
  {
    collection: "ff-react",
    slug: "protected-routes-pattern-in-react-router",
    question: "What is the protected routes pattern in React Router?",
    answer: `A wrapper component (or layout route) checks the current auth state and either renders the requested route's content via \`<Outlet />\` or redirects to a login page via \`<Navigate />\` — applied once at the routing layer instead of duplicating an auth check inside every protected page individually.

\`\`\`jsx
function ProtectedRoute() {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />; // renders the actual nested route
}

<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
\`\`\`

### Classic interview gotcha

Redirecting with \`<Navigate to="/login" replace />\` — not a plain \`<Navigate to="/login" />\` — genuinely matters: without \`replace\`, the unauthenticated attempt to view the protected page stays in browser history, so pressing the back button after logging in bounces the user right back to the redirect instead of skipping past it entirely (see the dedicated push-vs-replace question for why).

**Related:** [What is the difference between push and replace in routing?](/interview-prep/ff-react/push-vs-replace-in-routing) · [How do you handle authentication in React?](/interview-prep/ff-react/handling-authentication-in-react)`,
    difficulty: "medium",
    companies: ["Amazon", "Netflix"],
    orderIndex: 84,
  },
  {
    collection: "ff-react",
    slug: "react-router-v6-and-its-changes",
    question: "What is React Router v6 and its changes?",
    answer: `React Router v6 (released 2021) replaced v5's component-based routing (\`<Switch>\`, render-prop routes) with element-based routes (\`<Routes>\`, \`<Route element={...} />\`), added relative nested routing and layout routes, and introduced hooks like \`useNavigate\` (replacing the old \`history\` prop) and \`useParams\`. **As of 2026, React Router v6 itself is end-of-life** — Remix merged into React Router, what would have been Remix v3 shipped as React Router v7, and React Router v8 is the current version; v6 no longer receives security patches.

\`\`\`jsx
// v5
<Switch>
  <Route path="/user/:id" component={User} />
</Switch>

// v6 — element-based, with useParams instead of route props
<Routes>
  <Route path="/user/:id" element={<User />} />
</Routes>
function User() {
  const { id } = useParams();
}
\`\`\`

### Classic interview gotcha

This question is frequently asked as if v6 is still the current, latest version — the accurate, current answer states v6's real historical changes (genuinely useful, since plenty of production code still runs on it) but names the current status plainly: **React Router v8 is current as of 2026**, having absorbed Remix's framework-mode capabilities through the v7 merger, and any new project should start there instead of treating v6 as the modern baseline.

**Related:** [What is the protected routes pattern in React Router?](/interview-prep/ff-react/protected-routes-pattern-in-react-router)

**Sources checked:** remix.run/blog (React Router v7, React Router v8, the Remix/React Router merger), reactrouter.com`,
    difficulty: "medium",
    companies: ["Meta", "Shopify"],
    orderIndex: 85,
  },
  {
    collection: "ff-react",
    slug: "implementing-breadcrumbs-in-react",
    question: "How do you implement breadcrumbs in React?",
    answer: `Derive the breadcrumb trail directly from the current route rather than maintaining it as separate state — splitting the current pathname into segments and matching each prefix against your route config (or, in a file-based router, deriving labels from route metadata) keeps breadcrumbs automatically in sync with actual navigation, with nothing separate to fall out of date.

\`\`\`jsx
function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((_, i) => "/" + segments.slice(0, i + 1).join("/"));
  return crumbs.map((path) => <Link key={path} to={path}>{routeLabels[path]}</Link>);
}
\`\`\`

### Classic interview gotcha

Hand-maintaining a separate array of breadcrumb labels in component state is a common approach that reliably drifts out of sync with the actual URL the moment a route changes without someone remembering to update the array too. Deriving breadcrumbs from the route itself — the URL is already the single source of truth for "where am I" — eliminates that entire class of bug structurally, rather than relying on developer discipline to keep two representations in sync.`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Adobe", "Bloomberg"],
    orderIndex: 86,
  },
  {
    collection: "ff-react",
    slug: "push-vs-replace-in-routing",
    question: "What is the difference between push and replace in routing?",
    answer: `\`push\` adds a brand-new entry to the browser's history stack, so pressing back returns to the previous page. \`replace\` overwrites the current entry in place, so pressing back skips straight past the replaced page entirely, as if it had never been visited.

### Diagram

Navigating from \`/cart\` to \`/checkout\` with push adds a new entry — back returns to \`/cart\`. The same navigation with replace overwrites the \`/cart\` entry — back skips it entirely.

\`\`\`jsx
navigate("/checkout");                    // push (default) — adds a new entry
navigate("/checkout", { replace: true }); // replace — overwrites the current entry
\`\`\`

### Classic interview gotcha

Using \`push\` for a navigation that should never be a distinct "back" destination — a redirect after login, a form auto-advancing to a success step — leaves an awkward, low-value entry in history: the user hits back expecting to return to the previous *meaningful* page and instead lands right back on the redirect or interstitial they just passed through. \`replace\` is the fix specifically for navigations that represent "correcting" or "completing" the current step, rather than a genuine new page the user would ever want to return to.

**Related:** [What is the protected routes pattern in React Router?](/interview-prep/ff-react/protected-routes-pattern-in-react-router)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Google", "Uber"],
    orderIndex: 87,
  },
  {
    collection: "ff-react",
    slug: "handling-404-pages-in-react",
    question: "How do you handle 404 pages in React?",
    answer: `A catch-all route — a wildcard path like \`"*"\` in React Router, placed **last** in the route list — renders a \`NotFound\` component for any URL that doesn't match a real route. It's matched only after every real route has already failed to match, so it acts as a fallback rather than a competing route.

\`\`\`jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="*" element={<NotFound />} /> {/* must come last */}
</Routes>
\`\`\`

### Classic interview gotcha

The catch-all route's **position** in the route list matters — React Router matches routes in the order they're defined (within the same nesting level), so placing the wildcard route anywhere *before* a real route would shadow that real route entirely, matching the 404 page for a URL that actually has a legitimate destination.`,
    difficulty: "easy",
    isPremium: true,
    companies: ["Meta", "Airbnb"],
    orderIndex: 88,
  },
  {
    collection: "ff-react",
    slug: "accessibility-a11y-in-react",
    question: "What is Accessibility (a11y) in React?",
    answer: `Accessibility means building UI usable by people relying on assistive technology — screen readers, keyboard-only navigation, voice control. In React specifically, this means preferring semantic HTML elements over generic \`<div>\`s wherever possible, keeping focus management correct after route changes and modal open/close, ensuring every interactive element is keyboard-operable, and using ARIA attributes only to fill genuine gaps semantic HTML can't cover on its own.

| Concern | React-specific consideration |
|---|---|
| Semantic HTML | Prefer \`<button>\`/\`<nav>\`/\`<main>\` over a generic \`<div onClick>\` |
| Focus management | Move focus explicitly on route change / modal open, restore it on close |
| Keyboard operability | Every mouse interaction needs a keyboard equivalent |
| ARIA | Use only to fill gaps — a native element with correct semantics needs none |

### Classic interview gotcha

Reaching for ARIA attributes as the *default* way to "add accessibility" is backwards — the first rule of ARIA is not to use ARIA at all if a native HTML element already provides the needed semantics and behavior for free. A \`<button>\` already has the correct role, is keyboard-operable, and is focusable; a \`<div role="button">\` needs all of that re-implemented by hand, and it's easy to miss one piece. ARIA exists to describe things HTML genuinely has no native element for, not as a first-resort replacement for semantic markup.

**Related:** [What is ARIA in React?](/interview-prep/ff-react/aria-in-react)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Microsoft", "Adobe"],
    orderIndex: 89,
  },
  {
    collection: "ff-react",
    slug: "aria-in-react",
    question: "What is ARIA in React?",
    answer: `ARIA (Accessible Rich Internet Applications) attributes describe a component's role, state, and properties to assistive technology when semantic HTML alone doesn't convey it. In JSX, ARIA attributes are written exactly as their HTML spelling — \`aria-label\`, \`aria-expanded\`, \`aria-hidden\` — unlike most DOM attributes, which React camelCases.

\`\`\`jsx
function Dropdown({ isOpen, onToggle }) {
  return (
    <>
      <button aria-expanded={isOpen} aria-haspopup="listbox" onClick={onToggle}>
        Options
      </button>
      {isOpen && <ul role="listbox">...</ul>}
    </>
  );
}
\`\`\`

### Classic interview gotcha

ARIA attributes only *describe* state to assistive technology — setting \`aria-expanded={isOpen}\` doesn't make anything actually expand, collapse, or become keyboard-operable; the real behavior (conditional rendering, handling Escape/arrow keys, managing focus) still has to be implemented separately. A common, real bug is setting the "correct" ARIA attributes on a component that doesn't actually behave the way those attributes claim — arguably worse for screen reader users than no ARIA at all, since it actively promises behavior that isn't there.

**Related:** [What is Accessibility (a11y) in React?](/interview-prep/ff-react/accessibility-a11y-in-react)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Google", "Salesforce"],
    orderIndex: 90,
  },
  {
    collection: "ff-react",
    slug: "synthetic-events-in-react",
    question: "What are synthetic events in React?",
    answer: `A \`SyntheticEvent\` is React's cross-browser wrapper around the browser's native event object, normalizing inconsistent native event APIs into one consistent interface regardless of browser. Rather than attaching a listener to every individual DOM node, React attaches one listener per event type to the root container (as of React 17 — earlier versions attached to \`document\`) and dispatches to the correct handler by walking the **React component tree**, not the DOM tree.

### Diagram

A native click bubbles to the root container, gets wrapped as a normalized \`SyntheticEvent\`, and is dispatched to the correct handler by walking the component tree rather than the DOM tree.

\`\`\`jsx
function Button({ onClick }) {
  return <button onClick={(e) => {
    onClick(e);           // e is a SyntheticEvent, not the raw native event
    console.log(e.nativeEvent); // the underlying native event, if you need it directly
  }} />;
}
\`\`\`

### Classic interview gotcha

Because dispatch follows the *component* tree rather than the DOM tree, a Portal-rendered element's events still bubble to a real ancestor's handler in the component tree, even though the actual DOM node isn't nested inside that ancestor's DOM node at all (see the Portal question). Worth naming precisely: **React 17 changed where the delegated listener attaches** — from \`document\` to the root container — specifically to make embedding multiple React versions, or React inside a non-React app, safer and more predictable.

**Related:** [What is React Portal and when would you use it?](/interview-prep/ff-react/react-portal-explained) · [What is event pooling in older React versions?](/interview-prep/ff-react/event-pooling-in-older-react-versions)

**Sources checked:** bigbinary.com/blog (React 17 delegates events to root instead of document)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Meta", "Netflix"],
    orderIndex: 91,
  },
  {
    collection: "ff-react",
    slug: "memoization-in-react-and-when-to-avoid-it",
    question: "What is memoization in React and when to avoid it?",
    answer: `Memoization means caching a computed value (\`useMemo\`), a function reference (\`useCallback\`), or a whole component's rendered output (\`React.memo\`) so it isn't recomputed or recreated unless its actual inputs changed — and, as of the stable React Compiler, most of this is now applied automatically rather than written by hand.

| Situation | Memoize? |
|---|---|
| Genuinely expensive computation (sorting/filtering a large list) | Yes — helps |
| Value/function passed to a memoized child or an effect dependency | Yes — referential stability matters |
| Cheap computation (adding two numbers, a short template string) | No — memoizing costs more than it saves |
| Props/values that are never referentially stable to begin with | No — can't skip anything, pure overhead |

### Classic interview gotcha

Memoizing everything by default is a genuinely common mistake — every \`useMemo\`/\`useCallback\`/\`React.memo\` call has its own small bookkeeping cost (storing previous inputs, comparing them every render), so wrapping cheap, rarely-changing computations "just in case" can make a component measurably *slower*, not just neutral. The right approach: measure with the Profiler first, then memoize specifically what's shown to be expensive — or, on a codebase with the React Compiler enabled, mostly stop reaching for manual memoization at all.

**Related:** [What is useMemo and when should you use it?](/interview-prep/ff-react/usememo-when-to-use) · [What is the Profiler API in React?](/interview-prep/ff-react/profiler-api-in-react)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Meta", "Bloomberg"],
    orderIndex: 92,
  },
  {
    collection: "ff-react",
    slug: "implementing-a-design-system-in-react",
    question: "How do you implement a design system in React?",
    answer: `A design system in React is usually a small set of layered pieces: design tokens (colors, spacing, typography — as CSS variables or a theme object) as the single source of truth, low-level primitive components built directly on those tokens (\`Button\`, \`Input\`, \`Stack\`), and higher-level composed components built only from those primitives — with Storybook (or a similar tool) documenting every component's variants in isolation, and visual regression testing catching unintended visual drift as the system evolves.

\`\`\`jsx
// Token
const spacing = { sm: "8px", md: "16px", lg: "24px" };

// Primitive built on the token
function Stack({ gap = "md", children }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: spacing[gap] }}>{children}</div>;
}
\`\`\`

### Classic interview gotcha

A design system that lets consumers pass arbitrary \`className\`/\`style\` overrides onto every component quietly becomes unenforceable within a release or two — once overrides accumulate app-wide, the system stops actually guaranteeing visual consistency, which was the entire point of building it. Disciplined systems instead expose a constrained set of variant props (\`size="sm" | "md" | "lg"\`, not an open \`className\` escape hatch) and treat "needing an override" as a signal the system is missing a variant, not something to silently work around.

**Related:** [What is Storybook and why use it?](/interview-prep/ff-react/what-is-storybook-and-why-use-it)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Airbnb", "Shopify"],
    orderIndex: 93,
  },
  {
    collection: "ff-react",
    slug: "what-is-storybook-and-why-use-it",
    question: "What is Storybook and why use it?",
    answer: `Storybook is a tool for developing and documenting UI components in isolation — each "story" renders one component in one specific state or prop combination, outside the full application, letting you build, visually test, and showcase every variant (loading, error, empty, populated) without needing to navigate the real app into that exact state first.

\`\`\`jsx
// Button.stories.tsx
export default { component: Button };

export const Primary = { args: { variant: "primary", children: "Click me" } };
export const Loading = { args: { variant: "primary", isLoading: true } };
\`\`\`

### Classic interview gotcha

Storybook's real, ongoing value is as a **regression-prevention** tool via visual testing (Chromatic or a similar visual-diffing integration), not just a component gallery — without automated visual diffing wired in, stories tend to silently go stale, still rendering but no longer matching what the component actually looks like after an unrelated CSS change, since nothing forces anyone to notice or update them.

**Related:** [How do you implement a design system in React?](/interview-prep/ff-react/implementing-a-design-system-in-react)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Meta", "Vercel"],
    orderIndex: 94,
  },
  {
    collection: "ff-react",
    slug: "writing-a-custom-renderer-in-react",
    question: "How do you write a custom renderer in React?",
    answer: `React's reconciliation algorithm is deliberately decoupled from any specific rendering target: \`react-dom\` targets the browser DOM, \`react-native\` targets native mobile views, and a custom renderer built on the \`react-reconciler\` package can target anything else entirely — \`react-three-fiber\` renders to WebGL/Three.js scenes, \`Ink\` renders to a terminal — by implementing a small "host config" of primitive operations (\`createInstance\`, \`appendChild\`, \`commitUpdate\`) that the shared reconciler calls into.

### Diagram

\`react-dom\`, \`react-native\`, \`react-three-fiber\`, and \`Ink\` all plug their own host config into the same shared core reconciler — none of them re-implement the diffing algorithm itself.

\`\`\`js
const hostConfig = {
  createInstance(type, props) { /* create a node for your target */ },
  appendChild(parent, child) { /* attach it */ },
  commitUpdate(instance, updatePayload) { /* apply changed props */ },
  // ...the reconciler calls these; you never implement diffing yourself
};
const MyRenderer = ReactReconciler(hostConfig);
\`\`\`

### Classic interview gotcha

\`react-reconciler\`'s own package documentation describes its API as explicitly **less stable** than \`react-dom\` or \`react-native\`'s — it's intentionally positioned as an experimental, lower-level building block, not a beginner-friendly public API. Writing a real custom renderer means depending on internal-ish surface area that can shift between React versions more than the framework's actual public API does — a real tradeoff worth naming, not a detail to gloss over.

**Related:** [What is React Fiber architecture?](/interview-prep/ff-react/react-fiber-architecture-explained) · [What is reconciliation in React?](/interview-prep/ff-react/what-is-reconciliation-in-react)

**Sources checked:** npmjs.com/package/react-reconciler (explicit API-stability disclaimer), react-three-fiber and Ink as real production custom renderers`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Meta", "Vercel"],
    orderIndex: 95,
  },
  {
    collection: "ff-react",
    slug: "react-dom-vs-react",
    question: "What is react-dom vs react?",
    answer: `\`react\` is the core library — component definitions, hooks, the reconciliation algorithm, all entirely renderer-agnostic. \`react-dom\` is the renderer that actually targets web browsers, providing \`createRoot\`/\`hydrateRoot\` and translating React's internal instructions into real DOM operations. This split is exactly what allows \`react-native\`, \`react-three-fiber\`, and other custom renderers to reuse \`react\`'s core while swapping out \`react-dom\` for a completely different target.

\`\`\`js
import { useState } from "react";              // core — works with any renderer
import { createRoot } from "react-dom/client"; // the browser-specific renderer
\`\`\`

### Classic interview gotcha

A common early confusion is not realizing these are two entirely separate packages with two separate responsibilities at all — installing \`react\` alone and expecting \`createRoot\` to be available is a real, frequent mistake for anyone new to the ecosystem, since \`createRoot\` lives specifically in \`react-dom/client\`, not in \`react\` itself.

**Related:** [How do you write a custom renderer in React?](/interview-prep/ff-react/writing-a-custom-renderer-in-react) · [What is ReactDOM.createRoot() in React 18?](/interview-prep/ff-react/reactdom-createroot-in-react-18)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Google", "Amazon"],
    orderIndex: 96,
  },
  {
    collection: "ff-react",
    slug: "reactdom-createroot-in-react-18",
    question: "What is ReactDOM.createRoot() in React 18?",
    answer: `\`createRoot(container)\` replaces the legacy \`ReactDOM.render(element, container)\` as the entry point for rendering a React app into the DOM — it's what actually opts an app into React 18's concurrent features at all. Apps still calling the legacy \`render()\` kept running under React 18 in the old, non-concurrent behavior for backward compatibility.

\`\`\`jsx
// Legacy (React 17 and earlier)
ReactDOM.render(<App />, document.getElementById("root"));

// React 18+
import { createRoot } from "react-dom/client";
const root = createRoot(document.getElementById("root"));
root.render(<App />);
\`\`\`

### Classic interview gotcha

This is the concrete, practical reason "why isn't automatic batching / \`useTransition\` working in my React 18 app" is a real, common support question — if the app's entry point still calls the legacy \`ReactDOM.render\` instead of \`createRoot\`, none of React 18's concurrent-rendering features are actually active, regardless of which React version is installed in \`package.json\`. Upgrading the package alone doesn't opt an app into any of it.

**Related:** [How does batching work in React 18?](/interview-prep/ff-react/batching-in-react-18) · [What is React 18's concurrent mode?](/interview-prep/ff-react/react-18-concurrent-mode)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Meta", "Netflix"],
    orderIndex: 97,
  },
  {
    collection: "ff-react",
    slug: "debugging-performance-issues-in-react",
    question: "How do you debug performance issues in React?",
    answer: `Start with the React DevTools Profiler to record an interaction and see exactly which components rendered, how long each took, and why — resist the urge to guess and memoize speculatively before measuring, since a hunch about "this is probably the slow part" is wrong often enough to waste real effort.

| Tool | What it tells you |
|---|---|
| React DevTools Profiler | Which components rendered, how long, and why |
| \`<Profiler>\` API | The same data, programmatically, for automated tracking |
| Chrome Performance tab | Whether the bottleneck is even React at all (vs. layout, paint, a slow script) |
| why-did-you-render (library) | Flags exactly which prop/state change caused a specific re-render |

### Classic interview gotcha

A genuinely common mistake is assuming a slow interaction must be a React rendering problem and reaching straight for memoization, when the actual bottleneck is frequently something React can't fix at all — a slow network request, an expensive synchronous computation blocking the main thread outside any component, or real browser layout/paint cost from CSS. The Chrome Performance tab's flame chart shows whether time is even being spent inside React's rendering work at all before investing effort optimizing it.

**Related:** [What is the Profiler API in React?](/interview-prep/ff-react/profiler-api-in-react) · [How do you optimize React performance?](/interview-prep/ff-react/optimizing-react-performance)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Meta", "Google"],
    orderIndex: 98,
  },
  {
    collection: "ff-react",
    slug: "profiler-api-in-react",
    question: "What is the Profiler API in React?",
    answer: `\`<Profiler id="..." onRender={callback}>\` wraps part of a component tree and calls \`onRender\` after every commit within it, receiving timing data — actual render duration, the phase ("mount" or "update"), and more — programmatically. It's the same underlying data React DevTools' Profiler tab visualizes, but usable directly in code, for automated performance-regression tracking or logging real-user render timings. **A real, easy-to-miss caveat: the standard production build disables this timing instrumentation entirely by default** (profiling adds overhead, so it's stripped out) — collecting real-user timings in production specifically requires swapping in the special profiling-enabled production bundle (\`react-dom/profiling\`), not just adding \`<Profiler>\` to an app built normally.

\`\`\`jsx
function onRenderCallback(id, phase, actualDuration) {
  console.log(\`\${id} (\${phase}) took \${actualDuration}ms\`);
}

<Profiler id="ProductList" onRender={onRenderCallback}>
  <ProductList products={products} />
</Profiler>
\`\`\`

### Classic interview gotcha

Wrapping a \`<Profiler>\` around part of a tree adds a small amount of overhead by itself — it has to track and report timing on every commit inside it — so leaving Profiler instrumentation active broadly across an entire production app, rather than scoped to the specific subtree actually being investigated, is a real, self-defeating way to "measure performance" that quietly makes performance slightly worse everywhere it's applied.

**Related:** [How do you debug performance issues in React?](/interview-prep/ff-react/debugging-performance-issues-in-react) · [What is React DevTools and how do you use it?](/interview-prep/ff-react/react-devtools-explained) · [What causes unnecessary re-renders in React?](/interview-prep/ff-react/what-causes-unnecessary-re-renders)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Meta", "Airbnb"],
    orderIndex: 99,
  },
];
