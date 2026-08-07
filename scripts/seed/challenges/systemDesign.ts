import type { ChallengeSeed } from "../types";

export const SYSTEM_DESIGN_CHALLENGES: ChallengeSeed[] = [

  // ── system-design — standalone Frontend System Design Roadmap, Stage 1 ─────
  {
    slug: "nested-checkboxes-tree-state",
    companies: ["Meta", "Amazon", "Atlassian"],
    category: "system-design",
    title: "Nested Checkboxes (Tree State, Indeterminate Propagation)",
    description: `**RADIO framing:** the interesting part of this widget isn't the checkbox markup — it's the state propagation rule: checking a parent must check every descendant, and a parent whose children are a *mix* of checked/unchecked must show as "indeterminate," not fully checked or unchecked. Getting this right for an arbitrarily deep tree (Jira/file-explorer-style) is the actual system design question; a flat two-level version is a much easier (and much less commonly asked) variant.

## Your task

Write \`toggleNode(root, targetId)\`, where \`root\` is a tree of \`{ id, checked, indeterminate, children }\` nodes. Toggling a node must: flip that node and *every descendant* to the new checked state (clearing indeterminate on all of them), then recompute \`checked\`/\`indeterminate\` on every ancestor based on its children's states. Return a new tree — don't mutate the input.

\`\`\`js
const root = {
  id: "root", checked: false, indeterminate: false,
  children: [
    { id: "a", checked: false, indeterminate: false, children: [] },
    { id: "b", checked: false, indeterminate: false, children: [] },
  ],
}
const t1 = toggleNode(root, "a")
// t1.children[0].checked === true, t1.indeterminate === true
const t2 = toggleNode(t1, "b")
// t2.checked === true, t2.indeterminate === false
\`\`\``,
    difficulty: "hard",
    starterCode: `function toggleNode(root, targetId) {
}`,
    solutionCode: `function toggleNode(root, targetId) {
  function setAll(node, checked) {
    return {
      ...node,
      checked,
      indeterminate: false,
      children: node.children.map((c) => setAll(c, checked)),
    };
  }
  function update(node) {
    if (node.id === targetId) {
      return setAll(node, !node.checked);
    }
    if (!node.children.length) return node;
    const newChildren = node.children.map(update);
    const allChecked = newChildren.every((c) => c.checked && !c.indeterminate);
    const noneChecked = newChildren.every((c) => !c.checked && !c.indeterminate);
    return {
      ...node,
      children: newChildren,
      checked: allChecked,
      indeterminate: !allChecked && !noneChecked,
    };
  }
  return update(root);
}`,
    testCases: [
      { input: "a parent with two unchecked children, toggle one child", expected: "that child is checked, the parent becomes indeterminate", label: "A partially-checked set of children makes the parent indeterminate" },
      { input: "the same tree, then toggle the other child too", expected: "the parent becomes fully checked, no longer indeterminate", label: "Checking every child makes the parent fully checked" },
      { input: "an unchecked parent with two unchecked children, toggle the parent", expected: "the parent and both children all become checked", label: "Toggling a parent propagates the new state to every descendant" },
    ],
    hints: [
      "Two independent passes: toggling the target node cascades DOWN to every descendant; recomputing every ancestor's state is a separate cascade UP based on its children's already-updated states.",
    ],
    orderIndex: 1333,
  },

  {
    slug: "star-rating-widget",
    companies: [],
    category: "system-design",
    title: "Star Rating Widget",
    description: `**RADIO framing:** a classic warm-up, but it hides a real state-modeling question: the stars shown while hovering are a *preview*, separate from the committed value — hovering must never overwrite the actual rating until the user clicks.

## Your task

Write \`createStarRating(max, initial)\`, returning \`{ getDisplayValue(), hover(n), clearHover(), select(n), getValue() }\`. \`getDisplayValue()\` reflects the hover preview when one is active, falling back to the real committed value otherwise; \`select(n)\` commits and clamps to \`[0, max]\`.

\`\`\`js
const rating = createStarRating(5, 2)
rating.hover(4)
rating.getDisplayValue() // 4 (preview only)
rating.getValue() // 2 (still uncommitted)
rating.clearHover()
rating.getDisplayValue() // 2
rating.select(7)
rating.getValue() // 5 (clamped to max)
\`\`\``,
    difficulty: "easy",
    isPremium: true,
    starterCode: `function createStarRating(max, initial) {
}`,
    solutionCode: `function createStarRating(max, initial) {
  let value = initial;
  let hovered = null;
  return {
    getDisplayValue() {
      return hovered !== null ? hovered : value;
    },
    hover(n) {
      hovered = n;
    },
    clearHover() {
      hovered = null;
    },
    select(n) {
      value = Math.max(0, Math.min(max, n));
      hovered = null;
    },
    getValue() {
      return value;
    },
  };
}`,
    testCases: [
      { input: "createStarRating(5, 2), hover(4)", expected: "getDisplayValue() is 4, but getValue() is still 2", label: "Hovering previews without committing the real value" },
      { input: "the same widget, clearHover()", expected: "getDisplayValue() reverts to 2", label: "Clearing the hover falls back to the committed value" },
      { input: "select(7) on a max-5 widget", expected: "getValue() clamps to 5", label: "select() clamps to the valid [0, max] range" },
    ],
    hints: [
      "hovered and value are genuinely two separate pieces of state — resist the urge to store the hover preview by temporarily overwriting value.",
    ],
    orderIndex: 1334,
  },

  {
    slug: "tic-tac-toe-game-logic",
    companies: ["Amazon"],
    category: "system-design",
    title: "Tic-Tac-Toe Game Logic",
    description: `**RADIO framing:** the UI is trivial; the actual design question is the state machine — whose turn it is, which moves are legal, and win detection across all 8 possible lines (3 rows, 3 columns, 2 diagonals).

## Your task

Write \`createTicTacToe()\`, returning \`{ play(index), getBoard(), getWinner(), getTurn() }\`. \`play\` should reject moves on an already-occupied cell or after the game has a winner, and switch turns after every legal move.

\`\`\`js
const game = createTicTacToe()
game.play(0) // true — board[0] = "X", turn becomes "O"
game.play(0) // false — cell 0 is already occupied
game.play(4); game.play(1); game.play(5); game.play(2)
// X has now played the full top row: 0, 1, 2
game.getWinner() // "X"
\`\`\``,
    difficulty: "medium",
    isPremium: true,
    starterCode: `function createTicTacToe() {
}`,
    solutionCode: `function createTicTacToe() {
  let board = Array(9).fill(null);
  let turn = "X";
  let winner = null;
  const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  function checkWinner() {
    for (const [a, b, c] of LINES) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    return null;
  }
  return {
    play(index) {
      if (board[index] || winner) return false;
      board[index] = turn;
      winner = checkWinner();
      turn = turn === "X" ? "O" : "X";
      return true;
    },
    getBoard() {
      return board;
    },
    getWinner() {
      return winner;
    },
    getTurn() {
      return turn;
    },
  };
}`,
    testCases: [
      { input: "play(0) on a fresh game", expected: "board[0] is 'X', turn switches to 'O'", label: "A legal move updates the board and switches turns" },
      { input: "play(0) twice in a row (same cell)", expected: "the second call returns false and doesn't change the board", label: "Rejects a move on an already-occupied cell" },
      { input: "X plays a full winning line (0, 1, 2)", expected: "getWinner() returns 'X'", label: "Detects a winning line across the board" },
    ],
    hints: [
      "checkWinner() only needs to run after every move, checking all 8 lines — there's no need to track win state incrementally.",
    ],
    orderIndex: 1335,
  },

  {
    slug: "toast-notification-queue",
    companies: ["Meta", "Amazon", "Shopify"],
    category: "system-design",
    title: "Toast/Notification System (Queueing, Auto-Dismiss, Stacking)",
    description: `**RADIO framing:** the real design constraint is a max-visible cap — showing 15 toasts stacked on screen at once is a real bug, not a feature. Beyond that cap, new toasts queue and only appear once an earlier one is dismissed (by the user or by its own timer).

## Your task

Write \`createToastQueue(maxVisible)\`, returning \`{ show(message, durationMs), dismiss(id), getVisible() }\`. Beyond \`maxVisible\` visible toasts, new ones should queue; dismissing (manually or via \`durationMs\` auto-dismiss) should promote the next queued toast into view.

\`\`\`js
const toasts = createToastQueue(2)
toasts.show("Saved", 5000) // id 1, visible
toasts.show("Uploaded", 5000) // id 2, visible
toasts.show("Synced", 5000) // id 3, queued — 2 are already visible
toasts.dismiss(1)
toasts.getVisible() // [{ id: 2, ... }, { id: 3, ... }] — id 3 gets promoted
\`\`\``,
    difficulty: "medium",
    starterCode: `function createToastQueue(maxVisible) {
}`,
    solutionCode: `function createToastQueue(maxVisible) {
  let visible = [];
  let queue = [];
  let nextId = 1;
  function show(message, durationMs) {
    const id = nextId++;
    const toast = { id, message };
    if (visible.length < maxVisible) {
      visible.push(toast);
    } else {
      queue.push(toast);
    }
    setTimeout(() => dismiss(id), durationMs);
    return id;
  }
  function dismiss(id) {
    const wasVisible = visible.some((t) => t.id === id);
    visible = visible.filter((t) => t.id !== id);
    queue = queue.filter((t) => t.id !== id);
    if (wasVisible && queue.length > 0 && visible.length < maxVisible) {
      visible.push(queue.shift());
    }
  }
  return { show, dismiss, getVisible: () => visible };
}`,
    testCases: [
      { input: "createToastQueue(2), show() called 3 times with a long duration", expected: "only 2 are visible, the 3rd is queued", label: "Caps visible toasts at maxVisible, queueing the rest" },
      { input: "the same queue, then dismiss() the first visible toast", expected: "the queued 3rd toast becomes visible", label: "Dismissing promotes the next queued toast into view" },
      { input: "show(message, 30) with a short duration, waited past it", expected: "the toast auto-dismisses on its own", label: "Auto-dismisses after the given duration without manual dismiss()" },
    ],
    hints: [
      "dismiss() needs to handle both a manually-dismissed toast and a toast that was still sitting in the queue (never shown) — only promoting a queued toast when a VISIBLE slot actually opened up.",
    ],
    orderIndex: 1336,
  },


  // ── system-design — standalone Frontend System Design Roadmap, Stage 2 ─────
  {
    slug: "poll-widget-vote-tally",
    companies: ["Meta", "Twitter"],
    category: "system-design",
    title: "Poll Widget (Voting UI, Result Reveal)",
    description: `**RADIO framing:** the data-model question here is enforcing one vote per user while computing live percentages — the UI reveal is easy once the tallying logic is right.

## Your task

Write \`createPoll(options)\`, returning \`{ vote(userId, option), getResults() }\`. Each user may vote once; \`getResults()\` returns each option's percentage of the total votes, rounded to the nearest whole number.

\`\`\`js
const poll = createPoll(["a", "b"])
poll.vote("user1", "a")
poll.getResults() // { a: 100, b: 0 }
poll.vote("user1", "b") // false — user1 already voted
poll.vote("user2", "a")
poll.vote("user3", "a")
poll.vote("user4", "b")
poll.getResults() // { a: 75, b: 25 }
\`\`\``,
    difficulty: "medium",
    starterCode: `function createPoll(options) {
}`,
    solutionCode: `function createPoll(options) {
  const votes = Object.fromEntries(options.map((o) => [o, 0]));
  const votedUsers = new Set();
  function vote(userId, option) {
    if (votedUsers.has(userId)) return false;
    votedUsers.add(userId);
    votes[option]++;
    return true;
  }
  function getResults() {
    const total = Object.values(votes).reduce((a, b) => a + b, 0);
    return Object.fromEntries(
      options.map((o) => [o, total === 0 ? 0 : Math.round((votes[o] / total) * 100)]),
    );
  }
  return { vote, getResults };
}`,
    testCases: [
      { input: "createPoll(['a', 'b']), vote('user1', 'a')", expected: "getResults() shows { a: 100, b: 0 }", label: "A single vote is reflected correctly in the percentages" },
      { input: "the same user voting again", expected: "vote() returns false, the tally doesn't change", label: "Rejects a duplicate vote from the same user" },
      { input: "3 votes for 'a', 1 vote for 'b'", expected: "{ a: 75, b: 25 }", label: "Computes percentages correctly across multiple voters" },
    ],
    hints: [
      "A Set of userIds who've already voted is the whole duplicate-vote guard — no need to track WHAT they voted for to enforce the one-vote rule.",
    ],
    orderIndex: 1337,
  },

  {
    slug: "slider-value-from-position",
    companies: ["Meta", "Amazon", "Airbnb"],
    category: "system-design",
    title: "Slider Component (Pointer Position → Value)",
    description: `**RADIO framing:** the accessibility and gesture-handling parts of a slider are UI plumbing; the actual algorithm is converting a raw pointer X-coordinate into a clamped, step-snapped value within the slider's range — get this wrong and every other part of the widget is wrong too.

## Your task

Write \`getSliderValueFromPosition({ pointerX, trackLeft, trackWidth, min, max, step })\`, returning the value the slider should show for that pointer position — clamped to \`[min, max]\` and snapped to the nearest \`step\`.

\`\`\`js
getSliderValueFromPosition({ pointerX: 0, trackLeft: 0, trackWidth: 200, min: 0, max: 100, step: 10 })
// 0 — pointer at the track's start
getSliderValueFromPosition({ pointerX: 260, trackLeft: 0, trackWidth: 200, min: 0, max: 100, step: 10 })
// 100 — clamped, even though the pointer is past the track's end
\`\`\``,
    difficulty: "medium",
    starterCode: `function getSliderValueFromPosition({ pointerX, trackLeft, trackWidth, min, max, step }) {
}`,
    solutionCode: `function getSliderValueFromPosition({ pointerX, trackLeft, trackWidth, min, max, step }) {
  const ratio = Math.min(1, Math.max(0, (pointerX - trackLeft) / trackWidth));
  const raw = min + ratio * (max - min);
  const stepped = Math.round(raw / step) * step;
  return Math.min(max, Math.max(min, stepped));
}`,
    testCases: [
      { input: "pointerX at the very start of the track", expected: "min", label: "A pointer at the track's start resolves to the minimum value" },
      { input: "pointerX at the very end of the track", expected: "max", label: "A pointer at the track's end resolves to the maximum value" },
      { input: "pointerX past the end of the track (dragged beyond the edge)", expected: "still clamps to max, doesn't overshoot", label: "Clamps pointer positions outside the track's bounds" },
      { input: "a pointer position landing between two step values", expected: "snaps to the nearest step", label: "Snaps the raw value to the nearest step, not a raw fractional value" },
    ],
    hints: [
      "Work in three clean stages: normalize the pointer position to a 0–1 ratio first, THEN map that ratio onto [min, max], THEN snap to step — trying to do all three in one expression is where the bugs hide.",
    ],
    orderIndex: 1338,
  },

  {
    slug: "carousel-autoplay-index",
    companies: ["Amazon", "Airbnb", "Netflix"],
    category: "system-design",
    title: "Carousel Widget (Autoplay, Index Wrapping)",
    description: `**RADIO framing:** touch gestures and transition animations are the visible surface; the design question underneath is index math (wrapping cleanly at both ends) plus pausing autoplay the instant a user interacts, so the carousel never fights the user's own navigation.

## Your task

Write \`createCarousel(slideCount, intervalMs)\`, returning \`{ getIndex(), advance(), prev(), pause(), resume(), stop() }\`. \`advance\`/\`prev\` must wrap around at both ends; autoplay must stop advancing while paused, and resume from wherever it left off.

\`\`\`js
const carousel = createCarousel(3, 3000)
carousel.advance(); carousel.advance()
carousel.getIndex() // 2
carousel.advance()
carousel.getIndex() // 0 — wraps back around
carousel.prev()
carousel.getIndex() // 2 — prev() wraps the other way too, back to the last slide
carousel.pause() // autoplay's own interval stops advancing the index
\`\`\``,
    difficulty: "medium",
    starterCode: `function createCarousel(slideCount, intervalMs) {
}`,
    solutionCode: `function createCarousel(slideCount, intervalMs) {
  let index = 0;
  let paused = false;
  const timer = setInterval(() => {
    if (!paused) advance();
  }, intervalMs);
  function advance() {
    index = (index + 1) % slideCount;
  }
  function prev() {
    index = (index - 1 + slideCount) % slideCount;
  }
  function pause() {
    paused = true;
  }
  function resume() {
    paused = false;
  }
  function stop() {
    clearInterval(timer);
  }
  return { getIndex: () => index, advance, prev, pause, resume, stop };
}`,
    testCases: [
      { input: "createCarousel(3, ...), advance() from the last slide (index 2)", expected: "wraps back to index 0", label: "advance() wraps around at the end" },
      { input: "createCarousel(3, ...), prev() from the first slide (index 0)", expected: "wraps to index 2, the last slide", label: "prev() wraps around at the start" },
      { input: "pause() called, then waited past several autoplay intervals", expected: "the index doesn't change while paused", label: "pause() actually stops autoplay from advancing" },
    ],
    hints: [
      "The modulo trick `(index - 1 + slideCount) % slideCount` (not just `(index - 1) % slideCount`) is what makes prev() wrap correctly — JavaScript's % can return a negative result for negative operands, which a bare subtraction would trigger at index 0.",
    ],
    orderIndex: 1339,
  },

  {
    slug: "command-palette-fuzzy-match",
    companies: ["Linear", "Notion", "Vercel"],
    category: "system-design",
    title: "Command Palette (Fuzzy Search + Ranking)",
    description: `**RADIO framing:** the keyboard-navigation overlay is UI wiring; the real algorithmic core — and the part that makes a command palette feel "smart" — is fuzzy matching: a query's characters just need to appear *in order* somewhere in the target, and matches with consecutive characters should rank higher than scattered ones.

## Your task

Write \`fuzzySearch(query, items)\`, returning \`items\` filtered to only those containing every character of \`query\` in order, sorted with the best matches (more consecutive-character runs) first.

\`\`\`js
fuzzySearch("gp", ["Go to Profile", "Settings"]) // ["Go to Profile"]
fuzzySearch("xyz", ["Go to Profile"]) // [] — not all characters appear in order
fuzzySearch("set", ["Settings", "Reset Everything"])
// ["Settings", "Reset Everything"] — the consecutive match ranks first
\`\`\``,
    difficulty: "medium",
    starterCode: `function fuzzySearch(query, items) {
}`,
    solutionCode: `function fuzzyScore(query, target) {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  let score = 0;
  let lastMatchIndex = -1;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += lastMatchIndex === ti - 1 ? 2 : 1;
      lastMatchIndex = ti;
      qi++;
    }
  }
  return qi === q.length ? score : -1;
}

function fuzzySearch(query, items) {
  return items
    .map((item) => ({ item, score: fuzzyScore(query, item) }))
    .filter((r) => r.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.item);
}`,
    testCases: [
      { input: "fuzzySearch('gp', ['Go to Profile', 'Settings'])", expected: "['Go to Profile']", label: "Matches a subsequence in order, even non-consecutively" },
      { input: "fuzzySearch('xyz', ['Go to Profile'])", expected: "[]", label: "Excludes items where the query's characters don't all appear in order" },
      { input: "fuzzySearch('set', ['Settings', 'Reset Everything'])", expected: "['Settings', 'Reset Everything'], in that order", label: "Ranks a consecutive-character match higher than a scattered one" },
    ],
    hints: [
      "The score bonus for consecutive matches (lastMatchIndex === ti - 1) is what separates real fuzzy ranking from a plain 'does it match at all' filter — without it, every match would tie.",
    ],
    orderIndex: 1340,
  },


  // ── system-design — standalone Frontend System Design Roadmap, Stage 3 ─────
  {
    slug: "typeahead-debounced-search",
    companies: ["Google", "Meta", "Airbnb", "Uber"],
    category: "system-design",
    title: "Typeahead Widget (the #1 Frontend System Design Question)",
    description: `**RADIO framing:** the single most commonly asked frontend system design question industry-wide. The UI is a text box and a dropdown — the actual design problem is entirely about state during network requests: debouncing keystrokes so you're not firing a request per character, and handling **race conditions**, where a slow early request resolves *after* a faster later one and must not be allowed to overwrite its results.

## Your task

Write \`createTypeahead(fetcher, debounceMs)\`, returning \`{ search(query, onResults) }\`. Rapid \`search\` calls within \`debounceMs\` of each other should coalesce into a single \`fetcher\` call; if an earlier request's response arrives after a later request has already started, it must be discarded, not passed to \`onResults\`.

\`\`\`js
const typeahead = createTypeahead(fetchSuggestions, 300)
typeahead.search("a", onResults)
typeahead.search("ab", onResults)
typeahead.search("abc", onResults)
// fetchSuggestions is called only once, 300ms later, with "abc"
// if a stale response for an earlier query resolves late, onResults never sees it
\`\`\``,
    difficulty: "hard",
    starterCode: `function createTypeahead(fetcher, debounceMs) {
}`,
    solutionCode: `function createTypeahead(fetcher, debounceMs) {
  let timer = null;
  let requestId = 0;
  function search(query, onResults) {
    if (timer) clearTimeout(timer);
    const thisRequestId = ++requestId;
    timer = setTimeout(async () => {
      const results = await fetcher(query);
      if (thisRequestId === requestId) {
        onResults(results);
      }
    }, debounceMs);
  }
  return { search };
}`,
    testCases: [
      { input: "search() called 3 times rapidly, all within debounceMs", expected: "fetcher is only called once, with the last query", label: "Coalesces rapid calls into a single debounced fetch" },
      { input: "a slow request for 'ab' followed by a fast request for 'abc', where 'ab' resolves after 'abc'", expected: "onResults only fires with 'abc's results — 'ab's stale response is discarded", label: "Discards a stale response that resolves out of order" },
    ],
    hints: [
      "A monotonically increasing request counter, captured at the moment each debounced call actually fires, is the whole race-condition fix — compare it against the *current* counter when the response comes back, not when the request was sent.",
    ],
    orderIndex: 1341,
  },

  {
    slug: "infinite-scroll-pagination-trigger",
    companies: ["Meta", "Pinterest", "Twitter", "TikTok"],
    category: "system-design",
    title: "Infinite Scroller (Pagination Trigger Logic)",
    description: `**RADIO framing:** the scroll-position math is what \`IntersectionObserver\` handles for you — the actual design problem is the state machine wrapped around it: never trigger a second fetch while one's already in flight, and stop trying entirely once the server says there's no more data. To keep this testable without a real layout engine, the observer is injected — exactly how you'd mock it in a real test suite.

## Your task

Write \`createInfiniteScroll(loadPage, createObserver)\`, returning \`{ isLoading(), isDone(), getPage() }\`. \`createObserver(onIntersect)\` is called once and is expected to invoke \`onIntersect(isIntersecting)\` whenever the sentinel's visibility changes; \`loadPage(pageNumber)\` resolves to a boolean — whether there's more data after this page.

\`\`\`js
const scroller = createInfiniteScroll(loadPage, createObserver)
// sentinel becomes intersecting -> loadPage(0) fires, scroller.isLoading() is true
// a second intersection while page 0 is still loading is ignored
// once loadPage resolves false (no more data):
scroller.isDone() // true — further intersections no longer trigger loadPage
\`\`\``,
    difficulty: "medium",
    starterCode: `function createInfiniteScroll(loadPage, createObserver) {
}`,
    solutionCode: `function createInfiniteScroll(loadPage, createObserver) {
  let page = 0;
  let loading = false;
  let done = false;
  createObserver(async (isIntersecting) => {
    if (!isIntersecting || loading || done) return;
    loading = true;
    const hasMore = await loadPage(page);
    page++;
    loading = false;
    if (!hasMore) done = true;
  });
  return { isLoading: () => loading, isDone: () => done, getPage: () => page };
}`,
    testCases: [
      { input: "the sentinel becomes intersecting", expected: "loadPage(0) is called", label: "Triggers a page load when the sentinel becomes visible" },
      { input: "the sentinel intersects again while a page is still loading", expected: "loadPage is not called a second time until the first resolves", label: "Never triggers a second fetch while one is already in flight" },
      { input: "loadPage resolves false (no more data)", expected: "isDone() becomes true, and further intersections don't trigger more loads", label: "Stops trying once the server reports no more pages" },
    ],
    hints: [
      "The loading flag has to be set BEFORE awaiting loadPage, not after — otherwise a second intersection callback firing while the first await is still pending would slip through the guard.",
    ],
    orderIndex: 1342,
  },

  {
    slug: "api-progress-bar-aggregation",
    companies: ["Amazon", "Dropbox", "Google"],
    category: "system-design",
    title: "API Progress Bar (Aggregating Multiple In-Flight Requests)",
    description: `**RADIO framing:** a single upload's progress bar is trivial; the real design question is a *global* progress indicator tracking several concurrent uploads at once, where the overall percentage has to correctly reflect a mix of nearly-done and just-started requests — not just average the percentages naively.

## Your task

Write \`createProgressTracker()\`, returning \`{ start(id, totalBytes), update(id, loadedBytes), finish(id), getOverallPercent() }\`. The overall percentage should be *bytes loaded across all active requests* divided by *total bytes across all active requests* — not a simple average of each request's own percentage.

\`\`\`js
const tracker = createProgressTracker()
tracker.start("upload-a", 100)
tracker.update("upload-a", 100) // fully loaded
tracker.start("upload-b", 100) // just started, 0 bytes loaded
tracker.getOverallPercent() // 50 — weighted by bytes, not averaged per request
tracker.finish("upload-a"); tracker.finish("upload-b")
tracker.getOverallPercent() // 100 — nothing in flight, not 0 or NaN
\`\`\``,
    difficulty: "medium",
    starterCode: `function createProgressTracker() {
}`,
    solutionCode: `function createProgressTracker() {
  const requests = new Map();
  function start(id, totalBytes) {
    requests.set(id, { loaded: 0, total: totalBytes });
  }
  function update(id, loaded) {
    const r = requests.get(id);
    if (r) r.loaded = loaded;
  }
  function finish(id) {
    requests.delete(id);
  }
  function getOverallPercent() {
    if (requests.size === 0) return 100;
    let loaded = 0;
    let total = 0;
    requests.forEach((r) => {
      loaded += r.loaded;
      total += r.total;
    });
    return total === 0 ? 0 : Math.round((loaded / total) * 100);
  }
  return { start, update, finish, getOverallPercent };
}`,
    testCases: [
      { input: "one request, 50 of 100 bytes loaded", expected: "getOverallPercent() is 50", label: "Computes the correct percentage for a single request" },
      { input: "two requests: 100 of 100 bytes, and 0 of 100 bytes", expected: "getOverallPercent() is 50 — weighted by total bytes, not averaged by request", label: "Aggregates by total bytes across requests, not a naive per-request average" },
      { input: "finish() called on a completed request, leaving no active requests", expected: "getOverallPercent() returns 100", label: "An empty tracker (nothing in flight) reports 100%, not 0% or NaN" },
    ],
    hints: [
      "Summing loaded and total bytes separately across every active request — then dividing those two sums — is what correctly weights a huge file's progress more heavily than a tiny one, instead of treating every request as equally important.",
    ],
    orderIndex: 1343,
  },

  {
    slug: "chunked-file-upload-retry",
    companies: ["Dropbox", "Google", "Amazon"],
    category: "system-design",
    title: "Chunked File Upload (Progress + Retry)",
    description: `**RADIO framing:** uploading a large file as one request is fragile — a single dropped connection loses everything. The real design splits it into chunks uploaded sequentially, retrying a failed chunk in place (not restarting the whole file) up to a limit before giving up entirely.

## Your task

Write \`createChunkedUploader(uploadChunk, maxRetries)\`, returning \`{ uploadFile(chunks) }\`. Each chunk should retry up to \`maxRetries\` times on failure before the whole upload rejects; a chunk that eventually succeeds (within the retry budget) should let the upload continue normally to the next chunk.

\`\`\`js
const uploader = createChunkedUploader(uploadChunk, 3)
await uploader.uploadFile([chunk0, chunk1, chunk2])
// chunk1 fails twice, then succeeds on its 3rd attempt — uploadFile still resolves true
// a chunk that keeps failing past maxRetries makes uploadFile() reject entirely
\`\`\``,
    difficulty: "medium",
    starterCode: `function createChunkedUploader(uploadChunk, maxRetries) {
}`,
    solutionCode: `function createChunkedUploader(uploadChunk, maxRetries) {
  async function uploadFile(chunks) {
    for (let i = 0; i < chunks.length; i++) {
      let attempts = 0;
      let success = false;
      while (attempts <= maxRetries && !success) {
        try {
          await uploadChunk(chunks[i], i);
          success = true;
        } catch (e) {
          attempts++;
          if (attempts > maxRetries) throw new Error("Upload failed after retries");
        }
      }
    }
    return true;
  }
  return { uploadFile };
}`,
    testCases: [
      { input: "a chunk that fails twice, then succeeds on its 3rd attempt (within maxRetries: 3)", expected: "the upload completes successfully overall", label: "Recovers from transient failures within the retry budget" },
      { input: "a chunk that always fails, with maxRetries: 2", expected: "uploadFile rejects after exhausting the retry budget", label: "Gives up after exceeding the retry limit, rather than retrying forever" },
      { input: "3 chunks, all succeeding on the first try", expected: "uploadChunk is called with each chunk in order (0, 1, 2)", label: "Uploads chunks sequentially in the correct order" },
    ],
    hints: [
      "A failed chunk retries in place — the loop over chunks never advances to chunk i+1 until chunk i has either succeeded or exhausted its retries and thrown.",
    ],
    orderIndex: 1344,
  },


  // ── system-design — standalone Frontend System Design Roadmap, Stage 4 ─────
  {
    slug: "analytics-event-batcher",
    companies: ["Google", "Amazon", "Shopify"],
    category: "system-design",
    title: "Analytics Script (Event Batching)",
    description: `**RADIO framing:** sending one network request per tracked event would drown a page in requests. A real analytics script batches events and flushes on whichever comes first: the batch hits a size limit, or a timer elapses — the same dual-trigger pattern behind \`navigator.sendBeacon\`-based analytics libraries.

## Your task

Write \`createEventBatcher(flushFn, { maxBatchSize, flushIntervalMs })\`, returning \`{ track(event), flush(), stop() }\`. Flush automatically once the batch reaches \`maxBatchSize\`, or every \`flushIntervalMs\` regardless of size; \`stop()\` should flush whatever's left before stopping.

\`\`\`js
const batcher = createEventBatcher(sendToServer, { maxBatchSize: 3, flushIntervalMs: 5000 })
batcher.track({ name: "click" })
batcher.track({ name: "scroll" })
batcher.track({ name: "click" }) // the 3rd event hits maxBatchSize -> flushes immediately
// sendToServer is called once, with all 3 events
batcher.stop() // flushes any remaining events before stopping the timer
\`\`\``,
    difficulty: "medium",
    starterCode: `function createEventBatcher(flushFn, { maxBatchSize, flushIntervalMs }) {
}`,
    solutionCode: `function createEventBatcher(flushFn, { maxBatchSize, flushIntervalMs }) {
  let batch = [];
  const timer = setInterval(flush, flushIntervalMs);
  function track(event) {
    batch.push(event);
    if (batch.length >= maxBatchSize) flush();
  }
  function flush() {
    if (batch.length === 0) return;
    flushFn(batch);
    batch = [];
  }
  function stop() {
    clearInterval(timer);
    flush();
  }
  return { track, flush, stop };
}`,
    testCases: [
      { input: "maxBatchSize: 3, track() called 3 times", expected: "flushFn is called once, with all 3 events", label: "Flushes automatically once the batch reaches maxBatchSize" },
      { input: "maxBatchSize: 10, track() called twice, then waited past flushIntervalMs", expected: "flushFn is called with those 2 events, even though the batch never filled", label: "Flushes on the interval even when the batch isn't full" },
      { input: "track() called once, then stop() called immediately", expected: "flushFn is called with that 1 event before stopping", label: "stop() flushes whatever's left instead of dropping it" },
    ],
    hints: [
      "flush() should be a genuine no-op (not call flushFn at all) when the batch is empty — otherwise the interval timer would fire flushFn with an empty array on every tick, even when nothing happened.",
    ],
    orderIndex: 1345,
  },

  {
    slug: "qrcode-login-polling",
    companies: ["Google", "Meta"],
    category: "system-design",
    title: "QR-Code Login System (Polling State Machine)",
    description: `**RADIO framing:** scanning a QR code on a phone to log in a desktop session needs the desktop tab to somehow find out it happened — polling a status endpoint is the simplest reliable mechanism. The state machine has exactly three end states, and getting the timeout right matters: an abandoned login flow shouldn't poll forever.

## Your task

Write \`createQrLoginPoller(checkStatus, { intervalMs, timeoutMs })\`, returning \`{ getStatus(), stop() }\`. Status starts \`"pending"\`, becomes \`"approved"\` the moment \`checkStatus()\` resolves \`"approved"\`, and becomes \`"expired"\` if that never happens before \`timeoutMs\` elapses — stopping the polling either way once resolved.

\`\`\`js
const poller = createQrLoginPoller(checkStatus, { intervalMs: 2000, timeoutMs: 60000 })
poller.getStatus() // "pending"
// checkStatus() resolves "approved" on a later poll:
poller.getStatus() // "approved" — polling has already stopped
// or, if checkStatus() never resolves "approved" before timeoutMs elapses:
poller.getStatus() // "expired"
\`\`\``,
    difficulty: "medium",
    starterCode: `function createQrLoginPoller(checkStatus, { intervalMs, timeoutMs }) {
}`,
    solutionCode: `function createQrLoginPoller(checkStatus, { intervalMs, timeoutMs }) {
  let status = "pending";
  let elapsed = 0;
  const timer = setInterval(async () => {
    elapsed += intervalMs;
    if (elapsed >= timeoutMs) {
      status = "expired";
      clearInterval(timer);
      return;
    }
    const result = await checkStatus();
    if (result === "approved") {
      status = "approved";
      clearInterval(timer);
    }
  }, intervalMs);
  return { getStatus: () => status, stop: () => clearInterval(timer) };
}`,
    testCases: [
      { input: "checkStatus() resolves 'approved' on its first poll", expected: "getStatus() becomes 'approved' and polling stops", label: "Transitions to approved as soon as the status check confirms it" },
      { input: "checkStatus() always resolves 'pending', with a short timeoutMs", expected: "getStatus() becomes 'expired' once the timeout elapses", label: "Expires after the timeout without ever being approved" },
      { input: "polling has already resolved to 'approved'", expected: "no further checkStatus() calls happen afterward", label: "Actually stops polling once resolved, not just changing the reported status" },
    ],
    hints: [
      "Check the elapsed-time-vs-timeout condition BEFORE calling checkStatus() on each tick — that's what guarantees the poller can't sneak in one more check attempt past its own deadline.",
    ],
    orderIndex: 1346,
  },

  {
    slug: "realtime-notification-transport",
    companies: ["Meta", "Slack", "LinkedIn"],
    category: "system-design",
    title: "Real-Time Notification System (Transport Fallback)",
    description: `**RADIO framing:** a websocket connection isn't always reliable (corporate proxies, flaky networks) — a resilient real-time system falls back to polling when the primary transport fails, rather than just losing updates silently. This is the actual "websocket vs. polling vs. SSE trade-offs" system design question distilled into its core failure-handling logic.

## Your task

Write \`createResilientNotifier(connectWebSocket, pollFallback, onMessage)\`, returning \`{ isUsingFallback(), stop() }\`. \`connectWebSocket({ onMessage, onError })\` attempts the primary transport; on \`onError\`, switch to polling \`pollFallback()\` on an interval, delivering each message it returns to \`onMessage\`.

\`\`\`js
const notifier = createResilientNotifier(connectWebSocket, pollFallback, onMessage)
notifier.isUsingFallback() // false — the websocket connected fine
// the websocket's onError fires:
notifier.isUsingFallback() // true — now polling pollFallback() on an interval
// each message pollFallback() returns is delivered to onMessage
\`\`\``,
    difficulty: "medium",
    starterCode: `function createResilientNotifier(connectWebSocket, pollFallback, onMessage) {
}`,
    solutionCode: `function createResilientNotifier(connectWebSocket, pollFallback, onMessage) {
  let usingFallback = false;
  let pollTimer = null;
  connectWebSocket({
    onMessage,
    onError: () => {
      if (!usingFallback) {
        usingFallback = true;
        pollTimer = setInterval(async () => {
          const messages = await pollFallback();
          messages.forEach(onMessage);
        }, 20);
      }
    },
  });
  return {
    isUsingFallback: () => usingFallback,
    stop() {
      if (pollTimer) clearInterval(pollTimer);
    },
  };
}`,
    testCases: [
      { input: "the websocket connects with no error", expected: "isUsingFallback() stays false", label: "Stays on the primary transport when nothing goes wrong" },
      { input: "the websocket's onError fires", expected: "isUsingFallback() becomes true", label: "Switches to the polling fallback on a transport error" },
      { input: "after falling back, pollFallback() resolves with a new message", expected: "onMessage is called with it", label: "The fallback path actually delivers messages, not just flags that it's active" },
    ],
    hints: [
      "The usingFallback guard inside onError matters — a flaky connection could fire onError more than once, and you don't want to stack up multiple competing poll intervals.",
    ],
    orderIndex: 1347,
  },


  // ── system-design — standalone Frontend System Design Roadmap, Stage 5 ─────
  {
    slug: "undo-redo-command-stack",
    companies: ["Notion", "Atlassian"],
    category: "system-design",
    title: "WYSIWYG Editor: Undo/Redo Command Stack",
    description: `**RADIO framing:** \`contentEditable\` and the Selection/Range APIs are the messy, browser-specific part of building a rich-text editor — but the undo/redo stack underneath them is a clean, well-defined, and very commonly probed piece of the design on its own: a history of states, a cursor into that history, and one crucial rule — making a *new* edit after undoing has to discard the "future" you undid away from.

## Your task

Write \`createUndoRedoStack(initialState)\`, returning \`{ commit(newState), undo(), redo(), getState() }\`. \`commit\` after one or more \`undo\` calls must discard the now-abandoned redo branch, not just append past it.

\`\`\`js
const history = createUndoRedoStack("start")
history.commit("a")
history.commit("b")
history.undo()
history.getState() // "a" — reverted to the state before "b"
history.redo()
history.getState() // "b" — re-applied
history.undo()
history.commit("c") // discards the abandoned "b" redo branch
history.redo()
history.getState() // still "c" — "b" is gone for good
\`\`\``,
    difficulty: "medium",
    isPremium: true,
    starterCode: `function createUndoRedoStack(initialState) {
}`,
    solutionCode: `function createUndoRedoStack(initialState) {
  let history = [initialState];
  let index = 0;
  function commit(newState) {
    history = history.slice(0, index + 1);
    history.push(newState);
    index++;
  }
  function undo() {
    if (index > 0) index--;
    return history[index];
  }
  function redo() {
    if (index < history.length - 1) index++;
    return history[index];
  }
  function getState() {
    return history[index];
  }
  return { commit, undo, redo, getState };
}`,
    testCases: [
      { input: "commit('a'), commit('b'), then undo()", expected: "getState() reverts to the state before 'b'", label: "undo() reverts to the previous committed state" },
      { input: "the same sequence, then redo()", expected: "getState() returns to 'b'", label: "redo() re-applies the state that was just undone" },
      { input: "commit('a'), commit('b'), undo(), then commit('c')", expected: "redo() no longer returns 'b' — the abandoned branch is gone", label: "A new commit after undoing discards the redo branch entirely" },
    ],
    hints: [
      "commit() truncating history to index + 1 BEFORE pushing the new state is the entire fix for the abandoned-branch rule — it silently deletes everything past the current point in history.",
    ],
    orderIndex: 1348,
  },

  {
    slug: "kanban-board-reorder",
    companies: ["Atlassian", "Asana", "Linear"],
    category: "system-design",
    title: "Kanban Board (Drag-and-Drop Reordering)",
    description: `**RADIO framing:** the drag gesture itself is UI plumbing — the data model question is representing a card move (within a column, or across two different columns) as a single, clean operation on the board's data, independent of how the drag was performed.

## Your task

Write \`moveCard(board, { fromColumn, fromIndex, toColumn, toIndex })\`, where \`board\` is \`{ columnName: [cards...] }\`. Return a new board with the card moved to its new position — this must work whether \`fromColumn\` and \`toColumn\` are the same or different.

\`\`\`js
const board = { todo: [{ id: 1, text: "Fix bug" }], done: [] }
moveCard(board, { fromColumn: "todo", fromIndex: 0, toColumn: "done", toIndex: 0 })
// { todo: [], done: [{ id: 1, text: "Fix bug" }] }
\`\`\``,
    difficulty: "medium",
    starterCode: `function moveCard(board, { fromColumn, fromIndex, toColumn, toIndex }) {
}`,
    solutionCode: `function moveCard(board, { fromColumn, fromIndex, toColumn, toIndex }) {
  const newBoard = Object.fromEntries(Object.entries(board).map(([k, v]) => [k, [...v]]));
  const [card] = newBoard[fromColumn].splice(fromIndex, 1);
  newBoard[toColumn].splice(toIndex, 0, card);
  return newBoard;
}`,
    testCases: [
      { input: "moving a card from index 0 to index 2 within the same column", expected: "the card ends up at index 2, other cards shift to fill the gap", label: "Reorders correctly within a single column" },
      { input: "moving a card from 'todo' to 'done'", expected: "the card is removed from 'todo' and inserted into 'done'", label: "Moves a card across two different columns" },
      { input: "moving a card with content { id: 5, text: 'Fix bug' }", expected: "the same card object (with its full content) appears at the destination", label: "Preserves the card's full content through the move, not just its position" },
    ],
    hints: [
      "splice's remove-then-insert pattern (one splice(fromIndex, 1) to pull the card out, one splice(toIndex, 0, card) to put it back in) works identically whether fromColumn and toColumn are the same array or two different ones.",
    ],
    orderIndex: 1349,
  },


  // ── system-design — standalone Frontend System Design Roadmap, Stage 6 ─────
  {
    slug: "todo-app-filter-visibility",
    companies: [],
    category: "system-design",
    title: "The Perfect TODO App (CRUD + Filtering)",
    description: `**RADIO framing:** the classic first "full app" question. The CRUD operations themselves are simple; the part worth actually designing carefully is keeping the *visible* list correctly derived from both the todos and the active filter — a common bug is filtering logic that gets out of sync with the underlying data after an edit.

## Your task

Write \`getVisibleTodos(state)\`, where \`state\` is \`{ todos: [{ id, text, done }], filter: "all" | "active" | "completed" }\`. Return exactly the todos that should be visible under the current filter.

\`\`\`js
const state = {
  todos: [
    { id: 1, text: "Buy milk", done: false },
    { id: 2, text: "Walk dog", done: true },
  ],
  filter: "active",
}
getVisibleTodos(state) // [{ id: 1, text: "Buy milk", done: false }]
\`\`\``,
    difficulty: "easy",
    isPremium: true,
    starterCode: `function getVisibleTodos(state) {
}`,
    solutionCode: `function getVisibleTodos(state) {
  if (state.filter === "active") return state.todos.filter((t) => !t.done);
  if (state.filter === "completed") return state.todos.filter((t) => t.done);
  return state.todos;
}`,
    testCases: [
      { input: "filter: 'all', a mix of done and not-done todos", expected: "every todo is visible", label: "The 'all' filter shows everything" },
      { input: "filter: 'active', a mix of done and not-done todos", expected: "only the not-done todos are visible", label: "The 'active' filter shows only incomplete todos" },
      { input: "filter: 'completed', a mix of done and not-done todos", expected: "only the done todos are visible", label: "The 'completed' filter shows only finished todos" },
    ],
    hints: [
      "This should always be a pure derivation from state.todos + state.filter, recomputed fresh — never a separately-maintained 'visible todos' list that could drift out of sync after an edit.",
    ],
    orderIndex: 1350,
  },

  {
    slug: "course-platform-progress-tracking",
    companies: [],
    category: "system-design",
    title: "Design FrontendForever.dev (Course Progress Tracking)",
    description: `**RADIO framing:** designing a content/course platform (catalog, auth, progress tracking) is a genuinely meta question on this platform, since it's tracking your progress through *this exact roadmap* the same way. The data-model question worth isolating: rolling up completion across many small pieces (each concept's several tabs) into one overall percentage.

## Your task

Write \`calculateCourseProgress(concepts)\`, where \`concepts\` is an array of \`{ id, tabs: { [tabName]: boolean } }\`. Return the percentage of tabs marked \`true\` across every concept, rounded to the nearest whole number.

\`\`\`js
calculateCourseProgress([
  { id: "closures", tabs: { understand: true, build: true, challenge: false, interview: false } },
])
// 50
calculateCourseProgress([]) // 0, not NaN
\`\`\``,
    difficulty: "easy",
    isPremium: true,
    starterCode: `function calculateCourseProgress(concepts) {
}`,
    solutionCode: `function calculateCourseProgress(concepts) {
  let totalTabs = 0;
  let completedTabs = 0;
  concepts.forEach((c) => {
    Object.values(c.tabs).forEach((done) => {
      totalTabs++;
      if (done) completedTabs++;
    });
  });
  return totalTabs === 0 ? 0 : Math.round((completedTabs / totalTabs) * 100);
}`,
    testCases: [
      { input: "one concept with 4 tabs, 2 completed", expected: "50", label: "Computes the correct percentage for a single concept" },
      { input: "an empty concepts array", expected: "0", label: "Returns 0 (not NaN) when there's nothing to track" },
      { input: "two concepts, several tabs each, all completed", expected: "100", label: "Reaches exactly 100 once every tab across every concept is done" },
    ],
    hints: [
      "Count every tab across every concept into one shared total, rather than averaging each concept's own percentage — that keeps a concept with more tabs correctly weighted more heavily.",
    ],
    orderIndex: 1351,
  },

  {
    slug: "multistep-form-wizard-navigation",
    companies: ["Stripe", "Amazon", "Airbnb"],
    category: "system-design",
    title: "Multi-Step Form Wizard (Validation + Branching)",
    description: `**RADIO framing:** a real checkout or onboarding wizard isn't a straight line — a step's answer can determine which step comes next (branching), and a step shouldn't be navigable away from until its own data is valid.

## Your task

Write \`createWizard(steps)\`, where each step is \`{ id, validate(data), next(data) }\` (\`next\` returns the next step's \`id\`, or falls through to the following step in the array if omitted). Return \`{ getCurrentStep(), goNext(stepData), goBack(), getData() }\`. \`goNext\` should reject (return \`false\`, stay on the current step) if \`validate\` fails on the merged data.

\`\`\`js
const wizard = createWizard([
  { id: "email", validate: (d) => !!d.email, next: () => "password" },
  { id: "password", validate: (d) => (d.password || "").length >= 8 },
])
wizard.goNext({ email: "" }) // false — validate() fails, stays on "email"
wizard.goNext({ email: "a@b.com" }) // true — advances via next()
wizard.getCurrentStep().id // "password"
\`\`\``,
    difficulty: "medium",
    starterCode: `function createWizard(steps) {
}`,
    solutionCode: `function createWizard(steps) {
  let currentIndex = 0;
  let data = {};
  function getCurrentStep() {
    return steps[currentIndex];
  }
  function goNext(stepData) {
    const step = getCurrentStep();
    const merged = { ...data, ...stepData };
    if (!step.validate(merged)) return false;
    data = merged;
    const nextId = step.next ? step.next(data) : steps[currentIndex + 1]?.id;
    const nextIndex = steps.findIndex((s) => s.id === nextId);
    if (nextIndex === -1) return false;
    currentIndex = nextIndex;
    return true;
  }
  function goBack() {
    if (currentIndex > 0) currentIndex--;
  }
  return { getCurrentStep, goNext, goBack, getData: () => data };
}`,
    testCases: [
      { input: "a step whose validate() passes for the given data", expected: "goNext() advances to the next step", label: "Advances to the next step when validation passes" },
      { input: "a step whose validate() fails for the given data", expected: "goNext() returns false, the wizard stays on the current step", label: "Blocks advancement when validation fails" },
      { input: "a step with a next() that branches to a specific step id based on the data", expected: "the wizard jumps to that step, not just the next one in array order", label: "Supports branching to a specific step, not just linear progression" },
    ],
    hints: [
      "Merge the new step's data into the accumulated data BEFORE calling validate — a step's own validation often depends on data collected in earlier steps too, not just what was just submitted.",
    ],
    orderIndex: 1352,
  },


  // ── system-design — standalone Frontend System Design Roadmap, Stage 7 ─────
  {
    slug: "messenger-optimistic-send",
    companies: ["Meta", "Slack", "Discord"],
    category: "system-design",
    title: "Messenger Web App (Optimistic Message Delivery)",
    description: `**RADIO framing:** a messenger that waits for the server to confirm before showing your own message feels sluggish — real chat apps show it immediately (optimistically) with a "sending" indicator, then reconcile with the server's real message ID once it's confirmed. A failed send has to stay visible (not vanish) so the user can retry it.

## Your task

Write \`createMessageSender(sendToServer)\`, returning \`{ sendMessage(text), getMessages() }\`. \`sendMessage\` should immediately add the message with a temporary id and \`"sending"\` status; on success, swap in the server's real id and \`"sent"\` status; on failure, keep the message visible with \`"failed"\` status.

\`\`\`js
const messenger = createMessageSender(sendToServer)
messenger.sendMessage("hi") // doesn't await
messenger.getMessages() // [{ id: "temp-1", text: "hi", status: "sending" }] — visible already
// once sendToServer resolves { id: "real-42" }:
messenger.getMessages() // [{ id: "real-42", text: "hi", status: "sent" }]
// if sendToServer rejects instead, the message stays with status "failed"
\`\`\``,
    difficulty: "medium",
    starterCode: `function createMessageSender(sendToServer) {
}`,
    solutionCode: `function createMessageSender(sendToServer) {
  let messages = [];
  let nextTempId = 1;
  async function sendMessage(text) {
    const tempId = "temp-" + nextTempId++;
    messages.push({ id: tempId, text, status: "sending" });
    try {
      const real = await sendToServer(text);
      messages = messages.map((m) => (m.id === tempId ? { id: real.id, text, status: "sent" } : m));
    } catch {
      messages = messages.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m));
    }
  }
  return { sendMessage, getMessages: () => messages };
}`,
    testCases: [
      { input: "sendMessage('hi'), checked synchronously before the server responds", expected: "the message is already visible with status 'sending'", label: "Shows the message immediately, before the server confirms it" },
      { input: "a send that resolves successfully with { id: 'real-42' }", expected: "the message's id becomes 'real-42' and status becomes 'sent'", label: "Reconciles the temp id with the server's real id on success" },
      { input: "a send that rejects", expected: "the message stays in the list with status 'failed', not removed", label: "A failed send stays visible for retry, instead of disappearing" },
    ],
    hints: [
      "The message is pushed into the list synchronously, before the `await sendToServer(text)` line — that's what makes it 'optimistic' rather than waiting for confirmation.",
    ],
    orderIndex: 1353,
  },

  {
    slug: "video-conference-grid-layout",
    companies: ["Zoom", "Meta", "Google"],
    category: "system-design",
    title: "Video Conferencing UI (Gallery Grid Layout)",
    description: `**RADIO framing:** WebRTC signaling is the hard networking half of this question; the layout half is a genuinely clean algorithm on its own — given N participants, compute a grid of rows/columns that's as close to square as possible, so the gallery view never looks lopsided.

## Your task

Write \`getGridLayout(participantCount)\`, returning \`{ rows, cols }\` — a grid with enough cells for every participant, with the column count no more than the row count would require (favor a wider-than-tall grid, which is how most gallery views actually lay out).

\`\`\`js
getGridLayout(1) // { rows: 1, cols: 1 }
getGridLayout(4) // { rows: 2, cols: 2 }
getGridLayout(5) // { rows: 2, cols: 3 } — wider than tall, still fits everyone
\`\`\``,
    difficulty: "easy",
    starterCode: `function getGridLayout(participantCount) {
}`,
    solutionCode: `function getGridLayout(participantCount) {
  if (participantCount === 0) return { rows: 0, cols: 0 };
  const cols = Math.ceil(Math.sqrt(participantCount));
  const rows = Math.ceil(participantCount / cols);
  return { rows, cols };
}`,
    testCases: [
      { input: "getGridLayout(1)", expected: "{ rows: 1, cols: 1 }", label: "A single participant gets a 1x1 grid" },
      { input: "getGridLayout(4)", expected: "{ rows: 2, cols: 2 }", label: "A perfect square count gets an exactly-square grid" },
      { input: "getGridLayout(5)", expected: "{ rows: 2, cols: 3 }", label: "A non-square count still fits everyone, favoring extra columns over extra rows" },
    ],
    hints: [
      "Compute cols first as the ceiling of the square root, then derive rows from however many of those columns are actually needed — that order is what keeps the grid wider than it is tall.",
    ],
    orderIndex: 1354,
  },

  {
    slug: "collab-editor-ot-transform",
    companies: ["Google", "Notion", "Figma"],
    category: "system-design",
    title: "Collaborative Document Editor (Operational Transform Core)",
    description: `**RADIO framing:** consistently rated among the hardest frontend system design questions — real-time multi-user editing needs every client to converge on the same document even when edits happen concurrently. The foundational building block behind Operational Transform (OT) — and, via a different mechanism, CRDTs (Conflict-free Replicated Data Types, the other major approach to multi-user sync) — is transforming one operation's position against a concurrent one that already landed first.

## Your task

Write \`transformPosition(opPosition, concurrentOp)\`, where \`concurrentOp\` is \`{ type: "insert", position, text }\` or \`{ type: "delete", position, length }\`. Return the adjusted position \`opPosition\` should now point to, accounting for the concurrent edit.

\`\`\`js
transformPosition(10, { type: "insert", position: 3, text: "hello" }) // 15
transformPosition(10, { type: "delete", position: 2, length: 3 }) // 7
transformPosition(5, { type: "insert", position: 8, text: "x" }) // 5 — edit happened after, unaffected
\`\`\``,
    difficulty: "hard",
    starterCode: `function transformPosition(opPosition, concurrentOp) {
}`,
    solutionCode: `function transformPosition(opPosition, concurrentOp) {
  if (concurrentOp.type === "insert" && concurrentOp.position <= opPosition) {
    return opPosition + concurrentOp.text.length;
  }
  if (concurrentOp.type === "delete" && concurrentOp.position < opPosition) {
    return Math.max(concurrentOp.position, opPosition - concurrentOp.length);
  }
  return opPosition;
}`,
    testCases: [
      { input: "opPosition 10, a concurrent insert of 5 characters at position 3", expected: "15 — shifted forward by the inserted length", label: "An insert before the position shifts it forward" },
      { input: "opPosition 10, a concurrent delete of 3 characters starting at position 2", expected: "7 — shifted back by the deleted length", label: "A delete before the position shifts it backward" },
      { input: "opPosition 5, a concurrent insert at position 8 (after opPosition)", expected: "5 — unchanged", label: "An edit that happens after the position doesn't affect it at all" },
    ],
    hints: [
      "The delete case needs a floor (Math.max with the delete's own position) — if the concurrent delete removed the exact text your position pointed into, it can't land somewhere before where that deletion started.",
    ],
    orderIndex: 1355,
  },


  // ── system-design — standalone Frontend System Design Roadmap, Stage 8 ─────
  {
    slug: "twitter-optimistic-like-toggle",
    companies: ["Twitter", "Meta"],
    category: "system-design",
    title: "Twitter Web App (Optimistic Like Toggle)",
    description: `**RADIO framing:** the news-feed archetype question — infinite scroll, real-time updates, and feed architecture are all covered in earlier stages. The piece worth isolating here is the interaction every user does most often: liking a post has to feel instant, which means updating the UI *before* the server confirms, then rolling back cleanly if the request actually fails.

## Your task

Write \`createLikeToggler(sendToServer)\`, returning \`{ toggleLike(), getLiked(), getCount() }\`. \`toggleLike\` should update \`liked\`/\`count\` immediately, then revert both to their exact prior values if \`sendToServer\` rejects.

\`\`\`js
const like = createLikeToggler(sendToServer)
like.toggleLike() // doesn't await
like.getLiked() // true — updated before the server responds
like.getCount() // 1
// if sendToServer rejects:
like.getLiked() // false — rolled back to the exact prior value
like.getCount() // 0
\`\`\``,
    difficulty: "medium",
    isPremium: true,
    starterCode: `function createLikeToggler(sendToServer) {
}`,
    solutionCode: `function createLikeToggler(sendToServer) {
  let liked = false;
  let count = 0;
  async function toggleLike() {
    const prevLiked = liked;
    const prevCount = count;
    liked = !liked;
    count += liked ? 1 : -1;
    try {
      await sendToServer(liked);
    } catch {
      liked = prevLiked;
      count = prevCount;
    }
  }
  return { toggleLike, getLiked: () => liked, getCount: () => count };
}`,
    testCases: [
      { input: "toggleLike(), checked synchronously before the server responds", expected: "getLiked() is already true, getCount() already incremented", label: "Updates the UI optimistically, before the server confirms" },
      { input: "a toggleLike() whose sendToServer call rejects", expected: "getLiked() and getCount() both revert to their pre-toggle values", label: "Rolls back cleanly to the exact prior state on failure" },
      { input: "a toggleLike() whose sendToServer call succeeds", expected: "the optimistic state is kept as-is", label: "Leaves the optimistic update in place once the server confirms it" },
    ],
    hints: [
      "Capture prevLiked and prevCount before making any change — rolling back has to restore the exact values from before the toggle, not just re-invert the current ones (which would double-flip if toggleLike were called again before the first one resolved).",
    ],
    orderIndex: 1356,
  },

  {
    slug: "facebook-notification-grouping",
    companies: ["Meta"],
    category: "system-design",
    title: "facebook.com (Notification Grouping)",
    description: `**RADIO framing:** a real notification feed doesn't show "Alice liked your post," "Bob liked your post," and "Carol liked your post" as three separate rows — it groups them into "Alice, Bob, and 1 other liked your post." The data-model question is grouping by what the notification is *about*, not by who triggered it.

## Your task

Write \`groupNotifications(notifications)\`, where each is \`{ type, targetId, actor }\`. Group notifications sharing the same \`type\` and \`targetId\` into a single entry with an \`actors\` array, in the order they were first grouped.

\`\`\`js
groupNotifications([
  { type: "like", targetId: "post1", actor: "Alice" },
  { type: "like", targetId: "post1", actor: "Bob" },
  { type: "comment", targetId: "post1", actor: "Carol" },
])
// [
//   { type: "like", targetId: "post1", actors: ["Alice", "Bob"] },
//   { type: "comment", targetId: "post1", actors: ["Carol"] },
// ]
\`\`\``,
    difficulty: "medium",
    isPremium: true,
    starterCode: `function groupNotifications(notifications) {
}`,
    solutionCode: `function groupNotifications(notifications) {
  const groups = new Map();
  notifications.forEach((n) => {
    const key = n.type + ":" + n.targetId;
    if (!groups.has(key)) groups.set(key, { type: n.type, targetId: n.targetId, actors: [] });
    groups.get(key).actors.push(n.actor);
  });
  return Array.from(groups.values());
}`,
    testCases: [
      { input: "3 'like' notifications on the same post, from 3 different actors", expected: "one group with all 3 actors, not 3 separate entries", label: "Groups notifications sharing the same type and target" },
      { input: "a 'like' and a 'comment' notification on the same post", expected: "two separate groups — different types don't merge", label: "Keeps different notification types on the same target separate" },
      { input: "'like' notifications on two different posts", expected: "two separate groups — different targets don't merge", label: "Keeps notifications on different targets separate, even with the same type" },
    ],
    hints: [
      "A composite key (type + targetId together, not either alone) is what correctly distinguishes 'likes on post A' from 'comments on post A' and from 'likes on post B'.",
    ],
    orderIndex: 1357,
  },

  {
    slug: "instagram-stories-seen-tracker",
    companies: ["Meta", "Pinterest"],
    category: "system-design",
    title: "Instagram (Stories Seen/Unseen Tracker)",
    description: `**RADIO framing:** the colored ring around a story avatar (unseen) versus gray (all seen) is driven by per-user, per-story view tracking — and it has to be tracked independently for every viewer, since what you've seen has no bearing on what anyone else has seen.

## Your task

Write \`createStoriesTracker()\`, returning \`{ markSeen(userId, storyId), hasUnseenStories(userId, storyIds) }\`. \`hasUnseenStories\` should return \`true\` if any of the given \`storyIds\` haven't been marked seen by that specific \`userId\`.

\`\`\`js
const tracker = createStoriesTracker()
tracker.hasUnseenStories("user1", ["s1", "s2", "s3"]) // true — nothing seen yet
tracker.markSeen("user1", "s1")
tracker.markSeen("user1", "s2")
tracker.markSeen("user1", "s3")
tracker.hasUnseenStories("user1", ["s1", "s2", "s3"]) // false
tracker.hasUnseenStories("user2", ["s1"]) // true — a different user's own history
\`\`\``,
    difficulty: "easy",
    isPremium: true,
    starterCode: `function createStoriesTracker() {
}`,
    solutionCode: `function createStoriesTracker() {
  const seen = new Map();
  function markSeen(userId, storyId) {
    if (!seen.has(userId)) seen.set(userId, new Set());
    seen.get(userId).add(storyId);
  }
  function hasUnseenStories(userId, storyIds) {
    const seenSet = seen.get(userId) || new Set();
    return storyIds.some((id) => !seenSet.has(id));
  }
  return { markSeen, hasUnseenStories };
}`,
    testCases: [
      { input: "a user who hasn't seen any of a person's 3 stories", expected: "hasUnseenStories() returns true", label: "Detects unseen stories for a viewer with no view history" },
      { input: "the same user, after marking all 3 stories seen", expected: "hasUnseenStories() returns false", label: "Flips to false once every story has been marked seen" },
      { input: "two different users, one has seen the stories and one hasn't", expected: "each user's hasUnseenStories() reflects only their own view history", label: "Tracks seen-state independently per user" },
    ],
    hints: [
      "The Map is keyed by userId, and each value is its own independent Set of storyIds — two users' view histories should never be able to influence each other.",
    ],
    orderIndex: 1358,
  },

  {
    slug: "youtube-adaptive-bitrate-selection",
    companies: ["Google", "Netflix"],
    category: "system-design",
    title: "youtube.com (Adaptive Bitrate Selection)",
    description: `**RADIO framing:** adaptive-bitrate streaming is the core technical concept behind youtube.com's player — given an estimated network speed, pick the highest quality level the connection can actually sustain, with a safety margin so playback doesn't stall the moment bandwidth dips slightly.

## Your task

Write \`selectBitrate(bandwidthKbps, qualityLevels)\`, where \`qualityLevels\` is \`[{ label, requiredKbps }]\` sorted ascending by \`requiredKbps\`. Return the \`label\` of the highest quality level whose \`requiredKbps\` fits within 80% of \`bandwidthKbps\` (the safety margin), falling back to the lowest level if even that doesn't fit.

\`\`\`js
selectBitrate(5000, [
  { label: "240p", requiredKbps: 400 },
  { label: "1080p", requiredKbps: 4000 },
])
// "1080p" — comfortably fits within the 80% safety margin
selectBitrate(500, [{ label: "240p", requiredKbps: 400 }])
// "240p" — the lowest available level, even though it's a tight fit
\`\`\``,
    difficulty: "medium",
    isPremium: true,
    starterCode: `function selectBitrate(bandwidthKbps, qualityLevels) {
}`,
    solutionCode: `function selectBitrate(bandwidthKbps, qualityLevels) {
  const safeBandwidth = bandwidthKbps * 0.8;
  let best = qualityLevels[0];
  for (const level of qualityLevels) {
    if (level.requiredKbps <= safeBandwidth) best = level;
  }
  return best.label;
}`,
    testCases: [
      { input: "5000 Kbps bandwidth, levels up to 4000 Kbps ('1080p')", expected: "'1080p' — comfortably fits within the 80% safety margin", label: "Picks the highest quality that fits within the bandwidth safety margin" },
      { input: "500 Kbps bandwidth, with a '240p' level requiring 400 Kbps as the lowest option", expected: "'240p' — the lowest available level, even though it's a tight fit", label: "Falls back to the lowest quality level when bandwidth is very constrained" },
    ],
    hints: [
      "Applying the 80% safety margin to the AVAILABLE bandwidth once, up front, is simpler and less error-prone than adjusting each quality level's requirement individually.",
    ],
    orderIndex: 1359,
  },

  {
    slug: "codesandbox-file-tree-crud",
    companies: ["Vercel", "Replit"],
    category: "system-design",
    title: "CodeSandbox (Virtual File Tree CRUD)",
    description: `**RADIO framing:** sandboxed iframes and live bundling are the exotic parts of an in-browser IDE — but every one of those systems sits on top of a very ordinary data structure: a virtual file tree that has to support creating and deleting files (including nested ones) correctly.

## Your task

Write \`createFileTree()\`, returning \`{ createFile(path, type), deleteFile(path), getTree() }\`. Paths are slash-separated (e.g. \`"src/utils/helpers.js"\`) and \`type\` is \`"file"\` (the default) or \`"folder"\`. Assume every intermediate folder in \`path\` already exists — \`createFile\` just inserts the new file (or folder) into its immediate parent; it doesn't need to create any missing ancestor folders.

\`\`\`js
const fs = createFileTree()
fs.createFile("index.js") // top-level file
fs.createFile("src", "folder")
fs.createFile("src/app.js") // nested inside "src", not at the root
fs.deleteFile("index.js")
// getTree() now has src/app.js, but no top-level index.js
\`\`\``,
    difficulty: "medium",
    isPremium: true,
    starterCode: `function createFileTree() {
}`,
    solutionCode: `function createFileTree() {
  const tree = { name: "root", type: "folder", children: [] };
  function findParent(path) {
    const parts = path.split("/").filter(Boolean);
    let node = tree;
    for (let i = 0; i < parts.length - 1; i++) {
      node = node.children.find((c) => c.name === parts[i] && c.type === "folder");
    }
    return node;
  }
  function createFile(path, type = "file") {
    const parent = findParent(path);
    const name = path.split("/").filter(Boolean).pop();
    parent.children.push({ name, type, children: type === "folder" ? [] : undefined });
  }
  function deleteFile(path) {
    const parent = findParent(path);
    const name = path.split("/").filter(Boolean).pop();
    parent.children = parent.children.filter((c) => c.name !== name);
  }
  return { createFile, deleteFile, getTree: () => tree };
}`,
    testCases: [
      { input: "createFile('index.js')", expected: "a file named 'index.js' appears as a direct child of the root", label: "Creates a top-level file" },
      { input: "createFile('src', 'folder'), then createFile('src/app.js')", expected: "'app.js' appears inside the 'src' folder, not at the root", label: "Creates a file nested inside an existing folder" },
      { input: "creating two files, then deleting one by path", expected: "only the named file is removed — the other one is untouched", label: "Deletes exactly the targeted file, leaving its siblings alone" },
    ],
    hints: [
      "findParent walks the path one segment at a time, stopping one segment short of the target — that shared helper is what both createFile and deleteFile need, since they both have to locate the same immediate parent folder first.",
    ],
    orderIndex: 1360,
  },

  {
    slug: "spreadsheet-formula-dependency-order",
    companies: ["Google", "Microsoft"],
    category: "system-design",
    title: "Spreadsheet App (Formula Recalculation Order)",
    description: `**RADIO framing:** if cell C depends on B, which depends on A, recalculating C before B (or B before A) after an edit produces a wrong, stale result. This is a classic topological sort over the cells' dependency graph — the same technique behind build systems and package managers, applied to formulas.

## Your task

Write \`getRecalculationOrder(dependencies)\`, where \`dependencies\` is \`{ cellId: [cellIds it directly depends on] }\`. Return an array of every cell ID, ordered so that a cell always appears *after* every cell it depends on.

\`\`\`js
getRecalculationOrder({ A: [], B: ["A"], C: ["B"] })
// ["A", "B", "C"] — each cell only recalculates after its own dependencies
getRecalculationOrder({ A: [], B: ["A"], C: ["A"] })
// A appears exactly once, before both B and C
\`\`\``,
    difficulty: "hard",
    isPremium: true,
    starterCode: `function getRecalculationOrder(dependencies) {
}`,
    solutionCode: `function getRecalculationOrder(dependencies) {
  const visited = new Set();
  const order = [];
  function visit(cellId) {
    if (visited.has(cellId)) return;
    visited.add(cellId);
    (dependencies[cellId] || []).forEach(visit);
    order.push(cellId);
  }
  Object.keys(dependencies).forEach(visit);
  return order;
}`,
    testCases: [
      { input: "C depends on B, B depends on A: { A: [], B: ['A'], C: ['B'] }", expected: "A appears before B, and B appears before C", label: "Orders a chain of dependencies correctly" },
      { input: "two independent cells with no dependency between them", expected: "both appear in the result, in either relative order", label: "Handles independent cells that don't depend on each other" },
      { input: "a cell depended on by two different cells: { A: [], B: ['A'], C: ['A'] }", expected: "A appears exactly once, before both B and C", label: "A shared dependency is only recalculated once, before all of its dependents" },
    ],
    hints: [
      "This is depth-first traversal with a visited guard — visit every dependency recursively BEFORE adding the current cell to the result, and the visited Set is what stops a cell with multiple dependents from being processed (or added) more than once.",
    ],
    orderIndex: 1361,
  },

  {
    slug: "analytics-dashboard-time-bucketing",
    companies: ["Amazon", "Bloomberg"],
    category: "system-design",
    title: "Analytics Dashboard (Streaming Data Time-Bucketing)",
    description: `**RADIO framing:** a real-time chart fed by a raw event stream would try to plot thousands of points and choke — the standard fix is downsampling: group incoming data points into fixed-size time windows and chart the aggregate (e.g. the average) of each window instead of every individual point.

## Your task

Write \`bucketDataPoints(points, bucketSizeMs)\`, where \`points\` is \`[{ timestamp, value }]\`. Group points into \`bucketSizeMs\`-wide time windows and return \`[{ timestamp, average }]\` — one entry per bucket, in chronological order, where \`timestamp\` is the start of that bucket's window.

\`\`\`js
bucketDataPoints(
  [
    { timestamp: 0, value: 10 },
    { timestamp: 500, value: 20 },
    { timestamp: 1000, value: 30 },
  ],
  1000,
)
// [{ timestamp: 0, average: 15 }, { timestamp: 1000, average: 30 }]
\`\`\``,
    difficulty: "medium",
    isPremium: true,
    starterCode: `function bucketDataPoints(points, bucketSizeMs) {
}`,
    solutionCode: `function bucketDataPoints(points, bucketSizeMs) {
  const buckets = new Map();
  points.forEach(({ timestamp, value }) => {
    const bucketKey = Math.floor(timestamp / bucketSizeMs) * bucketSizeMs;
    if (!buckets.has(bucketKey)) buckets.set(bucketKey, { sum: 0, count: 0 });
    const b = buckets.get(bucketKey);
    b.sum += value;
    b.count++;
  });
  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([timestamp, { sum, count }]) => ({ timestamp, average: sum / count }));
}`,
    testCases: [
      { input: "3 points all within the same 1000ms bucket, values 10, 20, 30", expected: "one bucket with average 20", label: "Averages points that fall within the same time window" },
      { input: "points spread across two distinct 1000ms buckets", expected: "two separate bucket entries, not merged into one", label: "Keeps points in different time windows in separate buckets" },
      { input: "points from multiple buckets, inserted out of chronological order", expected: "the returned buckets are still sorted chronologically", label: "Returns buckets in chronological order regardless of input order" },
    ],
    hints: [
      "Math.floor(timestamp / bucketSizeMs) * bucketSizeMs rounds any timestamp down to its bucket's start time — that's the entire bucketing key, no manual range-checking needed.",
    ],
    orderIndex: 1362,
  }
];
