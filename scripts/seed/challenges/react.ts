import type { ChallengeSeed } from "../types";

export const REACT_CHALLENGES: ChallengeSeed[] = [

  // ── react — standalone React Custom Hooks & Patterns Roadmap, Stage R1 ─────
  {
    slug: "react-counter-app",
    companies: [],
    category: "react",
    title: "The React Counter app",
    description: `The classic first custom-hook interview question — "build a counter hook" — a counter that increments, decrements, and resets. Framed here as the plain state-and-actions logic a \`Counter\` component's \`useState\` would drive — no JSX needed, just the state transitions themselves.

## Your task

Write \`createCounterStore(initial = 0)\`, returning \`{ getValue(), increment(), decrement(), reset() }\`. \`increment\`/\`decrement\` change the value by 1; \`reset\` returns it to whatever \`initial\` was, not to 0.

\`\`\`js
const counter = createCounterStore(10);
counter.increment();
counter.getValue(); // 11
counter.reset();
counter.getValue(); // 10 — back to initial, not 0
\`\`\``,
    difficulty: "easy",
    starterCode: `function createCounterStore(initial = 0) {
}`,
    solutionCode: `function createCounterStore(initial = 0) {
  let value = initial;
  return {
    getValue() {
      return value;
    },
    increment() {
      value += 1;
    },
    decrement() {
      value -= 1;
    },
    reset() {
      value = initial;
    },
  };
}`,
    testCases: [
      { input: "initial 0, increment() twice", expected: "2", label: "Increment increases the value by 1 each call" },
      { input: "initial 5, decrement() once", expected: "4", label: "Decrement decreases the value by 1" },
      { input: "initial 10, incremented then reset()", expected: "10 — the original initial, not 0", label: "Reset returns to the constructor's initial value, not zero" },
    ],
    hints: [
      "reset() must restore initial, not hardcode 0 — a counter created with createCounterStore(10) should reset back to 10.",
    ],
    orderIndex: 1190,
  },

  {
    slug: "controlled-vs-uncontrolled-input",
    companies: ["Meta", "Amazon"],
    category: "react",
    title: "Forms: Controlled vs. Uncontrolled Input",
    description: `The core distinction interviewers probe for: a **controlled** input's value is owned by external state — the DOM element only ever shows what that state says, and never updates itself. An **uncontrolled** input owns its own value internally — you just read the live DOM value on demand, via a ref.

## Your task

Write two functions. \`createControlledInput(initialValue)\` returns \`{ getValue(), setValue(next) }\` — an external "state" that only ever changes through an explicit \`setValue\` call. \`readUncontrolledValue(inputEl)\` takes a real \`<input>\` element and simply returns its current \`.value\`, read live — with no state of its own.

\`\`\`js
const controlled = createControlledInput("a");
controlled.setValue("b");
controlled.getValue(); // "b" — only setValue can move it

readUncontrolledValue(inputEl); // whatever inputEl.value currently is, read live
\`\`\``,
    difficulty: "easy",
    starterCode: `function createControlledInput(initialValue) {
}

function readUncontrolledValue(inputEl) {
}`,
    solutionCode: `function createControlledInput(initialValue) {
  let value = initialValue;
  return {
    getValue() {
      return value;
    },
    setValue(next) {
      value = next;
    },
  };
}

function readUncontrolledValue(inputEl) {
  return inputEl.value;
}`,
    testCases: [
      { input: "createControlledInput('a'), then the DOM never touched", expected: "getValue() still 'a' until setValue is called", label: "Controlled value only changes through setValue — nothing else can move it" },
      { input: "createControlledInput('a').setValue('b')", expected: "getValue() === 'b'", label: "setValue is the only way to update a controlled value" },
      { input: "a real <input> whose .value is set directly (simulating native typing), then readUncontrolledValue(el)", expected: "reflects the DOM's current value immediately, with no separate state copy", label: "Uncontrolled reads live from the DOM — there's no state to keep in sync" },
    ],
    hints: [
      "createControlledInput shouldn't touch the DOM at all — it's pure state, exactly like what a useState pair backing a controlled <input value={state} onChange={...}> would hold.",
      "readUncontrolledValue should never cache anything between calls — read inputEl.value fresh every time, which is exactly what a ref-based uncontrolled input does on submit.",
    ],
    orderIndex: 1191,
  },

  {
    slug: "todo-list-reducer-basics",
    companies: [],
    category: "react",
    title: "Build a Todo List (add / toggle / delete)",
    description: `Every "build a Todo list" round eventually reduces to the same three state transitions, whether you write them as three separate \`useState\` updaters or as one \`useReducer\`. Writing them as a single pure reducer function makes the logic trivial to test in isolation.

## Your task

Write \`todoReducer(state, action)\`, where \`state\` is an array of \`{ id, text, done }\` and \`action\` is one of \`{ type: "add", text }\`, \`{ type: "toggle", id }\`, or \`{ type: "delete", id }\`. Return a **new** array each time — never mutate \`state\` in place. New todos start with \`done: false\`, and get an \`id\` equal to the array's current length + 1 (simple, sequential, fine for this exercise).

\`\`\`js
let state = todoReducer([], { type: "add", text: "Buy milk" });
// [{ id: 1, text: "Buy milk", done: false }]
state = todoReducer(state, { type: "toggle", id: 1 });
// [{ id: 1, text: "Buy milk", done: true }]
state = todoReducer(state, { type: "delete", id: 1 });
// []
\`\`\``,
    difficulty: "easy",
    starterCode: `function todoReducer(state, action) {
}`,
    solutionCode: `function todoReducer(state, action) {
  switch (action.type) {
    case "add":
      return [...state, { id: state.length + 1, text: action.text, done: false }];
    case "toggle":
      return state.map((todo) =>
        todo.id === action.id ? { ...todo, done: !todo.done } : todo,
      );
    case "delete":
      return state.filter((todo) => todo.id !== action.id);
    default:
      return state;
  }
}`,
    testCases: [
      { input: "todoReducer([], { type: 'add', text: 'Buy milk' })", expected: "[{ id: 1, text: 'Buy milk', done: false }]", label: "add appends a new todo with done: false" },
      { input: "toggle the id-1 todo", expected: "only that todo's done flips — the rest are untouched", label: "toggle flips a single todo's done flag by id" },
      { input: "delete the id-1 todo from a two-item list", expected: "an array with only the remaining todo", label: "delete removes exactly the matching todo" },
      { input: "any action, checking the original state array afterward", expected: "the original array/objects are unchanged", label: "Never mutates the input state — always returns a new array" },
    ],
    hints: [
      "toggle should map over every todo and only replace the one matching action.id — every other todo should be the exact same object reference, not just equal by value.",
      "Returning [...state, newTodo] instead of state.push(newTodo) is what keeps this reducer pure — pushing would mutate the array a caller might still be holding a reference to.",
    ],
    orderIndex: 1192,
  },


  // ── react — standalone React Custom Hooks & Patterns Roadmap, Stage R2 ─────
  {
    slug: "use-toggle-hook",
    companies: ["Meta", "Amazon", "Airbnb", "Uber"],
    category: "react",
    title: "useToggle()",
    description: `One of the most-repeated "write a custom hook" openers, because it's the simplest possible shape of shared state: a single **boolean** with three ways to move it — flip whatever it currently is, or force it to a specific side regardless of the current value.

## Your task

Write \`createToggle(initial = false)\`, returning \`{ getValue(), toggle(), setOn(), setOff() }\`.

\`\`\`js
const toggle = createToggle(false);
toggle.toggle();
toggle.getValue(); // true
toggle.setOff();
toggle.getValue(); // false
\`\`\``,
    difficulty: "easy",
    starterCode: `function createToggle(initial = false) {
}`,
    solutionCode: `function createToggle(initial = false) {
  let value = Boolean(initial);
  return {
    getValue() {
      return value;
    },
    toggle() {
      value = !value;
    },
    setOn() {
      value = true;
    },
    setOff() {
      value = false;
    },
  };
}`,
    testCases: [
      { input: "createToggle(false), toggle() once", expected: "true", label: "toggle() flips the current value" },
      { input: "createToggle(false), toggle() twice", expected: "false — back to the start", label: "toggle() flips back on a second call" },
      { input: "createToggle(false), setOn() then setOff()", expected: "false, forced directly rather than by flipping", label: "setOn/setOff force a specific value regardless of the current one" },
    ],
    hints: [
      "toggle() should always invert the current value — never hardcode which direction it moves.",
    ],
    orderIndex: 1193,
  },

  {
    slug: "use-is-first-render-hook",
    companies: ["Meta", "Airbnb"],
    category: "react",
    title: "useIsFirstRender()",
    description: `A tiny but genuinely useful hook: lets a component (or an effect) know whether the current pass is the very first one, without a separate \`useEffect\` + ref dance every time you need that check.

## Your task

Write \`createIsFirstRenderTracker()\`, returning \`{ checkAndAdvance() }\`. Each call to \`checkAndAdvance()\` simulates checking on one render: it returns \`true\` the very first time it's called, and \`false\` on every call after that.

\`\`\`js
const tracker = createIsFirstRenderTracker();
tracker.checkAndAdvance(); // true
tracker.checkAndAdvance(); // false
tracker.checkAndAdvance(); // false
\`\`\``,
    difficulty: "easy",
    starterCode: `function createIsFirstRenderTracker() {
}`,
    solutionCode: `function createIsFirstRenderTracker() {
  let isFirst = true;
  return {
    checkAndAdvance() {
      const wasFirst = isFirst;
      isFirst = false;
      return wasFirst;
    },
  };
}`,
    testCases: [
      { input: "the first checkAndAdvance() call", expected: "true", label: "Returns true on the first call" },
      { input: "a second and third checkAndAdvance() call", expected: "false, false", label: "Returns false on every call after the first" },
    ],
    hints: [
      "The flag only needs to flip once, on the very first call — after that it should stay false forever, no matter how many more times checkAndAdvance() runs.",
    ],
    orderIndex: 1194,
  },

  {
    slug: "use-previous-hook",
    companies: ["Meta", "Amazon", "Shopify"],
    category: "react",
    title: "usePrevious()",
    description: `Comparing a value against what it was on the **previous** render is a common need — animating only when a prop changes direction, or logging a diff — but React doesn't expose the last render's props or state directly; you have to stash it yourself. \`createPreviousTracker\` simulates that: each call records the current value and hands back whatever was recorded on the call before it.

## Your task

Write \`createPreviousTracker()\`, returning \`{ track(current) }\`. Call \`track\` once per simulated render with the current value; it returns whatever value was passed to the *previous* call (\`undefined\` on the very first call).

\`\`\`js
const prev = createPreviousTracker();
prev.track(1); // undefined — no previous value yet
prev.track(2); // 1
prev.track(3); // 2
\`\`\``,
    difficulty: "easy",
    starterCode: `function createPreviousTracker() {
}`,
    solutionCode: `function createPreviousTracker() {
  let previous;
  return {
    track(current) {
      const value = previous;
      previous = current;
      return value;
    },
  };
}`,
    testCases: [
      { input: "track(1) on the first call", expected: "undefined", label: "The first call has no previous value yet" },
      { input: "track(1) then track(2)", expected: "the second call returns 1", label: "Each call returns what was passed in the call before it" },
      { input: "track(1), track(2), track(3)", expected: "returns undefined, then 1, then 2", label: "Tracks the immediately-prior value across a whole sequence of renders" },
    ],
    hints: [
      "Update the stored value to the new current *after* reading out the old one to return — order matters here.",
    ],
    orderIndex: 1195,
  },

  {
    slug: "use-effect-once-hook",
    companies: ["Meta"],
    category: "react",
    title: "useEffectOnce()",
    description: `A guarded version of "run this only on mount" — the kind of hook teams reach for when React 18 Strict Mode's intentional double-invoke of effects in development breaks code that assumed \`useEffect(fn, [])\` truly only ever runs once.

## Your task

Write \`createEffectOnce(effectFn)\`, returning a function \`run()\`. \`effectFn\` should execute the first time \`run()\` is called, and never again on any later call.

\`\`\`js
let calls = 0;
const run = createEffectOnce(() => { calls++; });
run();
run();
run();
calls; // 1 — effectFn only ever ran once
\`\`\``,
    difficulty: "easy",
    starterCode: `function createEffectOnce(effectFn) {
}`,
    solutionCode: `function createEffectOnce(effectFn) {
  let hasRun = false;
  return function run() {
    if (hasRun) return;
    hasRun = true;
    effectFn();
  };
}`,
    testCases: [
      { input: "run() called three times in a row", expected: "effectFn was invoked exactly once", label: "The wrapped effect only ever runs on the first call" },
      { input: "run() called once", expected: "effectFn was invoked", label: "The effect does run — just only once" },
    ],
    hints: [
      "Set the guard flag before calling effectFn, not after — if effectFn calls run() again re-entrantly, the guard still has to hold.",
    ],
    orderIndex: 1196,
  },

  {
    slug: "use-is-mounted-hook",
    companies: ["Meta", "Amazon"],
    category: "react",
    title: "useIsMounted()",
    description: `An async callback — a fetch response, a timer — can resolve after its component has already unmounted, and calling \`setState\` at that point throws React's well-known **"Can't perform a React state update on an unmounted component"** warning. The standard guard is a ref-like flag the callback checks before updating state, instead of letting the update fire into the void.

## Your task

Write \`createIsMountedRef()\`, returning \`{ isMounted(), unmount() }\`. \`isMounted()\` returns \`true\` until \`unmount()\` has been called, after which it returns \`false\` forever.

\`\`\`js
const ref = createIsMountedRef();
ref.isMounted(); // true
ref.unmount();
ref.isMounted(); // false
ref.unmount();
ref.isMounted(); // still false
\`\`\``,
    difficulty: "easy",
    starterCode: `function createIsMountedRef() {
}`,
    solutionCode: `function createIsMountedRef() {
  let mounted = true;
  return {
    isMounted() {
      return mounted;
    },
    unmount() {
      mounted = false;
    },
  };
}`,
    testCases: [
      { input: "isMounted() right after creation", expected: "true", label: "Starts mounted" },
      { input: "unmount(), then isMounted()", expected: "false", label: "isMounted() flips to false after unmount()" },
      { input: "unmount() called twice, then isMounted()", expected: "still false", label: "Stays unmounted permanently — there's no way back to true" },
    ],
    hints: [
      "There's no remount path here — once unmount() has been called, isMounted() must never return true again, no matter what else happens.",
    ],
    orderIndex: 1197,
  },

  {
    slug: "use-counter-hook",
    companies: [],
    category: "react",
    title: "useCounter() (increment/decrement/reset with bounds)",
    description: `A step up from the plain counter: this version enforces a \`min\`/\`max\` range, clamping every change instead of letting the value drift outside it.

## Your task

Write \`createCounter({ initial = 0, min = -Infinity, max = Infinity } = {})\`, returning \`{ getValue(), increment(), decrement(), reset() }\`. Every change must stay clamped within \`[min, max]\` — including the very first \`initial\` value itself.

\`\`\`js
const counter = createCounter({ initial: 4, max: 5 });
counter.increment();
counter.increment();
counter.getValue(); // 5 — clamped, not 6

createCounter({ initial: 10, max: 5 }).getValue(); // 5 — initial is clamped too
\`\`\``,
    difficulty: "easy",
    starterCode: `function createCounter({ initial = 0, min = -Infinity, max = Infinity } = {}) {
}`,
    solutionCode: `function createCounter({ initial = 0, min = -Infinity, max = Infinity } = {}) {
  function clamp(v) {
    return Math.min(Math.max(v, min), max);
  }
  let value = clamp(initial);
  return {
    getValue() {
      return value;
    },
    increment() {
      value = clamp(value + 1);
    },
    decrement() {
      value = clamp(value - 1);
    },
    reset() {
      value = clamp(initial);
    },
  };
}`,
    testCases: [
      { input: "createCounter({ initial: 4, max: 5 }), increment() twice", expected: "5 — clamped, not 6", label: "increment() never goes above max" },
      { input: "createCounter({ initial: 0, min: 0 }), decrement() twice", expected: "0 — clamped, not negative", label: "decrement() never goes below min" },
      { input: "createCounter({ initial: 10, max: 5 })", expected: "getValue() starts at 5, not 10", label: "The initial value itself is clamped into range" },
    ],
    hints: [
      "Run every write — increment, decrement, and reset — through the same clamp() helper, including the very first assignment from initial.",
    ],
    orderIndex: 1198,
  },


  // ── react — standalone React Custom Hooks & Patterns Roadmap, Stage R3 ─────
  {
    slug: "use-click-outside-hook",
    companies: ["Meta", "Airbnb", "Shopify"],
    category: "react",
    title: "useClickOutside()",
    description: `The hook behind every dropdown, modal, and popover that closes itself when you click elsewhere on the page — a single document-level click listener that checks whether the click landed inside the target element.

## Your task

Write \`createClickOutsideWatcher(targetEl, callback)\`. It should call \`callback\` whenever a click happens anywhere in the document *outside* \`targetEl\` (and outside any of its children), and never when the click is inside it. Return \`{ destroy() }\` to remove the listener.

\`\`\`js
const watcher = createClickOutsideWatcher(dropdownEl, () => console.log("closed"));
// a click on document.body fires callback — "closed"
// a click on dropdownEl itself does not
watcher.destroy(); // no more callbacks after this
\`\`\``,
    difficulty: "easy",
    starterCode: `function createClickOutsideWatcher(targetEl, callback) {
}`,
    solutionCode: `function createClickOutsideWatcher(targetEl, callback) {
  function handleClick(event) {
    if (!targetEl.contains(event.target)) {
      callback(event);
    }
  }
  document.addEventListener("click", handleClick);
  return {
    destroy() {
      document.removeEventListener("click", handleClick);
    },
  };
}`,
    testCases: [
      { input: "a click dispatched on an element outside targetEl", expected: "callback fires", label: "Fires when the click lands outside the target element" },
      { input: "a click dispatched on targetEl itself (or a child of it)", expected: "callback does not fire", label: "Does not fire when the click lands inside the target element" },
      { input: "destroy(), then another outside click", expected: "callback no longer fires", label: "destroy() removes the listener for good" },
    ],
    hints: [
      "Element.prototype.contains(node) returns true for the element itself too, not just its descendants — so checking !targetEl.contains(event.target) correctly excludes clicks on targetEl itself.",
    ],
    orderIndex: 1199,
  },

  {
    slug: "use-event-listener-hook",
    companies: ["Meta", "Amazon"],
    category: "react",
    title: "useEventListener() (generic addEventListener wrapper)",
    description: `A generic wrapper most codebases eventually write once and reuse everywhere. The subtle part isn't attaching the listener — it's making sure the *latest* handler always runs, even though the actual DOM listener was only attached once. A naive version captures whatever handler existed at attach time and runs that stale closure forever.

## Your task

Write \`createEventListenerHook(target, eventName, handler)\`, returning \`{ updateHandler(nextHandler), destroy() }\`. The listener should always invoke whichever handler was most recently passed to \`updateHandler\` (or the original one, if it's never been called) — not the one captured when the listener was first attached.

\`\`\`js
const listener = createEventListenerHook(button, "click", handlerA);
// clicking button now calls handlerA
listener.updateHandler(handlerB);
// clicking button now calls handlerB, not the stale handlerA
listener.destroy(); // no handler runs on further clicks
\`\`\``,
    difficulty: "easy",
    starterCode: `function createEventListenerHook(target, eventName, handler) {
}`,
    solutionCode: `function createEventListenerHook(target, eventName, handler) {
  let currentHandler = handler;
  function listener(event) {
    currentHandler(event);
  }
  target.addEventListener(eventName, listener);
  return {
    updateHandler(nextHandler) {
      currentHandler = nextHandler;
    },
    destroy() {
      target.removeEventListener(eventName, listener);
    },
  };
}`,
    testCases: [
      { input: "attach with handler A, dispatch the event once", expected: "A is invoked", label: "The original handler runs on the event" },
      { input: "attach with handler A, updateHandler(B), then dispatch the event", expected: "B runs, A does not", label: "Always calls the most recently registered handler, not a stale closure over the first one" },
      { input: "destroy(), then dispatch the event again", expected: "no handler runs", label: "destroy() actually removes the underlying DOM listener" },
    ],
    hints: [
      "Attach one stable listener function to the DOM that always reads a mutable 'current handler' variable — don't call target.addEventListener again inside updateHandler.",
    ],
    orderIndex: 1200,
  },

  {
    slug: "use-hover-hook",
    companies: ["Meta", "Airbnb"],
    category: "react",
    title: "useHover()",
    description: `There's no CSS-only way to read hover state back into JS — \`:hover\` styles the element, but a component that needs to *branch on* whether something is hovered (to conditionally render a tooltip, say) needs that as real state. \`createHoverWatcher\` tracks it with the **\`mouseenter\`**/**\`mouseleave\`** pair, which — unlike \`mouseover\`/\`mouseout\` — don't bubble, so they won't misfire as the pointer crosses a child element.

## Your task

Write \`createHoverWatcher(el)\`, returning \`{ isHovered(), destroy() }\`.

\`\`\`js
const hover = createHoverWatcher(cardEl);
// mouseenter fires on cardEl
hover.isHovered(); // true
// mouseleave fires on cardEl
hover.isHovered(); // false
\`\`\``,
    difficulty: "medium",
    starterCode: `function createHoverWatcher(el) {
}`,
    solutionCode: `function createHoverWatcher(el) {
  let hovered = false;
  function onEnter() {
    hovered = true;
  }
  function onLeave() {
    hovered = false;
  }
  el.addEventListener("mouseenter", onEnter);
  el.addEventListener("mouseleave", onLeave);
  return {
    isHovered() {
      return hovered;
    },
    destroy() {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    },
  };
}`,
    testCases: [
      { input: "a mouseenter event dispatched on el", expected: "isHovered() becomes true", label: "mouseenter sets hovered to true" },
      { input: "mouseenter then mouseleave dispatched on el", expected: "isHovered() becomes false again", label: "mouseleave sets hovered back to false" },
      { input: "destroy(), then a mouseenter dispatched on el", expected: "isHovered() stays false", label: "destroy() removes both listeners" },
    ],
    hints: [
      "mouseenter/mouseleave don't bubble the way mouseover/mouseout do, but since you're attaching directly to el (not delegating from a parent), that difference doesn't matter here.",
    ],
    orderIndex: 1201,
  },

  {
    slug: "use-focus-hook",
    companies: ["Meta"],
    category: "react",
    title: "useFocus()",
    description: `A component often needs to know whether one of its elements currently has focus — to show a highlighted border on a wrapping card, say, when an inner input is focused, since the input's own \`:focus\` style can't reach outside itself. \`createFocusWatcher\` tracks that by listening for the **\`focus\`**/**\`blur\`** event pair directly on the target element.

## Your task

Write \`createFocusWatcher(el)\`, returning \`{ isFocused(), destroy() }\`.

\`\`\`js
const focus = createFocusWatcher(inputEl);
// focus fires on inputEl
focus.isFocused(); // true
// blur fires on inputEl
focus.isFocused(); // false
\`\`\``,
    difficulty: "medium",
    starterCode: `function createFocusWatcher(el) {
}`,
    solutionCode: `function createFocusWatcher(el) {
  let focused = false;
  function onFocus() {
    focused = true;
  }
  function onBlur() {
    focused = false;
  }
  el.addEventListener("focus", onFocus);
  el.addEventListener("blur", onBlur);
  return {
    isFocused() {
      return focused;
    },
    destroy() {
      el.removeEventListener("focus", onFocus);
      el.removeEventListener("blur", onBlur);
    },
  };
}`,
    testCases: [
      { input: "a focus event dispatched on el", expected: "isFocused() becomes true", label: "focus sets focused to true" },
      { input: "focus then blur dispatched on el", expected: "isFocused() becomes false again", label: "blur sets focused back to false" },
      { input: "destroy(), then a focus event dispatched on el", expected: "isFocused() stays false", label: "destroy() removes both listeners" },
    ],
    hints: [
      "focus and blur don't bubble, so this only works because the listeners are attached directly to el — attaching them on a parent instead would silently never fire.",
    ],
    orderIndex: 1202,
  },

  {
    slug: "use-on-screen-hook",
    companies: ["Meta", "Pinterest", "TikTok"],
    category: "react",
    title: "useOnScreen() (IntersectionObserver)",
    description: `The hook behind lazy-loaded images and infinite scroll: track whether an element is currently within the viewport, using \`IntersectionObserver\` instead of scroll-event math. To keep this testable without a real browser layout engine, the observer itself is injected — exactly how you'd mock it in a real test suite.

## Your task

Write \`createOnScreenWatcher(el, createObserver)\`, returning \`{ isOnScreen(), destroy() }\`. \`createObserver(el, onChange)\` is called once; it's expected to return \`{ disconnect() }\`, and to call \`onChange({ isIntersecting })\` whenever the intersection state changes.

\`\`\`js
const watcher = createOnScreenWatcher(imgEl, createObserver);
watcher.isOnScreen(); // false — nothing's been reported yet
// the injected observer calls onChange({ isIntersecting: true })
watcher.isOnScreen(); // true
watcher.destroy(); // calls the observer's disconnect()
\`\`\``,
    difficulty: "medium",
    starterCode: `function createOnScreenWatcher(el, createObserver) {
}`,
    solutionCode: `function createOnScreenWatcher(el, createObserver) {
  let onScreen = false;
  const observer = createObserver(el, (entry) => {
    onScreen = entry.isIntersecting;
  });
  return {
    isOnScreen() {
      return onScreen;
    },
    destroy() {
      observer.disconnect();
    },
  };
}`,
    testCases: [
      { input: "before any intersection change fires", expected: "isOnScreen() is false", label: "Starts off-screen by default" },
      { input: "the injected observer reports isIntersecting: true", expected: "isOnScreen() becomes true", label: "Reflects the observer's reported intersection state" },
      { input: "destroy()", expected: "the observer's disconnect() was called", label: "destroy() disconnects the underlying observer" },
    ],
    hints: [
      "createObserver is called exactly once, at setup — don't call it again elsewhere, and don't reach into IntersectionObserver directly since it's provided for you as a parameter.",
    ],
    orderIndex: 1203,
  },

  {
    slug: "use-window-size-hook",
    companies: ["Amazon", "Airbnb"],
    category: "react",
    title: "useWindowSize()",
    description: `Tracks the browser viewport's width/height, updating whenever the window resizes. Since a real iframe's viewport can't be resized on demand for testing, the \`window\`-like object is passed in — the same shape a real \`window\` has (\`innerWidth\`, \`innerHeight\`, \`addEventListener\`).

## Your task

Write \`createWindowSizeWatcher(win)\`, returning \`{ getSize(), destroy() }\`, where \`getSize()\` returns \`{ width, height }\` and stays in sync with \`win\`'s \`resize\` events.

\`\`\`js
const watcher = createWindowSizeWatcher(win); // win.innerWidth = 1024, innerHeight = 768
watcher.getSize(); // { width: 1024, height: 768 }
// win resizes to 500x400 and fires "resize"
watcher.getSize(); // { width: 500, height: 400 }
\`\`\``,
    difficulty: "easy",
    starterCode: `function createWindowSizeWatcher(win) {
}`,
    solutionCode: `function createWindowSizeWatcher(win) {
  let size = { width: win.innerWidth, height: win.innerHeight };
  function onResize() {
    size = { width: win.innerWidth, height: win.innerHeight };
  }
  win.addEventListener("resize", onResize);
  return {
    getSize() {
      return size;
    },
    destroy() {
      win.removeEventListener("resize", onResize);
    },
  };
}`,
    testCases: [
      { input: "created against a 1024×768 window", expected: "getSize() is { width: 1024, height: 768 }", label: "Reads the initial size immediately" },
      { input: "the window resizes to 500×400", expected: "getSize() updates to { width: 500, height: 400 }", label: "Updates on a resize event" },
      { input: "destroy(), then the window resizes again", expected: "getSize() stays at the last value before destroy()", label: "destroy() stops tracking further resizes" },
    ],
    hints: [
      "Read win.innerWidth/win.innerHeight fresh inside the resize handler — don't try to pull the new size out of the event object itself.",
    ],
    orderIndex: 1204,
  },


  // ── react — standalone React Custom Hooks & Patterns Roadmap, Stage R4 ─────
  {
    slug: "use-debounced-value-hook",
    companies: ["Meta", "Amazon", "Uber", "TikTok", "Airbnb"],
    category: "react",
    title: "useDebounce()",
    description: `Not to be confused with debouncing a *function* — this debounces a *value*: as a value changes rapidly (like a search box's text on every keystroke), the debounced version only catches up once the value has stopped changing for a while.

## Your task

Write \`createDebouncedValue(initial, delayMs)\`, returning \`{ getValue(), setValue(next) }\`. Each \`setValue\` call restarts a \`delayMs\` timer; \`getValue()\` only reflects the latest \`setValue\` call once that timer finishes without being restarted again.

\`\`\`js
const debounced = createDebouncedValue("", 300);
debounced.setValue("i");
debounced.setValue("in");
debounced.setValue("ind");
// 300ms after the last call:
debounced.getValue(); // "ind"
\`\`\``,
    difficulty: "easy",
    starterCode: `function createDebouncedValue(initial, delayMs) {
}`,
    solutionCode: `function createDebouncedValue(initial, delayMs) {
  let value = initial;
  let timer = null;
  return {
    getValue() {
      return value;
    },
    setValue(next) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        value = next;
        timer = null;
      }, delayMs);
    },
  };
}`,
    testCases: [
      { input: "three rapid setValue calls within the delay window", expected: "getValue() only reflects the last of the three, and only after the delay", label: "Coalesces rapid updates into the final one" },
      { input: "setValue called, checked immediately (before the delay elapses)", expected: "getValue() still returns the old value", label: "Doesn't update until the full delay has passed" },
      { input: "setValue called once, waited past the full delay", expected: "getValue() reflects the new value", label: "Updates once the delay elapses undisturbed" },
    ],
    hints: [
      "Every setValue call should clear whatever timer is already pending before starting a new one — that's what makes rapid calls collapse into a single update.",
    ],
    orderIndex: 1205,
  },

  {
    slug: "use-throttled-value-hook",
    companies: ["Uber", "TikTok"],
    category: "react",
    title: "useThrottle()",
    description: `Like debounce, but for capping the *rate* of updates instead of waiting for silence — the first update in a window applies immediately, and further updates within the same window are dropped until the window passes (leading-edge throttling, the version most prep guides ask for first).

## Your task

Write \`createThrottledValue(initial, intervalMs)\`, returning \`{ getValue(), setValue(next) }\`. A \`setValue\` call applies immediately if at least \`intervalMs\` has passed since the last applied update; otherwise it's dropped.

\`\`\`js
const throttled = createThrottledValue(0, 200);
throttled.setValue(1); // applies immediately
throttled.setValue(2); // dropped — still inside the 200ms window
throttled.getValue(); // 1
// after 200ms pass:
throttled.setValue(3); // applies
\`\`\``,
    difficulty: "easy",
    starterCode: `function createThrottledValue(initial, intervalMs) {
}`,
    solutionCode: `function createThrottledValue(initial, intervalMs) {
  let value = initial;
  let lastUpdate = 0;
  return {
    getValue() {
      return value;
    },
    setValue(next) {
      const now = Date.now();
      if (now - lastUpdate >= intervalMs) {
        value = next;
        lastUpdate = now;
      }
    },
  };
}`,
    testCases: [
      { input: "the very first setValue call", expected: "applies immediately", label: "The leading update always goes through" },
      { input: "a second setValue call right after the first, well within intervalMs", expected: "dropped — getValue() still shows the first update", label: "Updates within the same window are dropped" },
      { input: "a setValue call after waiting past intervalMs", expected: "applies", label: "A new window allows the next update through" },
    ],
    hints: [
      "Only lastUpdate matters for the decision — there's no queued 'trailing' call to worry about in this leading-edge version.",
    ],
    orderIndex: 1206,
  },

  {
    slug: "use-timeout-hook",
    companies: ["Meta", "Amazon"],
    category: "react",
    title: "useTimeout()",
    description: `Raw \`setTimeout\`/\`clearTimeout\` bookkeeping gets messy fast once a component needs to **restart** a pending timer on some events and **cancel** it outright on others — a save-draft-after-idle feature, say, that resets its delay on every keystroke but cancels entirely if the user navigates away. \`createTimeoutRunner\` wraps that bookkeeping behind two verbs instead of manual ref-juggling.

## Your task

Write \`createTimeoutRunner(callback, delayMs)\`, returning \`{ reset(), clear() }\`. \`reset()\` cancels any pending timer and starts a fresh \`delayMs\` one; \`clear()\` cancels it without starting a new one.

\`\`\`js
const timeout = createTimeoutRunner(() => console.log("saved"), 1000);
timeout.reset(); // restarts the full 1000ms wait from now
// ...or:
timeout.clear(); // cancels it — "saved" never logs
\`\`\``,
    difficulty: "medium",
    starterCode: `function createTimeoutRunner(callback, delayMs) {
}`,
    solutionCode: `function createTimeoutRunner(callback, delayMs) {
  let timer = setTimeout(callback, delayMs);
  return {
    reset() {
      clearTimeout(timer);
      timer = setTimeout(callback, delayMs);
    },
    clear() {
      clearTimeout(timer);
    },
  };
}`,
    testCases: [
      { input: "created, then waited past delayMs untouched", expected: "callback fires", label: "The callback fires on its own if left alone" },
      { input: "clear() called before delayMs elapses", expected: "callback never fires", label: "clear() cancels the pending callback" },
      { input: "reset() called partway through, extending the wait", expected: "callback fires delayMs after the reset() call, not the original start", label: "reset() restarts the full delay from that point" },
    ],
    hints: [
      "reset() is just clear() followed by starting a brand new setTimeout — no need for any more elaborate bookkeeping than that.",
    ],
    orderIndex: 1207,
  },

  {
    slug: "use-interval-hook",
    companies: ["Meta"],
    category: "react",
    title: "useInterval() (the classic Dan Abramov pattern)",
    description: `The subtlety Dan Abramov's famous post is about: a naive \`setInterval(callback, delay)\` inside \`useEffect\` captures whatever \`callback\` closure existed when the effect ran — so if \`callback\` changes on a later render, the interval keeps calling the *stale* one forever, unless you restart the whole interval (which resets its timing). The fix is to keep the interval itself stable, but always call through to the *latest* callback.

## Your task

Write \`createInterval(callback, delayMs)\`, returning \`{ updateCallback(nextCallback), stop() }\`. The underlying interval should tick every \`delayMs\` without ever restarting, but each tick must call whichever callback was most recently passed to \`updateCallback\` (or the original, if never updated).

\`\`\`js
const interval = createInterval(callbackA, 1000);
// ticks call callbackA
interval.updateCallback(callbackB);
// later ticks call callbackB — the same interval, never restarted
interval.stop(); // no further ticks
\`\`\``,
    difficulty: "medium",
    starterCode: `function createInterval(callback, delayMs) {
}`,
    solutionCode: `function createInterval(callback, delayMs) {
  let currentCallback = callback;
  const timer = setInterval(() => {
    currentCallback();
  }, delayMs);
  return {
    updateCallback(nextCallback) {
      currentCallback = nextCallback;
    },
    stop() {
      clearInterval(timer);
    },
  };
}`,
    testCases: [
      { input: "created with callback A, waited past a few ticks", expected: "A was called", label: "The original callback fires on each tick" },
      { input: "updateCallback(B) called, then waited past another tick", expected: "B is called on the next tick, not the stale A", label: "Ticks always call the most recently registered callback" },
      { input: "stop(), then waited past several more delayMs periods", expected: "no further calls happen", label: "stop() actually clears the underlying interval" },
    ],
    hints: [
      "There should only ever be one setInterval call, made once at creation — updateCallback must never create a new interval, only swap which function the existing one calls.",
    ],
    orderIndex: 1208,
  },

  {
    slug: "use-update-effect-hook",
    companies: ["Meta"],
    category: "react",
    title: "useUpdateEffect() (skip effect on mount)",
    description: `A variant of \`useEffect\` that skips its very first run — useful when an effect should only react to genuine *changes*, not the initial mount (e.g. showing a "saved!" toast only after an actual edit, not when the form first loads).

## Your task

Write \`createUpdateEffectRunner(effectFn)\`, returning a function \`run()\` meant to be called once per simulated render/update. \`effectFn\` must **not** run on the first call, but must run on every call after that.

\`\`\`js
let calls = 0;
const run = createUpdateEffectRunner(() => { calls++; });
run(); // the mount — effectFn does not run
run(); // effectFn runs
run(); // effectFn runs
calls; // 2
\`\`\``,
    difficulty: "medium",
    starterCode: `function createUpdateEffectRunner(effectFn) {
}`,
    solutionCode: `function createUpdateEffectRunner(effectFn) {
  let hasMounted = false;
  return function run() {
    if (hasMounted) {
      effectFn();
    } else {
      hasMounted = true;
    }
  };
}`,
    testCases: [
      { input: "run() called once (the mount)", expected: "effectFn was not called", label: "Skips the effect on the very first call" },
      { input: "run() called three times total", expected: "effectFn was called exactly twice", label: "Runs on every call after the first" },
    ],
    hints: [
      "The very first run() call should only flip an internal 'has mounted' flag — it shouldn't call effectFn at all.",
    ],
    orderIndex: 1209,
  },


  // ── react — standalone React Custom Hooks & Patterns Roadmap, Stage R5 ─────
  {
    slug: "use-local-storage-hook",
    companies: ["Amazon", "Airbnb", "Meta"],
    category: "react",
    title: "useLocalStorage()",
    description: `A \`useState\` that persists to \`localStorage\`, so the value survives a refresh. To keep this testable without touching the browser's real storage, the storage backend itself is injected — any object with \`get(key)\`/\`set(key, value)\` will do.

## Your task

Write \`createLocalStorageState(key, initialValue, storage)\`, returning \`{ getValue(), setValue(next) }\`. On creation, it should read any existing value already in \`storage\` for \`key\` (JSON-decoded) instead of \`initialValue\`, if one exists — and every \`setValue\` call must write the new value back to \`storage\` (JSON-encoded) as well as updating the in-memory value.

\`\`\`js
const theme = createLocalStorageState("theme", "light", storage);
theme.getValue(); // "light" — nothing in storage yet
theme.setValue("dark"); // writes JSON.stringify("dark") into storage

// a fresh instance against the same storage:
createLocalStorageState("theme", "light", storage).getValue(); // "dark", not "light"
\`\`\``,
    difficulty: "easy",
    starterCode: `function createLocalStorageState(key, initialValue, storage) {
}`,
    solutionCode: `function createLocalStorageState(key, initialValue, storage) {
  const existing = storage.get(key);
  let value = existing !== undefined ? JSON.parse(existing) : initialValue;
  if (existing === undefined) {
    storage.set(key, JSON.stringify(value));
  }
  return {
    getValue() {
      return value;
    },
    setValue(next) {
      value = next;
      storage.set(key, JSON.stringify(value));
    },
  };
}`,
    testCases: [
      { input: "an empty storage, createLocalStorageState('theme', 'light', storage)", expected: "getValue() is 'light'", label: "Falls back to initialValue when storage has nothing for that key" },
      { input: "setValue('dark') on that instance", expected: "storage now holds the JSON-encoded 'dark' for that key", label: "setValue writes through to storage" },
      { input: "a fresh createLocalStorageState('theme', 'light', storage) against the same pre-populated storage", expected: "getValue() is 'dark', not the initialValue 'light'", label: "A new instance picks up whatever was already persisted, ignoring initialValue" },
    ],
    hints: [
      "Only fall back to initialValue when storage.get(key) is genuinely undefined — an empty string or 0 is still a real stored value.",
    ],
    orderIndex: 1210,
  },

  {
    slug: "use-array-hook",
    companies: ["Amazon"],
    category: "react",
    title: "useArray() (push/remove/clear/update helpers over useState)",
    description: `Managing an array with plain \`useState\` means remembering to always spread into a new array on every change — this hook bundles the common operations so callers never mutate in place by accident.

## Your task

Write \`createArrayState(initial = [])\`, returning \`{ getValue(), push(item), removeAt(index), updateAt(index, item), clear() }\`. Every operation must return a new array — never mutate the array \`getValue()\` last returned.

\`\`\`js
const list = createArrayState([1, 2]);
list.push(3);
list.getValue(); // [1, 2, 3]
list.updateAt(1, 99);
list.getValue(); // [1, 99, 3]
list.removeAt(0);
list.getValue(); // [99, 3]
list.clear();
list.getValue(); // []
\`\`\``,
    difficulty: "medium",
    starterCode: `function createArrayState(initial = []) {
}`,
    solutionCode: `function createArrayState(initial = []) {
  let items = [...initial];
  return {
    getValue() {
      return items;
    },
    push(item) {
      items = [...items, item];
    },
    removeAt(index) {
      items = items.filter((_, i) => i !== index);
    },
    updateAt(index, item) {
      items = items.map((existing, i) => (i === index ? item : existing));
    },
    clear() {
      items = [];
    },
  };
}`,
    testCases: [
      { input: "createArrayState([1, 2]), push(3)", expected: "[1, 2, 3]", label: "push appends to the end" },
      { input: "createArrayState([1, 2, 3]), removeAt(1)", expected: "[1, 3]", label: "removeAt drops exactly the item at that index" },
      { input: "createArrayState([1, 2, 3]), updateAt(1, 99)", expected: "[1, 99, 3]", label: "updateAt replaces exactly the item at that index" },
      { input: "createArrayState([1, 2]), clear()", expected: "[]", label: "clear empties the array" },
    ],
    hints: [
      "None of these methods should call .push/.splice on the existing items array directly — always build a new array with spread, filter, or map.",
    ],
    orderIndex: 1211,
  },

  {
    slug: "phone-number-input-formatter",
    companies: ["Stripe", "Amazon", "Meta"],
    category: "react",
    title: "Phone Number Input (controlled, formatted as you type)",
    description: `The formatting logic behind a controlled phone-number field: as digits are typed, the display string grows through \`5\`, \`(555\`, \`(555) 12\`, \`(555) 123-4567\` — all driven off the raw digits typed so far, exactly what a controlled input's \`onChange\` would recompute on every keystroke.

## Your task

Write \`formatPhoneNumberInput(raw)\`, which takes the raw characters typed so far (only digits count — ignore anything else, so pasted text like \`"(555) 123-4567"\` still works) and returns the progressively-formatted \`(XXX) XXX-XXXX\` string, capped at 10 digits.

\`\`\`js
formatPhoneNumberInput("5"); // "(5"
formatPhoneNumberInput("555"); // "(555"
formatPhoneNumberInput("5551234"); // "(555) 123-4"
formatPhoneNumberInput("(555) 123-4567"); // "(555) 123-4567" — pasted, non-digits stripped
formatPhoneNumberInput("55512345678"); // "(555) 123-4567" — capped at 10 digits
\`\`\``,
    difficulty: "medium",
    starterCode: `function formatPhoneNumberInput(raw) {
}`,
    solutionCode: `function formatPhoneNumberInput(raw) {
  const digits = Array.from(raw)
    .filter((ch) => ch >= "0" && ch <= "9")
    .slice(0, 10)
    .join("");
  if (digits.length === 0) return "";
  if (digits.length < 4) return "(" + digits;
  if (digits.length < 7) {
    return "(" + digits.slice(0, 3) + ") " + digits.slice(3);
  }
  return "(" + digits.slice(0, 3) + ") " + digits.slice(3, 6) + "-" + digits.slice(6);
}`,
    testCases: [
      { input: "'5'", expected: "'(5'", label: "A single digit starts the area code group" },
      { input: "'555'", expected: "'(555'", label: "Three digits still show only the open area-code group" },
      { input: "'5551234'", expected: "'(555) 123-4'", label: "Past three digits, the prefix group and separator appear" },
      { input: "'(555) 123-4567' pasted in directly", expected: "'(555) 123-4567'", label: "Ignores non-digit characters already present in pasted input" },
      { input: "'55512345678' (11 raw digits)", expected: "'(555) 123-4567' — capped at 10 digits", label: "Extra digits past 10 are ignored" },
    ],
    hints: [
      "Strip everything down to just the digit characters first, then decide the formatting purely from how many digits you have left — never try to format the raw string with punctuation still in it.",
    ],
    orderIndex: 1212,
  },

  {
    slug: "use-form-hook",
    companies: ["Stripe", "Amazon", "Airbnb"],
    category: "react",
    title: "useForm() — basic controlled form state + field-level validation",
    description: `A minimal form hook: tracks every field's value in one place, and re-validates a field the moment it changes — the foundation every larger form library (Formik, React Hook Form) builds on top of.

## Your task

Write \`createFormState(initialValues, validators = {})\`, returning \`{ getValues(), getErrors(), setField(name, value), validateAll() }\`. \`validators\` maps a field name to a function \`(value) => errorMessage | null\`. Changing a field via \`setField\` should immediately re-validate just that field; \`validateAll()\` re-validates every field and returns whether the whole form is currently valid.

\`\`\`js
const form = createFormState({ email: "" }, { email: (v) => (v ? null : "Required") });
form.getErrors().email; // "Required" — validated up front, before any edit
form.setField("email", "a@b.com");
form.getErrors().email; // null
form.setField("email", "");
form.validateAll(); // false — getErrors().email is "Required" again
\`\`\``,
    difficulty: "medium",
    starterCode: `function createFormState(initialValues, validators = {}) {
}`,
    solutionCode: `function createFormState(initialValues, validators = {}) {
  let values = { ...initialValues };
  let errors = {};
  function validateField(name) {
    const validate = validators[name];
    errors = { ...errors, [name]: validate ? validate(values[name]) : null };
  }
  Object.keys(initialValues).forEach(validateField);
  return {
    getValues() {
      return values;
    },
    getErrors() {
      return errors;
    },
    setField(name, value) {
      values = { ...values, [name]: value };
      validateField(name);
    },
    validateAll() {
      Object.keys(values).forEach(validateField);
      return Object.values(errors).every((error) => !error);
    },
  };
}`,
    testCases: [
      { input: "createFormState({ email: '' }, { email: (v) => (v ? null : 'Required') })", expected: "getErrors().email is 'Required' immediately, without waiting for setField", label: "Validates every field up front, on creation" },
      { input: "setField('email', 'a@b.com')", expected: "getErrors().email becomes null", label: "setField re-validates just the field that changed" },
      { input: "setField('email', '') then validateAll()", expected: "returns false, and getErrors().email is 'Required' again", label: "validateAll re-checks every field and reports overall validity" },
      { input: "setField('email', 'a@b.com') on a form with an untouched second invalid field", expected: "setField only touches email's error — the other field's error is unaffected", label: "setField only re-validates the field that actually changed, not the whole form" },
    ],
    hints: [
      "Run every field through its validator once at creation time too — an empty required field should already show its error before any setField call, not just after the first edit.",
    ],
    orderIndex: 1213,
  },


  // ── react — standalone React Custom Hooks & Patterns Roadmap, Stage R6 ─────
  {
    slug: "use-async-resource-hook",
    companies: ["Meta", "Amazon", "Airbnb", "Stripe"],
    category: "react",
    title: "useFetch() / useAsync()",
    description: `The single most common "build a hook" live-coding task: wrap an async operation and expose its lifecycle as data — idle, loading, then success (with the resolved value) or error (with the rejection reason) — instead of making every caller repeat the same try/catch/state juggling.

## Your task

Write \`createAsyncResource(promiseFactory)\`, returning \`{ getState(), run() }\`. \`getState()\` returns \`{ status, data, error }\`, starting at \`{ status: "idle", data: null, error: null }\`. Calling \`run()\` sets status to \`"loading"\`, then resolves to either \`{ status: "success", data, error: null }\` or \`{ status: "error", data: null, error }\` once \`promiseFactory()\` settles.

\`\`\`js
const resource = createAsyncResource(() => fetch("/api/user").then((r) => r.json()));
resource.getState(); // { status: "idle", data: null, error: null }
const promise = resource.run();
resource.getState().status; // "loading" — set synchronously, before the fetch resolves
await promise;
resource.getState(); // { status: "success", data: {...}, error: null }

// if promiseFactory() rejects instead:
const failing = createAsyncResource(() => Promise.reject(new Error("network down")));
await failing.run();
failing.getState(); // { status: "error", data: null, error: Error("network down") }
\`\`\``,
    difficulty: "medium",
    starterCode: `function createAsyncResource(promiseFactory) {
}`,
    solutionCode: `function createAsyncResource(promiseFactory) {
  let state = { status: "idle", data: null, error: null };
  return {
    getState() {
      return state;
    },
    async run() {
      state = { status: "loading", data: null, error: null };
      try {
        const data = await promiseFactory();
        state = { status: "success", data, error: null };
      } catch (error) {
        state = { status: "error", data: null, error };
      }
      return state;
    },
  };
}`,
    testCases: [
      { input: "a fresh resource, before run() is called", expected: "{ status: 'idle', data: null, error: null }", label: "Starts idle" },
      { input: "run() with a promiseFactory that resolves to 42", expected: "ends at { status: 'success', data: 42, error: null }", label: "Resolves into a success state carrying the data" },
      { input: "run() with a promiseFactory that rejects with an Error", expected: "ends at { status: 'error', data: null, error: <the error> }", label: "A rejection lands in the error state, not an unhandled rejection" },
      { input: "getState() called synchronously right after calling run() (before the promise settles)", expected: "status is 'loading'", label: "Status flips to loading immediately, before the async work resolves" },
    ],
    hints: [
      "Update state to the loading status synchronously, before the first await — the caller should be able to observe 'loading' immediately after calling run(), without waiting for anything.",
    ],
    orderIndex: 1214,
  },

  {
    slug: "use-swr-stale-while-revalidate",
    companies: ["Meta", "Vercel"],
    category: "react",
    title: "useSWR() I (stale-while-revalidate fetching + caching)",
    description: `SWR's core idea: on load, return whatever's already cached *immediately* (even if it might be outdated) while a fresh fetch runs in the background — once that resolves, the cache updates and every subscriber is notified. No spinner for data you already have.

## Your task

Write \`createSWRResource(key, fetcher, cache)\`, returning \`{ getData(), subscribe(listener), load() }\`. \`cache\` is a shared \`Map\`-like store (\`get\`/\`set\`) so multiple resources can share state. \`load()\` should return whatever was cached *before* the fetch started, while updating the cache (and notifying subscribers) once \`fetcher()\` resolves. \`subscribe(listener)\` returns an unsubscribe function — calling it detaches that listener so it stops receiving future updates.

\`\`\`js
cache.set("user", { name: "stale" });
const resource = createSWRResource("user", fetcher, cache);
const unsubscribe = resource.subscribe((data) => console.log("updated:", data));
const stale = await resource.load(); // { name: "stale" } — the cache's old value
resource.getData(); // { name: "fresh" } — now updated in the background
// "updated: { name: 'fresh' }" was logged once fetcher() resolved
unsubscribe(); // this listener won't be called on any future load()
\`\`\``,
    difficulty: "medium",
    starterCode: `function createSWRResource(key, fetcher, cache) {
}`,
    solutionCode: `function createSWRResource(key, fetcher, cache) {
  const listeners = [];
  function notify() {
    listeners.forEach((fn) => fn(cache.get(key)));
  }
  return {
    getData() {
      return cache.get(key);
    },
    subscribe(listener) {
      listeners.push(listener);
      return () => {
        const i = listeners.indexOf(listener);
        if (i !== -1) listeners.splice(i, 1);
      };
    },
    async load() {
      const stale = cache.get(key);
      const fresh = await fetcher();
      cache.set(key, fresh);
      notify();
      return stale;
    },
  };
}`,
    testCases: [
      { input: "a cache pre-seeded with a stale value for the key, then getData() called immediately after starting load() (before it resolves)", expected: "still the stale value", label: "Serves the cached value immediately, without waiting on the fetch" },
      { input: "load() awaited to completion", expected: "getData() now returns the freshly-fetched value", label: "The cache updates once the background fetch resolves" },
      { input: "a subscriber registered before load() runs", expected: "it's called once the fresh value lands in the cache", label: "Subscribers are notified when revalidation completes" },
      { input: "unsubscribe() called, then another load()", expected: "that listener is not called again", label: "The unsubscribe function returned by subscribe() actually detaches the listener" },
    ],
    hints: [
      "Read the stale value out of the cache before calling fetcher() — that snapshot, not whatever ends up in the cache later, is what load() should resolve to.",
    ],
    orderIndex: 1215,
  },

  {
    slug: "fetch-request-deduper",
    companies: ["Airbnb", "Vercel"],
    category: "react",
    title: "Minimal Caching Layer on Top of useFetch (Dedupe Identical Requests)",
    description: `A common follow-up once a basic \`useFetch\` exists: if two components request the *same* resource while a request for it is already in flight, they should share that one request instead of firing a duplicate — a small win that avoids redundant network traffic under React's frequent re-renders.

## Your task

Write \`createDedupedFetcher(fetcher)\`, returning a function \`fetchDeduped(key)\`. While a request for a given \`key\` is in flight, any further calls with that same \`key\` must return the *same* promise instead of calling \`fetcher\` again. Once that request settles, the next call with the same \`key\` should start a brand-new request.

\`\`\`js
const fetchDeduped = createDedupedFetcher(fetcher);
const p1 = fetchDeduped("/api/user/1");
const p2 = fetchDeduped("/api/user/1");
p1 === p2; // true — fetcher was only called once
await p1;
const p3 = fetchDeduped("/api/user/1"); // settled — this starts a fresh request
\`\`\``,
    difficulty: "medium",
    starterCode: `function createDedupedFetcher(fetcher) {
}`,
    solutionCode: `function createDedupedFetcher(fetcher) {
  const inFlight = new Map();
  return function fetchDeduped(key) {
    if (inFlight.has(key)) {
      return inFlight.get(key);
    }
    const promise = fetcher(key).finally(() => {
      inFlight.delete(key);
    });
    inFlight.set(key, promise);
    return promise;
  };
}`,
    testCases: [
      { input: "two calls with the same key made before either resolves", expected: "fetcher was only called once", label: "Concurrent calls with the same key share one underlying request" },
      { input: "calls with two different keys, both made before either resolves", expected: "fetcher was called once per distinct key", label: "Different keys are never deduped against each other" },
      { input: "a call, awaited to completion, then another call with the same key", expected: "fetcher is called again — a fresh request, not the old cached promise", label: "Once a request settles, the next call starts over rather than reusing a stale result forever" },
    ],
    hints: [
      "The in-flight map should only ever hold a key while its promise is still pending — clean it up (e.g. with .finally()) the moment that request settles, whether it succeeds or fails.",
    ],
    orderIndex: 1216,
  },

  {
    slug: "global-store-pubsub",
    companies: ["Meta", "Amazon"],
    category: "react",
    title: "Global Store with Context + useContext (Avoid Prop Drilling)",
    description: `Strip away the JSX and \`<Provider>\` boilerplate, and what \`Context\` actually gives every descendant is just this: a shared value, plus a way to be notified when it changes — which is exactly what a plain subscribable store provides too.

## The idea

A global store needs only three moving parts: a value held in closure, a \`setValue\` that updates it and notifies listeners, and a \`subscribe\` that registers (and can later remove) a listener. \`useContext\` wraps exactly this in JSX plumbing — the reactive core underneath is the pub/sub pattern below.

## Your task

Write \`createGlobalStore(initialValue)\`, returning \`{ getValue(), setValue(next), subscribe(listener) }\`. \`setValue\` should notify every current subscriber with the new value; \`subscribe\` returns an unsubscribe function.

\`\`\`js
const store = createGlobalStore({ theme: "light" });
const unsubscribe = store.subscribe((value) => console.log("changed:", value));
store.setValue({ theme: "dark" }); // logs "changed: { theme: 'dark' }"
unsubscribe();
store.setValue({ theme: "light" }); // the listener is no longer called
\`\`\``,
    difficulty: "medium",
    starterCode: `function createGlobalStore(initialValue) {
}`,
    solutionCode: `function createGlobalStore(initialValue) {
  let value = initialValue;
  const listeners = new Set();
  return {
    getValue() {
      return value;
    },
    setValue(next) {
      value = next;
      listeners.forEach((listener) => listener(value));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}`,
    testCases: [
      { input: "createGlobalStore({ theme: 'light' })", expected: "getValue() returns { theme: 'light' }", label: "Starts at the given initial value" },
      { input: "two subscribers registered, then setValue() called once", expected: "both subscribers are called with the new value", label: "Every subscriber is notified on a change, not just the first one" },
      { input: "a subscriber's returned unsubscribe function is called, then setValue() again", expected: "that subscriber is not called again", label: "unsubscribe actually detaches the listener" },
    ],
    hints: [
      "Iterate the listeners with the value already updated — subscribers should see the new value both from the callback argument and from calling getValue() themselves.",
    ],
    orderIndex: 1217,
  },

  {
    slug: "valtio-style-proxy-store",
    companies: ["Meta"],
    category: "react",
    title: "Proxy-State (Valtio-Style Reactive Store)",
    description: `Valtio's pitch: mutate a plain object directly (\`store.count++\`) and subscribers still get notified — no reducer, no setter functions, just a \`Proxy\` intercepting every write. Simpler (and coarser-grained) than a full dependency-tracking system: every mutation notifies every subscriber, with no per-property filtering.

## The idea

A JavaScript \`Proxy\` can intercept property writes via its \`set\` trap. Route every assignment through that trap, perform the real write, then notify subscribers — and \`store.count++\` (which reads then writes) triggers it automatically, with no special-casing needed for that syntax.

## Your task

Write \`createValtioStore(initialState)\`, returning \`{ store, subscribe(callback) }\`. \`store\` must be directly mutable (\`store.someKey = value\`), and every mutation should synchronously call every subscribed \`callback\` (with no arguments — subscribers just re-read \`store\` themselves).

\`\`\`js
const { store, subscribe } = createValtioStore({ count: 0 });
subscribe(() => console.log("changed, count is now:", store.count));
store.count = 5; // logs "changed, count is now: 5"
store.count; // 5 — store is directly mutable, no setter needed
\`\`\``,
    difficulty: "medium",
    starterCode: `function createValtioStore(initialState) {
}`,
    solutionCode: `function createValtioStore(initialState) {
  const listeners = new Set();
  const store = new Proxy(
    { ...initialState },
    {
      set(target, key, value) {
        target[key] = value;
        listeners.forEach((listener) => listener());
        return true;
      },
    },
  );
  return {
    store,
    subscribe(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}`,
    testCases: [
      { input: "createValtioStore({ count: 0 }), then store.count = 5 directly", expected: "store.count reads back as 5", label: "The store object is directly mutable, not read-only" },
      { input: "a subscriber registered, then store.count = 1 directly", expected: "the subscriber is called", label: "Directly mutating a property triggers subscribers" },
      { input: "two separate mutations in a row", expected: "the subscriber is called twice, once per mutation", label: "Every mutation notifies subscribers — there's no batching in this minimal version" },
    ],
    hints: [
      "The Proxy's set trap is where both the actual write and the notification belong — that's the one place every mutation, however it's written, necessarily passes through.",
    ],
    orderIndex: 1218,
  },

  {
    slug: "create-redux-store",
    companies: ["Amazon", "Airbnb"],
    category: "react",
    title: "Minimal Redux-Like Store: createStore, useSelector, useDispatch",
    description: `The three pieces underneath every Redux app, stripped to their essentials: a store holding one piece of state, a \`dispatch\` that runs actions through a reducer to produce the next state, and subscribers notified after every change — \`useSelector\`/\`useDispatch\` are thin hooks layered on top of exactly this.

## The idea

Everything a Redux store does reduces to: hold \`state\` in closure, and on \`dispatch(action)\`, compute \`state = reducer(state, action)\`, then notify every subscriber with the new state. \`useSelector\` just reads a slice of that state; \`useDispatch\` just returns the store's \`dispatch\` function.

## Your task

Write \`createReduxStore(reducer, initialState)\`, returning \`{ getState(), dispatch(action), subscribe(listener) }\`. \`dispatch(action)\` must compute the next state as \`reducer(currentState, action)\`, store it, and notify every subscriber — then return the action, matching real Redux's \`dispatch\`.

\`\`\`js
const counterReducer = (state, action) => (action.type === "increment" ? state + 1 : state);
const store = createReduxStore(counterReducer, 0);
store.subscribe((state) => console.log("now:", state));
store.dispatch({ type: "increment" }); // logs "now: 1"
store.dispatch({ type: "increment" }); // logs "now: 2"
store.getState(); // 2
\`\`\``,
    difficulty: "hard",
    starterCode: `function createReduxStore(reducer, initialState) {
}`,
    solutionCode: `function createReduxStore(reducer, initialState) {
  let state = initialState;
  const listeners = new Set();
  return {
    getState() {
      return state;
    },
    dispatch(action) {
      state = reducer(state, action);
      listeners.forEach((listener) => listener(state));
      return action;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}`,
    testCases: [
      { input: "a counter reducer, dispatch({ type: 'increment' }) twice", expected: "getState() is 2", label: "dispatch runs the reducer and stores the resulting state" },
      { input: "a subscriber registered, then a dispatch()", expected: "the subscriber is called with the new state", label: "Subscribers are notified after every dispatch" },
      { input: "dispatch({ type: 'increment' })", expected: "the returned value is the action object itself", label: "dispatch returns the action, matching real Redux's dispatch signature" },
      { input: "an unsubscribed listener, then another dispatch()", expected: "that listener is not called", label: "subscribe's returned function actually detaches the listener" },
    ],
    hints: [
      "dispatch has three jobs in a fixed order: compute the next state via the reducer, store it, then notify — get that order right or subscribers will read the stale state.",
    ],
    orderIndex: 1219,
  },


  // ── react — standalone React Custom Hooks & Patterns Roadmap, Stage R7 ─────
  {
    slug: "usestate-from-scratch",
    companies: ["Meta"],
    category: "react",
    title: "Implement useState From Scratch (Simplified, No Fiber)",
    description: `The trick behind every React hook: state doesn't live on the component function at all — it lives in a slots array outside it, indexed purely by **call order** within a render. That's exactly why hooks can never be called conditionally: skip a call on one render and every slot index after it shifts, pointing state at the wrong hook.

## The idea

Keep a module-level \`slots\` array and a \`cursor\` that resets to 0 at the start of every render. Each \`useState\` call reads \`slots[cursor]\` and then increments \`cursor\` — so as long as a component calls its hooks in the same order every time, "the Nth \`useState\` call" always lands on "slot N". \`setState\` just writes that slot and re-invokes \`render\`.

## Your task

Write \`createStateRuntime()\`, returning \`{ useState, render(componentFn) }\`. \`useState(initial)\` returns \`[value, setState]\`; \`setState\` accepts either a plain value or an updater function \`(prev) => next\`, and must trigger \`render\` to be called again automatically with the same \`componentFn\`. State must persist correctly across multiple \`useState\` calls within one render (each gets its own slot, by order).

\`\`\`js
const runtime = createStateRuntime();
let setCount;
runtime.render(() => {
  const [count, setState] = runtime.useState(0);
  setCount = setState;
  console.log("rendered with count:", count);
});
// logs "rendered with count: 0"
setCount((prev) => prev + 1);
// automatically re-renders, logging "rendered with count: 1"

// two useState calls in the same render each keep their own slot, by call order:
runtime.render(() => {
  const [name] = runtime.useState("Ada");
  const [age] = runtime.useState(30);
  console.log(name, age); // "Ada" 30 — each call's value survives independently
});
\`\`\``,
    difficulty: "hard",
    starterCode: `function createStateRuntime() {
}`,
    solutionCode: `function createStateRuntime() {
  let slots = [];
  let cursor = 0;
  let currentComponent = null;
  function useState(initial) {
    const i = cursor++;
    if (!(i in slots)) slots[i] = initial;
    function setState(next) {
      slots[i] = typeof next === "function" ? next(slots[i]) : next;
      runtime.render(currentComponent);
    }
    return [slots[i], setState];
  }
  const runtime = {
    useState,
    render(componentFn) {
      currentComponent = componentFn;
      cursor = 0;
      return componentFn();
    },
  };
  return runtime;
}`,
    testCases: [
      { input: "a component with one useState(0) call, rendered, then its setState(5) called", expected: "the next render sees 5, not 0", label: "setState updates the value and triggers a fresh render" },
      { input: "setState called with an updater function (prev) => prev + 1", expected: "correctly reads the current slot value as prev, not the original initial", label: "Supports the functional-updater form of setState" },
      { input: "a component calling useState twice in the same render (e.g. for 'name' then 'age')", expected: "each call keeps its own independent value across renders", label: "Multiple useState calls in one render map to distinct, stable slots by call order" },
    ],
    hints: [
      "cursor must reset to 0 at the start of every render() call — that's what makes 'the Nth useState call' consistently land on 'the Nth slot', as long as the component always calls its hooks in the same order.",
      "Only initialize a slot the very first time it's reached (i in slots check) — re-render must never reset an existing slot back to initial.",
    ],
    orderIndex: 1220,
  },

  {
    slug: "usereducer-from-scratch",
    companies: ["Meta"],
    category: "react",
    title: "Implement useReducer From Scratch",
    description: `\`useReducer\` uses the exact same slot mechanism as \`useState\` — the only difference is that updates go through a reducer function instead of being set directly, which is why \`useState\` itself can actually be implemented as \`useReducer\` with a trivial "replace" reducer.

## The idea

Reuse the identical slots-array-plus-cursor mechanism from \`useState\`: each \`useReducer\` call claims the next slot on first render. The only change is what writes to that slot — instead of \`setState\` assigning directly, \`dispatch\` computes \`reducer(slots[i], action)\` and stores *that*, then triggers a re-render exactly like \`setState\` does.

## Your task

Write \`createReducerRuntime()\`, returning \`{ useReducer, render(componentFn) }\`. \`useReducer(reducer, initialState)\` returns \`[state, dispatch]\`; calling \`dispatch(action)\` must compute \`reducer(state, action)\`, store the result in that call's slot, and trigger a fresh render.

\`\`\`js
const runtime = createReducerRuntime();
const counterReducer = (state, action) => (action.type === "increment" ? state + 1 : state);
let dispatch;
runtime.render(() => {
  const [state, d] = runtime.useReducer(counterReducer, 0);
  dispatch = d;
  console.log("state:", state);
});
dispatch({ type: "increment" });
dispatch({ type: "increment" });
// the next render reads state: 2
\`\`\``,
    difficulty: "hard",
    starterCode: `function createReducerRuntime() {
}`,
    solutionCode: `function createReducerRuntime() {
  let slots = [];
  let cursor = 0;
  let currentComponent = null;
  function useReducer(reducer, initialState) {
    const i = cursor++;
    if (!(i in slots)) slots[i] = initialState;
    function dispatch(action) {
      slots[i] = reducer(slots[i], action);
      runtime.render(currentComponent);
    }
    return [slots[i], dispatch];
  }
  const runtime = {
    useReducer,
    render(componentFn) {
      currentComponent = componentFn;
      cursor = 0;
      return componentFn();
    },
  };
  return runtime;
}`,
    testCases: [
      { input: "a counter reducer, useReducer(reducer, 0), then dispatch({ type: 'increment' }) twice", expected: "the next render reads 2", label: "dispatch runs the reducer against the current slot value and stores the result" },
      { input: "dispatch called with an action the reducer doesn't recognize", expected: "the state is whatever the reducer itself returns for that case (e.g. unchanged, if that's how the reducer handles it)", label: "The runtime never second-guesses the reducer — it always stores exactly what reducer(state, action) returns" },
      { input: "dispatch()", expected: "automatically triggers render() again with the same componentFn", label: "Dispatch re-renders automatically, the same way setState does" },
    ],
    hints: [
      "This should reuse the identical slot-array-plus-cursor mechanism as useState — the only real difference is that dispatch computes the next value via reducer(state, action) instead of taking it directly.",
    ],
    orderIndex: 1221,
  },

  {
    slug: "usememo-usecallback-from-scratch",
    companies: ["Meta"],
    category: "react",
    title: "Implement useMemo / useCallback From Scratch",
    description: `Both hooks are the same idea: skip recomputation when nothing relevant changed. \`useCallback(fn, deps)\` is really nothing more than \`useMemo(() => fn, deps)\` — memoizing the function reference itself instead of a computed value.

## The idea

Each \`useMemo\` call claims a slot (same slots-plus-cursor mechanism as \`useState\`) holding \`{ value, deps }\`. On every render, compare the new \`deps\` against the stored ones element-by-element; only call \`factory()\` again — and overwrite the slot — if something actually differs. \`useCallback\` needs no separate logic at all: it's just \`useMemo(() => fn, deps)\`, memoizing the function reference as if it were the "value".

## Your task

Write \`createMemoRuntime()\`, returning \`{ useMemo, useCallback, render(componentFn) }\`. \`useMemo(factory, deps)\` should only call \`factory()\` again when \`deps\` has changed (element-by-element) since the last render for that slot — otherwise it returns the previously memoized value without calling \`factory\` again.

\`\`\`js
const runtime = createMemoRuntime();
let calls = 0;
function render(a, b) {
  runtime.render(() => {
    runtime.useMemo(() => { calls++; return a + b; }, [a, b]);
  });
}
render(1, 2); // calls factory — calls === 1
render(1, 2); // deps unchanged — calls stays 1, memoized value reused
render(1, 3); // a dep changed — calls factory again, calls === 2
\`\`\``,
    difficulty: "hard",
    starterCode: `function createMemoRuntime() {
}`,
    solutionCode: `function createMemoRuntime() {
  let slots = [];
  let cursor = 0;
  function depsChanged(prevDeps, nextDeps) {
    if (!prevDeps || !nextDeps) return true;
    return nextDeps.some((dep, i) => dep !== prevDeps[i]);
  }
  function useMemo(factory, deps) {
    const i = cursor++;
    const slot = slots[i];
    if (!slot || depsChanged(slot.deps, deps)) {
      slots[i] = { value: factory(), deps };
    }
    return slots[i].value;
  }
  function useCallback(fn, deps) {
    return useMemo(() => fn, deps);
  }
  return {
    useMemo,
    useCallback,
    render(componentFn) {
      cursor = 0;
      return componentFn();
    },
  };
}`,
    testCases: [
      { input: "useMemo(factory, [a, b]) called across two renders with the same [a, b] values", expected: "factory is only called once — the second render reuses the memoized value", label: "Doesn't recompute when deps are unchanged" },
      { input: "useMemo(factory, [a, b]) where one dependency changes between renders", expected: "factory is called again on that render", label: "Recomputes when any dependency actually changes" },
      { input: "useCallback(fn, deps) across two renders with unchanged deps", expected: "the exact same function reference is returned both times", label: "useCallback returns a stable reference when its deps haven't changed" },
    ],
    hints: [
      "useCallback doesn't need its own slot logic at all — it can be implemented purely as useMemo(() => fn, deps), memoizing the function itself as the 'value'.",
    ],
    orderIndex: 1222,
  },

  {
    slug: "higher-order-component-logger",
    companies: ["Meta", "Amazon"],
    category: "react",
    title: "Build a Higher-Order Component (HOC) Example",
    description: `A HOC is just a function that takes a component and returns a new one wrapping it with extra behavior — here, a component is modeled simply as a plain function of \`props\`, since the wrapping logic itself doesn't depend on JSX or actual rendering.

## Your task

Write \`withLogger(Component, log)\`, returning a new function that: calls \`log(props)\` every time it's invoked, then calls \`Component(props)\` and returns its result unchanged.

\`\`\`js
const Greeting = (props) => "Hello, " + props.name;
const LoggedGreeting = withLogger(Greeting, (props) => console.log("rendering with", props));
LoggedGreeting({ name: "Ada" }); // logs "rendering with { name: 'Ada' }", returns "Hello, Ada"
\`\`\``,
    difficulty: "medium",
    starterCode: `function withLogger(Component, log) {
}`,
    solutionCode: `function withLogger(Component, log) {
  return function LoggedComponent(props) {
    log(props);
    return Component(props);
  };
}`,
    testCases: [
      { input: "a component that returns 'Hello, ' + props.name, wrapped and called with { name: 'Ada' }", expected: "'Hello, Ada' — the same as calling the unwrapped component directly", label: "The wrapped component's output is passed through unchanged" },
      { input: "the wrapped component called with { name: 'Ada' }", expected: "log was called once with { name: 'Ada' }", label: "Every call logs the props it was invoked with" },
      { input: "the wrapped component called three times with different props", expected: "log was called three times, once per call, each with that call's props", label: "Logging happens on every invocation, not just the first" },
    ],
    hints: [
      "The returned function is the entire HOC — it needs to do exactly two things in order: log, then delegate to the original Component and return whatever it returns.",
    ],
    orderIndex: 1223,
  },

  {
    slug: "compound-component-tabs",
    companies: ["Meta", "Airbnb"],
    category: "react",
    title: "Build a Compound Component Pattern (e.g. <Tabs><Tabs.Item/></Tabs>)",
    description: `Compound components (\`<Tabs><Tabs.Item/></Tabs>\`) look like plain composition in JSX, but underneath, the parent and its children share coordinated state — each child implicitly registers itself and reads back whether it's the active one. That coordination logic is what's being tested here, independent of the JSX syntax around it.

## Your task

Write \`createTabsController()\`, returning \`{ registerTab(), selectTab(index), getActiveIndex(), isActive(id) }\`. Each call to \`registerTab()\` simulates a \`Tabs.Item\` mounting, and returns a unique, sequentially-assigned id (0, 1, 2, ...). \`isActive(id)\` tells a given tab whether it's the currently selected one.

\`\`\`js
const tabs = createTabsController();
const idA = tabs.registerTab(); // 0
const idB = tabs.registerTab(); // 1
tabs.getActiveIndex(); // 0 — the first tab is active by default
tabs.selectTab(1);
tabs.isActive(idB); // true
tabs.isActive(idA); // false
\`\`\``,
    difficulty: "medium",
    starterCode: `function createTabsController() {
}`,
    solutionCode: `function createTabsController() {
  let activeIndex = 0;
  let nextId = 0;
  return {
    registerTab() {
      return nextId++;
    },
    selectTab(index) {
      activeIndex = index;
    },
    getActiveIndex() {
      return activeIndex;
    },
    isActive(id) {
      return id === activeIndex;
    },
  };
}`,
    testCases: [
      { input: "three registerTab() calls in a row", expected: "0, 1, 2 — sequential, unique ids", label: "Each registered tab gets its own sequential id" },
      { input: "a fresh controller, before selectTab is ever called", expected: "getActiveIndex() is 0", label: "The first tab (index 0) is active by default" },
      { input: "selectTab(2), then isActive(2) and isActive(0)", expected: "true for isActive(2), false for isActive(0)", label: "isActive correctly reflects the currently selected tab, and only that one" },
    ],
    hints: [
      "registerTab and selectTab are deliberately independent — a tab's registration id and its position/index are the same numbering scheme here, so isActive can compare them directly.",
    ],
    orderIndex: 1224,
  },

  {
    slug: "error-boundary-wrapper",
    companies: ["Meta", "Amazon"],
    category: "react",
    title: "Build an Error Boundary Component",
    description: `A real Error Boundary catches render-time errors in its subtree and shows a fallback UI in their place — and crucially, it *stays* in that errored state (not retrying the crashed render on every subsequent update) until something explicitly resets it.

## Your task

Write \`createErrorBoundary(renderFn, fallbackFn)\`, returning \`{ run(props), reset() }\`. \`run(props)\` calls \`renderFn(props)\`; if it throws, \`run\` catches the error and returns \`fallbackFn(error)\` instead — and once that's happened, every subsequent \`run()\` call must keep returning the fallback (without calling \`renderFn\` again) until \`reset()\` is called.

\`\`\`js
const boundary = createErrorBoundary(
  () => { throw new Error("boom"); },
  (error) => "Something went wrong: " + error.message,
);
boundary.run(); // "Something went wrong: boom"
boundary.run(); // still the fallback — renderFn is not retried
boundary.reset();
boundary.run(); // renderFn runs again from a clean state
\`\`\``,
    difficulty: "medium",
    starterCode: `function createErrorBoundary(renderFn, fallbackFn) {
}`,
    solutionCode: `function createErrorBoundary(renderFn, fallbackFn) {
  let hasErrored = false;
  let lastError = null;
  return {
    run(props) {
      if (hasErrored) {
        return fallbackFn(lastError);
      }
      try {
        return renderFn(props);
      } catch (error) {
        hasErrored = true;
        lastError = error;
        return fallbackFn(error);
      }
    },
    reset() {
      hasErrored = false;
      lastError = null;
    },
  };
}`,
    testCases: [
      { input: "a renderFn that throws, wrapped and run() once", expected: "the fallback's output is returned instead of the error propagating", label: "Catches a thrown error and returns the fallback output" },
      { input: "run() called again after an error was already caught", expected: "still returns the fallback — renderFn is not called again", label: "Stays in the errored state on later calls, without retrying renderFn" },
      { input: "reset() called after an error, then run() again with a now-working renderFn", expected: "renderFn's normal output is returned", label: "reset() clears the errored state, allowing renderFn to run again" },
    ],
    hints: [
      "Once hasErrored is true, run() should return early with the fallback before ever touching renderFn again — the try/catch only matters on the way into the errored state, not once you're already in it.",
    ],
    orderIndex: 1225,
  },

  {
    slug: "imperative-handle-example",
    companies: ["Meta"],
    category: "react",
    title: "forwardRef + useImperativeHandle Example",
    description: `\`useImperativeHandle\` exists to *curate* what a parent can do through a ref — instead of exposing the child's entire internal DOM node or instance, it exposes exactly the methods you choose, and nothing else.

## Your task

Write \`attachImperativeHandle(ref, createHandle)\`, where \`ref\` is a plain object with a \`.current\` property (standing in for a real ref object) and \`createHandle()\` returns the curated methods object. Set \`ref.current\` to exactly what \`createHandle()\` returns.

\`\`\`js
const ref = { current: null };
const focus = () => console.log("focused");
attachImperativeHandle(ref, () => ({ focus }));
ref.current.focus === focus; // true — exactly the curated methods, nothing extra
\`\`\``,
    difficulty: "medium",
    starterCode: `function attachImperativeHandle(ref, createHandle) {
}`,
    solutionCode: `function attachImperativeHandle(ref, createHandle) {
  ref.current = createHandle();
  return ref;
}`,
    testCases: [
      { input: "a ref object and a createHandle returning { focus: fn }", expected: "ref.current.focus === fn", label: "ref.current is set to exactly the object createHandle() returned" },
      { input: "createHandle returning only { focus, scrollIntoView }", expected: "ref.current has exactly those two keys — nothing extra leaked", label: "The exposed handle is exactly what createHandle curated, not some larger internal object" },
      { input: "attachImperativeHandle's return value", expected: "the same ref object passed in", label: "Returns the ref itself, so it can be used inline" },
    ],
    hints: [
      "This one is intentionally almost too simple — the point being tested is that the handle is exactly what createHandle() returns, not a partial or augmented version of it.",
    ],
    orderIndex: 1226,
  },

  {
    slug: "list-virtualization-window-calc",
    companies: ["Meta", "Airbnb", "TikTok"],
    category: "react",
    title: "Build a Virtualization Hook for a Long List (Windowing)",
    description: `The math underneath every virtualized list (react-window, react-virtual): given the current scroll position and item height, only a small contiguous slice of items is actually visible — render just that slice (plus a little overscan buffer), and use a spacer offset to keep the scrollbar's total size correct.

## Your task

Write \`getVisibleRange({ scrollTop, containerHeight, itemHeight, totalItems, overscan = 0 })\`, returning \`{ startIndex, endIndex, offsetY }\`. \`offsetY\` is how far down (in pixels) the first rendered item should be positioned, so the visible slice lines up correctly within the full scrollable area.

\`\`\`js
getVisibleRange({ scrollTop: 0, containerHeight: 300, itemHeight: 50, totalItems: 100 });
// { startIndex: 0, endIndex: 6, offsetY: 0 }

getVisibleRange({ scrollTop: 500, containerHeight: 300, itemHeight: 50, totalItems: 100, overscan: 2 });
// { startIndex: 8, endIndex: 18, offsetY: 400 }
\`\`\``,
    difficulty: "hard",
    starterCode: `function getVisibleRange({ scrollTop, containerHeight, itemHeight, totalItems, overscan = 0 }) {
}`,
    solutionCode: `function getVisibleRange({ scrollTop, containerHeight, itemHeight, totalItems, overscan = 0 }) {
  const rawStart = Math.floor(scrollTop / itemHeight);
  const rawEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);
  const startIndex = Math.max(0, rawStart - overscan);
  const endIndex = Math.min(totalItems - 1, rawEnd + overscan);
  const offsetY = startIndex * itemHeight;
  return { startIndex, endIndex, offsetY };
}`,
    testCases: [
      { input: "scrollTop: 0, containerHeight: 300, itemHeight: 50, totalItems: 100, overscan: 0", expected: "startIndex: 0, endIndex: 6", label: "At the top, the visible range starts at index 0" },
      { input: "scrollTop: 500, containerHeight: 300, itemHeight: 50, totalItems: 100, overscan: 0", expected: "startIndex: 10, offsetY: 500", label: "offsetY matches startIndex * itemHeight, positioning the rendered slice correctly" },
      { input: "scrollTop: 500, containerHeight: 300, itemHeight: 50, totalItems: 100, overscan: 2", expected: "startIndex: 8, endIndex: 18 — 2 extra items on each side of the strictly-visible range", label: "overscan pads the range by the given number of items on each side" },
      { input: "scrollTop near the very end of a totalItems: 100 list", expected: "endIndex never exceeds 99", label: "endIndex is clamped to the last valid item index, even with a large overscan" },
    ],
    hints: [
      "Compute the strictly-visible range first (rawStart/rawEnd from scrollTop and containerHeight alone), then apply overscan and clamp to [0, totalItems - 1] as a separate step afterward.",
    ],
    orderIndex: 1227,
  }
];
