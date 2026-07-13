import type { InterviewQuestionSeed } from "../types";

export const FF_75_QUESTIONS: InterviewQuestionSeed[] = [
  // ff-75
  {
    collection: "ff-75",
    conceptSlug: "event-loop",
    question: "What is the event loop and why does it exist?",
    answer:
      "JavaScript is single-threaded — only one piece of code runs at a time. The event loop is the mechanism that lets it handle async work (timers, network requests, user events) without blocking. It continuously checks the call stack; when the stack is empty, it processes the microtask queue fully, then picks one task from the task queue, runs it to completion, and repeats.\n\nThis matters because blocking the call stack for even a few hundred milliseconds will make the UI unresponsive — the event loop is what lets JavaScript appear concurrent.",
    difficulty: "easy",
    companies: ["Google", "Meta", "Stripe"],
    orderIndex: 1,
  },

  {
    collection: "ff-75",
    conceptSlug: "equality-type-coercion",
    question: "What is the difference between `null` and `undefined` in JavaScript?",
    answer:
      "`undefined` means a variable has been declared but not yet assigned a value — it's the runtime's default. `null` is an explicit absence of value intentionally set by the programmer.\n\nKey differences: `typeof undefined` is `'undefined'`; `typeof null` is `'object'` (a historical bug in JS). `undefined == null` is `true` (loose equality), but `undefined === null` is `false` (strict equality). Always use strict equality to distinguish them.",
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 2,
  },

  {
    collection: "ff-75",
    conceptSlug: "css-specificity",
    question: "Explain CSS specificity and how conflicts are resolved.",
    answer:
      "When multiple CSS rules target the same element, the browser uses specificity to decide which rule wins. Specificity is a three-part score: [id, class, element]. IDs contribute to the first bucket, class selectors / attribute selectors / pseudo-classes to the second, and type selectors / pseudo-elements to the third.\n\nThe scores are compared left-to-right: a rule with any ID wins over one with no IDs, regardless of how many classes the loser has. If specificity ties, the last rule in source order wins. `!important` overrides all specificity and should be avoided.",
    difficulty: "easy",
    companies: ["Google", "Airbnb"],
    orderIndex: 3,
  },

  {
    collection: "ff-75",
    conceptSlug: "browser-rendering-pipeline",
    question: "What happens when you type a URL in the browser and press Enter?",
    answer:
      "1. **DNS resolution** — the browser resolves the hostname to an IP address, checking its cache, then the OS, then a DNS resolver.\n2. **TCP + TLS handshake** — a connection is established; HTTPS negotiates a TLS session.\n3. **HTTP request** — the browser sends a GET request; the server responds with HTML.\n4. **HTML parsing** — the browser parses HTML top-to-bottom, constructing the DOM. When it encounters `<link rel='stylesheet'>` it fetches CSS (render-blocking). `<script>` without `async`/`defer` is also render-blocking.\n5. **Render pipeline** — DOM + CSSOM → Render Tree → Layout → Paint → Composite → pixels on screen.\n6. **Subsequent requests** — images, fonts, JS, etc. are fetched as discovered.",
    difficulty: "medium",
    companies: ["Google", "Meta", "Amazon", "Microsoft", "Stripe"],
    orderIndex: 4,
  },

  {
    collection: "ff-75",
    conceptSlug: "equality-type-coercion",
    question: "What is the difference between `==` and `===` in JavaScript?",
    answer:
      "`===` (strict equality) checks both value and type — no coercion. `==` (loose equality) performs type coercion before comparing, following a complex set of rules that can produce surprising results:\n\n```js\n0 == false   // true  (false coerces to 0)\n'' == false  // true\nnull == undefined // true\nnull == 0   // false\n```\n\nAlways prefer `===` unless you specifically need the `null == undefined` coercion (checking for either), which is the one common legitimate use of `==`.",
    difficulty: "easy",
    companies: ["Meta", "Stripe"],
    orderIndex: 5,
  },

  // css-specificity concept top-ups (queried by concept_id on the Interview tab)
  {
    collection: "ff-75",
    conceptSlug: "css-specificity",
    question: "How do you calculate the specificity of a selector like `#nav ul.menu li a`?",
    answer:
      "Count the selector's parts into three buckets `[id, class, element]`:\n\n1. **IDs** — `#nav` → 1\n2. **Classes / attributes / pseudo-classes** — `.menu` → 1\n3. **Elements / pseudo-elements** — `ul`, `li`, `a` → 3\n\nSo the score is `[1, 1, 3]`. Comparison is left-to-right, and a higher bucket always dominates: `[1, 0, 0]` (a single `#id`) beats `[0, 10, 0]` (ten classes), because the first bucket is compared before the second. The universal selector `*` and combinators (`>`, `+`, `~`, whitespace) add nothing.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 6,
  },

  {
    collection: "ff-75",
    conceptSlug: "css-specificity",
    question: "Why is using `!important` discouraged, and what problems does it cause?",
    answer:
      "`!important` overrides the entire specificity calculation, so the normal cascade no longer explains why a rule wins. That causes real problems:\n\n- **Escalation** — the only way to beat an `!important` is another `!important`, so one usage tends to breed more\n- **Debugging pain** — DevTools shows a rule winning even though a far more specific selector exists\n- **Broken overrides** — utility classes and component variants silently stop working\n\nLegitimate uses are narrow: overriding third-party styles you can't edit, or utility helpers like `.hidden { display: none !important }`. Prefer raising specificity or fixing source order instead.",
    difficulty: "easy",
    companies: ["Airbnb", "Stripe"],
    orderIndex: 7,
  },

  {
    collection: "ff-75",
    conceptSlug: "css-specificity",
    question: "When two rules have equal specificity, how does the browser decide which wins?",
    answer:
      "When specificity ties, **source order** decides — the rule that appears later in the stylesheet (or in the later-loaded stylesheet) wins.\n\n```css\n.btn { color: blue; }\n.btn { color: green; } /* wins — same specificity, later */\n```\n\nThis is why the order you import stylesheets matters, and why utility-first frameworks depend on a predictable final layer. Note that the full cascade also weighs **origin and importance** (user-agent < user < author, with `!important` flipping the order) *before* specificity — but within the same origin and importance, specificity first, then source order.",
    difficulty: "medium",
    companies: ["Google", "Microsoft"],
    orderIndex: 8,
  },

  {
    collection: "ff-75",
    conceptSlug: "css-specificity",
    question: "Do inline styles have specificity, and how do they compare to selectors?",
    answer:
      "Yes. An inline `style` attribute sits in a bucket *above* all selectors — think of it as `[1, 0, 0, 0]`, a fourth column to the left of `[id, class, element]`. So any inline style beats any selector-based rule, no matter how specific the selector is.\n\nThe only thing that overrides an inline style is a declaration marked `!important` in a stylesheet. This is a big reason inline styles are hard to override and are usually avoided for anything beyond dynamic, one-off values set by JavaScript.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 9,
  },

  // browser-rendering-pipeline concept top-ups
  {
    collection: "ff-75",
    conceptSlug: "browser-rendering-pipeline",
    question: "What is the difference between the DOM and the CSSOM, and why does the browser build both?",
    answer:
      "The **DOM** (Document Object Model) is the tree the browser builds by parsing HTML — it represents the page's content and structure. The **CSSOM** (CSS Object Model) is the tree built by parsing CSS — it represents the style rules and how they cascade onto elements.\n\nThe browser needs both because content and presentation are separate inputs. It then combines them into the **Render Tree** — only the nodes that will actually be displayed, each with its computed styles attached. Both must be ready before the render tree can be built, which is why CSS is render-blocking: the browser won't paint content it might immediately have to restyle.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 10,
  },

  {
    collection: "ff-75",
    conceptSlug: "browser-rendering-pipeline",
    question: "What is the difference between layout (reflow) and paint, and why does it matter for performance?",
    answer:
      "**Layout (reflow)** computes the geometry of every element — position and size. **Paint** fills in the pixels — colors, text, borders, shadows.\n\nWhy it matters: layout is expensive because changing one element's size can cascade to its siblings and descendants. Properties that trigger layout (`width`, `top`, `margin`, `font-size`) are costlier to animate than paint-only properties (`color`, `background`).\n\nThe cheapest changes are **composite-only** — `transform` and `opacity` — because they can be handled by the GPU without re-running layout or paint. That's the reason `transform: translate()` is preferred over animating `top`/`left`.",
    difficulty: "hard",
    companies: ["Google", "Meta", "Amazon"],
    orderIndex: 11,
  },

  {
    collection: "ff-75",
    conceptSlug: "browser-rendering-pipeline",
    question: "What does 'render-blocking' mean, and which resources block rendering?",
    answer:
      "A render-blocking resource is one the browser must fetch and process **before** it can paint the first pixels.\n\n- **CSS** is render-blocking by default — the browser won't paint until the CSSOM is ready, to avoid a flash of unstyled content\n- **Synchronous `<script>`** (no `async`/`defer`) is parser-blocking: it halts HTML parsing until the script downloads and runs\n\nMitigations:\n1. Add `defer` (or `async`) to scripts so parsing continues\n2. Inline critical CSS and lazy-load the rest\n3. Use `media` attributes so non-matching stylesheets don't block\n4. Preload key fonts to avoid a later reflow",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 12,
  },

  {
    collection: "ff-75",
    conceptSlug: "browser-rendering-pipeline",
    question: "Why can an element be in the DOM but not appear in the render tree?",
    answer:
      "The render tree contains only nodes that are actually painted, so some DOM nodes are deliberately excluded:\n\n- Elements with `display: none` — removed from the render tree entirely (they take up no space)\n- Non-visual nodes like `<head>`, `<meta>`, `<script>`, `<title>`\n\nA key contrast: `visibility: hidden` and `opacity: 0` elements **do** stay in the render tree — they still occupy layout space, they're just not visible. Only `display: none` drops out. This is exactly why the render tree can be smaller than the DOM, and why toggling `display: none` triggers layout while toggling `visibility` only triggers paint.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 13,
  },

  // Phase 10 (Feature 41) — one flagship question per new JS Runtime concept,
  // matching the existing 1-per-concept ff-75 pattern above.
  {
    collection: "ff-75",
    conceptSlug: "hoisting-temporal-dead-zone",
    question:
      "What is hoisting in JavaScript, and how does it differ between var, let/const, and function declarations?",
    answer:
      "Before executing a scope, the engine registers every declaration it contains — that registration step is hoisting. The three kinds behave differently once hoisted:\n\n- **Function declarations** are hoisted with their full body available — you can call one before its line in the file.\n- **`var`** is hoisted and immediately initialized to `undefined` — reading it early gives `undefined`, not an error.\n- **`let`/`const`** are hoisted but left uninitialized until their declaration line runs. Reading them earlier throws a `ReferenceError` — this window is the **temporal dead zone (TDZ)**.\n\nThe TDZ is a deliberate improvement over `var`'s silent `undefined` — it turns a use-before-declare mistake into an immediate, loud error instead of a bug that surfaces somewhere else entirely.",
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 14,
  },

  {
    collection: "ff-75",
    conceptSlug: "closures",
    question:
      "What does this log, and why? `for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i)); }`",
    answer:
      "It logs `3`, `3`, `3` — not `0`, `1`, `2` as most people expect.\n\n`var` creates a single shared binding for the entire loop, not one per iteration. All three arrow functions close over that same `i`, so by the time any of the `setTimeout` callbacks actually run (after the loop has already finished), `i` is `3` for all of them.\n\nSwapping `var` for `let` fixes it — `let` creates a **new binding per iteration**, so each closure captures its own snapshot (`0`, `1`, `2`) instead of one shared variable.",
    difficulty: "medium",
    companies: ["Google", "Meta", "Amazon"],
    orderIndex: 15,
  },

  {
    collection: "ff-75",
    conceptSlug: "callbacks-higher-order-functions",
    question: "What is a higher-order function? Give an example from the array methods you use daily.",
    answer:
      "A higher-order function is any function that takes another function as an argument, returns a function, or both — possible because functions are ordinary values in JavaScript.\n\n`Array.prototype.map`, `.filter`, and `.reduce` are all higher-order functions: each one accepts a callback and calls it for you. `map` calls it once per item and collects the return values; `filter` calls it once per item and keeps the ones where it returns `true`; `reduce` calls it once per item while carrying an accumulator forward.",
    difficulty: "easy",
    companies: ["Meta", "Stripe"],
    orderIndex: 16,
  },

  {
    collection: "ff-75",
    conceptSlug: "array-object-methods-immutability",
    question: "Why do map/filter/reduce return new arrays instead of mutating the original, and why does that matter?",
    answer:
      "They're designed as pure transformations — given the same array and callback, they always produce a new array without touching the input. This matters because nothing else holding a reference to the original array gets silently surprised by a change it didn't expect.\n\nIt matters even more once state lives in a UI framework: React's rendering model compares an old reference to a new one to decide whether to re-render. That comparison only works correctly if updates always produce new arrays/objects instead of mutating existing ones — a mutated-in-place array still looks 'the same' to React and won't trigger a re-render at all.",
    difficulty: "easy",
    companies: ["Meta", "Airbnb"],
    orderIndex: 17,
  },

  {
    collection: "ff-75",
    conceptSlug: "this-binding-execution-context",
    question:
      "What does this log, and why? `const obj = { name: 'A', greet() { setTimeout(function () { console.log(this.name); }); } }; obj.greet();`",
    answer:
      "It logs `undefined` (or throws in strict mode), not `'A'`.\n\n`this` is determined by how a function is *called*, not where it's defined. `setTimeout`'s callback is invoked as a plain function call — no object to the left of a dot — so `this` inside it is `globalThis`/`undefined`, not `obj`, even though the callback is written lexically inside `greet`.\n\nThe fix is an arrow function for the callback (`setTimeout(() => console.log(this.name))`), since arrow functions don't have their own `this` and instead inherit it from `greet`'s method-call `this`, which is `obj`.",
    difficulty: "medium",
    companies: ["Google", "Meta", "Amazon"],
    orderIndex: 18,
  },

  {
    collection: "ff-75",
    conceptSlug: "prototypal-inheritance",
    question: "What is the difference between `__proto__` and `prototype`?",
    answer:
      "`prototype` is a property that exists on **functions** (specifically constructor functions) — it's the object that becomes the `[[Prototype]]` of every instance created with `new Fn()`.\n\n`__proto__` is an accessor that exists on **instances** — it's the (informally standardized, but widely supported) way to read or set an object's actual internal `[[Prototype]]` link directly. `instance.__proto__ === Fn.prototype` for any instance created via `new Fn()`. `Object.getPrototypeOf(instance)` is the modern, preferred way to read the same link.",
    difficulty: "medium",
    companies: ["Airbnb", "Stripe"],
    orderIndex: 19,
  },

  {
    collection: "ff-75",
    conceptSlug: "esm-vs-commonjs",
    question: "What's the core difference between ES Modules and CommonJS, and why does it affect tree-shaking?",
    answer:
      "ES Modules' `import`/`export` are **static** — they must appear at a module's top level, so a bundler can read the entire dependency graph just by parsing the file, before running any code. CommonJS's `require()` is a normal function call that can appear anywhere, including conditionally, so what a module actually needs is only knowable by executing it.\n\nBecause ESM's graph is knowable ahead of time, a bundler can prove an export is never imported anywhere and safely delete it — **tree-shaking**. CommonJS's dynamic `require()` calls can't be analyzed with the same confidence, so CommonJS code tends to ship larger, less-optimized bundles.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 20,
  },

  {
    collection: "ff-75",
    conceptSlug: "promises-async-await",
    question: "What happens if you forget to `await` an async function call inside another async function?",
    answer:
      "The call still starts running immediately — `async` functions execute synchronously up to their first `await` regardless of whether the caller awaits them. What you lose is the **result**: without `await`, you get back the Promise object itself, not its resolved value, and your code moves on immediately instead of waiting.\n\nIt also breaks error handling — a rejection from the un-awaited call won't be caught by a surrounding `try/catch`, since that `catch` only wraps code that's actually waiting on the Promise. It becomes an unhandled promise rejection instead.",
    difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 21,
  },

  {
    collection: "ff-75",
    conceptSlug: "debouncing-throttling",
    question: "What's the difference between debounce and throttle, and when would you use each?",
    answer:
      "**Debounce** delays running a function until a pause — every new call resets the timer, so only the final call in a burst actually runs. Use it when only the end state matters: search-as-you-type, form validation, autosave.\n\n**Throttle** runs a function at most once per fixed interval, no matter how many calls come in. Use it when the handler needs to keep responding continuously throughout activity, not just once it stops: scroll progress bars, resize-driven layout recalculation, drag handlers.",
    difficulty: "easy",
    companies: ["Meta", "Amazon", "Stripe"],
    orderIndex: 22,
  },

  {
    collection: "ff-75",
    conceptSlug: "function-composition-currying",
    question: "What is function composition, and why is it useful in real code?",
    answer:
      "Composition builds a new function by chaining smaller ones together — the output of one becomes the input of the next, so `compose(f, g)(x)` is `f(g(x))`.\n\nIt's useful because each composed function stays small and single-purpose, and the pipeline itself reads as a description of the overall transformation (e.g. `compose(slugify, lower, trim)`) rather than one large function doing everything at once — easier to test and reuse each individual step in isolation.",
    difficulty: "medium",
    companies: ["Google", "Airbnb"],
    orderIndex: 23,
  },

  {
    collection: "ff-75",
    conceptSlug: "memory-management-leaks",
    question: "What causes memory leaks in JavaScript, given that it has automatic garbage collection?",
    answer:
      "The garbage collector only frees memory that's **unreachable** — it has no concept of 'unused.' A leak happens when some reference you didn't realize you were still holding keeps an object reachable long after you actually stopped needing it.\n\nThe most common patterns: forgotten event listeners (never removed, so their closures stay alive), detached DOM nodes still referenced by a variable after being removed from the page, stray long-lived closures referencing large data, and uncleared `setInterval`/`setTimeout` timers.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 24,
  },

  {
    collection: "ff-75",
    conceptSlug: "generators-iterators",
    question: "What is a generator function, and what problem does it solve that a regular function can't?",
    answer:
      "A generator function (`function*`) can pause itself mid-execution with `yield` and resume exactly where it left off on the next `.next()` call — a regular function always runs start-to-finish in one go with no way to pause partway through.\n\nThis makes generators the natural fit for lazy, on-demand sequences: an infinite sequence (like natural numbers) can never be fully computed by a regular function, but a generator only computes the next value when actually asked for one, so it works fine even for a sequence with no end.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 25,
  },


  // Phase 10 (Feature 42) — Browser Internals, 5 flagship questions per new concept
  {
    collection: "ff-75",
    conceptSlug: "dom-vs-bom",
    question: "What is the difference between the DOM and the BOM?",
    answer:
      "The **DOM** (Document Object Model) is the standardized tree representing a page's HTML content — elements, attributes, text nodes. The **BOM** (Browser Object Model) represents the browser itself — `window`, `location`, `navigator`, `history`, `screen`.\n\nThere's an important asymmetry: the DOM is formally standardized by the W3C/WHATWG. The BOM has no equivalent spec — `window`, `navigator`, and friends exist because browser vendors converged on the same shape by convention, which is also why BOM APIs vary slightly more across browsers than DOM APIs do.",
    difficulty: "easy",
    companies: ["Google", "Meta"],
    orderIndex: 26,
  },

  {
    collection: "ff-75",
    conceptSlug: "dom-vs-bom",
    question: "Is `document` part of the DOM or the BOM?",
    answer:
      "`document` is the **root of the DOM tree** — but it's reached as a property of `window`, the BOM's root (`window.document`). So `document` itself sits at the boundary between the two: it's accessed through the BOM's global object, but the tree it represents (elements, attributes, text) is entirely DOM content, not browser state.",
    difficulty: "easy",
    companies: ["Amazon"],
    orderIndex: 27,
  },

  {
    collection: "ff-75",
    conceptSlug: "dom-vs-bom",
    question: "Why doesn't calling `history.pushState()` update what's rendered on the page?",
    answer:
      "`pushState()` only changes the URL and adds a history entry — a purely BOM-level operation. It never touches the DOM, so the page's visible content stays exactly as it was.\n\nThis is exactly why every client-side router has to do extra work: it calls `pushState()` to change the URL, then **manually** re-renders the DOM to match, and listens for the `popstate` event (fired on back/forward navigation) to do the same re-render when the browser — not the app — changes the URL.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 28,
  },

  {
    collection: "ff-75",
    conceptSlug: "dom-vs-bom",
    question: "Name three BOM objects besides `document`, and what each one exposes.",
    answer:
      "- `navigator` — information about the browser and OS (`userAgent`, `onLine`, `language`)\n- `location` — the current URL and methods to navigate (`href`, `reload()`, `assign()`)\n- `history` — the tab's session history (`pushState`, `back()`, `length`)\n- `screen` — the physical display's dimensions (`width`, `height`, `availHeight`)\n\nAll four are reached as properties of `window`, but none of them represent page content — they represent the browser environment the page happens to be running in.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 29,
  },

  {
    collection: "ff-75",
    conceptSlug: "dom-vs-bom",
    question: "Why is there no official standard for \"the BOM\" the way there is for the DOM?",
    answer:
      "The DOM is formally specified by the W3C/WHATWG — every browser is expected to implement the same tree structure and API surface. The BOM was never formally standardized this way; `window`, `navigator`, `location`, and `history` exist purely because every browser vendor independently converged on roughly the same shape, largely for backward compatibility with the earliest browsers.\n\nThis is a real, practical consequence: BOM APIs (especially `navigator`) tend to have more cross-browser inconsistencies and quirks than DOM APIs do, precisely because there was never a single spec all vendors were implementing against from day one.",
    difficulty: "medium",
    companies: ["Stripe"],
    orderIndex: 30,
  },


  {
    collection: "ff-75",
    conceptSlug: "event-delegation-bubbling-capturing",
    question: "What are the three phases of DOM event propagation?",
    answer:
      "1. **Capturing** — the event travels from `document` down through each ancestor toward the target\n2. **Target** — the event reaches the actual element that was interacted with\n3. **Bubbling** — the event travels back up from the target through the same ancestors to `document`\n\nBy default, `addEventListener` registers for the bubbling phase. Passing `{ capture: true }` registers for the capturing phase instead.",
    difficulty: "easy",
    companies: ["Google", "Amazon", "Microsoft"],
    orderIndex: 31,
  },

  {
    collection: "ff-75",
    conceptSlug: "event-delegation-bubbling-capturing",
    question: "How does event delegation let one listener handle clicks on elements added after the listener was attached?",
    answer:
      "Because a click on any descendant bubbles up through every ancestor, a listener on a shared parent (like a list container) sees every click that happens inside it — including on elements that didn't exist yet when the listener was registered:\n\n```js\nlist.addEventListener(\"click\", (e) => {\n  const item = e.target.closest(\"li\");\n  if (item) console.log(\"Clicked:\", item.textContent);\n});\n```\n\nThis single listener keeps working correctly even as `<li>` elements are added or removed dynamically, because it's bubbling — not the specific target element — that the listener depends on.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 32,
  },

  {
    collection: "ff-75",
    conceptSlug: "event-delegation-bubbling-capturing",
    question: "What's the difference between `e.target` and `e.currentTarget`?",
    answer:
      "`e.target` is the actual element the event originated on — the specific element the user clicked, which might be a `<span>` nested deep inside a delegated listener's container.\n\n`e.currentTarget` is always the element the listener is *attached to* — inside a delegated handler on a `<ul>`, `e.currentTarget` is always that `<ul>`, no matter which descendant was actually clicked. This distinction is exactly why delegated handlers use `e.target.closest(...)` to find the specific item that was interacted with.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 33,
  },

  {
    collection: "ff-75",
    conceptSlug: "event-delegation-bubbling-capturing",
    question: "When would you register a listener with `{ capture: true }`?",
    answer:
      "When you need to intercept an event **before** it reaches a deeply nested element's own bubble-phase handlers — most commonly to detect an \"outside click\" that should close something (a dropdown, a modal) even if an inner element would otherwise stop the event from bubbling with `stopPropagation()`.\n\nA capture-phase listener on `document` always runs before any bubble-phase listener further down the tree, since capturing happens top-down before the event ever reaches the target.",
    difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 34,
  },

  {
    collection: "ff-75",
    conceptSlug: "event-delegation-bubbling-capturing",
    question: "What's the difference between `stopPropagation()` and `stopImmediatePropagation()`?",
    answer:
      "`stopPropagation()` prevents the event from continuing to the next phase/ancestor — but other listeners registered on the *same* element still run.\n\n`stopImmediatePropagation()` does that **and** prevents any other listener on the same element from running at all, even ones registered before it.\n\nBoth should be used sparingly: they can silently break a parent's delegated listener that was relying on the event actually reaching it.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 35,
  },


  {
    collection: "ff-75",
    conceptSlug: "storage-apis",
    question: "Compare localStorage, sessionStorage, and cookies along capacity, lifetime, and server visibility.",
    answer:
      "| | Capacity | Lifetime | Sent to server? |\n|---|---|---|---|\n| Cookies | ~4KB | configurable expiry, or session-only | yes, automatically, every matching request |\n| sessionStorage | ~5-10MB | until the tab closes | no |\n| localStorage | ~5-10MB | forever, until cleared | no |\n\nCookies are the only one of the three the server sees without any extra JavaScript — which is exactly why auth sessions traditionally use them, and exactly why a bloated cookie is a real performance cost (it's resent on every request, including images and stylesheets).",
    difficulty: "medium",
    companies: ["Google", "Amazon", "Stripe"],
    orderIndex: 36,
  },

  {
    collection: "ff-75",
    conceptSlug: "storage-apis",
    question: "Why are cookies sent automatically with every request, and why is that both useful and risky?",
    answer:
      "The browser attaches every cookie matching a request's domain/path automatically, with no JavaScript involved — which is exactly what makes cookies useful for auth: the server can identify a logged-in user on every request without the client doing anything special.\n\nThe risk is CSRF: because the browser attaches cookies automatically, a malicious page can trigger a request to another site and the browser will still attach that site's session cookie, making the forged request look legitimate. This is why `SameSite` cookie attributes and CSRF tokens exist — to make \"the cookie was present\" insufficient proof that the user actually intended the request.",
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 37,
  },

  {
    collection: "ff-75",
    conceptSlug: "storage-apis",
    question: "Why is localStorage a poor choice for storing a large JSON blob?",
    answer:
      "`localStorage`'s API is **synchronous** — reading or writing a multi-megabyte value blocks the main thread for however long that read/write takes, which can visibly jank the page. It also silently fails once you're near the browser's storage quota, with no built-in warning.\n\nAnything beyond small key/value settings (a theme preference, a dismissed-banner flag) belongs in IndexedDB instead, which is asynchronous by design and built for exactly this scale of data.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 38,
  },

  {
    collection: "ff-75",
    conceptSlug: "storage-apis",
    question: "When would you reach for IndexedDB instead of localStorage?",
    answer:
      "Whenever the data is large (multiple megabytes) or structured (needs querying/indexing, not just flat key/value pairs) — an offline cache of a user's documents, a local copy of a large dataset, anything a simple string-keyed store can't reasonably hold.\n\nIndexedDB is asynchronous, so reading or writing it never blocks rendering the way a large `localStorage` operation can — the tradeoff is a more verbose, callback/promise-based API, which is why most real apps wrap it in a small library rather than using it directly.",
    difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 39,
  },

  {
    collection: "ff-75",
    conceptSlug: "storage-apis",
    question: "What's the practical difference in lifetime between localStorage and sessionStorage?",
    answer:
      "`localStorage` persists indefinitely — across tab closes, browser restarts, even system reboots — until explicitly cleared by code or the user. `sessionStorage` is scoped to a single tab and is wiped the moment that tab closes; it doesn't even survive being duplicated into a new tab (each tab gets its own separate `sessionStorage`).\n\nThis makes `sessionStorage` the right fit for per-visit ephemeral state (an in-progress multi-step form, a \"don't show again this session\" flag) and `localStorage` the right fit for settings that should genuinely persist (theme, language preference).",
    difficulty: "easy",
    companies: ["Google", "Stripe"],
    orderIndex: 40,
  },


  {
    collection: "ff-75",
    conceptSlug: "cors-same-origin-policy",
    question: "What determines whether two URLs are considered the same origin?",
    answer:
      "Three things must all match exactly: **scheme** (http vs. https), **host** (the domain), and **port**. `https://app.example.com:443` and `http://app.example.com:443` are different origins because the scheme differs, even though the host is identical — and `https://app.example.com` and `https://api.example.com` are different origins even though both are `example.com` subdomains.",
    difficulty: "easy",
    companies: ["Google", "Meta", "Amazon"],
    orderIndex: 41,
  },

  {
    collection: "ff-75",
    conceptSlug: "cors-same-origin-policy",
    question: "Does CORS prevent the server from ever receiving a cross-origin request?",
    answer:
      "No — the request is still sent, and the server still receives and can act on it. CORS only controls whether the **browser** lets the calling JavaScript **read the response**. This is why CORS is a browser-side protection, not a server-side security boundary: a request blocked by CORS in the browser console still shows up in the server's logs, because it was never actually blocked from arriving.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 42,
  },

  {
    collection: "ff-75",
    conceptSlug: "cors-same-origin-policy",
    question: "What triggers a CORS preflight request?",
    answer:
      "A request needs a preflight (an `OPTIONS` request sent first, asking permission) whenever it isn't a \"simple request\":\n\n- the method isn't `GET`, `HEAD`, or `POST`\n- it carries a header outside the simple set (`Accept`, `Accept-Language`, `Content-Language`, `Content-Type` with a simple value)\n- it uses a custom header like `Authorization`\n\nOnly if the preflight's response allows the actual method and headers does the browser send the real request.",
    difficulty: "medium",
    companies: ["Google", "Amazon"],
    orderIndex: 43,
  },

  {
    collection: "ff-75",
    conceptSlug: "cors-same-origin-policy",
    question: "What does `Access-Control-Allow-Credentials` control, and why can't it be paired with a wildcard origin?",
    answer:
      "It controls whether the browser will include cookies/auth headers on a cross-origin request and expose a response that did. Pairing it with `Access-Control-Allow-Origin: *` is disallowed by the spec (and browsers will reject it) because that combination would mean \"any site on the internet may make an authenticated request on this user's behalf and read the result\" — exactly the CSRF-adjacent scenario CORS exists to prevent. An exact origin must be specified whenever credentials are involved.",
    difficulty: "hard",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 44,
  },

  {
    collection: "ff-75",
    conceptSlug: "cors-same-origin-policy",
    question: "If a request fails with a CORS error in the browser console, does that mean the server never received it?",
    answer:
      "No — for a simple request (no preflight needed), the request was already sent and the server already processed it; the browser only blocks the *response* from being readable by the page's JavaScript. For a preflighted request, the browser may stop before sending the real request if the preflight itself is rejected — but the preflight `OPTIONS` request still reached the server.\n\nThis is the most common source of wasted debugging time: assuming a CORS error means \"the backend didn't get this,\" when server logs usually show it did.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 45,
  },


  {
    collection: "ff-75",
    conceptSlug: "web-security-fundamentals",
    question: "What is XSS, and why does using `textContent` instead of `innerHTML` prevent it?",
    answer:
      "XSS (Cross-Site Scripting) happens when attacker-controlled input is rendered as HTML/script rather than as plain text, letting it execute with the page's own privileges.\n\n`element.innerHTML = userInput` parses `userInput` as markup — any `<script>` tag or event-handler attribute inside it gets interpreted. `element.textContent = userInput` never parses the string as markup at all; it's always rendered literally as visible text, so there's nothing for the browser to execute, no matter what the string contains.",
    difficulty: "easy",
    companies: ["Google", "Meta", "Amazon"],
    orderIndex: 46,
  },

  {
    collection: "ff-75",
    conceptSlug: "web-security-fundamentals",
    question: "How does CSRF exploit cookies, and how does the SameSite attribute defend against it?",
    answer:
      "The browser attaches a site's cookies to any request to that site, regardless of which page triggered the request. A malicious page can submit a form or fire a `fetch()` to your bank's API, and the browser dutifully attaches the bank's session cookie — the request looks legitimate to the server purely because the cookie is valid.\n\n`SameSite=Strict` or `SameSite=Lax` tells the browser not to attach the cookie at all on a request originating from a different site, which stops the forged request from ever carrying valid credentials in the first place.",
    difficulty: "medium",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 47,
  },

  {
    collection: "ff-75",
    conceptSlug: "web-security-fundamentals",
    question: "What does a Content-Security-Policy header actually do?",
    answer:
      "CSP is a browser-enforced whitelist of what's allowed to load or execute on the page — e.g. `script-src 'self' https://trusted-cdn.com` tells the browser to refuse to run any script not from those origins, including inline `<script>` tags by default.\n\nIt's a second line of defense specifically for XSS: even if an attacker manages to inject a `<script>` tag through an XSS bug elsewhere in the app, a correctly configured CSP means the browser simply won't execute it.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 48,
  },

  {
    collection: "ff-75",
    conceptSlug: "web-security-fundamentals",
    question: "What is clickjacking, and how is it prevented?",
    answer:
      "Clickjacking overlays a legitimate page inside an invisible iframe on top of an attacker's own page, tricking the user into clicking something (like a \"confirm transfer\" button) they never saw.\n\nIt's prevented with `X-Frame-Options: DENY` (or `SameOrigin`) or CSP's `frame-ancestors 'none'` — both tell the browser to simply refuse to render the page inside any (or any cross-origin) frame at all.",
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 49,
  },

  {
    collection: "ff-75",
    conceptSlug: "web-security-fundamentals",
    question: "Why doesn't a framework's auto-escaping fully eliminate XSS risk?",
    answer:
      "Auto-escaping (e.g. React escaping interpolated text by default) only protects the specific code path it covers — regular JSX text interpolation. It does nothing to stop a developer who explicitly opts out, such as calling `dangerouslySetInnerHTML` in React or setting `.innerHTML` directly anywhere in the codebase. Auto-escaping reduces the *default* risk, but any deliberate escape hatch reintroduces exactly the same vulnerability the framework was otherwise preventing — which is why sanitizing untrusted HTML remains the developer's responsibility whenever raw HTML rendering is genuinely needed.",
    difficulty: "hard",
    companies: ["Meta", "Google"],
    orderIndex: 50,
  },


  {
    collection: "ff-75",
    conceptSlug: "the-network-stack",
    question: "What are the four steps between typing a URL and the browser receiving a response?",
    answer:
      "1. **DNS resolution** — resolve the hostname to an IP address\n2. **TCP handshake** — establish a reliable connection (`SYN` → `SYN-ACK` → `ACK`)\n3. **TLS handshake** — negotiate an encrypted channel, for HTTPS\n4. **HTTP request/response** — the actual request goes out and the response comes back\n\nEach step is a full round trip (or more, for TLS), so a brand-new HTTPS connection can be 3-4 round trips deep before a single byte of the actual page content arrives.",
    difficulty: "easy",
    companies: ["Google", "Amazon", "Microsoft"],
    orderIndex: 51,
  },

  {
    collection: "ff-75",
    conceptSlug: "the-network-stack",
    question: "Why is the first request to a new domain slower than every request after it?",
    answer:
      "The first request pays the full cost of all four stack steps: a fresh DNS lookup, a fresh TCP handshake, and (for HTTPS) a fresh TLS handshake, before the HTTP request can even go out. Subsequent requests to the *same* domain skip most of this — DNS is cached, and the TCP connection is typically kept alive and reused (HTTP/1.1+ keep-alive), so only the HTTP request/response actually needs to happen again.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 52,
  },

  {
    collection: "ff-75",
    conceptSlug: "the-network-stack",
    question: "What does `<link rel=\"preconnect\">` actually do?",
    answer:
      "It tells the browser to perform the DNS lookup, TCP handshake, and TLS handshake for a given origin **before** the browser has actually discovered a resource that needs it — hiding that latency behind other work that's already happening. When the real request for that origin's resource is eventually made, it can skip straight to the HTTP request/response step, since the connection is already fully established.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 53,
  },

  {
    collection: "ff-75",
    conceptSlug: "the-network-stack",
    question: "Why does adding a third-party script from a new domain have an outsized performance cost?",
    answer:
      "Every distinct origin a page depends on means a brand-new DNS + TCP + TLS handshake cost — not just the bytes of the script itself. A single third-party analytics or ad script can silently add multiple full round trips to a page's load time purely from connection setup, on top of whatever the script itself downloads and executes. This is exactly why reducing the number of distinct third-party origins a page talks to is one of the highest-leverage performance wins available.",
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 54,
  },

  {
    collection: "ff-75",
    conceptSlug: "the-network-stack",
    question: "What's the difference between DNS caching and TCP connection reuse (keep-alive)?",
    answer:
      "**DNS caching** avoids repeating the *hostname → IP address* lookup — the browser/OS remembers the answer for the DNS record's TTL. **Keep-alive** avoids repeating the *TCP handshake itself* — the same already-established connection is reused for multiple HTTP requests instead of tearing it down and reconnecting each time.\n\nThey're independent: a request can have a cached DNS answer but still need a fresh TCP handshake (e.g. the previous connection timed out), or vice versa.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 55,
  },


  {
    collection: "ff-75",
    conceptSlug: "service-workers-caching-strategies",
    question: "How does a service worker intercept a page's network requests?",
    answer:
      "A registered service worker listens for the `fetch` event, which fires for every request the page makes. Calling `event.respondWith(promise)` inside that handler lets the service worker fully control what the page actually receives — an actual network response, something pulled from a `Cache` object, or a combination of both — instead of letting the request go straight to the network unmodified.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 56,
  },

  {
    collection: "ff-75",
    conceptSlug: "service-workers-caching-strategies",
    question: "When would you use cache-first vs. network-first?",
    answer:
      "**Cache-first** — check the cache before ever hitting the network; only fetch on a miss. Right for resources that rarely change: versioned JS/CSS bundles, fonts, icons.\n\n**Network-first** — always try the network first, falling back to cache only if the network fails. Right for data that must be as fresh as possible whenever there's connectivity: a live feed, an account balance.\n\nUsing the wrong one causes real bugs — cache-first on live data means users see stale numbers indefinitely; network-first on a large static bundle means every load is blocked on an avoidable round trip.",
    difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 57,
  },

  {
    collection: "ff-75",
    conceptSlug: "service-workers-caching-strategies",
    question: "What is stale-while-revalidate, and what problem does it solve?",
    answer:
      "It responds from the cache **immediately** (possibly stale, but instant), while kicking off a network fetch in the background to refresh the cache for next time. It's the middle ground between cache-first (fast but can go stale forever) and network-first (always fresh but always waits on the network) — right for content that changes occasionally but shouldn't block the current view, like a news list or a settings page.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 58,
  },

  {
    collection: "ff-75",
    conceptSlug: "service-workers-caching-strategies",
    question: "What happens if a cache-first strategy is applied to an API that returns live data?",
    answer:
      "Once a response is cached, cache-first will keep serving that same stale response forever (or until the cache entry is explicitly invalidated) — the network is never consulted again for that request, no matter how much the underlying data changes server-side. This is a real, common misconfiguration bug: applying one strategy uniformly to every request a service worker intercepts, instead of choosing per-resource based on how often it actually changes.",
    difficulty: "hard",
    companies: ["Meta"],
    orderIndex: 59,
  },

  {
    collection: "ff-75",
    conceptSlug: "service-workers-caching-strategies",
    question: "What's the role of `event.respondWith()` in a service worker's fetch handler?",
    answer:
      "It's how the service worker claims responsibility for a given request's response. Calling it with a promise tells the browser \"wait for this promise instead of hitting the network yourself\" — the promise can resolve with a cached `Response`, a fresh network `Response`, or a constructed one. If `respondWith()` is never called for a given `fetch` event, the browser just proceeds with its normal, un-intercepted network request.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 60,
  },


  {
    collection: "ff-75",
    conceptSlug: "web-workers-concurrency",
    question: "Why does a long-running computation freeze the whole page, even inside an async function?",
    answer:
      "JavaScript's main thread handles rendering, layout, and input alongside running your code — there's only one thread. `async`/`await` only helps with *waiting* (I/O, timers, promises); it does nothing for a computation that's actually CPU-bound and synchronous. A 2-second `for` loop doing real work still occupies the main thread for those full 2 seconds, regardless of whether it's wrapped in an `async` function — the event loop simply can't get to rendering or input handling until that synchronous work finishes.",
    difficulty: "medium",
    companies: ["Google", "Meta", "Amazon"],
    orderIndex: 61,
  },

  {
    collection: "ff-75",
    conceptSlug: "web-workers-concurrency",
    question: "What does a Web Worker not have access to, and why?",
    answer:
      "A worker has no access to the DOM — no `document`, no `window` (its global scope is `self`, not `window`). This is a deliberate constraint: it's exactly what makes it safe to run a worker on a genuinely separate thread in true parallel, with no risk of two threads racing to read or mutate the same DOM node at once. If a worker needs the UI updated, it must `postMessage` its result back to the main thread, which performs the actual DOM update itself.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 62,
  },

  {
    collection: "ff-75",
    conceptSlug: "web-workers-concurrency",
    question: "How do the main thread and a worker communicate, since they can't share memory?",
    answer:
      "Exclusively through `postMessage()` and the `message` event — the main thread posts to the worker via `worker.postMessage(data)`, and the worker posts back via `self.postMessage(result)`. Every value passed this way is **structured-cloned**: deep-copied, not referenced, so mutating the original after sending it has no effect on what the other side received.",
    difficulty: "easy",
    companies: ["Meta", "Amazon"],
    orderIndex: 63,
  },

  {
    collection: "ff-75",
    conceptSlug: "web-workers-concurrency",
    question: "What is a Transferable object, and why is it faster than a normal postMessage?",
    answer:
      "A `Transferable` (like an `ArrayBuffer`) can be **transferred** to a worker instead of cloned: ownership of the underlying memory moves to the receiver at essentially zero cost, rather than the browser copying every byte. The tradeoff is that the sender loses access to it entirely once transferred — `worker.postMessage(buffer, [buffer])` empties `buffer` on the sending side. This matters a lot for large binary payloads (images, audio buffers), where a full clone would otherwise be an expensive copy proportional to the data's size.",
    difficulty: "hard",
    companies: ["Google", "Stripe"],
    orderIndex: 64,
  },

  {
    collection: "ff-75",
    conceptSlug: "web-workers-concurrency",
    question: "Why is `async`/`await` alone not enough to keep a CPU-heavy computation from blocking the UI?",
    answer:
      "`async`/`await` changes *when* code runs relative to other queued work (it yields at `await` points) — it doesn't change *which thread* the code runs on. A CPU-heavy computation with no `await` inside it (a tight loop doing real work) never yields, so it still monopolizes the single main thread for its entire duration, freezing rendering and input regardless of the `async` keyword. Only moving the computation to a Web Worker — a genuinely separate thread — actually frees the main thread to keep working while it runs.",
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 65,
  },


  // React Concepts (Feature 43) — 5 questions per new concept
  {
    collection: "ff-75",
    conceptSlug: "jsx-virtual-dom",
    question: "What does JSX actually compile to?",
    answer:
      "JSX is syntax sugar compiled by Babel/SWC into plain `React.createElement(type, props, ...children)` calls before the code ever runs. `<button className=\"primary\">Save</button>` becomes `React.createElement('button', { className: 'primary' }, 'Save')`, which returns a plain JavaScript object describing the element — not a real DOM node.",
    difficulty: "easy",
    companies: ["Meta", "Google"],
    orderIndex: 66,
  },

  {
    collection: "ff-75",
    conceptSlug: "jsx-virtual-dom",
    question: "Why does React use a Virtual DOM instead of updating the real DOM directly?",
    answer:
      "Reading and writing the real DOM triggers layout, style recalculation, and repaints — all comparatively expensive. Plain JavaScript objects are cheap to create and compare. By building a new Virtual DOM tree on every render and diffing it against the previous one first, React can compute the minimal set of real DOM operations needed and only pay the expensive cost for that minimal set, instead of on every render.",
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 67,
  },


  {
    collection: "ff-75",
    conceptSlug: "usestate-useeffect-fundamentals",
    question: "Why should you use the function form of a state setter (setCount(c => c + 1)) inside rapid or batched updates?",
    answer:
      "The function form always receives the latest pending state, even when multiple updates are batched together before a re-render. `setCount(count + 1)` called three times in a row all close over the same stale `count` from the current render and only apply once net; `setCount(c => c + 1)` called three times correctly compounds to +3, because each call receives the result of the previous one.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 68,
  },

  {
    collection: "ff-75",
    conceptSlug: "usestate-useeffect-fundamentals",
    question: "What is a 'stale closure' in the context of useEffect, and how does it happen?",
    answer:
      "An effect's function closes over the values from the render it was created in. If the effect reads a value but that value is missing from the dependency array, the effect keeps using its original value from whenever it last ran — even after the real value has since changed elsewhere in the component. The fix is always to include every value the effect reads in the dependency array, not to suppress the exhaustive-deps lint warning.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 69,
  },


  {
    collection: "ff-75",
    conceptSlug: "controlled-vs-uncontrolled-forms",
    question: "What determines whether an input is controlled or uncontrolled in React?",
    answer:
      "Whether the input receives a `value` prop from React state. A controlled input's `value` always comes from state and is updated via `onChange`; an uncontrolled input manages its own value internally in the DOM, and React only reads it on demand through a ref.",
    difficulty: "easy",
    companies: ["Meta", "Google"],
    orderIndex: 70,
  },

  {
    collection: "ff-75",
    conceptSlug: "controlled-vs-uncontrolled-forms",
    question: "Why does React warn about a component 'changing from uncontrolled to controlled'?",
    answer:
      "If `value` starts as `undefined` on the first render, React treats the input as uncontrolled. If `value` later becomes a real string, the source of truth flips mid-lifetime — a state React explicitly warns about, since it usually indicates state that was accidentally initialized to `undefined`/`null` instead of an empty string.",
    difficulty: "medium",
    companies: ["Amazon", "Stripe"],
    orderIndex: 71,
  },


  {
    collection: "ff-75",
    conceptSlug: "useref-imperative-handles",
    question: "What's the core difference between useRef and useState?",
    answer:
      "Both persist a value across renders, but `useState` triggers a re-render when updated and `useRef` never does. `useRef` is for values the UI shouldn't reflect — DOM nodes, timer ids, previous values — while `useState` is for anything the rendered output should change in response to.",
    difficulty: "easy",
    companies: ["Meta", "Amazon"],
    orderIndex: 72,
  },

  {
    collection: "ff-75",
    conceptSlug: "useref-imperative-handles",
    question: "Why doesn't mutating a ref's .current property trigger a re-render?",
    answer:
      "`useRef` returns a single, stable mutable object for the component's whole lifetime — React has no hook into assignments to its `.current` property, unlike a state setter, which explicitly schedules work when called. This is intentional: it's what makes refs safe for values that shouldn't cause re-renders, but also means changing `.current` is invisible to anything relying on React to notice.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 73,
  },


  {
    collection: "ff-75",
    conceptSlug: "context-api-prop-drilling",
    question: "What problem does prop drilling create in a component tree?",
    answer:
      "Every intermediate component between the value's source and its actual consumer has to accept and forward a prop it never uses itself. Renaming the prop, adding a new one, or inserting a component in the middle means touching every layer in between, even though most of them have no real relationship to the value.",
    difficulty: "easy",
    companies: ["Meta", "Google"],
    orderIndex: 74,
  },

  {
    collection: "ff-75",
    conceptSlug: "context-api-prop-drilling",
    question: "What re-render cost does Context introduce that passing plain props doesn't?",
    answer:
      "Every component calling `useContext` for a given context re-renders whenever that Provider's `value` changes — regardless of which part of the value it actually reads. A context object holding `{ theme, user, cart }` re-renders a component that only reads `theme` on every `cart` update too, which plain, narrowly-scoped props would never do.",
    difficulty: "medium",
    companies: ["Amazon", "Airbnb"],
    orderIndex: 75,
  },


  {
    collection: "ff-75",
    conceptSlug: "component-composition-patterns",
    question: "Compare the render props pattern to a custom hook — when would you still reach for render props today?",
    answer:
      "Both share stateful logic while leaving the caller in control of rendering, but render props wrap the output in an extra component and level of JSX nesting, while a custom hook doesn't. Render props are still useful when the shared logic genuinely needs to inject markup *between* other elements the caller controls (rather than the caller receiving raw values and rendering however it wants), which a hook alone can't do.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 76,
  },

  {
    collection: "ff-75",
    conceptSlug: "component-composition-patterns",
    question: "How do compound components share state between siblings without prop drilling?",
    answer:
      "The parent (e.g. `<Tabs>`) holds the shared state (like the active tab) in a Context Provider internally; each child component (`Tabs.Trigger`, `Tabs.Panel`) reads that Context directly with `useContext`. The caller's JSX still reads like plain nested markup — no props are manually passed between the siblings themselves.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 77,
  },


  {
    collection: "ff-75",
    conceptSlug: "custom-hooks-composition",
    question: "Why must hooks always be called in the same order on every render?",
    answer:
      "React tracks each `useState`/`useEffect` call by the position it's called in during render, not by any name — there's no variable-name binding at runtime. Skipping a hook call on some renders (by calling it conditionally) shifts every hook call after it into the wrong internal slot, corrupting state that has nothing to do with the skipped hook.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 78,
  },

  {
    collection: "ff-75",
    conceptSlug: "custom-hooks-composition",
    question: "Does a custom hook share state between the different components that call it?",
    answer:
      "No — a custom hook is just a function that calls other hooks; every component that calls it gets its own independent copy of that state. Two components both calling `useToggle()` end up with two completely separate booleans, not one shared boolean.",
    difficulty: "easy",
    companies: ["Amazon"],
    orderIndex: 79,
  },


  {
    collection: "ff-75",
    conceptSlug: "error-boundaries",
    question: "What kinds of errors does an Error Boundary NOT catch?",
    answer:
      "Errors inside event handlers (`onClick`, `onChange`), errors in asynchronous code (`setTimeout` callbacks, rejected promises), errors during server-side rendering, and errors thrown inside the boundary component itself. All of these need a regular `try/catch` at the source, since an Error Boundary only catches errors thrown synchronously during rendering, in lifecycle methods, or in constructors of its descendants.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 80,
  },

  {
    collection: "ff-75",
    conceptSlug: "error-boundaries",
    question: "Why must an Error Boundary be a class component?",
    answer:
      "It relies on `static getDerivedStateFromError` and `componentDidCatch`, two lifecycle methods with no hook equivalent as of React 18 — there is no `useDerivedStateFromError` or `useDidCatch` hook. Function components that need boundary behavior wrap a small class component internally, or use a library like `react-error-boundary` that does this for them.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 81,
  },


  {
    collection: "ff-75",
    conceptSlug: "render-performance-memoization",
    question: "What does React.memo actually compare, and what's a common way it silently fails to help?",
    answer:
      "By default, `React.memo` does a shallow comparison of the new props object against the previous one — same keys, `Object.is`-equal values. It silently stops helping the moment a parent passes a brand-new object, array, or inline function as a prop on every render, since a new reference always fails the shallow-equality check even if its contents are 'the same.'",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 82,
  },

  {
    collection: "ff-75",
    conceptSlug: "render-performance-memoization",
    question: "When would adding useMemo or useCallback make performance worse, not better?",
    answer:
      "When the calculation/function being memoized is cheap and the dependencies change on almost every render anyway — the comparison overhead, plus the memory held onto for the cached value, can exceed the cost of just recomputing it. This is why the React team's own guidance is to profile first and confirm an actual slow re-render before reaching for either.",
    difficulty: "hard",
    companies: ["Amazon", "Stripe"],
    orderIndex: 83,
  },


  {
    collection: "ff-75",
    conceptSlug: "concurrent-react-suspense",
    question: "What problem does useTransition solve that a plain state update doesn't?",
    answer:
      "A plain, synchronous state update blocks the UI from reflecting anything else — including a more urgent update like the next keystroke — until it finishes. `useTransition` marks an update as low-priority and interruptible: if a more urgent update comes in while it's still processing, React abandons the stale in-progress work and starts over with the latest input, keeping the rest of the UI responsive throughout.",
    difficulty: "hard",
    companies: ["Meta", "Google"],
    orderIndex: 84,
  },

  {
    collection: "ff-75",
    conceptSlug: "concurrent-react-suspense",
    question: "How does Suspense actually catch a component that isn't ready to render yet?",
    answer:
      "A component (or the data-fetching library it uses) throws a Promise instead of returning JSX when it isn't ready. React catches that thrown Promise the same way a try/catch would, renders the nearest `<Suspense fallback>` in its place, and automatically retries rendering the component once the Promise resolves.",
    difficulty: "medium",
    companies: ["Amazon"],
    orderIndex: 85,
  },


  {
    collection: "ff-75",
    conceptSlug: "state-management-tradeoffs",
    question: "How do you decide whether a piece of state should be local, lifted, or global?",
    answer:
      "Start local, in whichever component actually uses it. Lift it to the nearest common ancestor only once a sibling genuinely needs to read or update the same value. Reach for a broader mechanism (Context or an external store) only once lifting has pushed the state so many levels up that intermediate components are just forwarding props they never use themselves.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 86,
  },

  {
    collection: "ff-75",
    conceptSlug: "state-management-tradeoffs",
    question: "What's the main advantage of a store with selectors (Zustand/Redux) over Context for frequently-changing state?",
    answer:
      "A selector-based store lets a component subscribe to just the specific slice of state it reads (e.g. `state.cart.items.length`), re-rendering only when that slice changes. Context re-renders every consumer whenever the Provider's whole value changes, regardless of which part any individual consumer actually reads — for state that updates often, that difference in re-render granularity matters a lot at scale.",
    difficulty: "hard",
    companies: ["Amazon", "Stripe"],
    orderIndex: 87,
  },

  // Phase 10 (Feature 44) — CSS Concepts, 5 flagship questions per new concept
  {
    collection: "ff-75",
    conceptSlug: "the-box-model",
    question: "What's the difference between content-box and border-box, and why do most CSS resets set box-sizing: border-box globally?",
    answer:
      "content-box (the default) has width/height describe only the content — padding and border are added on top, so the rendered box grows larger than its declared size. border-box has width/height describe the outer edge instead, so adding padding or border shrinks the content area rather than growing the box. Resets set border-box globally so a declared width stays the actual rendered width no matter how much padding gets added later — without it, every padding change would require recalculating the width by hand.",
    difficulty: "easy",
    companies: ["Google", "Amazon"],
    orderIndex: 88,
  },

  {
    collection: "ff-75",
    conceptSlug: "the-box-model",
    question: "Do margin and padding both add to an element's rendered width the same way?",
    answer:
      "No. Padding is inside the border and is part of the element itself — it's included in border-box's width calculation and shares the element's background. Margin is outside the border, is always excluded from box-sizing's width calculation regardless of content-box or border-box, and is transparent with no background of its own. An element's total footprint on the page is its rendered box (affected by box-sizing) plus its margin on top, always added, never absorbed.",
    difficulty: "easy",
    companies: ["Meta"],
    orderIndex: 89,
  },

  {
    collection: "ff-75",
    conceptSlug: "the-box-model",
    question: "What is margin collapsing, and when does it not apply?",
    answer:
      "Vertical margins between adjacent block-level siblings in normal flow collapse into a single margin equal to the larger of the two, rather than summing. It doesn't apply to horizontal margins, to elements inside a flex or grid container, or across elements with padding/border/a clearfix between them (anything that breaks the two margins from being directly adjacent).",
    difficulty: "medium",
    companies: ["Microsoft"],
    orderIndex: 90,
  },

  {
    collection: "ff-75",
    conceptSlug: "the-box-model",
    question: "A button mysteriously overflows its 100px-wide parent — what's the first CSS property you'd check?",
    answer:
      "box-sizing. If the button has a declared width close to 100px plus any padding or border under the default content-box, that padding/border pushes the rendered width past the parent's 100px. Setting box-sizing: border-box on the button (or globally) makes the declared width the actual rendered width, resolving the overflow without changing the padding.",
    difficulty: "easy",
    companies: ["Airbnb", "Stripe"],
    orderIndex: 91,
  },

  {
    collection: "ff-75",
    conceptSlug: "the-box-model",
    question: "Does box-sizing: border-box affect how margin is calculated?",
    answer:
      "No. box-sizing only changes whether width/height includes padding and border — margin is never part of that calculation under either mode. Margin always sits outside the border and is always added on top of the rendered box, regardless of box-sizing.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 92,
  },

  {
    collection: "ff-75",
    conceptSlug: "units-sizing",
    question: "What's the difference between em and rem, and why does it matter for nested components?",
    answer:
      "em is relative to the current element's own font-size (or the parent's, when used to set font-size itself), so it compounds through nested elements — three nested 1.2em elements multiply to roughly 1.73× the root size. rem is always relative to the root <html> element's font-size, with no compounding regardless of nesting depth. This matters for nested components because an em-based value can silently grow or shrink depending on how deep it's nested, while a rem-based value stays predictable everywhere.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 93,
  },

  {
    collection: "ff-75",
    conceptSlug: "units-sizing",
    question: "When would you reach for vh/vw instead of a percentage?",
    answer:
      "Percentage is relative to the containing block's own size, which only exists if that ancestor has a defined size in the same dimension — a height: 50% on a child with no explicitly-sized parent resolves to nothing. vh/vw are always relative to the viewport itself, independent of any ancestor's size, which makes them the right choice for things like a full-screen hero section that should size off the browser window regardless of what wraps it.",
    difficulty: "medium",
    companies: ["Stripe"],
    orderIndex: 94,
  },

  {
    collection: "ff-75",
    conceptSlug: "units-sizing",
    question: "Why can 100vh behave inconsistently on mobile browsers?",
    answer:
      "Mobile browsers show and hide their own UI chrome (address bar, tab bar) as the user scrolls, which changes the actual visible viewport height in real time — but vh is computed against the layout viewport, which some browsers keep fixed at the largest possible height. The result is a 100vh element that's taller than what's actually visible on first load, or that jumps size as the chrome shows/hides. Newer units like dvh (dynamic viewport height) were introduced specifically to track the real, currently-visible viewport instead.",
    difficulty: "hard",
    companies: ["Airbnb", "Microsoft"],
    orderIndex: 95,
  },

  {
    collection: "ff-75",
    conceptSlug: "units-sizing",
    question: "What are vmin and vmax used for?",
    answer:
      "vmin resolves to 1% of whichever viewport dimension (width or height) is currently smaller; vmax resolves to 1% of whichever is larger. They're useful for sizing something relative to 'whichever direction is tightest' — a square avatar or icon sized in vmin never overflows either axis, regardless of whether the viewport is in portrait or landscape orientation.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 96,
  },

  {
    collection: "ff-75",
    conceptSlug: "units-sizing",
    question: "Why is rem generally preferred over em for a design system's spacing and type scale?",
    answer:
      "Because rem always resolves against one flat reference (the root font-size) with no compounding, a single change — html { font-size: 112.5%; } — rescales an entire spacing and typography system proportionally and predictably. em-based systems can't do this safely, since a root-level change ripples unpredictably through however many levels of nested compounding exist across the app.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 97,
  },

  {
    collection: "ff-75",
    conceptSlug: "the-cascade-inheritance",
    question: "What's the actual order the cascade uses to resolve competing rules?",
    answer:
      "First by origin and importance — user-agent defaults lose to author styles, which lose to a user's own styles, and !important flips each of those pairs, with a user's !important beating an author's !important. Within the same origin/importance tier, specificity decides. If specificity also ties, source order decides — the later declaration wins.",
    difficulty: "medium",
    companies: ["Amazon", "Google"],
    orderIndex: 98,
  },

  {
    collection: "ff-75",
    conceptSlug: "the-cascade-inheritance",
    question: "Which CSS properties inherit from parent to child by default, and why those specifically?",
    answer:
      "Mostly text and typography properties — color, font-family, font-size, line-height, visibility, list-style — because it's rarely useful to have to reset every nested element's font individually. Box-model and layout properties (margin, padding, border, width, background) don't inherit by default, because a child having its own independent box is almost always what's wanted.",
    difficulty: "easy",
    companies: ["Microsoft"],
    orderIndex: 99,
  },

  {
    collection: "ff-75",
    conceptSlug: "the-cascade-inheritance",
    question: "How do you force a non-inherited property to inherit, or force an inherited one to reset?",
    answer:
      "The inherit keyword forces any property to take its parent's computed value, regardless of whether it inherits by default. The initial keyword resets any property to its spec-defined default, regardless of whether it would otherwise inherit — useful for explicitly opting a subtree out of an ancestor's styling.",
    difficulty: "medium",
    companies: ["Stripe"],
    orderIndex: 100,
  },

  {
    collection: "ff-75",
    conceptSlug: "the-cascade-inheritance",
    question: "Why is !important considered a jump to an earlier cascade stage rather than just a specificity boost?",
    answer:
      "Specificity is only ever compared within the same origin/importance tier — !important moves a declaration to an entirely different, higher-priority tier before specificity is ever considered. That's why raising a normal rule's specificity can never beat an !important rule, and why the only way to override one is another !important, escalating a fight that specificity was never actually deciding.",
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 101,
  },

  {
    collection: "ff-75",
    conceptSlug: "the-cascade-inheritance",
    question: "What's the practical difference between the cascade and inheritance as two CSS concepts?",
    answer:
      "The cascade decides which of several competing declared rules wins for a given element and property. Inheritance is a separate fallback mechanism: if no rule at all applies to a property on a given element, some properties automatically take their parent's computed value instead of the browser's built-in default. A property can lose every cascade fight and still resolve correctly purely through inheritance.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 102,
  },

  {
    collection: "ff-75",
    conceptSlug: "flexbox-vs-grid",
    question: "When would you reach for Flexbox over Grid, and vice versa?",
    answer:
      "Flexbox fits one-dimensional, content-driven layouts — a nav bar, a button group, a card's internal stack — where item sizes should drive how space is shared along a single axis. Grid fits two-dimensional, structure-driven layouts — a page shell, a photo gallery, a dashboard — where rows and columns are defined as a shape first and content is placed into it. Most real layouts use Grid for the outer structural shell and Flexbox for the one-dimensional arrangements nested inside each cell.",
    difficulty: "easy",
    companies: ["Meta", "Amazon"],
    orderIndex: 103,
  },

  {
    collection: "ff-75",
    conceptSlug: "flexbox-vs-grid",
    question: "Explain flex-grow, flex-shrink, and flex-basis.",
    answer:
      "flex-basis is an item's starting size before any growing or shrinking. flex-grow decides how much of the container's leftover space this item claims, relative to its siblings' flex-grow values — a value of 0 means it never grows. flex-shrink decides how much this item gives up when the container is too small to fit every item's basis, again relative to siblings, weighted by their basis too.",
    difficulty: "medium",
    companies: ["Google", "Microsoft"],
    orderIndex: 104,
  },

  {
    collection: "ff-75",
    conceptSlug: "flexbox-vs-grid",
    question: "How does flex-wrap change alignment across multiple lines?",
    answer:
      "Without flex-wrap, all items are forced onto a single line, shrinking as needed to fit. With flex-wrap: wrap, items that don't fit spill onto a new line, and each wrapped line becomes its own independent flex line — items in one row don't align with items in the row below unless a two-dimensional system like Grid is used, since Flexbox only ever manages alignment within a single line at a time.",
    difficulty: "medium",
    companies: ["Stripe"],
    orderIndex: 105,
  },

  {
    collection: "ff-75",
    conceptSlug: "flexbox-vs-grid",
    question: "How would you build a typical page shell (sidebar + header + main) — Flexbox, Grid, or both?",
    answer:
      "Grid is the natural fit for the outer shell, since it needs to define both a row structure (header, main, footer) and a column structure (sidebar, content) at once — something Flexbox can't do in a single container. Flexbox is then used inside individual cells for one-dimensional arrangements, like a horizontal row of icons inside the header or a vertical stack inside a card in the main area.",
    difficulty: "medium",
    companies: ["Airbnb"],
    orderIndex: 106,
  },

  {
    collection: "ff-75",
    conceptSlug: "flexbox-vs-grid",
    question: "What's the difference between justify-content and align-items in Flexbox?",
    answer:
      "justify-content aligns items along the main axis (the direction set by flex-direction — typically horizontal for row). align-items aligns items along the cross axis, perpendicular to the main axis. Swapping flex-direction from row to column swaps which axis each property actually controls, since 'main axis' is direction-relative, not always horizontal.",
    difficulty: "easy",
    companies: ["Meta"],
    orderIndex: 107,
  },

  {
    collection: "ff-75",
    conceptSlug: "positioning-stacking-contexts",
    question: "What's the difference between position: absolute, fixed, and sticky?",
    answer:
      "absolute removes an element from flow and positions it relative to its nearest ancestor with a position other than static. fixed removes it from flow and positions it relative to the viewport, so it stays put while the page scrolls (unless an ancestor's transform/filter/will-change creates its own containing block and traps it). sticky behaves like relative until a scroll threshold is crossed, then behaves like fixed within its containing block's bounds.",
    difficulty: "medium",
    companies: ["Google", "Amazon"],
    orderIndex: 108,
  },

  {
    collection: "ff-75",
    conceptSlug: "positioning-stacking-contexts",
    question: "What creates a new stacking context?",
    answer:
      "The root element always creates one. Beyond that: position: relative/absolute combined with a z-index other than auto; position: fixed or sticky, always, regardless of z-index; opacity less than 1; and certain values of transform, filter, will-change, or contain. Once created, every descendant's z-index only ever competes within that context, never against elements outside it.",
    difficulty: "hard",
    companies: ["Meta", "Microsoft"],
    orderIndex: 109,
  },

  {
    collection: "ff-75",
    conceptSlug: "positioning-stacking-contexts",
    question: "Why can z-index: 9999 still lose to a sibling with z-index: 2?",
    answer:
      "z-index only ever compares within the same stacking context — if the 9999 element's ancestor created its own stacking context with a lower z-index than the sibling's context, the 9999 is trapped inside that losing context and never actually competes against the sibling at all. What decides the outcome on screen is the two ancestor contexts' own z-index values, one level up, not the descendant's.",
    difficulty: "hard",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 110,
  },

  {
    collection: "ff-75",
    conceptSlug: "positioning-stacking-contexts",
    question: "What determines the containing block for an absolutely positioned element?",
    answer:
      "Its nearest ancestor whose position is anything other than static — relative, absolute, fixed, or sticky. If no such ancestor exists, it falls back to the initial containing block (effectively the viewport). This is exactly why a common pattern is position: relative on a wrapper with no offsets at all — just to give an absolutely positioned child something to anchor to.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 111,
  },

  {
    collection: "ff-75",
    conceptSlug: "positioning-stacking-contexts",
    question: "Why might position: fixed unexpectedly stop working as expected?",
    answer:
      "A fixed element is normally positioned relative to the viewport — but if any ancestor has a transform, filter, perspective, or will-change value set, that ancestor creates its own containing block, and the fixed element becomes positioned relative to that ancestor instead of the viewport. The element still behaves as 'fixed' locally, but no longer stays put relative to the actual browser window.",
    difficulty: "hard",
    companies: ["Meta"],
    orderIndex: 112,
  },

  {
    collection: "ff-75",
    conceptSlug: "responsive-design-container-queries",
    question: "What's the difference between a media query and a container query?",
    answer:
      "A media query can only ever read the browser viewport's dimensions, regardless of where the styled element actually sits on the page. A container query instead reads the size of a specific containing element, so the same component can respond correctly whether it's rendered in a full-width column or a narrow sidebar.",
    difficulty: "easy",
    companies: ["Amazon", "Google"],
    orderIndex: 113,
  },

  {
    collection: "ff-75",
    conceptSlug: "responsive-design-container-queries",
    question: "What does container-type do, and why is it required for container queries to work?",
    answer:
      "container-type: inline-size (or size) opts an ancestor element into being a queryable container, establishing size containment on it. It's required because an element can't query its own size from within its own rules — that size might depend on the very rules being evaluated, a circular dependency — so the containment boundary always has to be declared on a parent, one level up from the element actually being styled.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 114,
  },

  {
    collection: "ff-75",
    conceptSlug: "responsive-design-container-queries",
    question: "Why do container queries make components more genuinely reusable than media queries?",
    answer:
      "A component styled with a media query has no way to know how wide the space it's actually rendering into is — only how wide the whole viewport is — so it silently breaks the moment it's reused somewhere narrower than the full page. A container query lets the component ask its own container's width instead, so the exact same component styles correctly no matter which layout context it's dropped into.",
    difficulty: "medium",
    companies: ["Airbnb"],
    orderIndex: 115,
  },

  {
    collection: "ff-75",
    conceptSlug: "responsive-design-container-queries",
    question: "Can a container query read the size of the exact element it's styling?",
    answer:
      "No — the query always reads an ancestor's size, never the element's own. A rule can't safely depend on the size of the very element whose styles it's helping determine, since that would be circular; the queried container has to be declared on a parent via container-type, one or more levels above the element the @container rule actually styles.",
    difficulty: "hard",
    companies: ["Microsoft"],
    orderIndex: 116,
  },

  {
    collection: "ff-75",
    conceptSlug: "responsive-design-container-queries",
    question: "What's a common real-world use case for container queries?",
    answer:
      "A card component that needs to switch from a stacked to a side-by-side layout once it has enough room — correctly, whether it's placed in a full-width feed, a two-column grid, or a narrow sidebar widget. Before container queries, this required either JavaScript with a ResizeObserver, or accepting that the component would only look right in one specific layout context.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 117,
  },

  {
    collection: "ff-75",
    conceptSlug: "custom-properties-theming",
    question: "What's the difference between a CSS custom property and a Sass/LESS variable?",
    answer:
      "A Sass variable is a compile-time text substitution — by the time the stylesheet ships, every reference has already been replaced with a fixed value, with no runtime awareness left. A CSS custom property ships to the browser as-is and is resolved live at render time by walking up the cascade from wherever var() is used, which means redefining it on any ancestor can retheme every descendant instantly, with no rebuild.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 118,
  },

  {
    collection: "ff-75",
    conceptSlug: "custom-properties-theming",
    question: "How does var(--name) actually resolve at render time?",
    answer:
      "It's resolved by walking up the cascade from the element using var(), not from wherever --name happens to be declared in the file — checking that element first, then its ancestors, until a matching declaration is found. This is exactly like inheritance's lookup, which is why the same variable name can resolve to different actual values in different parts of the page.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 119,
  },

  {
    collection: "ff-75",
    conceptSlug: "custom-properties-theming",
    question: "How would you implement a dark mode toggle using custom properties, without a JavaScript re-render?",
    answer:
      "Define the theme's custom properties (--accent-color, --surface-bg, etc.) at :root, and redefine them under a .theme-dark class scope. Toggling that single class on the <html> or <body> element (via classList.toggle, no React re-render needed) makes the browser re-resolve every var() reference beneath that point automatically, since custom properties genuinely cascade like any other CSS property.",
    difficulty: "medium",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 120,
  },

  {
    collection: "ff-75",
    conceptSlug: "custom-properties-theming",
    question: "What happens if you reference a custom property that was never declared?",
    answer:
      "var() accepts an optional second argument as a fallback — var(--accent-color, blue) resolves to blue if --accent-color isn't declared anywhere in the element's ancestor chain. Without a fallback, an undefined custom property makes the property it's used in behave as if it were unset (its inherited or initial value), rather than causing an error.",
    difficulty: "easy",
    companies: ["Meta"],
    orderIndex: 121,
  },

  {
    collection: "ff-75",
    conceptSlug: "custom-properties-theming",
    question: "Can custom properties be read and changed from JavaScript?",
    answer:
      "Yes — element.style.setProperty('--accent-color', 'cyan') sets it, and getComputedStyle(element).getPropertyValue('--accent-color') reads its resolved value. This is what makes custom properties useful for values JavaScript needs to drive dynamically, like a draggable slider's live position, without needing to rewrite an entire class's worth of styles imperatively.",
    difficulty: "medium",
    companies: ["Microsoft"],
    orderIndex: 122,
  },

  {
    collection: "ff-75",
    conceptSlug: "pseudo-classes-pseudo-elements-has",
    question: "What's the difference between a pseudo-class and a pseudo-element?",
    answer:
      "A pseudo-class (single colon, like :hover or :nth-child) selects a real element in the DOM that happens to be in a particular state, position, or relationship. A pseudo-element (double colon, like ::before or ::first-line) targets a sub-part of an element's rendered content that has no corresponding node in the DOM at all — it's generated or implied by rendering, not a real element you could otherwise select.",
    difficulty: "easy",
    companies: ["Amazon", "Google"],
    orderIndex: 123,
  },

  {
    collection: "ff-75",
    conceptSlug: "pseudo-classes-pseudo-elements-has",
    question: "How does :has() differ from every other CSS combinator?",
    answer:
      "Every other combinator (descendant, child >, sibling ~/+) only lets a selector reach downward or sideways from where it's anchored. :has() is the first selector that lets an element match based on its descendants — form:has(:invalid) selects the <form> itself, driven by whether some input inside it is currently invalid, effectively acting as a 'parent selector' that nothing in CSS could express before.",
    difficulty: "hard",
    companies: ["Meta", "Stripe"],
    orderIndex: 124,
  },

  {
    collection: "ff-75",
    conceptSlug: "pseudo-classes-pseudo-elements-has",
    question: "Give an example of something :has() lets you do in pure CSS that used to require JavaScript.",
    answer:
      "Highlighting a form as invalid whenever any of its fields are invalid — form:has(:invalid) { border-color: red; } — previously required a JavaScript event listener toggling a class based on each field's validity. Similarly, .card:has(img) can style a card differently only when it actually contains an image, without a conditional class from a component's render logic.",
    difficulty: "medium",
    companies: ["Airbnb"],
    orderIndex: 125,
  },

  {
    collection: "ff-75",
    conceptSlug: "pseudo-classes-pseudo-elements-has",
    question: "What's the difference between :nth-child() and :nth-of-type()?",
    answer:
      ":nth-child(n) counts an element's position among all its siblings, regardless of tag name — so li:nth-child(2) only matches if the <li> is literally the second child overall. :nth-of-type(n) counts an element's position only among siblings of the same tag name, ignoring any other elements interspersed between them.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 126,
  },

  {
    collection: "ff-75",
    conceptSlug: "pseudo-classes-pseudo-elements-has",
    question: "What do :is() and :where() do, and how do they differ in specificity?",
    answer:
      "Both let you group several selectors into one, shorter rule — :is(header, footer) nav matches a nav inside either a header or a footer. The difference is specificity: :is() takes on the specificity of its most specific argument, while :where() always contributes zero specificity, regardless of what's inside it — useful for writing overridable base styles that shouldn't fight with more specific component rules later.",
    difficulty: "hard",
    companies: ["Microsoft", "Meta"],
    orderIndex: 127,
  },

  {
    collection: "ff-75",
    conceptSlug: "animation-performance",
    question: "Why do transform and opacity animate more smoothly than width or top?",
    answer:
      "transform and opacity are Composite-only properties — the browser can hand an already-painted layer straight to the GPU and just reposition or fade it, skipping Layout and Paint entirely on every frame. width and top are layout-triggering — changing either forces the browser to recompute geometry (Layout), re-rasterize pixels (Paint), and then recomposite, on every single frame, which is far more expensive at 60fps.",
    difficulty: "medium",
    companies: ["Google", "Amazon"],
    orderIndex: 128,
  },

  {
    collection: "ff-75",
    conceptSlug: "animation-performance",
    question: "What's a compositor layer, and how does will-change relate to it?",
    answer:
      "A compositor layer is a separately rasterized bitmap the GPU can move, scale, or fade independently of the rest of the page, which is what makes transform/opacity animations cheap. will-change: transform hints the browser to pre-promote an element onto its own layer before an animation starts, avoiding a layer-creation cost on the very first frame — but it should be used sparingly, since promoting many elements trades memory for that benefit.",
    difficulty: "hard",
    companies: ["Meta", "Stripe"],
    orderIndex: 129,
  },

  {
    collection: "ff-75",
    conceptSlug: "animation-performance",
    question: "How would you diagnose a janky animation using browser DevTools?",
    answer:
      "The Performance panel's frame-by-frame breakdown shows purple bars for Layout and green bars for Paint on each frame — a janky animation shows repeated purple/green activity on every frame, while a smooth 60fps one shows almost nothing but a thin composite step. Seeing repeated Layout/Paint work points directly at which animated property is the culprit.",
    difficulty: "medium",
    companies: ["Airbnb"],
    orderIndex: 130,
  },

  {
    collection: "ff-75",
    conceptSlug: "animation-performance",
    question: "Why might overusing will-change actually hurt performance?",
    answer:
      "Every element with will-change gets promoted to its own compositor layer, and each layer consumes GPU memory. Applying it broadly (or leaving it on elements that aren't actively animating) can create far more layers than the device can comfortably manage, trading away the memory budget it was meant to save time with — it's a targeted, temporary hint for elements about to animate, not a default optimization to sprinkle everywhere.",
    difficulty: "hard",
    companies: ["Google"],
    orderIndex: 131,
  },

  {
    collection: "ff-75",
    conceptSlug: "animation-performance",
    question: "What rendering pipeline stages does each property tier skip when animated?",
    answer:
      "Layout-triggering properties (width, top, margin) skip nothing — Layout, Paint, and Composite all re-run every frame. Paint-only properties (color, box-shadow) skip Layout but still re-run Paint and Composite. Composite-only properties (transform, opacity) skip both Layout and Paint, running only Composite — the cheapest possible path, and the only one that reliably holds 60fps under load.",
    difficulty: "medium",
    companies: ["Microsoft", "Meta"],
    orderIndex: 132,
  },

  // Phase 10 (Feature 45) — TypeScript Concepts, 5 flagship questions per new concept
  {
    collection: "ff-75",
    conceptSlug: "basic-types-inference",
    question: "What's the difference between `any` and `unknown` in TypeScript?",
    answer:
      "Both accept any value on assignment, but they differ completely on what you can do with that value afterward. `any` disables type checking entirely — every operation on it is allowed, including ones that will crash at runtime, and it silently spreads to any variable it's assigned to. `unknown` blocks every operation until you've narrowed it with a type guard (`typeof`, `instanceof`, etc.) — it's the safe choice for a genuinely untyped boundary like a JSON response or `localStorage` read.",
    difficulty: "easy",
    companies: ["Google", "Meta"],
    orderIndex: 133,
  },

  {
    collection: "ff-75",
    conceptSlug: "basic-types-inference",
    question: "When does TypeScript infer a type instead of requiring an annotation?",
    answer:
      "Whenever a variable is assigned a value at declaration, TypeScript infers the narrowest type that fits and holds the variable to it going forward — `let count = 5` is inferred as `number` with no annotation needed. Inference also flows through function return values and generic calls. Annotations mostly earn their keep on function parameters and public APIs, where there's no assigned value yet for TypeScript to infer from.",
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 134,
  },

  {
    collection: "ff-75",
    conceptSlug: "basic-types-inference",
    question: "What does the `never` type represent, and when would a function return it?",
    answer:
      "`never` is the type of a value that can't exist — it represents an unreachable case. A function returns `never` when it never actually produces a value: one that always throws, or one that infinite-loops. It also shows up as the result of narrowing away every possibility in a union, which is exactly what powers exhaustiveness checks.",
    difficulty: "medium",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 135,
  },

  {
    collection: "ff-75",
    conceptSlug: "basic-types-inference",
    question: "Why is `unknown` considered safer than `any` even though both accept any value?",
    answer:
      "The safety difference is entirely about what happens *after* assignment, not at assignment. `any` propagates silently and permits every operation with no error, so a type mistake surfaces as a runtime crash instead of a compile error. `unknown` requires an explicit narrowing check before any operation is allowed, so the compiler keeps enforcing safety the moment the value is actually used, not just when it first enters the system.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 136,
  },

  {
    collection: "ff-75",
    conceptSlug: "basic-types-inference",
    question: "How does exhaustiveness checking use the `never` type?",
    answer:
      "A `default` case (or final `else`) that assigns the remaining value to a parameter typed `never` only compiles if every other case has truly been handled — once all real possibilities are narrowed away in the preceding branches, what's left is provably nothing, i.e. `never`. Add a new variant to the original union without handling it, and that assignment stops compiling, catching the missing case at build time instead of at runtime.",
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 137,
  },

  {
    collection: "ff-75",
    conceptSlug: "interfaces-vs-type-aliases",
    question: "What is declaration merging, and which of `interface`/`type` supports it?",
    answer:
      "Declaration merging is when multiple declarations with the same name automatically combine into one — two separate `interface Config { ... }` blocks anywhere in scope merge into a single shape with every field from both. Only `interface` supports this; declaring `type Config = { ... }` a second time is a compile error (\"Duplicate identifier\"), not a merge. It's how libraries safely extend global or third-party types without editing the original source.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 138,
  },

  {
    collection: "ff-75",
    conceptSlug: "interfaces-vs-type-aliases",
    question: "When would you choose `type` over `interface`, or vice versa?",
    answer:
      "`type` is the only option once a shape needs to be a union, a tuple, or any non-object type expression — `interface` has no syntax for \"one of these three string literals.\" `interface` is preferable for object shapes a consumer might reasonably need to extend later, like component props or a public API's request/response shape, since it supports declaration merging and a slightly more familiar `extends` syntax.",
    difficulty: "easy",
    companies: ["Meta", "Amazon"],
    orderIndex: 139,
  },

  {
    collection: "ff-75",
    conceptSlug: "interfaces-vs-type-aliases",
    question: "Can a `type` alias express a union? Can an `interface`?",
    answer:
      "`type` can — `type Status = \"idle\" | \"loading\" | \"error\"` is a completely ordinary type alias. `interface` cannot; it can only describe the shape of a single object, function, or class, so there's no way to write an interface that means \"one of these three specific things.\" This is the clearest case where `type` is not optional.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 140,
  },

  {
    collection: "ff-75",
    conceptSlug: "interfaces-vs-type-aliases",
    question: "What happens if you declare two `type` aliases with the same name?",
    answer:
      "It's a compile error — \"Duplicate identifier\" — because `type` aliases don't merge the way `interface` declarations do. Each `type` name can only be declared once in a given scope; if you need to add fields to an existing type-aliased shape, you have to define a new type and intersect it (`type Extended = Original & { extra: string }`) rather than redeclare the original name.",
    difficulty: "medium",
    companies: ["Microsoft"],
    orderIndex: 141,
  },

  {
    collection: "ff-75",
    conceptSlug: "interfaces-vs-type-aliases",
    question: "How do you extend an interface, and how does that compare to intersecting a type?",
    answer:
      "`interface Admin extends User { role: string }` adds fields on top of `User`'s shape, and TypeScript reports a clear error if a field conflicts incompatibly. The `type` equivalent is an intersection — `type Admin = User & { role: string }` — which produces a structurally identical result but resolves conflicting fields differently (an intersection of two incompatible types for the same key collapses to `never` for that field, rather than raising the same explicit conflict error `extends` does).",
    difficulty: "hard",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 142,
  },

  {
    collection: "ff-75",
    conceptSlug: "generics",
    question: "What problem do generics solve compared to using `any`?",
    answer:
      "Without generics, a reusable function has two bad options: duplicate it once per concrete type, or type its parameters `any` and lose type checking entirely. A generic type parameter (`<T>`) lets one function definition work across every type while TypeScript still infers and enforces the actual type per call — `first(numbers)[0]` is known to be `number`, `first(strings)[0]` is known to be `string`, from the exact same function body.",
    difficulty: "easy",
    companies: ["Google", "Meta"],
    orderIndex: 143,
  },

  {
    collection: "ff-75",
    conceptSlug: "generics",
    question: "How does `K extends keyof T` constrain a generic type parameter?",
    answer:
      "`keyof T` produces a union of `T`'s actual property names, and `K extends keyof T` restricts the generic parameter `K` to only those names. A function like `pluck<T, K extends keyof T>(obj: T, key: K): T[K]` then rejects a typo'd or nonexistent key at compile time, since a string that isn't one of `T`'s real keys simply isn't assignable to `K`.",
    difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 144,
  },

  {
    collection: "ff-75",
    conceptSlug: "generics",
    question: "What happens when you call a generic function without an explicit type argument?",
    answer:
      "TypeScript infers the type argument from the actual arguments passed at the call site — `first([1, 2, 3])` infers `T` as `number` without needing `first<number>([1, 2, 3])` written out. Explicit type arguments are only needed when inference genuinely can't determine `T` from the call, such as calling a generic function with no arguments that reference `T` at all.",
    difficulty: "easy",
    companies: ["Meta"],
    orderIndex: 145,
  },

  {
    collection: "ff-75",
    conceptSlug: "generics",
    question: "Can a function declare more than one generic type parameter?",
    answer:
      "Yes — a signature can declare as many generic parameters as it needs, each inferred independently from a different argument. `function merge<A, B>(a: A, b: B): A & B` infers `A` from the first argument and `B` from the second, and returns their intersection, with no relationship required between the two type parameters unless one is explicitly constrained against the other.",
    difficulty: "medium",
    companies: ["Stripe"],
    orderIndex: 146,
  },

  {
    collection: "ff-75",
    conceptSlug: "generics",
    question: "Why doesn't `first<T>(arr: T[]): T` need to be duplicated per array type?",
    answer:
      "`T` is a placeholder that gets filled in per call rather than fixed at the function's definition — TypeScript infers a fresh `T` for `first([1,2,3])` (`number`) and a different fresh `T` for `first([\"a\",\"b\"])` (`string`) from the same compiled function. The alternative — `firstNumber`, `firstString`, and so on — would require identical logic copy-pasted once per concrete type, which is exactly the duplication generics exist to eliminate.",
    difficulty: "easy",
    companies: ["Google", "Airbnb"],
    orderIndex: 147,
  },

  {
    collection: "ff-75",
    conceptSlug: "utility-types",
    question: "What does `Partial<T>` do, and where is it commonly used?",
    answer:
      "`Partial<T>` produces a new type identical to `T` but with every property made optional. It's most common for \"update\" payloads, where a caller only sends the fields that actually changed, and for objects that get built up incrementally across several steps before every required field has a value.",
    difficulty: "easy",
    companies: ["Meta", "Amazon"],
    orderIndex: 148,
  },

  {
    collection: "ff-75",
    conceptSlug: "utility-types",
    question: "What's the difference between `Pick<T, K>` and `Omit<T, K>`?",
    answer:
      "`Pick<T, K>` keeps only the listed keys `K` from `T` and drops everything else — useful for a narrow view like a list-item type. `Omit<T, K>` is the inverse: it keeps every key of `T` *except* the listed ones — useful for a \"create\" input type that excludes a server-assigned field like `id`. Both are derived from `T`, so they stay accurate automatically if `T` gains or loses fields later.",
    difficulty: "easy",
    companies: ["Google", "Microsoft"],
    orderIndex: 149,
  },

  {
    collection: "ff-75",
    conceptSlug: "utility-types",
    question: "How does `Record<K, V>` differ from the other utility types in what it derives?",
    answer:
      "`Partial`, `Pick`, and `Omit` all transform an *existing* object type. `Record<K, V>` doesn't start from an object type at all — it constructs one from a union of keys `K` and a single value type `V`, mapping every key in `K` to `V`. It's the one utility type here whose job is to build a shape from a key list, not derive a variant of an existing shape.",
    difficulty: "medium",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 150,
  },

  {
    collection: "ff-75",
    conceptSlug: "utility-types",
    question: "How would you combine `Partial` and `Omit` to build an \"update\" input type?",
    answer:
      "`type UserUpdateInput = Partial<Omit<User, \"id\">>` — `Omit` first drops the server-assigned `id` field entirely, then `Partial` makes every remaining field optional, since an update payload might only touch one or two fields at a time. Utility types compose freely because each one is just a function from a type to a type, so nesting them is ordinary function composition at the type level.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 151,
  },

  {
    collection: "ff-75",
    conceptSlug: "utility-types",
    question: "Why do utility types stay in sync automatically when the source type changes?",
    answer:
      "Because they're computed from `T`, not redefined by hand — `Pick<User, \"id\" | \"name\">` re-derives its shape from `User`'s current definition every time it's used, so adding a field to `User` doesn't require touching every derived type separately. A hand-written duplicate type has no such connection and silently drifts out of sync the moment the source type changes and the duplicate isn't updated to match.",
    difficulty: "hard",
    companies: ["Google", "Airbnb"],
    orderIndex: 152,
  },

  {
    collection: "ff-75",
    conceptSlug: "type-narrowing",
    question: "What's the difference between `typeof` narrowing and `instanceof` narrowing?",
    answer:
      "`typeof` distinguishes JavaScript's primitive types — `\"string\"`, `\"number\"`, `\"boolean\"`, `\"object\"`, `\"function\"`, `\"undefined\"` — but can't tell apart different object shapes or class instances, since they're all `\"object\"`. `instanceof` fills that gap by checking against a constructor's prototype chain, so `err instanceof RangeError` narrows correctly even though `typeof err` would just say `\"object\"` for any `Error` subclass.",
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 153,
  },

  {
    collection: "ff-75",
    conceptSlug: "type-narrowing",
    question: "How does the `in` operator narrow a union of object types?",
    answer:
      "`if (\"radius\" in shape)` checks whether a property actually exists on the value at runtime, and TypeScript uses that check to narrow `shape` to whichever union member(s) declare a `radius` field. It's the tool for narrowing object shapes that don't share a common literal discriminant field — where `typeof`/`instanceof` can't help because both variants are plain objects.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 154,
  },

  {
    collection: "ff-75",
    conceptSlug: "type-narrowing",
    question: "Why does narrowing stop working once a value is passed into a callback?",
    answer:
      "Narrowing is control-flow analysis — TypeScript tracks which checks are guaranteed to have run by a given line, based on the literal shape of the surrounding `if`/`switch`/early-return statements. Once a narrowed value crosses into a separate callback (especially an async one, or one stored and called later), the compiler can no longer statically prove the original check still holds by the time that callback runs, so the narrowing doesn't carry over automatically.",
    difficulty: "hard",
    companies: ["Stripe", "Meta"],
    orderIndex: 155,
  },

  {
    collection: "ff-75",
    conceptSlug: "type-narrowing",
    question: "What's the difference between narrowing and a type assertion (`as`)?",
    answer:
      "Narrowing is always backed by a real runtime check the compiler can verify — `typeof value === \"string\"` genuinely proves `value` is a string in that branch. A type assertion (`value as string`) makes no such promise; it just tells the compiler to trust you, with zero runtime check behind it, so an incorrect assertion compiles cleanly and fails later at the point the value is actually used incorrectly.",
    difficulty: "medium",
    companies: ["Airbnb"],
    orderIndex: 156,
  },

  {
    collection: "ff-75",
    conceptSlug: "type-narrowing",
    question: "How does `Array.isArray` help narrow a `T | T[]` union?",
    answer:
      "`typeof` can't distinguish an array from a plain object — both report `\"object\"` — so `Array.isArray(value)` is the dedicated check for that specific split. Inside the `if (Array.isArray(value))` branch, TypeScript narrows `value` to the array member of the union; in the `else`, it narrows to the non-array member, letting each branch use the value's real shape with no cast.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 157,
  },

  {
    collection: "ff-75",
    conceptSlug: "discriminated-unions",
    question: "What is a discriminant field, and why does it need to be a literal type?",
    answer:
      "A discriminant is a field every variant in a union shares, holding a distinct literal value — often `type` or `kind`. It has to be a literal type (`\"circle\"`, not the general type `string`) specifically because narrowing depends on TypeScript being able to prove that `shape.kind === \"circle\"` rules out every other variant; if `kind` were typed as plain `string`, no single check could ever eliminate the other possibilities.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 158,
  },

  {
    collection: "ff-75",
    conceptSlug: "discriminated-unions",
    question: "How does exhaustiveness checking work with a discriminated union and `never`?",
    answer:
      "A `default` case that passes the remaining value into a function typed to accept only `never` will only compile if every other `case` in the `switch` has already narrowed away every real variant. Add a new variant to the union without adding its `case`, and the `default` branch's value is no longer narrowed to `never` — the compile error lands exactly where the new case needs to be added.",
    difficulty: "hard",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 159,
  },

  {
    collection: "ff-75",
    conceptSlug: "discriminated-unions",
    question: "Why are discriminated unions the standard pattern for Redux-style reducers?",
    answer:
      "A reducer's whole job is branching on `action.type` and reading whatever data that specific action carries — exactly what a discriminated union is designed for. Typing `Action` as a union of `{ type: \"increment\" } | { type: \"set\"; value: number }` means `switch (action.type) { case \"set\": return action.value; }` gets `action.value` fully type-checked, with no manual cast, and no risk of reading a field that variant doesn't actually have.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 160,
  },

  {
    collection: "ff-75",
    conceptSlug: "discriminated-unions",
    question: "What breaks if two variants in a discriminated union share the same discriminant value?",
    answer:
      "Narrowing becomes ambiguous — if both `Circle` and `Ellipse` used `kind: \"circle\"`, checking `shape.kind === \"circle\"` couldn't narrow to just one of them, since TypeScript can't tell which fields are actually present without a unique literal per variant. Each variant's discriminant value has to be distinct for the whole pattern to work at all.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 161,
  },

  {
    collection: "ff-75",
    conceptSlug: "discriminated-unions",
    question: "How does a `switch` on the discriminant narrow the entire object, not just that field?",
    answer:
      "TypeScript's control-flow analysis ties the discriminant's narrowed value back to which union member the whole object must be — inside `case \"circle\":`, it's not just `shape.kind` that's known to be `\"circle\"`, the compiler has eliminated every other possibility for `shape` itself, so `shape.radius` becomes accessible with no cast, even though `radius` and `kind` are two separate fields.",
    difficulty: "hard",
    companies: ["Microsoft", "Stripe"],
    orderIndex: 162,
  },

  {
    collection: "ff-75",
    conceptSlug: "conditional-mapped-types",
    question: "What does `{ [K in keyof T]: ... }` do?",
    answer:
      "It's a mapped type — `keyof T` produces a union of `T`'s property names, and `[K in ...]` iterates over that union once per key, producing a new value type for each, the same way `Array.prototype.map` transforms every array element the same way. `T[K]` inside the mapping looks up that specific key's original value type, so the result stays connected to `T`'s real shape.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 163,
  },

  {
    collection: "ff-75",
    conceptSlug: "conditional-mapped-types",
    question: "How does a conditional type like `T extends U ? X : Y` get evaluated?",
    answer:
      "It's the type-level equivalent of a ternary — the compiler checks whether `T` is assignable to `U`, and resolves to `X` if so, `Y` if not, entirely at compile time with no runtime cost. It's most powerful combined with a generic `T`, since the same conditional type expression can resolve differently for every concrete type it's applied to.",
    difficulty: "medium",
    companies: ["Amazon", "Stripe"],
    orderIndex: 164,
  },

  {
    collection: "ff-75",
    conceptSlug: "conditional-mapped-types",
    question: "What does `infer` do inside a conditional type?",
    answer:
      "`infer` introduces a new type variable inside a conditional type's `extends` clause, capturing whatever type appears in that specific position if the match succeeds. `T extends (...args: never[]) => infer R ? R : never` matches any function type and captures its actual return type as `R` — it's how `ReturnType<T>` and similar utility types extract a piece of a larger type instead of just testing it.",
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 165,
  },

  {
    collection: "ff-75",
    conceptSlug: "conditional-mapped-types",
    question: "How is `Partial<T>` implemented using a mapped type?",
    answer:
      "`type MyPartial<T> = { [K in keyof T]?: T[K] }` — every key of `T` maps to itself, with a `?` added to make it optional. There's no special compiler feature behind `Partial`; it's a three-line mapped type shipped as a named utility so nobody has to write it themselves.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 166,
  },

  {
    collection: "ff-75",
    conceptSlug: "conditional-mapped-types",
    question: "How is `ReturnType<T>` implemented using a conditional type?",
    answer:
      "`type MyReturnType<T> = T extends (...args: never[]) => infer R ? R : never` — the conditional checks whether `T` matches a function type pattern, and if so, `infer R` captures the function's actual return type; if `T` isn't a function at all, the result falls back to `never`. It's a conditional type using `infer` to pull one specific piece out of a larger matched type.",
    difficulty: "hard",
    companies: ["Stripe", "Microsoft"],
    orderIndex: 167,
  },

  {
    collection: "ff-75",
    conceptSlug: "template-literal-branded-types",
    question: "What can a template literal type express that a plain `string` type can't?",
    answer:
      "A template literal type describes every string matching a specific pattern, checked at compile time — `type Margin = \\`margin-${\"top\" | \"right\" | \"bottom\" | \"left\"}\\`` is exactly those four literal strings, not any arbitrary string. A plain `string` accepts any value at all, so a typo like `\"margin-diagonal\"` would compile; as the template literal type, it's a compile error instead.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 168,
  },

  {
    collection: "ff-75",
    conceptSlug: "template-literal-branded-types",
    question: "Why does TypeScript's structural typing let you pass an `OrderId` where a `UserId` is expected, if both are just `string`?",
    answer:
      "TypeScript compares types by shape, not by name — `type UserId = string` and `type OrderId = string` both compile down to exactly `string`, and structurally there's nothing distinguishing them, so a function expecting `UserId` happily accepts a value typed `OrderId`. This is exactly the class of bug — passing the wrong kind of ID where a similarly-shaped one belongs — that structural typing alone can't catch.",
    difficulty: "hard",
    companies: ["Stripe", "Amazon"],
    orderIndex: 169,
  },

  {
    collection: "ff-75",
    conceptSlug: "template-literal-branded-types",
    question: "What is a \"branded type,\" and how does it fix that problem?",
    answer:
      "A branded type intersects a base type with a fake marker property that only exists in the type system — `type UserId = string & { readonly __brand: \"UserId\" }`. Two brands with different marker values become structurally incompatible even though their base type is identical, so `OrderId` is no longer assignable where `UserId` is expected, simulating the nominal typing (matched by name, not shape) that TypeScript doesn't have natively.",
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 170,
  },

  {
    collection: "ff-75",
    conceptSlug: "template-literal-branded-types",
    question: "Does a brand exist at runtime?",
    answer:
      "No — the `__brand` marker property is purely a type-level fiction that never actually exists on any real value; a branded `UserId` is, at runtime, just a plain string like any other. The brand only affects what the compiler will and won't let you assign; it adds zero runtime behavior or overhead.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 171,
  },

  {
    collection: "ff-75",
    conceptSlug: "template-literal-branded-types",
    question: "What are two real-world use cases for branded types?",
    answer:
      "Distinguishing structurally-identical ID types (a `UserId` from an `OrderId`, both really `string`, so they can't be passed to the wrong function by accident) and distinguishing units or currencies (a dollar amount from a cent amount, or meters from feet, both really `number`, so they can't be silently mixed in a calculation). Both are cases where the underlying primitive type is the same but the *meaning* genuinely isn't interchangeable.",
    difficulty: "medium",
    companies: ["Stripe", "Google"],
    orderIndex: 172,
  },

  {
    collection: "ff-75",
    conceptSlug: "aria-roles-and-semantic-html",
    question: "What is the \"First Rule of ARIA\"?",
    answer:
      "No ARIA is better than bad ARIA — always prefer a real semantic HTML element over recreating its behavior with ARIA attributes on a generic element like a div. A native `<button>` already ships with the correct role, keyboard support, and focusability; a `<div role=\"button\">` only gets the announced role, and every other piece of behavior has to be rebuilt by hand and is easy to get wrong.",
    difficulty: "easy",
    companies: ["Google", "Meta"],
    orderIndex: 173,
  },

  {
    collection: "ff-75",
    conceptSlug: "aria-roles-and-semantic-html",
    question: "Why is a `<div onclick=\"...\">` less accessible than a `<button onclick=\"...\">`, even if they look identical?",
    answer:
      "A `<div>` has no implicit role, isn't in the Tab order by default, has no visible focus indicator, and doesn't respond to Enter or Space — all of that is native, free behavior on `<button>`. Recreating it on a div means adding `role=\"button\"`, `tabindex=\"0\"`, a focus style, and manual keydown handlers for both Enter and Space, and missing any one of them leaves a control that mouse users can operate but keyboard and screen reader users can't.",
    difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 174,
  },

  {
    collection: "ff-75",
    conceptSlug: "aria-roles-and-semantic-html",
    question: "What are landmark elements and why do they matter for screen reader users?",
    answer:
      "Landmarks — `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>` — mark out the major regions of a page in a way screen readers expose as a navigable list. Instead of reading through the entire page linearly, a screen reader user can jump directly to the main content or the navigation menu, the same way a sighted user visually scans straight to the section they want.",
    difficulty: "easy",
    companies: ["Stripe"],
    orderIndex: 175,
  },

  {
    collection: "ff-75",
    conceptSlug: "aria-roles-and-semantic-html",
    question: "When is it actually appropriate to add an ARIA role to a non-semantic element?",
    answer:
      "Only when there's no native HTML element for the pattern at all — a tab panel, a combobox, a custom slider. Even then, the underlying element should still be a real focusable, keyboard-operable base (often a `<button>` or a div with `tabindex=\"0\"` and full key handling) — ARIA augments the semantics on top of working keyboard behavior, it doesn't substitute for it.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 176,
  },

  {
    collection: "ff-75",
    conceptSlug: "aria-roles-and-semantic-html",
    question: "What's wrong with adding `role=\"button\"` to a div and stopping there?",
    answer:
      "It announces to assistive tech that the element behaves like a button, without actually making it behave like one — no keyboard focusability, no Enter/Space activation. That's arguably worse than no ARIA at all: a screen reader user is told \"this is a button\" and then discovers it doesn't respond the way every other button on the page does.",
    difficulty: "hard",
    companies: ["Google"],
    orderIndex: 177,
  },

  {
    collection: "ff-75",
    conceptSlug: "accessible-images-media",
    question: "What's the difference between `alt=\"\"` and omitting the `alt` attribute entirely?",
    answer:
      "`alt=\"\"` is a deliberate signal that the image is decorative — a screen reader silently skips it. Omitting `alt` altogether is usually a bug: many screen readers fall back to announcing the image's file path or name as if it were real content, which is worse than saying nothing.",
    difficulty: "easy",
    companies: ["Meta", "Google"],
    orderIndex: 178,
  },

  {
    collection: "ff-75",
    conceptSlug: "accessible-images-media",
    question: "How should alt text differ for a functional image (one inside a link or button) versus a purely informational image?",
    answer:
      "A functional image's alt text should describe the destination or action it performs — \"View shopping cart\" for a cart icon inside a link — not what the icon literally looks like. An informational image's alt text should describe the content or meaning of the image itself, since there's no action for it to describe.",
    difficulty: "medium",
    companies: ["Amazon", "Stripe"],
    orderIndex: 179,
  },

  {
    collection: "ff-75",
    conceptSlug: "accessible-images-media",
    question: "What's the difference between captions and a transcript?",
    answer:
      "Captions are text synced to a video's timeline, covering dialogue and important non-speech sound, meant to be read alongside real-time playback. A transcript is a full text version with no timeline — used for audio-only content, or as a scannable/searchable alternative alongside a captioned video.",
    difficulty: "easy",
    companies: ["Microsoft"],
    orderIndex: 180,
  },

  {
    collection: "ff-75",
    conceptSlug: "accessible-images-media",
    question: "How do you make an icon-only button (no visible text label) accessible?",
    answer:
      "Give the button itself an accessible name via `aria-label` (or visually-hidden text inside it), and mark the icon `aria-hidden=\"true\"` so it isn't announced redundantly alongside the label. Without one of these, a screen reader either announces nothing useful or announces the icon's raw file/asset name.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 181,
  },

  {
    collection: "ff-75",
    conceptSlug: "accessible-images-media",
    question: "How would you handle alt text for a complex image like a bar chart?",
    answer:
      "A short `alt` names what the image is, but the real information — the actual data or takeaway the chart communicates — needs to exist as accessible text nearby: a data table, or a text summary of the key insight. A one-line alt attribute alone can't reasonably convey a multi-series chart's full content.",
    difficulty: "hard",
    companies: ["Google", "Stripe"],
    orderIndex: 182,
  },

  {
    collection: "ff-75",
    conceptSlug: "color-contrast-visual-accessibility",
    question: "What WCAG AA contrast ratio is required for normal text versus large text?",
    answer:
      "4.5:1 for normal text, and 3:1 for large text (18pt and up, or 14pt and up if bold). Large text gets a lower bar because its bigger, heavier letterforms stay legible at a lower contrast ratio than small text needs.",
    difficulty: "easy",
    companies: ["Google", "Meta"],
    orderIndex: 183,
  },

  {
    collection: "ff-75",
    conceptSlug: "color-contrast-visual-accessibility",
    question: "What is relative luminance, and how does it relate to contrast ratio?",
    answer:
      "Relative luminance is a standardized 0–1 measure of how much light a given color reflects, computed from its red/green/blue channel values with a gamma-correction step per channel. Contrast ratio compares the relative luminance of two colors — `(lighter + 0.05) / (darker + 0.05)` — giving a single number from 1:1 (no contrast) to 21:1 (pure black on pure white).",
    difficulty: "medium",
    companies: ["Stripe", "Microsoft"],
    orderIndex: 184,
  },

  {
    collection: "ff-75",
    conceptSlug: "color-contrast-visual-accessibility",
    question: "Why do UI components like input borders have their own contrast requirement, separate from text contrast?",
    answer:
      "WCAG 1.4.11 (Non-text Contrast) requires a 3:1 ratio for meaningful graphical elements — input borders, icons, focus indicators — because those convey information visually just like text does. A form field can pass every text-contrast check and still fail accessibility if its border is nearly invisible against the page background.",
    difficulty: "medium",
    companies: ["Amazon", "Meta"],
    orderIndex: 185,
  },

  {
    collection: "ff-75",
    conceptSlug: "color-contrast-visual-accessibility",
    question: "Why shouldn't color alone convey information, and what's a compliant alternative?",
    answer:
      "Roughly 1 in 12 men have some form of color vision deficiency, so a red-versus-green distinction alone can be imperceptible to a real portion of users. WCAG 1.4.1 requires a second signal alongside color — an icon, text label, or pattern — such as pairing a red error border with an error icon and message text, not the color change alone.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 186,
  },

  {
    collection: "ff-75",
    conceptSlug: "color-contrast-visual-accessibility",
    question: "What's the maximum possible WCAG contrast ratio, and which two colors produce it?",
    answer:
      "21:1, produced by pure black (`#000000`) against pure white (`#FFFFFF`) — their relative luminance values are exactly 0 and 1, which plug into the ratio formula `(1 + 0.05) / (0 + 0.05)` to give exactly 21.",
    difficulty: "hard",
    companies: ["Stripe"],
    orderIndex: 187,
  },

  {
    collection: "ff-75",
    conceptSlug: "keyboard-navigation-focus-management",
    question: "What's the difference between `tabindex=\"0\"`, `tabindex=\"-1\"`, and a positive `tabindex`?",
    answer:
      "`tabindex=\"0\"` inserts an otherwise-unfocusable element into the natural Tab order at its DOM position. `tabindex=\"-1\"` makes an element focusable only via JavaScript (`element.focus()`), removing it from the Tab sequence entirely. A positive `tabindex` creates a separate manually-numbered sequence that overrides DOM order completely, running before every `tabindex=\"0\"`/unset element.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 188,
  },

  {
    collection: "ff-75",
    conceptSlug: "keyboard-navigation-focus-management",
    question: "Why is a positive `tabindex` generally considered an anti-pattern?",
    answer:
      "It builds a manually-numbered sequence that's brittle to maintain — inserting a single new focusable element anywhere on the page usually means renumbering everything that should come after it, and forgetting to do so silently produces the wrong tab order. The natural DOM-order sequence needs no such bookkeeping at all.",
    difficulty: "medium",
    companies: ["Amazon", "Airbnb"],
    orderIndex: 189,
  },

  {
    collection: "ff-75",
    conceptSlug: "keyboard-navigation-focus-management",
    question: "What is a focus trap, and why does a modal dialog need one?",
    answer:
      "A focus trap constrains Tab and Shift+Tab to cycle only within the modal's own focusable elements while it's open — reaching the last one and pressing Tab wraps back to the first, instead of escaping into page content sitting behind the modal. Without it, a keyboard user can tab into content they can't see (it's visually behind the modal overlay) and lose track of where focus even is.",
    difficulty: "medium",
    companies: ["Stripe", "Microsoft"],
    orderIndex: 190,
  },

  {
    collection: "ff-75",
    conceptSlug: "keyboard-navigation-focus-management",
    question: "What does `tabindex=\"-1\"` on a `<main>` element enable for a skip link, and why is it needed?",
    answer:
      "A skip link's `href=\"#main-content\"` scrolls the page to `<main>` on activation, but doesn't move keyboard focus there by default since `<main>` isn't natively focusable. Adding `tabindex=\"-1\"` makes it programmatically focusable, so the browser can actually move focus to it when the anchor link is activated — without it, the page scrolls but subsequent Tab presses resume from wherever focus actually still is, not from the new visual position.",
    difficulty: "hard",
    companies: ["Google", "Meta"],
    orderIndex: 191,
  },

  {
    collection: "ff-75",
    conceptSlug: "keyboard-navigation-focus-management",
    question: "What accessibility problem does `outline: none` with no replacement introduce?",
    answer:
      "It removes the visible indicator of which element currently has keyboard focus, without removing keyboard navigation itself — a keyboard-only user can still Tab through the page, but has no way to see where they currently are. It's one of the most common accessibility regressions, usually introduced purely for cosmetic reasons.",
    difficulty: "easy",
    companies: ["Meta"],
    orderIndex: 192,
  },

  {
    collection: "ff-75",
    conceptSlug: "accessible-forms",
    question: "What are the two ways to programmatically associate a `<label>` with an input?",
    answer:
      "A matching `for`/`id` pair (`<label for=\"email\">` with `<input id=\"email\">`), or wrapping the input directly inside the `<label>` element with no `for`/`id` needed. Either way, a screen reader announces the label text when the input receives focus, and clicking the label focuses (or toggles) the input.",
    difficulty: "easy",
    companies: ["Google", "Amazon"],
    orderIndex: 193,
  },

  {
    collection: "ff-75",
    conceptSlug: "accessible-forms",
    question: "Why isn't placeholder text a substitute for a `<label>`?",
    answer:
      "Placeholder text disappears the moment the user types, typically renders at lower contrast than real body text, and isn't reliably announced as the field's accessible name by every screen reader. A label persists regardless of the field's content and is the correct source of the field's name — placeholder text can only supplement it as a formatting hint.",
    difficulty: "easy",
    companies: ["Stripe"],
    orderIndex: 194,
  },

  {
    collection: "ff-75",
    conceptSlug: "accessible-forms",
    question: "What does `aria-describedby` do, and how is it different from a label?",
    answer:
      "`aria-describedby` points at the id of separate text — a hint or error message — that gets appended after a field's accessible name is announced, giving extra context. It never replaces the accessible name a label provides; a field needs both a real label (\"what is this field\") and, when relevant, an `aria-describedby` (\"what else should I know\") — neither covers for the other.",
    difficulty: "medium",
    companies: ["Meta", "Microsoft"],
    orderIndex: 195,
  },

  {
    collection: "ff-75",
    conceptSlug: "accessible-forms",
    question: "What's the purpose of pairing `aria-invalid=\"true\"` with `aria-describedby` on an errored field?",
    answer:
      "`aria-invalid=\"true\"` announces the field's current validation state as part of its accessible description, while `aria-describedby` points at the specific error text explaining why. Together, a screen reader user hears both that the field is invalid and what to fix — a visual-only red border communicates neither.",
    difficulty: "medium",
    companies: ["Amazon", "Stripe"],
    orderIndex: 196,
  },

  {
    collection: "ff-75",
    conceptSlug: "accessible-forms",
    question: "Why use `<fieldset>`/`<legend>` for a group of radio buttons instead of just a heading above them?",
    answer:
      "`<fieldset>`/`<legend>` creates a real programmatic grouping — a screen reader announces the legend's question once as part of each radio button's accessible name, so \"Preferred contact method, Email, radio button\" is heard, not just \"Email, radio button\" with the grouping question lost. A visual heading above the group has no such programmatic connection to the inputs below it.",
    difficulty: "hard",
    companies: ["Google", "Airbnb"],
    orderIndex: 197,
  },

  {
    collection: "ff-75",
    conceptSlug: "aria-live-regions",
    question: "What's the difference between `aria-live=\"polite\"` and `aria-live=\"assertive\"`?",
    answer:
      "`polite` waits until the screen reader finishes whatever it's currently reading before announcing the change, without interrupting. `assertive` interrupts immediately, and should be reserved for genuinely urgent, time-sensitive content since every use of it cuts off whatever the user was already listening to.",
    difficulty: "easy",
    companies: ["Meta", "Google"],
    orderIndex: 198,
  },

  {
    collection: "ff-75",
    conceptSlug: "aria-live-regions",
    question: "What do `role=\"status\"` and `role=\"alert\"` imply, in terms of `aria-live`?",
    answer:
      "`role=\"status\"` implies `aria-live=\"polite\"` plus the semantics of a status message. `role=\"alert\"` implies `aria-live=\"assertive\"` plus alert semantics. Both are shorthands — using the explicit role is often clearer than the raw `aria-live` attribute for these common cases.",
    difficulty: "medium",
    companies: ["Stripe"],
    orderIndex: 199,
  },

  {
    collection: "ff-75",
    conceptSlug: "aria-live-regions",
    question: "Why might a screen reader fail to announce a live region that's inserted into the DOM already containing its final text?",
    answer:
      "A live region only announces content that changes after it's already present in the accessibility tree — it detects a delta, not an appearance. If the container and its final text arrive together in one DOM update, there's no \"before\" state to compare against, so no change event fires and many screen readers never announce it, even though the markup looks entirely correct.",
    difficulty: "hard",
    companies: ["Google", "Meta"],
    orderIndex: 200,
  },

  {
    collection: "ff-75",
    conceptSlug: "aria-live-regions",
    question: "Why should `aria-live=\"assertive\"` be used sparingly?",
    answer:
      "Every assertive announcement interrupts whatever the screen reader is currently reading, regardless of how minor the update is. Overusing it for routine updates (a save confirmation, a result count) constantly disrupts the user's listening experience — it should be reserved for content a sighted user would also treat as urgent.",
    difficulty: "medium",
    companies: ["Amazon"],
    orderIndex: 201,
  },

  {
    collection: "ff-75",
    conceptSlug: "aria-live-regions",
    question: "Name two real UI patterns that commonly use a live region.",
    answer:
      "Toast/snackbar notifications (\"Changes saved\", \"Item added to cart\") and live search result counts that update as a user types — both need to be announced to a screen reader user without stealing keyboard focus away from where they're currently working.",
    difficulty: "easy",
    companies: ["Meta", "Stripe"],
    orderIndex: 202,
  },

  {
    collection: "ff-75",
    conceptSlug: "accessible-component-patterns",
    question: "What three things does a custom widget like a modal or combobox need to be accessible?",
    answer:
      "The correct ARIA role and state (announcing what it is and its current condition), full keyboard operability matching the established pattern for that widget type, and correct focus management on open and close (focus moves into the widget when it appears, and back to its trigger when it's dismissed). Missing any one of the three leaves a widget that looks right but doesn't actually work for keyboard or screen reader users.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 203,
  },

  {
    collection: "ff-75",
    conceptSlug: "accessible-component-patterns",
    question: "What is `aria-activedescendant`, and what problem does it solve?",
    answer:
      "It lets one element (usually a combobox's text input) keep real DOM keyboard focus the entire time, while `aria-activedescendant` points at the id of whichever option is currently highlighted — a 'virtual focus'. This is why typing continues to work in a combobox while arrow keys move the highlighted option: actual focus never leaves the input.",
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 204,
  },

  {
    collection: "ff-75",
    conceptSlug: "accessible-component-patterns",
    question: "What is \"roving tabindex\", and how does it differ from `aria-activedescendant`?",
    answer:
      "Roving tabindex gives only the currently-active option `tabindex=\"0\"` (every other option gets `tabindex=\"-1\"`), and moves real DOM focus between options via JavaScript as arrow keys are pressed. Unlike `aria-activedescendant`, focus genuinely moves — this fits standalone widgets like menus and toolbars well, while `aria-activedescendant` fits widgets with a text input to keep focus in, like a combobox.",
    difficulty: "hard",
    companies: ["Google", "Stripe"],
    orderIndex: 205,
  },

  {
    collection: "ff-75",
    conceptSlug: "accessible-component-patterns",
    question: "What should happen to focus when a modal dialog closes?",
    answer:
      "Focus should return to whatever element originally triggered the dialog's opening — not get lost at the top of the document or left on a now-removed element. Losing this return step is a common bug: after closing a modal, a keyboard user's next Tab press starts from an unpredictable point instead of picking back up where they were.",
    difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 206,
  },

  {
    collection: "ff-75",
    conceptSlug: "accessible-component-patterns",
    question: "What does `aria-modal=\"true\"` communicate, and what should happen to content outside the dialog?",
    answer:
      "It tells assistive technology that everything outside the dialog is currently inert while it's open — a screen reader shouldn't navigate into background content, matching the visual reality that it's usually obscured or dimmed. This should be paired with an actual focus trap so keyboard navigation respects the same boundary, not just the announced state.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 207,
  },

  {
    collection: "ff-75",
    conceptSlug: "automated-a11y-testing",
    question: "What kinds of accessibility issues can tools like axe-core or Lighthouse reliably catch?",
    answer:
      "Objectively-checkable, rule-based violations: missing `alt` attributes, insufficient computed color contrast, form inputs with no associated label, invalid or contradictory ARIA attribute values, duplicate ids, and a missing document `lang` attribute. All of these can be verified mechanically by inspecting the DOM and computed styles, with no ambiguity.",
    difficulty: "easy",
    companies: ["Google", "Meta"],
    orderIndex: 208,
  },

  {
    collection: "ff-75",
    conceptSlug: "automated-a11y-testing",
    question: "What's a commonly cited estimate for how much of WCAG automated tools catch, and what covers the rest?",
    answer:
      "Roughly 30–50% of real WCAG issues — the objectively rule-checkable subset. The rest requires human judgment: a keyboard-only walkthrough and real screen reader testing (VoiceOver, NVDA, JAWS) to evaluate things no static scan can verify, like whether content and interaction actually make sense.",
    difficulty: "medium",
    companies: ["Stripe", "Amazon"],
    orderIndex: 209,
  },

  {
    collection: "ff-75",
    conceptSlug: "automated-a11y-testing",
    question: "Why can't an automated tool verify that alt text is accurate?",
    answer:
      "A scanner can confirm an `alt` attribute exists and even flag some likely-bad patterns (identical to the filename, or literally the word \"image\"), but it has no way to know whether the text actually describes what's in that specific image correctly. That's a judgment call about meaning, which is exactly the class of problem manual review exists to catch.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 210,
  },

  {
    collection: "ff-75",
    conceptSlug: "automated-a11y-testing",
    question: "What's a sound workflow for combining automated and manual accessibility testing?",
    answer:
      "Run an automated scan first — it's fast and clears the objectively-checkable issues out of the way. Then do a manual pass (keyboard-only walkthrough, real screen reader testing) focused on the judgment calls a scanner structurally can't make, since that's where human review time is best spent once the easy issues are already handled.",
    difficulty: "medium",
    companies: ["Amazon", "Airbnb"],
    orderIndex: 211,
  },

  {
    collection: "ff-75",
    conceptSlug: "automated-a11y-testing",
    question: "What's the risk of treating a passing axe-core/Lighthouse CI check as your full accessibility sign-off?",
    answer:
      "A passing automated scan only confirms the objectively-checkable ~30-50% subset of issues — it says nothing about whether a custom widget is actually keyboard-operable end to end, whether the tab order is logical, or whether content genuinely makes sense read aloud. Treating a green CI check as a complete accessibility guarantee lets real, user-facing issues ship undetected.",
    difficulty: "hard",
    companies: ["Google", "Stripe"],
    orderIndex: 212,
  },

  {
    collection: "ff-75",
    conceptSlug: "image-asset-optimization",
    question: "Why doesn't compressing an image's file size alone guarantee it's optimized?",
    answer:
      "Compression only addresses one of three independent levers: format. An image can be maximally compressed for its format and still waste bandwidth if it's served at 4x the dimensions it will actually render at, or if the browser has no srcset menu to pick a smaller candidate for a smaller viewport. Format, sizing, and responsive delivery all have to be right together.",
    difficulty: "easy",
    companies: ["Google", "Shopify"],
    orderIndex: 213,
  },

  {
    collection: "ff-75",
    conceptSlug: "image-asset-optimization",
    question: "When would you choose WebP over AVIF, given AVIF usually compresses better?",
    answer:
      "When broad, safe support matters more than squeezing out the last few percent of compression, or when the image needs animation — WebP's tooling and encoder support for animated images is more mature and consistent than AVIF's today. AVIF is the better default for static photographic content where maximum compression is the priority.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 214,
  },

  {
    collection: "ff-75",
    conceptSlug: "image-asset-optimization",
    question: "How do srcset and sizes work together, and why do you need both?",
    answer:
      "srcset lists candidate image files with their real pixel widths; sizes tells the browser how wide the image will actually render at different viewport widths. The browser needs both to do the math — sizes gives it the target render width at the current viewport, and srcset gives it the menu of real file widths to pick the smallest sufficient one from. Without sizes, the browser has to guess the render width, usually assuming full viewport width, which defeats the purpose.",
    difficulty: "medium",
    companies: ["Amazon", "Stripe"],
    orderIndex: 215,
  },

  {
    collection: "ff-75",
    conceptSlug: "image-asset-optimization",
    question: "What's the relationship between missing width/height on an image and layout shift?",
    answer:
      "Without explicit width/height (or an aspect-ratio), the browser doesn't know how much vertical space to reserve for the image before it loads, so surrounding content renders as if the image weren't there yet — then jumps down once the image arrives and its real dimensions are known. This is one of the most common real-world causes of a poor CLS score.",
    difficulty: "medium",
    companies: ["Google", "Netflix"],
    orderIndex: 216,
  },

  {
    collection: "ff-75",
    conceptSlug: "image-asset-optimization",
    question: "Why does loading=\"lazy\" help page weight, and when is it the wrong choice?",
    answer:
      "It defers downloading off-screen images until the user scrolls near them, so a long page with dozens of images doesn't pay for all of them up front. It's the wrong choice for above-the-fold images — especially a likely LCP candidate — since deferring the very image the user sees first only delays it further and can hurt LCP instead of helping overall performance.",
    difficulty: "medium",
    companies: ["Meta", "Uber"],
    orderIndex: 217,
  },

  {
    collection: "ff-75",
    conceptSlug: "bundle-size-code-splitting",
    question: "What decides whether a module ends up in a shared chunk versus a route's own chunk?",
    answer:
      "Purely how many separate entry points (routes, in the common case) import it. A module imported by more than one route graduates into a shared chunk so it's only downloaded once; a module imported by exactly one route stays local to that route's own chunk. It has nothing to do with the module's size or perceived importance.",
    difficulty: "medium",
    companies: ["Google", "Airbnb"],
    orderIndex: 218,
  },

  {
    collection: "ff-75",
    conceptSlug: "bundle-size-code-splitting",
    question: "How does route-based code splitting differ from splitting a single heavy component with a dynamic import?",
    answer:
      "Route-based splitting happens automatically at a navigation boundary — visiting one route doesn't download another route's code. Splitting a single component (a rich text editor, a chart library) is the same underlying mechanism triggered manually at a component boundary instead, useful when one part of a route is disproportionately heavy and not needed until a specific interaction, like opening a modal.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 219,
  },

  {
    collection: "ff-75",
    conceptSlug: "bundle-size-code-splitting",
    question: "How would you use a bundle analyzer to find what's bloating a bundle?",
    answer:
      "A bundle analyzer renders each module as a box sized proportionally to its contribution to the final bundle, usually grouped by chunk. Scanning for an unexpectedly large box — a full utility library imported for one function, an icon set pulled in whole instead of per-icon — surfaces concrete, fixable bloat far faster than guessing from the file list alone.",
    difficulty: "easy",
    companies: ["Amazon", "Shopify"],
    orderIndex: 220,
  },

  {
    collection: "ff-75",
    conceptSlug: "bundle-size-code-splitting",
    question: "Can over-splitting a bundle hurt performance? How?",
    answer:
      "Yes — every chunk is a separate network request, and each one carries its own overhead (HTTP request cost, and in HTTP/1.1 environments, real connection limits). Splitting so finely that dozens of tiny chunks load for one page can net out worse than one moderately-sized bundle, especially on higher-latency connections where per-request overhead dominates. Splitting is a tradeoff to tune, not a lever to maximize.",
    difficulty: "hard",
    companies: ["Netflix", "Google"],
    orderIndex: 221,
  },

  {
    collection: "ff-75",
    conceptSlug: "bundle-size-code-splitting",
    question: "Why does Next.js's App Router split per route segment by default, without extra config?",
    answer:
      "Because the router already knows the full route tree and which segment's code a given navigation needs — it can generate a separate chunk per segment as part of the build without a developer manually drawing the split points, unlike a traditional SPA router where code splitting has to be wired up explicitly per route.",
    difficulty: "medium",
    companies: ["Vercel", "Meta"],
    orderIndex: 222,
  },

  {
    collection: "ff-75",
    conceptSlug: "resource-loading-render-blocking",
    question: "What's the actual difference between async and defer on a script tag?",
    answer:
      "Both download in parallel with HTML parsing instead of blocking it immediately. async executes the moment its download finishes, whenever that happens to be — potentially interrupting parsing mid-stream. defer always waits until parsing has fully completed, and multiple defer scripts run in their original document order relative to each other; async scripts have no such ordering guarantee.",
    difficulty: "medium",
    companies: ["Google", "Amazon"],
    orderIndex: 223,
  },

  {
    collection: "ff-75",
    conceptSlug: "resource-loading-render-blocking",
    question: "Why does preconnect help even though it doesn't fetch any actual resource?",
    answer:
      "Establishing a connection to a new origin (DNS lookup, TCP handshake, TLS negotiation) has real latency before the very first byte of any real request can even be sent. preconnect does that connection setup ahead of time, so when the actual request for a resource on that origin does fire, it skips straight to the request/response instead of paying the connection cost first.",
    difficulty: "medium",
    companies: ["Meta", "Cloudflare"],
    orderIndex: 224,
  },

  {
    collection: "ff-75",
    conceptSlug: "resource-loading-render-blocking",
    question: "When would you reach for preload instead of just relying on the browser's normal resource discovery?",
    answer:
      "When a critical resource is discovered late by normal parsing — a font only referenced inside a CSS file, or an image set via a background-image rule the browser can't see until it's parsed the stylesheet. preload tells the browser about it immediately, from the HTML itself, so the fetch starts as early as possible instead of waiting for CSS parsing to reveal the need.",
    difficulty: "medium",
    companies: ["Airbnb", "Stripe"],
    orderIndex: 225,
  },

  {
    collection: "ff-75",
    conceptSlug: "resource-loading-render-blocking",
    question: "Why does a <link rel=\"stylesheet\"> block rendering even though it isn't a script?",
    answer:
      "The browser can't safely paint anything until it knows the full set of styles that could apply — rendering with an incomplete stylesheet and then having to repaint once the rest arrives would produce a worse experience (a flash of unstyled or wrongly-styled content) than simply waiting. A media attribute that doesn't match the current context (like media=\"print\") is the one common escape hatch, since the browser knows that stylesheet doesn't apply to this render at all.",
    difficulty: "medium",
    companies: ["Google", "Netflix"],
    orderIndex: 226,
  },

  {
    collection: "ff-75",
    conceptSlug: "resource-loading-render-blocking",
    question: "How would you decide which scripts on a real page should be async versus defer versus left blocking?",
    answer:
      "Leave blocking only what's genuinely required before first paint — usually nothing, if styles are handled separately. Use defer for scripts that need the full DOM or a specific execution order relative to each other (most app bootstrap code). Use async for scripts with no DOM dependency and no ordering requirement relative to other scripts, like independent analytics or ad tags.",
    difficulty: "hard",
    companies: ["Meta", "Uber"],
    orderIndex: 227,
  },

  {
    collection: "ff-75",
    conceptSlug: "core-web-vitals",
    question: "Why does Google use the 75th percentile of real user data instead of an average or a lab test?",
    answer:
      "An average can hide a large slow-user population behind a handful of fast ones, and a single lab test only reflects one simulated device and network. The 75th percentile requires at least three out of every four real visits — across real devices and real networks — to meet the threshold, which is a much more honest bar for 'is this page actually fast for most people' than either alternative.",
    difficulty: "hard",
    companies: ["Google", "Shopify"],
    orderIndex: 228,
  },

  {
    collection: "ff-75",
    conceptSlug: "core-web-vitals",
    question: "What replaced First Input Delay, and why?",
    answer:
      "Interaction to Next Paint (INP). FID only measured the delay before the browser started processing the very first interaction — it said nothing about how long that processing actually took, and nothing about any interaction after the first one. INP measures the full interaction-to-paint duration across every interaction in the visit, catching a page that's fine on the first click but janky by the fifth.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 229,
  },

  {
    collection: "ff-75",
    conceptSlug: "core-web-vitals",
    question: "What are the most common real causes of a poor CLS score?",
    answer:
      "Images or embeds with no reserved width/height (or aspect-ratio), causing surrounding content to jump once the real dimensions are known; web fonts that swap in and reflow text (FOIT/FOUT); and content — most often ads — injected above existing content after the initial layout has already settled.",
    difficulty: "medium",
    companies: ["Amazon", "Airbnb"],
    orderIndex: 230,
  },

  {
    collection: "ff-75",
    conceptSlug: "core-web-vitals",
    question: "What's usually responsible for a slow LCP, and how would you diagnose which one it is on a real page?",
    answer:
      "The most common culprits are a slow initial server response, render-blocking CSS/JS delaying first paint, or the LCP resource itself (usually a hero image) being discovered late or not preloaded. The Performance panel's timeline shows exactly when the LCP element rendered relative to when its own resource started downloading — a big gap there points at discovery/priority, not raw download speed.",
    difficulty: "hard",
    companies: ["Google", "Netflix"],
    orderIndex: 231,
  },

  {
    collection: "ff-75",
    conceptSlug: "core-web-vitals",
    question: "Is a page with excellent Core Web Vitals guaranteed to feel fast to use?",
    answer:
      "Not entirely — CWV measures three specific, well-chosen dimensions (load, responsiveness, stability), but a page could still feel slow for reasons outside those three, like a slow API response that leaves a spinner on screen well after LCP has fired, or content that's technically stable and responsive but poorly organized. CWV is a strong, standardized proxy for real experience, not an exhaustive measure of it.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 232,
  },

  {
    collection: "ff-75",
    conceptSlug: "list-virtualization",
    question: "Why does virtualization keep the DOM node count roughly constant regardless of list length?",
    answer:
      "Because only the rows currently within the viewport (plus a small overscan buffer) are ever mounted — the rest of the list simply doesn't exist as real DOM nodes at any given moment. A list of 100 rows and a list of 1,000,000 rows end up mounting a similar handful of rows at once; only which rows they are changes as the user scrolls.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 233,
  },

  {
    collection: "ff-75",
    conceptSlug: "list-virtualization",
    question: "What role does the spacer element play in a virtualized list?",
    answer:
      "It's sized to the full list's total height (totalRows × rowHeight in the fixed-height case), even though almost none of that height is filled with real rendered rows. It keeps the scrollbar's size and position behaving exactly as if every row were really mounted, while the actual visible rows are absolutely positioned inside it at their real offsets.",
    difficulty: "medium",
    companies: ["Airbnb", "Uber"],
    orderIndex: 234,
  },

  {
    collection: "ff-75",
    conceptSlug: "list-virtualization",
    question: "Why is variable-height virtualization meaningfully harder than fixed-height?",
    answer:
      "Fixed-height virtualization can compute any row's position with a single multiplication (index × rowHeight). Variable-height rows break that — a row's position depends on the cumulative height of every row before it, which needs an offset cache (and usually a measurement pass, since heights often aren't known until content renders) instead of a constant-time formula.",
    difficulty: "hard",
    companies: ["Meta", "Netflix"],
    orderIndex: 235,
  },

  {
    collection: "ff-75",
    conceptSlug: "list-virtualization",
    question: "What real UX and accessibility tradeoffs does virtualization introduce?",
    answer:
      "Browser find-in-page and screen readers generally expect content to actually exist in the DOM — a virtualized list's off-screen rows genuinely aren't there, so Ctrl+F won't find them and some assistive technology won't announce list length correctly without extra ARIA work. Scroll-to-index and deep-linking to a specific row also need custom logic, since the browser's native anchor-scrolling has nothing to scroll to until that row is mounted.",
    difficulty: "hard",
    companies: ["Google", "Amazon"],
    orderIndex: 236,
  },

  {
    collection: "ff-75",
    conceptSlug: "list-virtualization",
    question: "How would you decide whether a given list actually needs virtualization?",
    answer:
      "By whether full rendering visibly hurts — typically somewhere in the low hundreds of rows and up, depending on row complexity. A 20-row list gains nothing from virtualization but inherits all of its added complexity (scroll-to-index, accessibility workarounds); the decision should be driven by measured jank, not a blanket rule to virtualize every list.",
    difficulty: "medium",
    companies: ["Stripe", "Shopify"],
    orderIndex: 237,
  },

  {
    collection: "ff-75",
    conceptSlug: "profiling-with-devtools",
    question: "What's the difference between a function's self time and total time in a flame chart?",
    answer:
      "Total time is the function's duration including everything it called — its whole subtree. Self time is the function's duration excluding its children — the work it did itself, directly. A function can have huge total time and tiny self time if it's mostly a wrapper around slower children; the real bottleneck is found by self time, not total time.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 238,
  },

  {
    collection: "ff-75",
    conceptSlug: "profiling-with-devtools",
    question: "Why might the widest bar in a flame chart not be the actual bottleneck?",
    answer:
      "A wide bar reflects total time — how long that function's entire subtree took — which is often dominated by its children's work rather than its own. Chasing the widest bar can lead straight to a high-level orchestrating function that's doing almost no real work itself, while the genuine bottleneck sits several levels deeper with a much narrower-looking bar but high self time.",
    difficulty: "medium",
    companies: ["Amazon", "Airbnb"],
    orderIndex: 239,
  },

  {
    collection: "ff-75",
    conceptSlug: "profiling-with-devtools",
    question: "What does the Performance panel's Bottom-Up view show that a single flame chart recording doesn't make obvious?",
    answer:
      "It aggregates self time for each function across every place it was called during the entire recording, not just within one call stack. A helper function called from a dozen different components might never be the widest bar in any single stack, yet its aggregate cost across all those calls could be the biggest single line item in the whole recording — exactly what Bottom-Up is built to surface.",
    difficulty: "hard",
    companies: ["Google", "Meta"],
    orderIndex: 240,
  },

  {
    collection: "ff-75",
    conceptSlug: "profiling-with-devtools",
    question: "How does the React DevTools Profiler complement the generic Performance panel?",
    answer:
      "The generic Performance panel only sees function calls — it has no concept of a 'component.' The React Profiler adds that layer back, recording commits and showing which components rendered on each one along with an estimated render duration, making it far faster to spot 'this component re-rendered on every keystroke despite unchanged props' than reconstructing the same insight from a raw flame chart.",
    difficulty: "medium",
    companies: ["Meta", "Netflix"],
    orderIndex: 241,
  },

  {
    collection: "ff-75",
    conceptSlug: "profiling-with-devtools",
    question: "Why is profiling a real, representative interaction more valuable than profiling a guess?",
    answer:
      "Performance problems are frequently non-obvious and non-intuitive — the function a developer assumes is slow is often not the one a recording actually flags. Recording the real interaction a user reported as slow, then reading the trace for the true self-time bottleneck, replaces guesswork with evidence and avoids optimizing code that was never the problem in the first place.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 242,
  },

  {
    collection: "ff-75",
    conceptSlug: "streaming-ssr-hydration",
    question: "How does streaming SSR avoid one slow section holding up the entire page response?",
    answer:
      "The server sends the page shell — layout, nav, anything with no slow dependency — immediately, with a placeholder for any section wrapped in a Suspense boundary that isn't ready yet. Each slow section streams in separately, replacing its placeholder, the moment its own data resolves — so a single slow widget no longer blocks the fast parts of the page from showing up right away.",
    difficulty: "medium",
    companies: ["Meta", "Vercel"],
    orderIndex: 243,
  },

  {
    collection: "ff-75",
    conceptSlug: "streaming-ssr-hydration",
    question: "Does a streamed chunk's arrival order affect where it ends up on the page? Why or why not?",
    answer:
      "No — each streamed chunk is tagged with the id of the placeholder it belongs to, which is fixed by the original shell layout. The browser slots each chunk into its already-reserved position rather than appending it wherever it happens to arrive, so a footer that resolves before the main content still renders in the footer's spot, not ahead of main content.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 244,
  },

  {
    collection: "ff-75",
    conceptSlug: "streaming-ssr-hydration",
    question: "What is hydration actually doing to already-rendered server HTML?",
    answer:
      "React walks the existing, already-visible DOM tree the server produced and matches it up node-for-node against what a client-side render of the same tree would produce, attaching real event handlers and internal component state to the existing nodes — without throwing the DOM away and rebuilding it. This is why content is visible before it's interactive: paint happens first, hydration happens after.",
    difficulty: "hard",
    companies: ["Meta", "Google"],
    orderIndex: 245,
  },

  {
    collection: "ff-75",
    conceptSlug: "streaming-ssr-hydration",
    question: "What commonly causes a hydration mismatch, and why can't React just silently fix it like a normal re-render?",
    answer:
      "Common causes: rendering something dependent on Date.now()/Math.random() differently between server and client, or reading browser-only globals (window, localStorage) during the server render, which the client then renders differently. React can't silently reconcile a mismatch the way a normal re-render diffs old vs. new — it has to detect that the assumed-matching subtree actually diverged, then recover, typically by discarding and re-rendering that section client-side, which is slower and can cause a visible flash.",
    difficulty: "hard",
    companies: ["Meta", "Netflix"],
    orderIndex: 246,
  },

  {
    collection: "ff-75",
    conceptSlug: "streaming-ssr-hydration",
    question: "Why does streaming let hydration start earlier than it could with traditional SSR?",
    answer:
      "With traditional (non-streaming) SSR, the whole response has to arrive before the client has any HTML to hydrate at all. With streaming, each chunk can be hydrated as it arrives and its placeholder is replaced — the shell's fast sections can become interactive well before the slowest section has even finished loading, instead of the entire page waiting on the slowest common denominator.",
    difficulty: "medium",
    companies: ["Vercel", "Shopify"],
    orderIndex: 247,
  },

  {
    collection: "ff-75",
    conceptSlug: "performance-budgets",
    question: "Why does performance tend to regress gradually rather than in one obvious jump?",
    answer:
      "No single change usually looks bad enough to block on its own — one more small dependency, a slightly heavier image, one extra icon library — each individually invisible. Without an enforced ceiling, there's no single moment any of these gets stopped, so the page just gets slower release over release with no clear point anyone could have caught it.",
    difficulty: "easy",
    companies: ["Google", "Shopify"],
    orderIndex: 248,
  },

  {
    collection: "ff-75",
    conceptSlug: "performance-budgets",
    question: "Why does a budget only work as a hard CI gate rather than a dashboard someone checks periodically?",
    answer:
      "A dashboard that's merely monitored still lets regressions land — nothing actually stops a PR that crosses the line from merging, so drift continues one 'acceptable-looking' change at a time. A budget enforced in CI fails the build the same way a broken test would, which is the only mechanism that actually prevents the regression from shipping rather than just documenting it after the fact.",
    difficulty: "medium",
    companies: ["Meta", "Netflix"],
    orderIndex: 249,
  },

  {
    collection: "ff-75",
    conceptSlug: "performance-budgets",
    question: "What's the advantage of comparing a build against its previous baseline, not just a fixed budget ceiling?",
    answer:
      "A fixed budget only fails once the absolute number crosses the line — it can miss a real, meaningful regression in a PR that started well under budget with room to spare. Comparing against the immediately previous build's baseline instead catches 'this specific PR alone grew the bundle by 15%,' which is a much more actionable, attributable signal for the PR under review, even before the fixed ceiling is actually crossed.",
    difficulty: "hard",
    companies: ["Google", "Airbnb"],
    orderIndex: 250,
  },

  {
    collection: "ff-75",
    conceptSlug: "performance-budgets",
    question: "What typically gets budgeted, and why is bundle size the easiest to enforce mechanically?",
    answer:
      "Common targets: total JS bundle size (often per route), image payload weight, and the Core Web Vitals scores themselves. Bundle size is the easiest to gate mechanically because it's computed at build time with no real-user variability involved — unlike CWV metrics, which depend on real devices and networks and need real-user or lab measurement rather than a deterministic build-time number.",
    difficulty: "medium",
    companies: ["Vercel", "Stripe"],
    orderIndex: 251,
  },

  {
    collection: "ff-75",
    conceptSlug: "performance-budgets",
    question: "Why does a budget check need a clear next step, not just a pass/fail result?",
    answer:
      "A failing check with no obvious fix just gets bypassed under deadline pressure — someone force-merges past it because there's no clear path to actually resolving it. Pairing every budget with an obvious remediation (split this chunk, defer this dependency, revisit this image) turns a failing check into a solvable problem instead of a blocker people learn to argue their way around.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 252,
  },


  // Phase 10 (Feature 48) — System Design, 4 ff-75 top-ups per concept (each
  // concept's flagship question already lives in the ff-system-design collection
  // above, either an existing re-linked one or one of the 3 written for this feature)
  {
    collection: "ff-75",
    conceptSlug: "component-driven-architecture",
    question: "What's the difference between a presentational and a container component?",
    answer:
      "A **presentational** component only cares about how things look — it receives data and callbacks via props and renders UI, with no knowledge of where that data came from. A **container** component owns data-fetching, state, or business logic, and passes the results down to presentational components as props.\n\nThis split is what makes a presentational component reusable across completely different data sources — a `UserCard` that just renders `{ name, avatarUrl }` works identically whether the data came from a REST call, a GraphQL query, or a Storybook mock. Hooks blurred the strict 1990s-style split (a component can now both fetch and render), but the underlying principle — keep the reusable, generic rendering logic free of business/data concerns — still holds.",
    difficulty: "easy",
    companies: ["Meta", "Airbnb"],
    orderIndex: 253,
  },

  {
    collection: "ff-75",
    conceptSlug: "component-driven-architecture",
    question: "Why shouldn't a design system's base components (Button, Input) contain business logic?",
    answer:
      "A base component's entire value is that it's reusable in contexts its author never anticipated. The moment a `Button` reaches into a specific feature's state or API — even something as small as logging a specific analytics event — it stops being generic and becomes coupled to that one feature, and every other consumer either inherits logic it doesn't need or has to work around it.\n\nThe fix is keeping the base layer prop-driven and side-effect-free: an `onClick` prop, not a hardcoded call to a specific tracking function. Anything feature-specific belongs one layer up, in the component that composes the base primitive for that particular use case.",
    difficulty: "easy",
    companies: ["Stripe", "Shopify"],
    orderIndex: 254,
  },

  {
    collection: "ff-75",
    conceptSlug: "component-driven-architecture",
    question: "How do you decide whether a piece of UI is worth extracting into its own component?",
    answer:
      "Two independent signals, not one: **reuse** (is this markup/logic duplicated, or likely to be, in more than one place?) and **isolation of complexity** (is this piece of the tree independently complex enough that separating it makes the parent easier to read, even with only one caller?).\n\nExtracting purely on 'this file got long' without either signal tends to produce components that are only separated by file boundary, not by responsibility — they still reach into the same parent state and can't be tested or reused independently. A component earns its extraction when its props are a genuinely sufficient contract, not just when it's been cut out of a bigger file.",
    difficulty: "medium",
    companies: ["Google", "Netflix"],
    orderIndex: 255,
  },

  {
    collection: "ff-75",
    conceptSlug: "component-driven-architecture",
    question: "How does component composition help avoid prop drilling without reaching for global state?",
    answer:
      "Prop drilling happens when a value is threaded through several layers that don't use it themselves, just to reach a deeply nested consumer. Composition sidesteps this by passing the *already-rendered* consumer down as a prop or `children`, rather than passing the raw data down and re-rendering it at each layer.\n\n```jsx\n// Drilled: Layout must know about `user` just to forward it\n<Layout user={user}><Sidebar user={user} /></Layout>\n\n// Composed: Layout never touches `user` at all\n<Layout>\n  <Sidebar>{<UserBadge user={user} />}</Sidebar>\n</Layout>\n```\n\nThis isn't a universal fix — a value genuinely needed at many unrelated points in the tree is still a real case for Context or a shared store — but it eliminates the large share of 'prop drilling' that's really just intermediate components blindly forwarding something they never use.",
    difficulty: "medium",
    companies: ["Meta", "Vercel"],
    orderIndex: 256,
  },


  {
    collection: "ff-75",
    conceptSlug: "api-design-data-fetching-strategy",
    question: "What are over-fetching and under-fetching, and which API style is each usually associated with?",
    answer:
      "**Over-fetching** is receiving more data than the screen actually needs (a REST `/users/1` endpoint returning 20 fields when a list view only renders 3). **Under-fetching** is the opposite — needing data from several endpoints to render one screen, forcing multiple round trips or a chain of dependent requests.\n\nREST's fixed-shape-per-endpoint design is the classic source of both, since one endpoint has to serve every consumer's needs. GraphQL was designed specifically to eliminate both by letting the client specify the exact fields and relationships it wants in a single query — at the cost of the server doing more work to resolve an arbitrary shape.",
    difficulty: "easy",
    companies: ["Meta", "GitHub"],
    orderIndex: 257,
  },

  {
    collection: "ff-75",
    conceptSlug: "api-design-data-fetching-strategy",
    question: "Why does request deduplication matter in a data-fetching library like React Query?",
    answer:
      "Without it, two components independently requesting the same resource (say, both rendering after the same navigation) each fire their own network request for identical data — wasted bandwidth, wasted server load, and a real risk the two responses arrive out of order and momentarily show inconsistent data.\n\nA cache-aware library keys in-flight requests by their arguments: a second request for the same key while the first is still pending is handed the same in-flight promise instead of starting a new one. This is invisible to the calling components — each just calls the hook normally — but collapses what would've been N network calls into 1.",
    difficulty: "medium",
    companies: ["Airbnb", "Uber"],
    orderIndex: 258,
  },

  {
    collection: "ff-75",
    conceptSlug: "api-design-data-fetching-strategy",
    question: "What's the tradeoff of an RPC-style API (like tRPC) compared to REST?",
    answer:
      "RPC-style APIs make a network call look like calling a local function (`getUserPosts(userId)`), often with end-to-end type inference — the client gets the server's real return type with zero manually-maintained schema. This removes an entire class of client/server type-mismatch bugs.\n\nThe cost: it's tightly coupled to that specific backend's function signatures rather than a documented, stable resource contract. It works well for a first-party frontend and backend shipped by the same team, but isn't suited to a public API other, independent teams need to consume without being coupled to internal implementation details.",
    difficulty: "medium",
    companies: ["Vercel", "Linear"],
    orderIndex: 259,
  },

  {
    collection: "ff-75",
    conceptSlug: "api-design-data-fetching-strategy",
    question: "What is stale-while-revalidate and why does it help perceived performance?",
    answer:
      "Stale-while-revalidate serves the cached (possibly outdated) response immediately, then fetches a fresh copy in the background and updates the UI once it resolves. The user sees data instantly instead of a loading spinner, and gets corrected data moments later if anything changed.\n\nIt's the default behavior in cache-aware libraries like React Query/SWR (the acronym is literally the library's name), and is also a real HTTP `Cache-Control` directive CDNs respect — both layers apply the same idea: prefer showing something now over blocking on a guaranteed-fresh response.",
    difficulty: "easy",
    companies: ["Vercel", "Cloudflare"],
    orderIndex: 260,
  },


  {
    collection: "ff-75",
    conceptSlug: "designing-real-time-updates",
    question: "What's the key architectural difference between Server-Sent Events and WebSockets?",
    answer:
      "SSE is one-directional (server-to-client only) and built entirely on plain HTTP — the client opens a long-lived connection via `EventSource`, and the server streams events down it. It reconnects automatically on drop and works through nearly any HTTP-aware proxy or load balancer with no special handling.\n\nWebSockets are full-duplex over their own protocol (upgraded from an HTTP handshake) — either side can send at any time. That flexibility costs more: your own reconnection, heartbeat, and backpressure handling, plus infrastructure that's aware WebSocket connections need to stay pinned rather than load-balanced per-request like normal HTTP.",
    difficulty: "medium",
    companies: ["Slack", "Discord"],
    orderIndex: 261,
  },

  {
    collection: "ff-75",
    conceptSlug: "designing-real-time-updates",
    question: "Why does polling waste resources even when nothing has changed?",
    answer:
      "Every poll is a full request/response cycle — DNS, TLS, server processing, a response body — even if the answer is 'nothing changed since last time.' At scale, that's a constant baseline of load proportional to (client count × poll frequency), regardless of how often data actually changes.\n\nA push-based mechanism (SSE or WebSocket) inverts this: the server only sends something when there's actually something to send, so idle periods cost nothing beyond holding an open connection — which is far cheaper than a repeated full request cycle.",
    difficulty: "easy",
    companies: ["Amazon", "Google"],
    orderIndex: 262,
  },

  {
    collection: "ff-75",
    conceptSlug: "designing-real-time-updates",
    question: "What is exponential backoff, and why does a real-time client's reconnect logic need it?",
    answer:
      "Exponential backoff increases the delay between retry attempts after each failure (e.g. 1s, 2s, 4s, 8s...), typically capped at a maximum. For a dropped WebSocket or SSE connection, this matters because a connection often drops *because* the server is struggling — every client immediately retrying at a fixed short interval is exactly the pattern that turns a brief server hiccup into a thundering-herd outage.\n\nA real implementation also caps the number of attempts (giving up and surfacing an error after enough failures) rather than retrying forever, and often adds jitter (a small random offset) so many clients' retries don't all land in the same instant.",
    difficulty: "medium",
    companies: ["Netflix", "Cloudflare"],
    orderIndex: 263,
  },

  {
    collection: "ff-75",
    conceptSlug: "designing-real-time-updates",
    question: "Can a WebSocket connection pass through a corporate proxy or load balancer without extra configuration?",
    answer:
      "Not reliably. A WebSocket starts as a normal HTTP request that gets upgraded to a persistent connection — some older or strictly-configured proxies don't support the upgrade at all, and load balancers need to be explicitly configured to keep a WebSocket connection pinned to the same backend instance for its whole lifetime, rather than load-balancing it per-request the way they do normal HTTP.\n\nThis is one reason SSE is sometimes preferred for one-directional use cases: since it's just a long-lived plain HTTP response, it needs none of that special-case infrastructure support.",
    difficulty: "hard",
    companies: ["Microsoft", "Cisco"],
    orderIndex: 264,
  },


  {
    collection: "ff-75",
    conceptSlug: "designing-infinite-scroll-feed",
    question: "Why is cursor-based pagination preferred over offset-based pagination for a live feed?",
    answer:
      "Offset pagination (`?offset=20&limit=20`) identifies a page by numeric position — if a new item gets inserted above position 20 between two requests, every subsequent page shifts by one, causing duplicated or skipped items. A cursor (an opaque token pointing at a specific item, commonly an encoded `(timestamp, id)`) identifies 'everything after this specific row,' so it stays correct regardless of what gets inserted before or after it.\n\nThe cost is that cursors don't support jumping to an arbitrary page number the way offsets do — but a feed's UI (scroll, not page numbers) never needed that capability in the first place.",
    difficulty: "medium",
    companies: ["Meta", "Twitter"],
    orderIndex: 265,
  },

  {
    collection: "ff-75",
    conceptSlug: "designing-infinite-scroll-feed",
    question: "How do you preserve a feed's scroll position when a user navigates away and back?",
    answer:
      "Two things have to both be cached: the fetched pages themselves (so returning doesn't refetch from page 1 — a cache-aware library keyed by request handles this) and the scroll offset itself, typically stored in `sessionStorage` keyed by route.\n\nThe order matters: the scroll position has to be restored *after* the cached items have re-rendered, not before — restoring a scroll offset against an empty or partially-rendered list just lands in the wrong place once the real content finishes rendering underneath it.",
    difficulty: "medium",
    companies: ["LinkedIn", "Reddit"],
    orderIndex: 266,
  },

  {
    collection: "ff-75",
    conceptSlug: "designing-infinite-scroll-feed",
    question: "What UX pattern avoids disrupting a user's reading position when new items arrive at the top of a feed?",
    answer:
      "Auto-inserting new items at the top shifts everything the user is currently reading further down the screen — a jarring, disorienting jump. The standard fix is polling for new items in the background without inserting them automatically, and instead surfacing a small 'X new posts' banner at the top.\n\nThe user only sees the new content — and the layout shift that comes with it — after an explicit tap, at a moment they're prepared for it rather than mid-read.",
    difficulty: "easy",
    companies: ["Meta", "Twitter"],
    orderIndex: 267,
  },

  {
    collection: "ff-75",
    conceptSlug: "designing-infinite-scroll-feed",
    question: "What role does IntersectionObserver play in implementing infinite scroll?",
    answer:
      "A sentinel element (an otherwise-invisible element) is placed near the bottom of the rendered list, and an `IntersectionObserver` watches when it enters the viewport. When it does, that's the trigger to fetch the next page — no manual scroll-event math (comparing `scrollTop`/`scrollHeight`/`clientHeight` on every scroll tick) required.\n\nThis is significantly cheaper than a `scroll` event listener, since the browser only needs to notify the callback on actual intersection changes rather than firing on every pixel of scroll movement, which matters a lot for scroll-performance-sensitive feeds.",
    difficulty: "medium",
    companies: ["Google", "Pinterest"],
    orderIndex: 268,
  },


  {
    collection: "ff-75",
    conceptSlug: "designing-realtime-collaborative-editor",
    question: "What problem does Operational Transformation solve that naive last-write-wins doesn't?",
    answer:
      "Last-write-wins simply lets whichever edit arrives last overwrite everything before it — for a shared document, that silently discards other users' concurrent edits rather than merging them. OT instead transforms each incoming operation's position against every operation already applied ahead of it, so two users' concurrent inserts both end up present in the final document, in a well-defined order, rather than one clobbering the other.",
    difficulty: "medium",
    companies: ["Google", "Notion"],
    orderIndex: 269,
  },

  {
    collection: "ff-75",
    conceptSlug: "designing-realtime-collaborative-editor",
    question: "How do CRDTs achieve conflict-free merging without a central server?",
    answer:
      "A CRDT designs the data structure itself so that operations commute — applying the same set of edits in any order produces the same final result. For text, this typically means giving every character a unique, globally-ordered identifier rather than a plain array index, so inserting 'between' two characters is well-defined regardless of what else got inserted concurrently elsewhere.\n\nBecause the merge rule is baked into the structure rather than enforced by a server ordering operations, any two replicas (even offline, peer-to-peer copies) can exchange their edits directly and converge to the same state with no arbiter required.",
    difficulty: "hard",
    companies: ["Figma", "Linear"],
    orderIndex: 270,
  },

  {
    collection: "ff-75",
    conceptSlug: "designing-realtime-collaborative-editor",
    question: "Why aren't cursor positions and user presence stored in the same persisted log as document edits?",
    answer:
      "Cursor position and presence (who's online, where their selection is) are ephemeral — useful only while a user is actively connected, and meaningless once they leave. Persisting them in the same op log or snapshot as real document content would bloat storage with data that's never meant to be replayed or restored on reload.\n\nThey're broadcast live (typically over the same WebSocket connection) but kept entirely separate from the durable edit history, which only needs to reconstruct the document's actual content.",
    difficulty: "medium",
    companies: ["Figma", "Google"],
    orderIndex: 271,
  },

  {
    collection: "ff-75",
    conceptSlug: "designing-realtime-collaborative-editor",
    question: "What tradeoff do CRDTs make compared to OT in terms of overhead?",
    answer:
      "CRDTs avoid needing a central ordering server, but typically carry more per-character metadata (a unique id, sometimes tombstones for deleted characters that can't simply be removed without breaking convergence) than an OT-based document needs, since OT relies on a server enforcing a single authoritative order instead of encoding that guarantee into every character.\n\nIn practice this shows up as larger documents in memory/storage for a CRDT-backed editor, traded against not needing (and not being bottlenecked by) a single ordering server.",
    difficulty: "hard",
    companies: ["Figma", "Notion"],
    orderIndex: 272,
  },


  {
    collection: "ff-75",
    conceptSlug: "frontend-architecture-patterns",
    question: "What's the difference between a monorepo and a micro-frontend architecture?",
    answer:
      "A monorepo is a code-organization choice — many packages in one repository with shared tooling and dependency versions. It says nothing about how the app is deployed; a monorepo can still ship one single monolithic app.\n\nMicro-frontends are a runtime-deployment choice — the running application itself is split into separately built and deployed pieces, composed together in the browser. They're frequently adopted together, but a monorepo doesn't require micro-frontends, and micro-frontends can be built from entirely separate repositories.",
    difficulty: "medium",
    companies: ["Spotify", "IKEA"],
    orderIndex: 273,
  },

  {
    collection: "ff-75",
    conceptSlug: "frontend-architecture-patterns",
    question: "What is Module Federation, and what problem does it solve for micro-frontends?",
    answer:
      "Module Federation (a webpack/Rspack feature) lets one independently-built and independently-deployed application load code — a component, a whole page — from another application at runtime, without either being compiled together at build time. It's what makes 'separately deployed pieces composed into one experience' actually work in the browser, rather than requiring a full page reload or an iframe boundary between them.\n\nIt solves the practical composition problem micro-frontends need: how does the checkout team's independently-deployed bundle actually end up rendering inside the shell app the user loaded, sharing the same page without a hard iframe boundary.",
    difficulty: "hard",
    companies: ["Zalando", "American Express"],
    orderIndex: 274,
  },

  {
    collection: "ff-75",
    conceptSlug: "frontend-architecture-patterns",
    question: "What's the biggest operational cost micro-frontends introduce that a monolith doesn't have?",
    answer:
      "Shared dependency drift. Once teams deploy independently, nothing forces every micro-frontend to agree on a shared library's version — one team upgrading React while another hasn't can mean two different React instances loaded on the same page at once, a common real-world source of subtle bugs (broken hooks, duplicated context) that a monolith's single build simply can't have, since it only ever has one version of anything installed.",
    difficulty: "medium",
    companies: ["Microsoft", "Zalando"],
    orderIndex: 275,
  },

  {
    collection: "ff-75",
    conceptSlug: "frontend-architecture-patterns",
    question: "When is splitting an application into micro-frontends premature?",
    answer:
      "When no team is actually blocked by another team's release schedule. If the real pain is inconsistent tooling or dependency versions across teams sharing one product, a monorepo solves that without runtime-composition complexity. Micro-frontends earn their cost specifically when independent deploy schedules are the bottleneck — reaching for them just because a codebase feels large trades a solvable code-organization problem for a genuinely harder distributed-systems one (dependency drift, cross-team design consistency, runtime composition).",
    difficulty: "medium",
    companies: ["Spotify", "Amazon"],
    orderIndex: 276,
  },


  {
    collection: "ff-75",
    conceptSlug: "state-management-at-scale",
    question: "Why shouldn't server data (like an API response) be stored directly in Redux or Zustand?",
    answer:
      "A generic global store has no built-in concept of staleness — it just holds whatever was put there. Server data, by definition, can change on the backend without the client doing anything, so storing it in a plain store either goes silently stale forever, or the team ends up hand-rolling refetch-on-mount/refetch-on-focus logic that a dedicated server-state library (React Query, SWR, Apollo) already solves correctly, once, with cache invalidation and background revalidation built in.",
    difficulty: "medium",
    companies: ["Airbnb", "Google"],
    orderIndex: 277,
  },

  {
    collection: "ff-75",
    conceptSlug: "state-management-at-scale",
    question: "What's the difference between UI state and global app state?",
    answer:
      "UI state is ephemeral and local to a specific interaction — a dropdown being open, an unsubmitted form field's current value. It doesn't need to survive a refresh or be visible anywhere outside the component (or its nearest shared ancestor) that owns it.\n\nGlobal app state is genuinely shared across the whole session but small — the logged-in user, the active theme, feature flags. The defining trait isn't 'used in a few places'; it's 'there's exactly one source of truth for the entire app,' unlike UI state (many independent, unrelated instances) or server state (many independent remote resources).",
    difficulty: "easy",
    companies: ["Meta", "Netflix"],
    orderIndex: 278,
  },

  {
    collection: "ff-75",
    conceptSlug: "state-management-at-scale",
    question: "What problems come from putting every piece of state into one global store?",
    answer:
      "Two, both from treating fundamentally different kinds of state the same way: server data goes stale silently (no built-in revalidation), and hoisting local UI state (a single dropdown's open/closed flag) into the shared store causes unrelated components to re-render whenever unrelated global state changes, since a plain store typically notifies all subscribers on any update rather than only the ones reading the specific slice that changed.",
    difficulty: "medium",
    companies: ["Amazon", "Uber"],
    orderIndex: 279,
  },

  {
    collection: "ff-75",
    conceptSlug: "state-management-at-scale",
    question: "What does 'colocate state as close to where it's used as possible' mean in practice?",
    answer:
      "State should live in the lowest component in the tree that both needs it and is a common ancestor of everything that needs it — not hoisted further up (or all the way into a global store) by default. A form field's value only read by that one input stays in that input's own `useState`; it only moves up once a sibling genuinely needs to read or react to it too.\n\nThe payoff is fewer unrelated re-renders (a state change only affects the subtree that actually owns it) and a codebase where finding 'what can change this value' means reading one component, not searching the entire app for every dispatch to a shared store.",
    difficulty: "medium",
    companies: ["Meta", "Vercel"],
    orderIndex: 280,
  }
];
