import type { InterviewQuestionSeed } from "../types";

export const FF_REACT_QUESTIONS: InterviewQuestionSeed[] = [

  // ff-react
  {
    collection: "ff-react",
    conceptSlug: "react-rendering",
    question: "When does React re-render a component?",
    answer:
      "React re-renders a component in three situations:\n\n1. **Its own state changes** — via `setState` (class) or a state setter from `useState`/`useReducer`\n2. **Its parent re-renders** — by default, React re-renders all children when a parent re-renders, regardless of whether props changed\n3. **A context it consumes changes** — any component calling `useContext` re-renders when the context value changes\n\nTo opt out of parent-triggered re-renders, wrap the component in `React.memo`. To stabilize callbacks and objects passed as props (so `memo` actually helps), use `useCallback` and `useMemo`. The most common performance mistake is adding `memo`/`useCallback` before profiling — they have overhead too.",
    difficulty: "easy",
    companies: ["Meta", "Airbnb"],
    orderIndex: 1,
  },

  {
    collection: "ff-react",
    conceptSlug: "react-rendering",
    question: "What is the difference between `useEffect` and `useLayoutEffect`?",
    answer:
      "`useEffect` runs **after** the browser has painted — asynchronously. `useLayoutEffect` runs **before** the browser paints — synchronously after React commits DOM changes.\n\nUse `useLayoutEffect` when you need to read layout from the DOM (e.g. `getBoundingClientRect()`) and apply a change before the user sees the initial paint, preventing a visual flash. Otherwise, prefer `useEffect` — it doesn't block painting.\n\nPractical rule: start with `useEffect`. If you see a flicker on initial render, consider `useLayoutEffect`. On the server, `useLayoutEffect` does not run at all — prefer `useEffect` for SSR-safe logic.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 2,
  },

  {
    collection: "ff-react",
    conceptSlug: "react-rendering",
    question: "Explain the React reconciliation algorithm.",
    answer:
      "Reconciliation is how React decides what changed between renders and what DOM updates are needed.\n\nKey rules:\n1. **Different types → full remount** — if the element type changes (e.g. `<div>` → `<span>`), React destroys the old subtree and mounts a new one\n2. **Same type → update in place** — React updates only the changed attributes/children\n3. **Lists need keys** — when rendering arrays, React uses `key` props to match old and new children. Without stable keys, React resorts to positional matching, which causes incorrect updates (and subtle bugs) when items are reordered or added at the beginning\n\nThe algorithm runs in O(n) time by making two assumptions: elements of different types produce different trees, and keys identify stable elements across renders.",
    difficulty: "medium",
    companies: ["Meta", "Google", "Airbnb"],
    orderIndex: 3,
  },

  {
    collection: "ff-react",
    conceptSlug: "react-rendering",
    question: "What is the purpose of `useRef` and when should you use it over `useState`?",
    answer:
      "`useRef` returns a mutable object `{ current: value }` that persists across renders but does **not** trigger a re-render when changed.\n\nUse `useRef` when:\n- **DOM access** — attaching to an element with `ref={myRef}` to call `.focus()`, measure layout, etc.\n- **Storing mutable values** that shouldn't cause re-renders — timer IDs, previous values, event handler references, imperative library instances\n- **Breaking stale closure problems** — store the latest value of a prop/state in a ref so an event handler always reads the current value\n\nIf a change should update the UI, use `useState`. If it's internal bookkeeping that doesn't affect rendering, use `useRef`.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 4,
  },

  {
    collection: "ff-react",
    conceptSlug: "react-rendering",
    question: "What is React Suspense and how does it work?",
    answer:
      "Suspense lets components declare that they're waiting for something (data, a lazy-loaded component) before rendering. While waiting, React shows a fallback UI defined by the nearest `<Suspense fallback={...}>` boundary.\n\nHow it works: a component 'suspends' by throwing a Promise. React catches it, renders the fallback, and retries the component when the Promise resolves. You don't throw the Promise manually — libraries like React Query, Relay, or `React.lazy` do it for you.\n\n```jsx\nconst LazyChart = React.lazy(() => import('./Chart'));\n<Suspense fallback={<Spinner />}>\n  <LazyChart />\n</Suspense>\n```\n\nIn React 18+, Suspense integrates with concurrent features — it enables streaming SSR (rendering the shell immediately, streaming shell content as it resolves) and transitions (keeping the current UI visible while the next route loads).",
    difficulty: "hard",
    companies: ["Meta", "Google"],
    orderIndex: 5,
  },

  {
    collection: "ff-react",
    conceptSlug: "jsx-virtual-dom",
    question: "Is the Virtual DOM the same thing as the Shadow DOM?",
    answer:
      "No — they solve unrelated problems. The Shadow DOM is a real browser API for encapsulating a subtree's styles and markup (used by Web Components). The Virtual DOM is a React-specific, in-memory JavaScript representation used purely for diffing — it never touches the browser's rendering engine directly and has no encapsulation behavior at all.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 6,
  },

  {
    collection: "ff-react",
    conceptSlug: "jsx-virtual-dom",
    question: "What happens if you return two adjacent top-level elements from a component without wrapping them?",
    answer:
      "It's a compile error — JSX (really, `createElement`) requires exactly one root element per return value, since a single function call can only return one object. Wrapping siblings in `<>...</>` (a Fragment) or a real element satisfies this without adding an extra DOM node.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 7,
  },

  {
    collection: "ff-react",
    conceptSlug: "jsx-virtual-dom",
    question: "What is React.Fragment and why does it exist?",
    answer:
      "`<React.Fragment>` (shorthand `<>...</>`) groups a list of children into one JSX return value without adding an extra wrapping DOM node. It exists purely to satisfy JSX's single-root-element requirement — useful when adding a `<div>` wrapper would break CSS (e.g. flex/grid layouts that expect direct children) or table markup (`<tr>` requiring direct `<td>` children).",
    difficulty: "easy",
    companies: ["Airbnb"],
    orderIndex: 8,
  },

  {
    collection: "ff-react",
    conceptSlug: "usestate-useeffect-fundamentals",
    question: "What are the three modes an effect's dependency array can be in?",
    answer:
      "No array at all runs the effect after every render. An empty array `[]` runs it once, after the first render only. An array with values runs it after the first render, and again any time one of those values changes (compared with `Object.is`).",
    difficulty: "easy",
    companies: ["Meta"],
    orderIndex: 9,
  },

  {
    collection: "ff-react",
    conceptSlug: "usestate-useeffect-fundamentals",
    question: "Why does React call an effect's cleanup function before re-running it, not just on unmount?",
    answer:
      "Every run of an effect is treated as \"start syncing with this render's values\" — so before syncing with the *new* values, React must first undo whatever the previous run set up (clear the old timer, unsubscribe the old listener) to avoid leaking two overlapping subscriptions/timers. Cleanup runs on unmount too, for the same reason: tearing down whatever the last active run started.",
    difficulty: "medium",
    companies: ["Amazon", "Airbnb"],
    orderIndex: 10,
  },

  {
    collection: "ff-react",
    conceptSlug: "usestate-useeffect-fundamentals",
    question: "Does calling a state setter with the exact same value it already holds trigger a re-render?",
    answer:
      "No — React compares the new value to the current one with `Object.is` (a `useState` bail-out) and skips re-rendering if they're equal, even though the setter was called. This only bails out the render for that state update, not any other state changes happening in the same batch.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 11,
  },

  {
    collection: "ff-react",
    conceptSlug: "controlled-vs-uncontrolled-forms",
    question: "When would you deliberately choose an uncontrolled input over a controlled one?",
    answer:
      "For a simple form only read once on submit, where per-keystroke validation or live formatting isn't needed — the extra state and re-renders a controlled input requires add no value. It's also the right choice when integrating a non-React widget (some rich-text editors, some date pickers) that already manages its own DOM value internally.",
    difficulty: "easy",
    companies: ["Meta"],
    orderIndex: 12,
  },

  {
    collection: "ff-react",
    conceptSlug: "controlled-vs-uncontrolled-forms",
    question: "How do you set a starting value for an uncontrolled input without controlling it?",
    answer:
      "Use `defaultValue` instead of `value`. `defaultValue` only sets the input's initial value when it first mounts — the DOM then owns the value from then on, and React never re-applies `defaultValue` on subsequent renders the way it would continuously re-apply a controlled `value`.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 13,
  },

  {
    collection: "ff-react",
    conceptSlug: "controlled-vs-uncontrolled-forms",
    question: "Why can typing into a controlled input feel laggy in some apps?",
    answer:
      "Every keystroke fires `onChange`, which calls the state setter, which triggers a re-render before the input visually shows the new character. If `onChange` does anything expensive (validation, formatting, an API call) before calling the setter, that work now sits directly on the critical path between a keystroke and the screen updating.",
    difficulty: "medium",
    companies: ["Airbnb", "Stripe"],
    orderIndex: 14,
  },

  {
    collection: "ff-react",
    conceptSlug: "useref-imperative-handles",
    question: "What problem does useImperativeHandle solve that forwardRef alone doesn't?",
    answer:
      "`forwardRef` alone exposes a component's entire underlying DOM node (or whatever it forwards the ref to) to the parent. `useImperativeHandle` lets the component instead hand back a curated object — only the specific methods (`play()`, `focus()`) it wants the parent to call — hiding everything else about its internal implementation.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 15,
  },

  {
    collection: "ff-react",
    conceptSlug: "useref-imperative-handles",
    question: "Give an example of a bug caused by storing a value in a ref instead of state.",
    answer:
      "Storing a filter value that should affect what's rendered (e.g. a search query used to filter a displayed list) in a ref instead of state: updating `.current` never triggers a re-render, so the UI keeps showing results from the old query even though the 'current' value has technically changed — the classic 'I set it but the screen didn't update' bug.",
    difficulty: "medium",
    companies: ["Amazon"],
    orderIndex: 16,
  },

  {
    collection: "ff-react",
    conceptSlug: "useref-imperative-handles",
    question: "Can you safely read or write a ref's .current value during the render phase itself?",
    answer:
      "Writing to a ref during render is discouraged and can produce unpredictable behavior (React may call the render function multiple times per commit in Strict Mode/concurrent features), since render is supposed to be pure. Refs are meant to be read and written in effects and event handlers, after render has committed — not as part of computing what to render.",
    difficulty: "hard",
    companies: ["Google"],
    orderIndex: 17,
  },

  {
    collection: "ff-react",
    conceptSlug: "context-api-prop-drilling",
    question: "How would you stop every consumer of a context from re-rendering when only part of its value changes?",
    answer:
      "Split one large context into several narrower ones (a `ThemeContext` and a separate `UserContext` instead of one combined context), so a component only subscribes to — and only re-renders from — the specific slice it actually reads. Memoizing the Provider's `value` with `useMemo` also helps avoid re-renders caused purely by a new object reference on every parent render.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 18,
  },

  {
    collection: "ff-react",
    conceptSlug: "context-api-prop-drilling",
    question: "Does Context replace the need for useState or useReducer?",
    answer:
      "No — Context is purely a wiring mechanism for making a value available to descendants without passing props through every layer. The value it provides still has to come from somewhere, usually a `useState`/`useReducer` call in the component holding the `Provider`; Context doesn't manage state on its own.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 19,
  },

  {
    collection: "ff-react",
    conceptSlug: "context-api-prop-drilling",
    question: "What happens if a component calls useContext but there's no matching Provider above it in the tree?",
    answer:
      "It receives the `defaultValue` passed to `createContext(defaultValue)` — not an error or `undefined` by default. This is why a well-designed context usually gives its default value a sensible shape (or throws explicitly from a custom hook wrapper) rather than leaving consumers to silently work with an unexpected default.",
    difficulty: "medium",
    companies: ["Stripe"],
    orderIndex: 20,
  },

  {
    collection: "ff-react",
    conceptSlug: "component-composition-patterns",
    question: "How does composition via children avoid the prop drilling problem entirely?",
    answer:
      "A component that just renders `props.children` doesn't need to know anything about what's inside — the caller supplies the content directly at the point where it's needed, instead of that content's data being threaded down as props through components that don't use it.",
    difficulty: "easy",
    companies: ["Meta"],
    orderIndex: 21,
  },

  {
    collection: "ff-react",
    conceptSlug: "component-composition-patterns",
    question: "How would you design a component so its internals honor whatever markup a caller passes as children?",
    answer:
      "Render `props.children` directly rather than any hardcoded markup, and avoid assumptions about *what* children are (a specific component type, a fixed count) unless the component genuinely needs to coordinate between them — in which case compound components with Context is the pattern to reach for instead of inspecting `children` structurally.",
    difficulty: "medium",
    companies: ["Amazon"],
    orderIndex: 22,
  },

  {
    collection: "ff-react",
    conceptSlug: "component-composition-patterns",
    question: "What's a downside of the compound component pattern compared to plain props?",
    answer:
      "It requires internal plumbing (a Context Provider, and every sub-component consuming it) that plain, single-component APIs don't need, and it implicitly couples sub-components to being rendered somewhere inside their parent — `<Tabs.Panel>` rendered outside a `<Tabs>` silently gets the context's default value instead of a clear prop-types error.",
    difficulty: "hard",
    companies: ["Google"],
    orderIndex: 23,
  },

  {
    collection: "ff-react",
    conceptSlug: "custom-hooks-composition",
    question: "What's the modern replacement for higher-order components and render props, and why did it win out?",
    answer:
      "Custom hooks. They extract the same shared, stateful logic without wrapping the consuming component in an extra component layer or adding indirection to the JSX tree — a hook call is a plain function call, so there's no 'wrapper hell' from nesting several HOCs, and no extra component showing up in React DevTools' tree for logic that has no visual output of its own.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 24,
  },

  {
    collection: "ff-react",
    conceptSlug: "custom-hooks-composition",
    question: "Can a custom hook call another custom hook? Give an example of why you'd do that.",
    answer:
      "Yes — composing hooks from other hooks is the standard way to build more specific behavior from simpler pieces, e.g. `useSearchResults(query)` internally calling `useDebouncedValue(query, 300)` to avoid firing a fetch on every keystroke, then using the debounced value to actually search. Each layer only needs to understand the hook directly below it.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 25,
  },

  {
    collection: "ff-react",
    conceptSlug: "custom-hooks-composition",
    question: "Why does calling a hook inside a conditional or loop corrupt state even in components after it?",
    answer:
      "Not \"components after it\" — hook state within the *same* component, in every hook call that comes after the conditional one in source order. Since React matches hook calls to state slots purely by call order, skipping one hook call on some renders shifts every subsequent hook call in that same component into the wrong slot for the rest of that render.",
    difficulty: "hard",
    companies: ["Meta"],
    orderIndex: 26,
  },

  {
    collection: "ff-react",
    conceptSlug: "error-boundaries",
    question: "What's the difference between getDerivedStateFromError and componentDidCatch?",
    answer:
      "`getDerivedStateFromError(error)` is called during the render phase and returns new state used to render the fallback UI — it must be pure, with no side effects. `componentDidCatch(error, info)` is called during the commit phase and is where side effects belong — logging the error to a reporting service, for instance.",
    difficulty: "easy",
    companies: ["Meta"],
    orderIndex: 27,
  },

  {
    collection: "ff-react",
    conceptSlug: "error-boundaries",
    question: "How would you decide where in a component tree to place error boundaries?",
    answer:
      "It's a resilience tradeoff based on granularity: one boundary around the whole app means any single component's crash blanks the entire page. Wrapping each independent section (a dashboard's individual widgets, a feed's individual posts) in its own boundary means one broken widget shows its own fallback while everything else keeps working — usually the better default for anything with independently-failable sections.",
    difficulty: "medium",
    companies: ["Amazon", "Airbnb"],
    orderIndex: 28,
  },

  {
    collection: "ff-react",
    conceptSlug: "error-boundaries",
    question: "How do you handle an error thrown inside an async event handler, since an Error Boundary won't catch it?",
    answer:
      "Wrap the async logic in its own `try/catch` and handle the error explicitly — often by setting local state (e.g. an `error` state variable) that the component's own render then uses to show an inline error message, since there's no boundary mechanism that will intercept it automatically the way rendering errors are.",
    difficulty: "hard",
    companies: ["Google"],
    orderIndex: 29,
  },

  {
    collection: "ff-react",
    conceptSlug: "render-performance-memoization",
    question: "What's the difference between what useMemo does and what useCallback does?",
    answer:
      "`useMemo` caches the *result* of a calculation, recomputing it only when its dependencies change. `useCallback` caches the *function reference itself*, returning the same function instance across renders until its dependencies change — it's really just `useMemo` specialized for the case where the cached value happens to be a function.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 30,
  },

  {
    collection: "ff-react",
    conceptSlug: "render-performance-memoization",
    question: "What tool would you use to confirm a component is actually re-rendering unnecessarily before optimizing it?",
    answer:
      "The React DevTools Profiler — it records which components rendered during an interaction, how long each took, and (with 'why did this render' options enabled) what actually changed. Optimizing based on a guess instead of a profile is the most common way memoization ends up adding overhead without fixing anything.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 31,
  },

  {
    collection: "ff-react",
    conceptSlug: "render-performance-memoization",
    question: "Why does passing an inline arrow function as a prop defeat a child's React.memo?",
    answer:
      "`onClick={() => handleClick(id)}` creates a brand-new function on every render of the parent, even if `handleClick` and `id` haven't changed. A `memo`-wrapped child's shallow-equality check compares this new function reference to the previous one, sees they differ, and re-renders anyway — `useCallback` around the function (with matching dependencies) is what keeps the reference stable so `memo` can actually skip the re-render.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 32,
  },

  {
    collection: "ff-react",
    conceptSlug: "concurrent-react-suspense",
    question: "What's the difference between wrapping an update in startTransition versus not wrapping it at all?",
    answer:
      "An update wrapped in `startTransition` is marked low-priority and interruptible — React can pause it, prioritize a more urgent update, and resume or restart it later. An update outside `startTransition` runs at default (synchronous-feeling) priority and blocks other rendering until it completes.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 33,
  },

  {
    collection: "ff-react",
    conceptSlug: "concurrent-react-suspense",
    question: "How does Suspense enable streaming server-side rendering?",
    answer:
      "The server can send the HTML shell immediately and stream in the content of any component still wrapped in a pending `<Suspense>` boundary as its data becomes ready, rather than waiting for every single piece of data across the whole page before sending anything. Each streamed chunk 'hydrates in' as it arrives, instead of the user staring at a blank page until the slowest piece of data resolves.",
    difficulty: "hard",
    companies: ["Google", "Stripe"],
    orderIndex: 34,
  },

  {
    collection: "ff-react",
    conceptSlug: "concurrent-react-suspense",
    question: "Does React 18's concurrent rendering mean components can run twice unexpectedly? What should you watch out for?",
    answer:
      "Strict Mode in development intentionally double-invokes component functions and effects to help surface code that isn't safely repeatable (e.g. an effect with a side effect that isn't idempotent, or a render function relying on mutable external state). This is a development-only diagnostic, but it exists because concurrent rendering *can* genuinely discard and restart an in-progress render — so component functions and render logic need to stay pure regardless.",
    difficulty: "hard",
    companies: ["Meta"],
    orderIndex: 35,
  },

  {
    collection: "ff-react",
    conceptSlug: "state-management-tradeoffs",
    question: "What's a sign that a codebase reached for a global store too early?",
    answer:
      "State that's only ever read and updated by one component (or its direct children) living in a global store anyway — meaning changes to it can, in principle, cause unrelated parts of the app to re-check their subscriptions for no reason, and any developer touching that state has to understand the global store's wiring for something that was never actually shared.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 36,
  },

  {
    collection: "ff-react",
    conceptSlug: "state-management-tradeoffs",
    question: "Compare colocating state near where it's used versus centralizing it in one global store.",
    answer:
      "Colocated state is easier to reason about locally (everything relevant is in or near the component) but has to be lifted or drilled once sibling components need it too. A centralized store makes any piece of state reachable from anywhere without lifting, at the cost of needing selectors (or careful Context splitting) to avoid over-triggering re-renders, and making it less obvious, just from reading a component, what state it actually depends on.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 37,
  },

  {
    collection: "ff-react",
    conceptSlug: "state-management-tradeoffs",
    question: "Why can a large Context value cause more re-renders than the prop drilling it was meant to replace?",
    answer:
      "Prop drilling, however tedious, only re-renders a component when the specific prop it actually receives changes. A single context bundling several unrelated fields re-renders every consumer on *any* field's change, since Context has no built-in concept of subscribing to part of a value — a component reading only `theme` from a `{ theme, user, cart }` context re-renders on every cart update too.",
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 38,
  }
];
