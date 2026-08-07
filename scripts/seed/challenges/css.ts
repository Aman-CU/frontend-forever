import type { ChallengeSeed } from "../types";

export const CSS_CHALLENGES: ChallengeSeed[] = [

  // ── css — standalone CSS Interview Question Roadmap, Stage 1 ───────────────
  {
    slug: "box-sizing-content-vs-border",
    companies: [],
    category: "css",
    title: "box-sizing: border-box vs content-box",
    description: `The single most common cause of "why is my element wider than I set it" bugs: by default (\`content-box\`), \`width\`/\`height\` only size the content area — padding and border are added on top. \`border-box\` makes \`width\`/\`height\` include padding and border instead, so the element's total rendered size is exactly what you set.

## Your task

Write \`applyBoxSizing(el, mode)\`, which sets \`el\`'s \`box-sizing\` to \`mode\` (\`"content-box"\` or \`"border-box"\`).

\`\`\`js
applyBoxSizing(el, "border-box");
// el.style.boxSizing === "border-box"
// a 200px-wide element with 20px padding and a 5px border
// now renders at exactly 200px wide — padding and border no longer add to it
\`\`\``,
    difficulty: "easy",
    isPremium: true,
    starterCode: `function applyBoxSizing(el, mode) {
}`,
    solutionCode: `function applyBoxSizing(el, mode) {
  el.style.boxSizing = mode;
}`,
    testCases: [
      { input: "a 200px-wide element with 20px padding and a 5px border, box-sizing: content-box", expected: "renders 250px wide (200 + 40 padding + 10 border)", label: "content-box adds padding and border on top of width" },
      { input: "the same element switched to box-sizing: border-box", expected: "renders exactly 200px wide", label: "border-box makes width include padding and border" },
    ],
    hints: [
      "This is a one-line function — the whole point is knowing which single CSS property controls this, not writing complex logic.",
    ],
    orderIndex: 1228,
  },

  {
    slug: "center-element-vertically",
    companies: ["Meta", "Amazon", "Google", "Airbnb", "Microsoft"],
    category: "css",
    title: "Center an Element Vertically",
    description: `Vertical centering is the single most-repeated CSS interview question, and for years the honest answer was "it's surprisingly annoying" — table-cell hacks, negative margins, absolute positioning with manual offsets. **Flexbox** ended that: make the parent a flex container and set \`align-items: center\`, and any child centers vertically regardless of its own height, with nothing to measure by hand.

## Your task

Write \`centerVertically(container)\`, which makes \`container\`'s children center vertically within it, regardless of the container's or child's height.

\`\`\`js
centerVertically(container);
// container's children are now centered vertically:
// display: flex; align-items: center;
// a 300px-tall container with a 50px-tall child centers it 125px from the top
\`\`\``,
    difficulty: "easy",
    starterCode: `function centerVertically(container) {
}`,
    solutionCode: `function centerVertically(container) {
  container.style.display = "flex";
  container.style.alignItems = "center";
}`,
    testCases: [
      { input: "a 300px-tall container with a 50px-tall child", expected: "the child sits 125px from the container's top — exactly centered", label: "Centers a child vertically regardless of its height" },
      { input: "the same container with an 80px-tall child instead", expected: "the child sits 110px from the container's top", label: "Recomputes correctly for a different child height, not a fixed offset" },
    ],
    hints: [
      "display: flex plus align-items: center on the parent handles vertical centering for any child height — no need to know the child's height in advance.",
    ],
    orderIndex: 1229,
  },

  {
    slug: "center-element-both-axes",
    companies: ["Meta", "Amazon", "Google", "Airbnb", "Microsoft"],
    category: "css",
    title: "Center an Element Both Horizontally and Vertically",
    description: `The two-axis follow-up to vertical-only centering: center a child both **horizontally** and **vertically** at once. Flexbox handles both axes with the same mental model — \`align-items\` controls the cross axis, \`justify-content\` controls the main axis — so getting one axis right is really just getting both right with two properties instead of one.

## Your task

Write \`centerBoth(container)\`, which centers \`container\`'s children both horizontally and vertically within it.

\`\`\`js
centerBoth(container);
// container's children are now centered on both axes:
// display: flex; align-items: center; justify-content: center;
// a 300×300px container with a 50×80px child centers it at (125px, 110px)
\`\`\``,
    difficulty: "easy",
    starterCode: `function centerBoth(container) {
}`,
    solutionCode: `function centerBoth(container) {
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
}`,
    testCases: [
      { input: "a 300×300px container with a 50×80px child", expected: "the child sits 125px from the left and 110px from the top — centered on both axes", label: "Centers on both axes simultaneously" },
    ],
    hints: [
      "align-items controls the cross axis (vertical, in a default row-direction flex container) and justify-content controls the main axis (horizontal) — you need both properties, not just one.",
    ],
    orderIndex: 1230,
  },


  // ── css — standalone CSS Interview Question Roadmap, Stage 2 ───────────────
  {
    slug: "truncate-single-line-ellipsis",
    companies: ["Meta", "Amazon", "Airbnb", "Shopify"],
    category: "css",
    title: "Truncate Text in One Line (with Ellipsis)",
    description: `Long text — a filename, a table cell, a nav label — will happily overflow or wrap and break a layout unless you explicitly tell it not to. The classic fix is a **three-property combo**: stop the text from wrapping, hide whatever spills past the box, and swap that hidden overflow for a trailing "…" so it's visually obvious the text was cut off.

## Your task

Write \`truncateSingleLine(el)\`, which sets up \`el\` so any text overflowing its width is clipped to a single line and ends in an ellipsis.

\`\`\`js
truncateSingleLine(el);
// el.style.whiteSpace === "nowrap"
// el.style.overflow === "hidden"
// el.style.textOverflow === "ellipsis"
// long text now clips to one line, ending in "…" instead of wrapping or overflowing
\`\`\``,
    difficulty: "easy",
    starterCode: `function truncateSingleLine(el) {
}`,
    solutionCode: `function truncateSingleLine(el) {
  el.style.whiteSpace = "nowrap";
  el.style.overflow = "hidden";
  el.style.textOverflow = "ellipsis";
}`,
    testCases: [
      { input: "truncateSingleLine(el)", expected: "white-space: nowrap", label: "Prevents the text from wrapping onto a second line" },
      { input: "truncateSingleLine(el)", expected: "overflow: hidden", label: "Clips content that overflows the element's box" },
      { input: "truncateSingleLine(el)", expected: "text-overflow: ellipsis", label: "Shows an ellipsis at the clipped edge" },
    ],
    hints: [
      "All three properties are required together — text-overflow: ellipsis does nothing on its own unless overflow is also hidden and white-space prevents wrapping.",
    ],
    orderIndex: 1231,
  },

  {
    slug: "truncate-multiline-ellipsis",
    companies: ["Meta", "Amazon", "Airbnb"],
    category: "css",
    title: "Truncate Text in Multiple Lines (with Ellipsis)",
    description: `Single-line ellipsis truncation is one property combo; clipping to a **fixed number of lines** instead — a card description that should never grow past 3 lines, however long the text is — needs a different mechanism, since \`white-space: nowrap\` only makes sense for a single line. \`-webkit-line-clamp\` lets text wrap normally up to a set line count, then clips and ellipsizes whatever's left over.

## Your task

Write \`truncateMultiLine(el, lines)\`, which clips \`el\`'s text to exactly \`lines\` lines, ending in an ellipsis.

\`\`\`js
truncateMultiLine(el, 3);
// el.style.display === "-webkit-box"
// el.style.webkitBoxOrient === "vertical"
// el.style.webkitLineClamp === "3"
// el.style.overflow === "hidden"
// text now wraps normally for 3 lines, then clips with a trailing "…"
\`\`\``,
    difficulty: "medium",
    starterCode: `function truncateMultiLine(el, lines) {
}`,
    solutionCode: `function truncateMultiLine(el, lines) {
  el.style.display = "-webkit-box";
  el.style.webkitBoxOrient = "vertical";
  el.style.webkitLineClamp = String(lines);
  el.style.overflow = "hidden";
}`,
    testCases: [
      { input: "truncateMultiLine(el, 3)", expected: "display: -webkit-box", label: "Requires the -webkit-box display mode for line-clamp to apply" },
      { input: "truncateMultiLine(el, 3)", expected: "-webkit-box-orient: vertical", label: "Sets the box orientation the line-clamp mechanism depends on" },
      { input: "truncateMultiLine(el, 3)", expected: "-webkit-line-clamp: 3", label: "Clamps to exactly the requested number of lines" },
      { input: "truncateMultiLine(el, 5)", expected: "-webkit-line-clamp: 5", label: "Works correctly for a different line count, not hardcoded to one value" },
    ],
    hints: [
      "-webkit-line-clamp only has an effect combined with display: -webkit-box, -webkit-box-orient: vertical, and overflow: hidden — all four together, unlike the single-line version's three.",
    ],
    orderIndex: 1232,
  },

  {
    slug: "fluid-typography-clamp",
    companies: ["Google", "Airbnb"],
    category: "css",
    title: "Responsive Typography Using clamp() (No Media Queries)",
    description: `\`clamp(min, preferred, max)\` picks whichever of the three values is in the middle — so a font-size can scale smoothly with the viewport (via a \`vw\`-based preferred value) while never shrinking below a readable minimum or growing past a sensible maximum, all without a single media-query breakpoint.

## Your task

Write \`setFluidFontSize(el, minPx, preferredVw, maxPx)\`, setting \`el\`'s \`font-size\` to \`clamp(minPx, preferredVw, maxPx)\` (with \`px\`/\`vw\` units attached).

\`\`\`js
setFluidFontSize(el, 16, 4, 64);
// el.style.fontSize === "clamp(16px, 4vw, 64px)"
// resolves to 16px on narrow viewports, 64px on wide ones,
// and scales with 4vw of the viewport width in between
\`\`\``,
    difficulty: "medium",
    starterCode: `function setFluidFontSize(el, minPx, preferredVw, maxPx) {
}`,
    solutionCode: `function setFluidFontSize(el, minPx, preferredVw, maxPx) {
  el.style.fontSize = "clamp(" + minPx + "px, " + preferredVw + "vw, " + maxPx + "px)";
}`,
    testCases: [
      { input: "setFluidFontSize(el, 16, 1000, 64) — a huge preferred value, far past any real viewport", expected: "the resolved font-size saturates at the max, 64px", label: "Never grows past the max, however large the preferred value resolves to" },
      { input: "setFluidFontSize(el, 16, 0, 64) — a preferred value of 0vw", expected: "the resolved font-size saturates at the min, 16px", label: "Never shrinks below the min" },
      { input: "setFluidFontSize(el, 10, 4, 40) — a preferred value that resolves between min and max at the current viewport width", expected: "the resolved font-size matches 4vw of the actual viewport width", label: "Scales with the real viewport width when the preferred value lands between min and max" },
    ],
    hints: [
      "The browser resolves clamp() for you — this function just needs to write the correct CSS value string, with the right units on each of the three arguments.",
    ],
    orderIndex: 1233,
  },

  {
    slug: "fluid-font-size-vw",
    companies: ["Airbnb", "Shopify"],
    category: "css",
    title: "Fluid Font Size (Pure Viewport Units)",
    description: `The older, unbounded technique that predates \`clamp()\`: sizing text purely in \`vw\` units so it scales continuously with the viewport — with no floor or ceiling, unlike the clamped version. Useful to recognize as the "what came before clamp() and why it's risky" follow-up.

## Your task

Write \`setFluidFontSizeLegacy(el, vw)\`, setting \`el\`'s \`font-size\` to \`vw\` viewport-width units — no clamping, no fallback.

\`\`\`js
setFluidFontSizeLegacy(el, 5);
// el.style.fontSize === "5vw"
// resolved size is exactly 5% of the current viewport width — no min or max
\`\`\``,
    difficulty: "medium",
    starterCode: `function setFluidFontSizeLegacy(el, vw) {
}`,
    solutionCode: `function setFluidFontSizeLegacy(el, vw) {
  el.style.fontSize = vw + "vw";
}`,
    testCases: [
      { input: "setFluidFontSizeLegacy(el, 5)", expected: "the resolved font-size is exactly 5% of the current viewport width, in pixels", label: "Scales linearly and unboundedly with viewport width" },
    ],
    hints: [
      "Unlike the clamp() version, there's genuinely no floor or ceiling here — on a very narrow or very wide viewport this can render illegibly small or absurdly large, which is exactly why clamp() replaced it.",
    ],
    orderIndex: 1234,
  },

  {
    slug: "gradient-text-background-clip",
    companies: ["Meta", "Pinterest", "Adobe"],
    category: "css",
    title: "Color Gradients on Text (background-clip: text)",
    description: `The trick behind gradient headlines: paint a gradient as the element's background, then clip that background to the exact shape of the text glyphs (\`background-clip: text\`) and make the text itself transparent so the gradient shows through.

## Your task

Write \`applyGradientText(el, gradientCss)\`, applying \`gradientCss\` (e.g. \`"linear-gradient(90deg, red, blue)"\`) as a text-clipped gradient on \`el\`.

\`\`\`js
applyGradientText(el, "linear-gradient(90deg, red, blue)");
// el.style.backgroundImage === "linear-gradient(90deg, red, blue)"
// el.style.backgroundClip === "text"; el.style.webkitBackgroundClip === "text"
// el.style.color === "transparent" — the gradient shows through the text glyphs
\`\`\``,
    difficulty: "medium",
    starterCode: `function applyGradientText(el, gradientCss) {
}`,
    solutionCode: `function applyGradientText(el, gradientCss) {
  el.style.backgroundImage = gradientCss;
  el.style.backgroundClip = "text";
  el.style.webkitBackgroundClip = "text";
  el.style.color = "transparent";
}`,
    testCases: [
      { input: "applyGradientText(el, 'linear-gradient(90deg, red, blue)')", expected: "background-clip: text (and the -webkit- prefixed equivalent, for broader support)", label: "Clips the background to the text glyphs' shape" },
      { input: "applyGradientText(el, 'linear-gradient(90deg, red, blue)')", expected: "color: transparent", label: "Makes the text itself transparent so the clipped gradient shows through" },
      { input: "applyGradientText(el, 'linear-gradient(90deg, red, blue)')", expected: "background-image is the given gradient", label: "Applies the given gradient as the background" },
    ],
    hints: [
      "All three properties are required — the gradient alone does nothing visible until the background is clipped to the text and the text's own color is made transparent.",
    ],
    orderIndex: 1235,
  },


  // ── css — standalone CSS Interview Question Roadmap, Stage 3 ───────────────
  {
    slug: "flex-layout-fixed-flexible-fixed",
    companies: ["Meta", "Amazon", "Airbnb"],
    category: "css",
    title: "Flex Layout: Fixed | Flexible | Fixed",
    description: `A layout that shows up constantly in real UIs: two fixed-width side columns (icons, actions, a fixed-width label) with a flexible middle column that absorbs whatever space is left over.

## Your task

Write \`applyFlexLayoutOne(container)\`, where \`container\` has exactly 3 children. Make the 1st and 3rd children exactly 100px wide and never grow or shrink; make the 2nd child flexible, absorbing all remaining space.

\`\`\`js
applyFlexLayoutOne(container);
// container.style.display === "flex"
// children[0] and children[2] get flex: "0 0 100px" — fixed at 100px
// children[1] gets flex: "1" — in a 500px-wide container, it renders 300px wide
\`\`\``,
    difficulty: "medium",
    starterCode: `function applyFlexLayoutOne(container) {
}`,
    solutionCode: `function applyFlexLayoutOne(container) {
  container.style.display = "flex";
  const children = container.children;
  children[0].style.flex = "0 0 100px";
  children[1].style.flex = "1";
  children[2].style.flex = "0 0 100px";
}`,
    testCases: [
      { input: "a 500px-wide container with 3 children", expected: "widths 100px, 300px, 100px", label: "The middle child absorbs exactly the remaining space" },
      { input: "the same layout in a 700px-wide container", expected: "widths 100px, 500px, 100px", label: "The two fixed columns stay 100px regardless of container width" },
    ],
    hints: [
      "flex: 0 0 100px means 'never grow, never shrink, base size 100px' — that's what keeps the side columns fixed while flex: 1 lets the middle one absorb everything else.",
    ],
    orderIndex: 1236,
  },

  {
    slug: "flex-equal-height-cards",
    companies: ["Amazon", "Shopify"],
    category: "css",
    title: "Flex Layout: Equal-Height Wrapping Cards",
    description: `A row of cards with wildly different amounts of content only looks tidy if every card in the row is exactly as tall as the tallest one — normally that means measuring heights in JS and setting them manually. **Flexbox** gives you this for free: its default \`align-items: stretch\` already stretches every flex item in a row to match the tallest sibling, before you write a single line of layout code for it.

## Your task

Write \`applyEqualHeightCards(container)\`, making \`container\`'s children wrap onto new rows as needed, with every card in a row stretched to match the tallest card in that row.

\`\`\`js
applyEqualHeightCards(container);
// container.style.display === "flex"
// container.style.flexWrap === "wrap"
// two cards with different content heights both render at the taller card's height
\`\`\``,
    difficulty: "medium",
    starterCode: `function applyEqualHeightCards(container) {
}`,
    solutionCode: `function applyEqualHeightCards(container) {
  container.style.display = "flex";
  container.style.flexWrap = "wrap";
}`,
    testCases: [
      { input: "two cards in one row, with different amounts of inner content (one taller than the other)", expected: "both cards render at the height of the taller one", label: "Cards stretch to match the tallest card in their row" },
      { input: "container", expected: "flex-wrap: wrap", label: "Cards wrap onto a new row instead of overflowing or shrinking to fit one row" },
    ],
    hints: [
      "Don't set an explicit height on the cards themselves — flexbox's default align-items: stretch is what equalizes their height automatically, and an explicit height would override that.",
    ],
    orderIndex: 1237,
  },

  {
    slug: "flex-two-column-layout",
    companies: ["Amazon", "Microsoft"],
    category: "css",
    title: "Two-Column Layout (Fixed Sidebar + Flexible Main)",
    description: `A sidebar-plus-main-content shell is one of the most common page layouts there is — a nav or filter panel pinned to a fixed width, with the actual content area soaking up whatever space is left. It's the two-column cousin of the fixed-flexible-fixed pattern: drop the third fixed-width column and let the second one absorb everything else.

## Your task

Write \`applyTwoColumnLayout(container, sidebarWidth)\`, where \`container\` has exactly 2 children: a sidebar (1st) fixed at \`sidebarWidth\` pixels, and a main area (2nd) that fills the rest.

\`\`\`js
applyTwoColumnLayout(container, 150);
// container.style.display === "flex"
// children[0] gets flex: "0 0 150px" — in a 500px-wide container, sidebar is 150px
// children[1] gets flex: "1" — main fills the remaining 350px
\`\`\``,
    difficulty: "medium",
    starterCode: `function applyTwoColumnLayout(container, sidebarWidth) {
}`,
    solutionCode: `function applyTwoColumnLayout(container, sidebarWidth) {
  container.style.display = "flex";
  const children = container.children;
  children[0].style.flex = "0 0 " + sidebarWidth + "px";
  children[1].style.flex = "1";
}`,
    testCases: [
      { input: "applyTwoColumnLayout(container, 150) in a 500px-wide container", expected: "sidebar 150px, main 350px", label: "The sidebar takes exactly the given width, main takes the rest" },
      { input: "applyTwoColumnLayout(container, 250) in the same 500px-wide container", expected: "sidebar 250px, main 250px", label: "Works correctly for a different sidebarWidth, not hardcoded" },
    ],
    hints: [
      "This is nearly identical to the fixed-flexible-fixed pattern, just with one fixed column instead of two.",
    ],
    orderIndex: 1238,
  },

  {
    slug: "flex-sticky-footer",
    companies: ["Amazon", "Meta", "Airbnb"],
    category: "css",
    title: "Sticky Footer",
    description: `The classic "footer should stay at the bottom of the viewport even when the page content is short" layout — solved with a column-direction flex wrapper where the main content area is the only flexible piece.

## Your task

Write \`applyStickyFooterLayout(wrapper)\`, where \`wrapper\` has exactly 3 children in order: header, main, footer. However short the header/main/footer content is, the footer must stay pinned to \`wrapper\`'s bottom edge.

\`\`\`js
applyStickyFooterLayout(wrapper);
// wrapper.style.display === "flex"; wrapper.style.flexDirection === "column"
// children[1] (main) gets flex: "1", absorbing all leftover vertical space
// so the footer's bottom edge stays flush with wrapper's bottom edge
\`\`\``,
    difficulty: "medium",
    starterCode: `function applyStickyFooterLayout(wrapper) {
}`,
    solutionCode: `function applyStickyFooterLayout(wrapper) {
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  const children = wrapper.children;
  children[1].style.flex = "1";
}`,
    testCases: [
      { input: "a 400px-tall wrapper with a short header, main, and footer", expected: "the footer's bottom edge sits exactly at the wrapper's bottom edge", label: "Pins the footer to the bottom even when content doesn't fill the wrapper" },
      { input: "the main content area", expected: "flex: 1 — the only child that grows", label: "Only the main area absorbs the leftover space; header and footer keep their natural size" },
    ],
    hints: [
      "flex-direction: column turns the vertical axis into the main axis, so flex: 1 on just the main child (not the header or footer) makes it the only one that grows to fill leftover space — pushing the footer down to the very bottom.",
    ],
    orderIndex: 1239,
  },

  {
    slug: "flex-child-min-width-zero-truncation",
    companies: ["Meta", "Google"],
    category: "css",
    title: "Flexbox Truncated Text Inside a Flex Child (the min-width: 0 Gotcha)",
    description: `A well-known gotcha: a flex item's \`min-width\` defaults to \`auto\`, which means "never shrink below your content's natural width" — so even with \`white-space: nowrap\`, \`overflow: hidden\`, and \`text-overflow: ellipsis\` already set, a flex child containing long text will still overflow its container instead of truncating, until you explicitly override that default.

## Your task

Write \`fixFlexChildTruncation(flexChild)\`, which is the one missing property needed to let \`flexChild\`'s already-configured ellipsis truncation actually take effect.

\`\`\`js
fixFlexChildTruncation(flexChild);
// flexChild.style.minWidth === "0"
// overrides the flex item's default min-width: auto, so it can finally
// shrink below its text's natural width — the existing ellipsis styles now apply
\`\`\``,
    difficulty: "medium",
    starterCode: `function fixFlexChildTruncation(flexChild) {
}`,
    solutionCode: `function fixFlexChildTruncation(flexChild) {
  flexChild.style.minWidth = "0";
}`,
    testCases: [
      { input: "a flex child with long nowrap text, inside a narrow flex container, before the fix", expected: "the child overflows the container's width despite already having text-overflow: ellipsis", label: "Demonstrates the bug: ellipsis alone doesn't truncate a flex child that refuses to shrink" },
      { input: "the same flex child, after fixFlexChildTruncation is applied", expected: "the child's rendered width no longer exceeds the container's width", label: "min-width: 0 lets the flex child actually shrink, letting the existing ellipsis styles finally take effect" },
    ],
    hints: [
      "The fix is exactly one property — min-width: 0 — overriding the flex item's default min-width: auto, which is what was blocking it from shrinking below its text's natural width in the first place.",
    ],
    orderIndex: 1240,
  },


  // ── css — standalone CSS Interview Question Roadmap, Stage 4 ───────────────
  {
    slug: "grid-layout-basic-columns",
    companies: ["Meta", "Amazon", "Google"],
    category: "css",
    title: "CSS Grid Layout 1: Equal Columns",
    description: `**CSS Grid**'s answer to an equal-width column layout, and the first thing worth comparing against the flexbox version: instead of setting \`flex\` on every child individually, Grid lets the parent declare all the column tracks in one \`grid-template-columns\` line, and every child just falls into place.

## Your task

Write \`applyGridLayoutOne(container)\`, laying \`container\`'s children out in 3 equal-width columns.

\`\`\`js
applyGridLayoutOne(container);
// container.style.display === "grid"
// container.style.gridTemplateColumns === "repeat(3, 1fr)"
// in a 300px-wide container, each of the 3 children renders exactly 100px wide
\`\`\``,
    difficulty: "medium",
    starterCode: `function applyGridLayoutOne(container) {
}`,
    solutionCode: `function applyGridLayoutOne(container) {
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(3, 1fr)";
}`,
    testCases: [
      { input: "a 300px-wide container with 3 children", expected: "each child is exactly 100px wide", label: "Splits the container into 3 exactly equal columns" },
      { input: "the same layout in a 600px-wide container", expected: "each child is exactly 200px wide", label: "Recomputes correctly for a different container width" },
    ],
    hints: [
      "repeat(3, 1fr) is shorthand for '1fr 1fr 1fr' — three equal flexible tracks that split the available width evenly.",
    ],
    orderIndex: 1241,
  },

  {
    slug: "grid-layout-sidebar-main",
    companies: ["Meta", "Amazon"],
    category: "css",
    title: "CSS Grid Layout 2: Fixed Sidebar + Flexible Main",
    description: `The **Grid** counterpart to the flexbox fixed-sidebar-plus-flexible-main pattern — instead of setting \`flex\` separately on two children, one \`grid-template-columns\` declaration on the parent defines both a fixed-width track and a \`1fr\` track that absorbs the rest.

## Your task

Write \`applyGridLayoutTwo(container, sidebarWidth)\`, giving \`container\` two columns: the 1st exactly \`sidebarWidth\` pixels wide, the 2nd filling the rest.

\`\`\`js
applyGridLayoutTwo(container, 150);
// container.style.display === "grid"
// container.style.gridTemplateColumns === "150px 1fr"
// in a 500px-wide container, column 1 renders 150px, column 2 renders 350px
\`\`\``,
    difficulty: "medium",
    isPremium: true,
    starterCode: `function applyGridLayoutTwo(container, sidebarWidth) {
}`,
    solutionCode: `function applyGridLayoutTwo(container, sidebarWidth) {
  container.style.display = "grid";
  container.style.gridTemplateColumns = sidebarWidth + "px 1fr";
}`,
    testCases: [
      { input: "applyGridLayoutTwo(container, 150) in a 500px-wide container", expected: "columns 150px and 350px", label: "The sidebar column takes exactly the given width, the main column takes the rest" },
      { input: "applyGridLayoutTwo(container, 250) in the same 500px-wide container", expected: "columns 250px and 250px", label: "Works correctly for a different sidebarWidth" },
    ],
    hints: [
      "gridTemplateColumns takes a space-separated track list directly as a string — \"150px 1fr\" is both tracks in one declaration.",
    ],
    orderIndex: 1242,
  },

  {
    slug: "grid-responsive-auto-fit-minmax",
    companies: ["Airbnb", "Pinterest", "Shopify"],
    category: "css",
    title: "Responsive Grid with auto-fill/auto-fit + minmax() (No Media Queries)",
    description: `The single-line responsive grid trick: \`repeat(auto-fit, minmax(min, 1fr))\` fits as many columns of at least \`min\` width as the container allows, wrapping extra items onto new rows automatically — no breakpoints needed.

## Your task

Write \`applyResponsiveGrid(container, minItemWidth)\`, laying out \`container\`'s children in as many \`minItemWidth\`-or-wider columns as fit, wrapping the rest onto new rows.

\`\`\`js
applyResponsiveGrid(container, 200);
// container.style.gridTemplateColumns === "repeat(auto-fit, minmax(200px, 1fr))"
// a 650px-wide container fits 3 columns per row; resized to 450px, only 2 fit —
// the column count recalculates with no media query involved
\`\`\``,
    difficulty: "medium",
    starterCode: `function applyResponsiveGrid(container, minItemWidth) {
}`,
    solutionCode: `function applyResponsiveGrid(container, minItemWidth) {
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(" + minItemWidth + "px, 1fr))";
}`,
    testCases: [
      { input: "a 650px-wide container, minItemWidth 200, with 5 children", expected: "3 columns fit per row — the first 3 children share a row, the remaining 2 wrap to the next", label: "Fits as many columns as the container allows, wrapping the rest" },
      { input: "the same container resized to 450px wide", expected: "only 2 columns fit per row now", label: "Recomputes the column count for a narrower container, with no media query involved" },
    ],
    hints: [
      "auto-fit (not a fixed repeat count) is what makes the column count itself responsive — the browser recalculates how many minItemWidth-or-wider tracks fit as the container's width changes.",
    ],
    orderIndex: 1243,
  },


  // ── css — standalone CSS Interview Question Roadmap, Stage 5 ───────────────
  {
    slug: "css-multi-column-text",
    companies: ["Amazon", "Adobe"],
    category: "css",
    title: "Multi-Column Text (CSS Multi-Column Layout)",
    description: `Splitting a long block of text into newspaper-style columns used to mean manually chopping it into separate elements — brittle the moment the content or container size changed. The **CSS multi-column** module does it with one property: give an element a \`column-count\`, and the browser reflows that same continuous text across that many columns, recalculating the breaks itself.

## Your task

Write \`applyMultiColumnText(el, columnCount)\`, flowing \`el\`'s text content across \`columnCount\` columns.

\`\`\`js
applyMultiColumnText(el, 3);
// el.style.columnCount === "3"
// el's text now flows across 3 newspaper-style columns, reflowed automatically
\`\`\``,
    difficulty: "medium",
    isPremium: true,
    starterCode: `function applyMultiColumnText(el, columnCount) {
}`,
    solutionCode: `function applyMultiColumnText(el, columnCount) {
  el.style.columnCount = String(columnCount);
}`,
    testCases: [
      { input: "applyMultiColumnText(el, 3)", expected: "column-count: 3", label: "Sets the element to flow its content across 3 columns" },
      { input: "applyMultiColumnText(el, 2)", expected: "column-count: 2", label: "Works correctly for a different column count" },
    ],
    hints: [
      "column-count is the whole trick here — the browser handles wrapping the text across that many columns on its own.",
    ],
    orderIndex: 1244,
  },

  {
    slug: "three-column-feed-layout",
    companies: ["Meta", "Amazon"],
    category: "css",
    title: "Three-Column Feed Layout (Nav | Feed | Sidebar)",
    description: `The layout behind most social feeds: a fixed-width nav column and a fixed-width sidebar bracket a main feed column that's capped at a maximum width (so it doesn't stretch to an unreadable line length on wide screens) — the whole group centered in the viewport.

## Your task

Write \`applyThreeColumnFeedLayout(container, navWidth, sidebarWidth, mainMaxWidth)\`, where \`container\` has exactly 3 children: nav (1st, fixed at \`navWidth\`), feed (2nd, capped at \`mainMaxWidth\` but never growing past it), sidebar (3rd, fixed at \`sidebarWidth\`).

\`\`\`js
applyThreeColumnFeedLayout(container, 250, 300, 600);
// container.style.display === "flex"; justifyContent === "center"
// in a wide (1200px) container: nav renders 250px, feed caps at 600px
// (flex: 0 1 600px + max-width: 600px), sidebar renders 300px
\`\`\``,
    difficulty: "medium",
    isPremium: true,
    starterCode: `function applyThreeColumnFeedLayout(container, navWidth, sidebarWidth, mainMaxWidth) {
}`,
    solutionCode: `function applyThreeColumnFeedLayout(container, navWidth, sidebarWidth, mainMaxWidth) {
  container.style.display = "flex";
  container.style.justifyContent = "center";
  const children = container.children;
  children[0].style.flex = "0 0 " + navWidth + "px";
  children[1].style.flex = "0 1 " + mainMaxWidth + "px";
  children[1].style.maxWidth = mainMaxWidth + "px";
  children[2].style.flex = "0 0 " + sidebarWidth + "px";
}`,
    testCases: [
      { input: "applyThreeColumnFeedLayout(container, 250, 300, 600) in a wide (1200px) container", expected: "widths 250px, 600px, 300px", label: "Nav and sidebar stay fixed; the feed caps at its max width instead of stretching to fill the extra space" },
    ],
    hints: [
      "flex: 0 1 mainMaxWidth (grow: 0) is what stops the feed column from stretching to fill leftover space — combine it with justify-content: center on the container so the whole capped-width group centers in the viewport instead of hugging the left edge.",
    ],
    orderIndex: 1245,
  },

  {
    slug: "holy-grail-layout",
    companies: ["Amazon", "Meta", "Microsoft", "Airbnb"],
    category: "css",
    title: "Holy Grail Layout",
    description: `The classic layout every CSS course eventually covers: a full-width header and footer, with a 3-column middle row — fixed-width nav, flexible main, fixed-width aside — where main visually sits between nav and aside.

## Your task

Write \`applyHolyGrailLayout(wrapper, navWidth, asideWidth)\`. \`wrapper\` has exactly 3 direct children: header, a middle row, and footer. The middle row itself has exactly 3 children: nav, main, aside. Header and footer should span the full width; nav and aside should be fixed at \`navWidth\`/\`asideWidth\`; main should fill whatever's left, sitting visually between them; the middle row should fill all vertical space left over between the header and footer.

\`\`\`js
applyHolyGrailLayout(wrapper, 150, 200);
// wrapper: display: flex; flexDirection: column
// middle row: flex: 1; display: flex (nav | main | aside)
// in an 800px-wide wrapper: nav renders 150px, aside renders 200px,
// main fills the remaining 450px, visually sitting between them
\`\`\``,
    difficulty: "medium",
    starterCode: `function applyHolyGrailLayout(wrapper, navWidth, asideWidth) {
}`,
    solutionCode: `function applyHolyGrailLayout(wrapper, navWidth, asideWidth) {
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  const middle = wrapper.children[1];
  middle.style.flex = "1";
  middle.style.display = "flex";
  const nav = middle.children[0];
  const main = middle.children[1];
  const aside = middle.children[2];
  nav.style.flex = "0 0 " + navWidth + "px";
  main.style.flex = "1";
  aside.style.flex = "0 0 " + asideWidth + "px";
}`,
    testCases: [
      { input: "applyHolyGrailLayout(wrapper, 150, 200) in an 800px-wide, 500px-tall wrapper with a 40px header and 40px footer", expected: "nav 150px, aside 200px, main 450px (800 - 150 - 200)", label: "Nav and aside stay fixed width; main fills exactly what's left" },
      { input: "the same layout", expected: "the middle row's height is 420px (500 - 40 header - 40 footer)", label: "The middle row absorbs all vertical space left over between header and footer" },
      { input: "the rendered nav, main, and aside", expected: "left-to-right order is nav, then main, then aside", label: "Main renders visually between nav and aside" },
    ],
    hints: [
      "This is two nested flex layouts: the outer wrapper is a column-direction flex (stacking header / middle / footer, with only the middle row flexible), and the middle row is itself a row-direction flex (nav / main / aside, with only main flexible) — the same fixed-flexible-fixed pattern as earlier stages, one level deeper.",
    ],
    orderIndex: 1246,
  },

  {
    slug: "responsive-product-card-grid",
    companies: ["Amazon", "Airbnb", "Shopify"],
    category: "css",
    title: "Responsive Product/Card Grid",
    description: `An e-commerce-style grid: a fixed number of equal-width columns with real gutter spacing between cards — the grid version of the layout, with an explicit column count rather than auto-fit's intrinsic wrapping.

## Your task

Write \`applyProductGrid(container, columns, gapPx)\`, laying \`container\`'s children out in exactly \`columns\` equal-width columns with \`gapPx\` of spacing between both rows and columns.

\`\`\`js
applyProductGrid(container, 3, 15);
// container.style.display === "grid"
// container.style.gridTemplateColumns === "repeat(3, 1fr)"
// container.style.gap === "15px"
// in a 630px-wide container, each card renders 200px wide — gaps are
// subtracted from the width before it's split into equal columns
\`\`\``,
    difficulty: "medium",
    starterCode: `function applyProductGrid(container, columns, gapPx) {
}`,
    solutionCode: `function applyProductGrid(container, columns, gapPx) {
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(" + columns + ", 1fr)";
  container.style.gap = gapPx + "px";
}`,
    testCases: [
      { input: "applyProductGrid(container, 3, 15) in a 630px-wide container", expected: "each card is 200px wide ((630 - 2×15) / 3)", label: "Column width correctly accounts for the gaps eaten out of the container's total width" },
      { input: "the same grid", expected: "adjacent cards' left edges are exactly 215px apart (200px card + 15px gap)", label: "Applies real gutter spacing between cards, not just between the columns' content" },
    ],
    hints: [
      "gap (not margin on each card) is what correctly excludes gutter space from the 1fr column-width calculation — margin-based gutters would make the columns overflow the container instead.",
    ],
    orderIndex: 1247,
  },


  // ── css — standalone CSS Interview Question Roadmap, Stage 6 ───────────────
  {
    slug: "golden-ratio-rectangle",
    companies: ["Adobe"],
    category: "css",
    title: "Golden-Ratio Rectangle",
    description: `Design systems lean on the **golden ratio** (≈1.618) constantly — for card proportions, hero images, and typographic scales — because a rectangle at that width-to-height ratio reads as naturally balanced rather than arbitrary. Design-systems-heavy interviews sometimes ask for the calculation directly instead of assuming you'll eyeball it.

## Your task

Write \`applyGoldenRatioRectangle(el, width)\`, setting \`el\`'s \`width\` to \`width\` pixels and its \`height\` so the width-to-height ratio is exactly 1.618.

\`\`\`js
applyGoldenRatioRectangle(el, 300);
// el.style.width === "300px"
// el.style.height === "185.4...px" (300 / 1.618, ≈185.4px)
\`\`\``,
    difficulty: "easy",
    isPremium: true,
    starterCode: `function applyGoldenRatioRectangle(el, width) {
}`,
    solutionCode: `function applyGoldenRatioRectangle(el, width) {
  el.style.width = width + "px";
  el.style.height = (width / 1.618) + "px";
}`,
    testCases: [
      { input: "applyGoldenRatioRectangle(el, 300)", expected: "width 300px, height ≈185.4px (300 / 1.618)", label: "Height is derived from width divided by the golden ratio" },
      { input: "applyGoldenRatioRectangle(el, 500)", expected: "width 500px, height ≈309px", label: "Recomputes correctly for a different width, not a fixed height" },
    ],
    hints: [
      "height = width / 1.618 — the ratio is the entire calculation here.",
    ],
    orderIndex: 1248,
  },

  {
    slug: "css-triangle-border-trick",
    companies: [],
    category: "css",
    title: "CSS-Only Triangle/Arrow Shapes (the Border Trick)",
    description: `Before \`clip-path\` and ubiquitous SVG, arrows and triangles for tooltips, dropdown carets, and speech bubbles were built entirely out of **borders**. Collapse an element's width and height to 0, then give it a border on one side only, with the other two sides transparent — the borders still meet at 45° angles the way a picture frame's corners do, and a zero-size box means the solid edge tapers to a single point.

## Your task

Write \`applyCssTriangle(el, size, color)\`, turning \`el\` into an upward-pointing triangle of \`color\`, \`size\` pixels wide at its base.

\`\`\`js
applyCssTriangle(el, 20, "red");
// el.style.width === "0"; el.style.height === "0"
// el.style.borderLeft/borderRight === "20px solid transparent"
// el.style.borderBottom === "20px solid red"
// renders as an upward-pointing red triangle, 40px wide at its base
\`\`\``,
    difficulty: "easy",
    isPremium: true,
    starterCode: `function applyCssTriangle(el, size, color) {
}`,
    solutionCode: `function applyCssTriangle(el, size, color) {
  el.style.width = "0";
  el.style.height = "0";
  el.style.borderLeft = size + "px solid transparent";
  el.style.borderRight = size + "px solid transparent";
  el.style.borderBottom = size + "px solid " + color;
}`,
    testCases: [
      { input: "applyCssTriangle(el, 20, 'red')", expected: "width and height are both 0px", label: "The element itself has zero content size — the shape comes entirely from its borders" },
      { input: "applyCssTriangle(el, 20, 'red')", expected: "border-bottom-color is red, border-left-color and border-right-color are transparent", label: "Only the bottom border is colored — the other two are transparent, which is what forms the visible point" },
    ],
    hints: [
      "The two transparent side borders aren't invisible decoration — they're doing real geometric work, forcing the colored bottom border to taper to a point instead of staying a flat-topped trapezoid.",
    ],
    orderIndex: 1249,
  },

  {
    slug: "custom-checkbox-style",
    companies: ["Meta", "Amazon", "Stripe"],
    category: "css",
    title: "Different Checkbox Style (Custom-Styled Checkbox)",
    description: `Restyling a native checkbox from scratch: strip the browser's default rendering with \`appearance: none\`, draw your own box, and use the real \`:checked\` pseudo-class — not JavaScript — to swap its appearance when checked.

## Your task

Write \`applyCustomCheckbox(checkboxEl)\`, which strips \`checkboxEl\`'s native appearance and gives it a custom square look: a light border and white background unchecked, a dark background once checked.

\`\`\`js
applyCustomCheckbox(checkboxEl);
// checkboxEl gets class "custom-checkbox"; an injected stylesheet sets
// appearance: none, a bordered box, and a white background unchecked
// once checkboxEl.checked becomes true, the injected :checked rule
// switches its background-color to the dark checked color — no JS style-swap needed
\`\`\``,
    difficulty: "medium",
    starterCode: `function applyCustomCheckbox(checkboxEl) {
}`,
    solutionCode: `function applyCustomCheckbox(checkboxEl) {
  const style = document.createElement("style");
  style.textContent = \`
    input.custom-checkbox { appearance: none; width: 20px; height: 20px; border: 2px solid #666; border-radius: 4px; background-color: rgb(255, 255, 255); }
    input.custom-checkbox:checked { background-color: rgb(51, 51, 51); }
  \`;
  document.head.appendChild(style);
  checkboxEl.classList.add("custom-checkbox");
}`,
    testCases: [
      { input: "applyCustomCheckbox(checkboxEl), unchecked", expected: "background-color is white", label: "Renders with a white background before it's checked" },
      { input: "checkboxEl.checked set to true (programmatically, then a change event dispatched)", expected: "background-color becomes the dark checked color", label: "The real :checked pseudo-class reacts to the checkbox's actual checked state, no JS style-swapping needed" },
    ],
    hints: [
      "The checked-state styling has to come from a real :checked CSS rule in an injected stylesheet — inline styles set via el.style can't target a pseudo-class at all.",
    ],
    orderIndex: 1250,
  },

  {
    slug: "css-toggle-switch",
    companies: ["Stripe", "Airbnb"],
    category: "css",
    title: "Build a CSS-Only Toggle Switch",
    description: `The iOS-style toggle switch, built from a hidden checkbox plus a styled sibling: the checkbox's real \`:checked\` state drives the visible slider's position via the adjacent-sibling combinator (\`:checked + .toggle-slider\`) — no JavaScript needed for the visual state at all.

## Your task

Write \`applyToggleSwitch(rootEl)\`, where \`rootEl\` contains a checkbox (\`.toggle-input\`) immediately followed by a slider element (\`.toggle-slider\`). Style the slider so it slides \`20px\` to the right exactly when the checkbox becomes checked.

\`\`\`js
applyToggleSwitch(rootEl);
// injects a rule: .toggle-input:checked + .toggle-slider { transform: translateX(20px); }
// while unchecked, the slider's transform is none
// once the checkbox is checked, the slider slides 20px to the right automatically
\`\`\``,
    difficulty: "medium",
    isPremium: true,
    starterCode: `function applyToggleSwitch(rootEl) {
}`,
    solutionCode: `function applyToggleSwitch(rootEl) {
  const style = document.createElement("style");
  style.textContent = \`
    .toggle-slider { display: inline-block; width: 40px; height: 20px; background: #ccc; border-radius: 10px; position: relative; transition: transform 0.2s; }
    .toggle-input { display: none; }
    .toggle-input:checked + .toggle-slider { transform: translateX(20px); }
  \`;
  document.head.appendChild(style);
}`,
    testCases: [
      { input: "applyToggleSwitch(rootEl), checkbox unchecked", expected: "the slider's transform is none", label: "The slider sits in its resting position while unchecked" },
      { input: "the checkbox's checked state set to true and a change event dispatched, waited past the transition", expected: "the slider's transform translates it 20px to the right", label: "The adjacent-sibling :checked selector moves the slider automatically — no JS needed to touch the slider directly" },
    ],
    hints: [
      "The checkbox and slider must be immediate siblings in that exact order for the + combinator (:checked + .toggle-slider) to match at all.",
    ],
    orderIndex: 1251,
  },

  {
    slug: "css-close-button-x",
    companies: ["Meta", "Amazon"],
    category: "css",
    title: 'Close Button in CSS (an "X" from Pure CSS)',
    description: `Modals, toasts, and dismissible banners all need a close button, and shipping one as an image or SVG for something this simple is overkill. The classic pure-CSS trick builds the **X** entirely out of two \`::before\`/\`::after\` pseudo-element bars, rotated ±45° so they cross at the center — zero markup, zero image requests.

## Your task

Write \`applyCloseButtonX(el)\`, giving \`el\` two pseudo-element bars — one rotated 45°, the other -45° — that together form an X.

\`\`\`js
applyCloseButtonX(el);
// el gets class "close-btn"; ::before and ::after are injected with content: ""
// ::before gets transform: rotate(45deg); ::after gets transform: rotate(-45deg)
// the two bars cross at the center, forming an "X" with zero extra markup
\`\`\``,
    difficulty: "medium",
    isPremium: true,
    starterCode: `function applyCloseButtonX(el) {
}`,
    solutionCode: `function applyCloseButtonX(el) {
  const style = document.createElement("style");
  style.textContent = \`
    .close-btn { position: relative; width: 20px; height: 20px; }
    .close-btn::before, .close-btn::after {
      content: "";
      position: absolute;
      top: 9px;
      left: 0;
      width: 20px;
      height: 2px;
      background: #000;
    }
    .close-btn::before { transform: rotate(45deg); }
    .close-btn::after { transform: rotate(-45deg); }
  \`;
  document.head.appendChild(style);
  el.classList.add("close-btn");
}`,
    testCases: [
      { input: "applyCloseButtonX(el)", expected: "both ::before and ::after have content: \"\" (generated, not real DOM elements)", label: "Both bars are generated content, not extra real elements" },
      { input: "applyCloseButtonX(el)", expected: "::before and ::after are rotated in opposite directions", label: "The two bars rotate oppositely, which is what makes them cross into an X" },
    ],
    hints: [
      "content: \"\" is required on both pseudo-elements — without it, ::before/::after don't generate a box at all, regardless of any other styles you give them.",
    ],
    orderIndex: 1252,
  },

  {
    slug: "css-doughnut-chart",
    companies: ["Stripe", "Bloomberg"],
    category: "css",
    title: "Doughnut Chart (Pure CSS, No SVG/Canvas)",
    description: `A \`conic-gradient\` — a gradient that sweeps colors around a center point like a clock face, instead of across a straight line the way \`linear-gradient\` does — sliced into colored segments, with a smaller circle layered on top to punch a hole through the middle: the entire chart built from two \`border-radius: 50%\` circles and zero drawing APIs.

## Your task

Write \`applyDoughnutChart(el, segments)\`, where \`segments\` is an array of \`{ color, percent }\` (percentages summing to 100). Paint \`el\` as a circular conic-gradient sliced according to \`segments\`, then punch a hole through the middle with a smaller centered circle.

\`\`\`js
applyDoughnutChart(el, [{ color: "red", percent: 40 }, { color: "blue", percent: 60 }]);
// el.style.background === "conic-gradient(red 0% 40%, blue 40% 100%)"
// el.style.borderRadius === "50%"
// a smaller white circle is appended and centered on top of el,
// punching a hole through the middle to form the doughnut ring
\`\`\``,
    difficulty: "medium",
    isPremium: true,
    starterCode: `function applyDoughnutChart(el, segments) {
}`,
    solutionCode: `function applyDoughnutChart(el, segments) {
  let cumulative = 0;
  const stops = [];
  segments.forEach((seg) => {
    const start = cumulative;
    cumulative += seg.percent;
    stops.push(seg.color + " " + start + "% " + cumulative + "%");
  });
  el.style.background = "conic-gradient(" + stops.join(", ") + ")";
  el.style.borderRadius = "50%";
  el.style.position = "relative";
  const hole = document.createElement("div");
  hole.style.position = "absolute";
  hole.style.top = "25%";
  hole.style.left = "25%";
  hole.style.width = "50%";
  hole.style.height = "50%";
  hole.style.borderRadius = "50%";
  hole.style.background = "white";
  el.appendChild(hole);
}`,
    testCases: [
      { input: "applyDoughnutChart(el, [{color:'red',percent:40},{color:'blue',percent:60}])", expected: "background is a conic-gradient built from the segments", label: "Paints a conic-gradient with stops derived from the segments' cumulative percentages" },
      { input: "el", expected: "border-radius: 50%", label: "The outer shape is a full circle" },
      { input: "el's rendered result", expected: "a smaller circular hole element is layered on top, centered", label: "Punches a hole through the middle to give the doughnut shape, not a solid pie" },
    ],
    hints: [
      "Each segment's gradient stop needs both its start and end percentage — track a running cumulative total as you iterate segments so each slice picks up exactly where the last one left off.",
    ],
    orderIndex: 1253,
  },


  // ── css — standalone CSS Interview Question Roadmap, Stage 7 ───────────────
  {
    slug: "object-fit-image-fitting",
    companies: ["Amazon", "Airbnb", "Pinterest"],
    category: "css",
    title: "Fit the Image (object-fit Exercises)",
    description: `Dropping a real photo into a fixed-size box — a thumbnail, an avatar, a card image — almost always means the image's natural aspect ratio doesn't match the box, and squishing it with \`width\`/\`height\` alone distorts it. **\`object-fit\`** controls how the image's content fills that box instead: crop-to-fill (\`cover\`), shrink-to-fit-inside (\`contain\`), or stretch-to-match (\`fill\`) — without touching the image file itself.

## Your task

Write \`applyObjectFit(imgEl, containerWidth, containerHeight, fitMode)\`, sizing \`imgEl\` to exactly \`containerWidth\`×\`containerHeight\` and applying \`fitMode\` as its \`object-fit\`.

\`\`\`js
applyObjectFit(imgEl, 300, 200, "cover");
// imgEl.style.width === "300px"; imgEl.style.height === "200px"
// imgEl.style.objectFit === "cover"
// the image now crops to fill the 300×200 box without distorting it
\`\`\``,
    difficulty: "medium",
    starterCode: `function applyObjectFit(imgEl, containerWidth, containerHeight, fitMode) {
}`,
    solutionCode: `function applyObjectFit(imgEl, containerWidth, containerHeight, fitMode) {
  imgEl.style.width = containerWidth + "px";
  imgEl.style.height = containerHeight + "px";
  imgEl.style.objectFit = fitMode;
}`,
    testCases: [
      { input: "applyObjectFit(imgEl, 300, 200, 'cover')", expected: "the image box is exactly 300×200px, object-fit: cover", label: "Sizes the box to the given dimensions and applies the requested fit mode" },
      { input: "applyObjectFit(imgEl, 300, 200, 'contain')", expected: "object-fit: contain", label: "Works correctly for a different fit mode, not hardcoded to one" },
    ],
    hints: [
      "object-fit only has an effect once the element actually has an explicit width and height that differ from the image's own natural aspect ratio — set both before relying on it.",
    ],
    orderIndex: 1254,
  },

  {
    slug: "responsive-image-aspect-ratio",
    companies: ["Meta", "Airbnb"],
    category: "css",
    title: "Responsive Image Sizing with aspect-ratio (No Padding-Hack Needed)",
    description: `The old way to reserve space for an image before it loads (and avoid layout shift) was the "padding-top percentage hack." The \`aspect-ratio\` property replaces that trick with one direct, readable declaration.

## Your task

Write \`applyAspectRatio(el, ratioWidth, ratioHeight)\`, making \`el\` always \`100%\` of its container's width, with its height locked to the \`ratioWidth\`:\`ratioHeight\` aspect ratio.

\`\`\`js
applyAspectRatio(el, 16, 9);
// el.style.width === "100%"; el.style.aspectRatio === "16 / 9"
// inside a 400px-wide container, el renders 400px × 225px (400 × 9/16)
\`\`\``,
    difficulty: "medium",
    isPremium: true,
    starterCode: `function applyAspectRatio(el, ratioWidth, ratioHeight) {
}`,
    solutionCode: `function applyAspectRatio(el, ratioWidth, ratioHeight) {
  el.style.width = "100%";
  el.style.aspectRatio = ratioWidth + " / " + ratioHeight;
}`,
    testCases: [
      { input: "applyAspectRatio(el, 16, 9) inside a 400px-wide container", expected: "width 400px, height ≈225px (400 × 9/16)", label: "Height is derived from the container's real width and the given ratio" },
      { input: "applyAspectRatio(el, 1, 1) inside the same 400px-wide container", expected: "width 400px, height 400px", label: "Works correctly for a square ratio, not hardcoded to 16:9" },
    ],
    hints: [
      "aspect-ratio takes 'width / height' as a single CSS value — the browser derives the actual height from whatever width the element ends up with.",
    ],
    orderIndex: 1255,
  },

  {
    slug: "background-size-cover-vs-contain",
    companies: [],
    category: "css",
    title: "background-size: cover vs. contain",
    description: `The two most-used \`background-size\` keywords, and the distinction interviewers actually want to hear: \`cover\` scales the image up to fill the box entirely (cropping whatever overflows), while \`contain\` scales it down to fit entirely inside the box (leaving empty space if the aspect ratios don't match).

## Your task

Write \`applyBackgroundSize(el, mode)\`, setting \`el\`'s \`background-size\` to \`mode\`.

\`\`\`js
applyBackgroundSize(el, "cover");
// el.style.backgroundSize === "cover" — scales up to fill the box, cropping overflow

applyBackgroundSize(el, "contain");
// el.style.backgroundSize === "contain" — scales down to fit inside, may letterbox
\`\`\``,
    difficulty: "easy",
    isPremium: true,
    starterCode: `function applyBackgroundSize(el, mode) {
}`,
    solutionCode: `function applyBackgroundSize(el, mode) {
  el.style.backgroundSize = mode;
}`,
    testCases: [
      { input: "applyBackgroundSize(el, 'cover')", expected: "background-size: cover", label: "Applies cover, which crops to fill the box" },
      { input: "applyBackgroundSize(el, 'contain')", expected: "background-size: contain", label: "Applies contain, which fits entirely inside the box instead" },
    ],
    hints: [
      "This one really is a one-line function — the depth of this question is entirely in explaining the difference out loud, not in the code.",
    ],
    orderIndex: 1256,
  },


  // ── css — standalone CSS Interview Question Roadmap, Stage 8 ───────────────
  {
    slug: "native-input-accent-color",
    companies: ["Stripe", "Amazon"],
    category: "css",
    title: "Color of Input Elements (Styling Native Form Controls)",
    description: `Rebuilding a checkbox or radio from scratch with \`appearance: none\` and pseudo-elements is a lot of ceremony just to change its color — and it costs you the native focus ring and keyboard behavior unless you rebuild those too. **\`accent-color\`** restyles a native checkbox, radio, or range input's own checked/filled color directly, in one property, while keeping all of its native behavior intact.

## Your task

Write \`applyAccentColor(inputEl, color)\`, setting \`inputEl\`'s \`accent-color\` to \`color\`.

\`\`\`js
applyAccentColor(inputEl, "red");
// inputEl.style.accentColor resolves to rgb(255, 0, 0)
// the checkbox/radio/range's own checked or filled color becomes red,
// while its native focus ring and keyboard behavior stay untouched
\`\`\``,
    difficulty: "medium",
    isPremium: true,
    starterCode: `function applyAccentColor(inputEl, color) {
}`,
    solutionCode: `function applyAccentColor(inputEl, color) {
  inputEl.style.accentColor = color;
}`,
    testCases: [
      { input: "applyAccentColor(inputEl, 'red')", expected: "accent-color resolves to rgb(255, 0, 0)", label: "Sets the native control's accent color directly" },
    ],
    hints: [
      "accent-color is a real standalone CSS property (not a vendor-prefixed hack) — no appearance: none or pseudo-elements required for this simpler case.",
    ],
    orderIndex: 1257,
  },

  {
    slug: "css-counter-list-numbering",
    companies: ["Amazon", "Meta"],
    category: "css",
    title: "List Numbering (Custom counter-reset/counter-increment)",
    description: `Native ordered-list numbering isn't your only option — CSS counters let you drive custom numbering (with your own formatting around the number) purely through \`counter-reset\`, \`counter-increment\`, and \`content: counter(...)\` on a generated pseudo-element.

## Your task

Write \`applyCustomCounter(listEl, counterName)\`, setting up \`listEl\` (and each of its direct children) so every child is automatically numbered via a CSS counter named \`counterName\`, with the number rendered before each child's content.

\`\`\`js
applyCustomCounter(listEl, "item");
// listEl.style.counterReset === "item 0"
// each direct child gets class "item-item" with counter-increment: item
// and an injected ::before rule with content: counter(item)
// — children now render numbered "1. ", "2. ", "3. " automatically
\`\`\``,
    difficulty: "medium",
    isPremium: true,
    starterCode: `function applyCustomCounter(listEl, counterName) {
}`,
    solutionCode: `function applyCustomCounter(listEl, counterName) {
  listEl.style.counterReset = counterName + " 0";
  const style = document.createElement("style");
  style.textContent =
    "." + counterName + "-item { counter-increment: " + counterName + "; } " +
    "." + counterName + "-item::before { content: counter(" + counterName + ") \\". \\"; }";
  document.head.appendChild(style);
  Array.from(listEl.children).forEach((li) => li.classList.add(counterName + "-item"));
}`,
    testCases: [
      { input: "applyCustomCounter(listEl, 'item')", expected: "listEl has counter-reset: item 0", label: "Initializes the named counter on the list container" },
      { input: "each of listEl's children", expected: "counter-increment: item", label: "Each child increments the counter by one" },
      { input: "each child's ::before", expected: "a content value built from counter(item)", label: "Each child's generated content actually reads from the counter" },
    ],
    hints: [
      "counter-reset lives on the shared ancestor (once), while counter-increment lives on every item that should advance the count (repeated) — mixing those two up is the most common bug with CSS counters.",
    ],
    orderIndex: 1258,
  },

  {
    slug: "nth-child-row-striping",
    companies: ["Meta", "Amazon", "Google"],
    category: "css",
    title: '"a Row" (nth-child Selectors)',
    description: `**Zebra-striping** a table or list — alternating row background colors for readability — used to mean looping over rows in JS and toggling a class on every other one. \`:nth-child(even)\` does the same job as a pure CSS selector, matching every second element with no markup changes and no JS at all.

## Your task

Write \`applyRowStriping(listEl, stripeColor)\`, giving every even-positioned direct child of \`listEl\` a \`stripeColor\` background.

\`\`\`js
applyRowStriping(listEl, "rgb(240, 240, 240)");
// listEl gets class "striped-list"; injects
// ".striped-list > *:nth-child(even) { background-color: rgb(240, 240, 240); }"
// in a 4-child list, the 2nd and 4th children get the stripe, the 1st and 3rd don't
\`\`\``,
    difficulty: "medium",
    starterCode: `function applyRowStriping(listEl, stripeColor) {
}`,
    solutionCode: `function applyRowStriping(listEl, stripeColor) {
  const style = document.createElement("style");
  style.textContent = ".striped-list > *:nth-child(even) { background-color: " + stripeColor + "; }";
  document.head.appendChild(style);
  listEl.classList.add("striped-list");
}`,
    testCases: [
      { input: "a 4-child list, applyRowStriping(listEl, 'rgb(240, 240, 240)')", expected: "the 2nd and 4th children are striped, the 1st and 3rd are not", label: "Only even-positioned children receive the stripe color" },
    ],
    hints: [
      ":nth-child(even) counts from 1 and includes ALL element types among the children by default — the > combinator scoped to listEl's direct children is what keeps this from also matching further-nested descendants.",
    ],
    orderIndex: 1259,
  },

  {
    slug: "selection-pseudo-element-style",
    companies: ["Meta"],
    category: "css",
    title: "Fragment Style (::selection Styling)",
    description: `Every browser ships a default text-selection highlight — the flat blue box you get from click-dragging over text — and most sites never touch it. **\`::selection\`** is the pseudo-element that lets you restyle it to match your brand instead of leaving the OS default, a small detail that's easy to forget exists as a styling hook at all.

## Your task

Write \`applySelectionStyle(el, bgColor)\`, giving \`el\`'s selected-text highlight a \`bgColor\` background.

\`\`\`js
applySelectionStyle(el, "rgb(255, 200, 0)");
// el gets class "selectable"; injects ".selectable::selection { background-color: rgb(255, 200, 0); }"
// selecting el's text now highlights it in that color instead of the browser default
\`\`\``,
    difficulty: "medium",
    isPremium: true,
    starterCode: `function applySelectionStyle(el, bgColor) {
}`,
    solutionCode: `function applySelectionStyle(el, bgColor) {
  const style = document.createElement("style");
  style.textContent = ".selectable::selection { background-color: " + bgColor + "; }";
  document.head.appendChild(style);
  el.classList.add("selectable");
}`,
    testCases: [
      { input: "applySelectionStyle(el, 'rgb(255, 200, 0)')", expected: "el's ::selection background-color is rgb(255, 200, 0)", label: "Restyles the text-selection highlight, not the element's own background" },
    ],
    hints: [
      "::selection has to be written as a real CSS rule in a stylesheet — there's no el.style property for it, since it targets a browser-generated pseudo-element rather than the element itself.",
    ],
    orderIndex: 1260,
  },

  {
    slug: "custom-scrollbar-styling",
    companies: ["Airbnb", "Pinterest", "TikTok"],
    category: "css",
    title: "Custom Scrollbar Styling (::-webkit-scrollbar + scrollbar-color)",
    description: `Restyling the scrollbar itself: WebKit/Blink browsers use \`::-webkit-scrollbar\` and its sub-elements, while Firefox uses the standardized \`scrollbar-color\`/\`scrollbar-width\` properties instead — a real cross-browser answer needs both.

## Your task

Write \`getCustomScrollbarCss()\`, returning a CSS text string (as it would appear in a stylesheet) for a \`.custom-scroll\` element with a thin, rounded, gray-thumbed scrollbar — covering both the WebKit pseudo-elements and the standard Firefox properties.

\`\`\`js
getCustomScrollbarCss();
// returns a string containing all of:
// ".custom-scroll::-webkit-scrollbar { width: 10px; }"
// ".custom-scroll::-webkit-scrollbar-thumb { background: #888; border-radius: 5px; }"
// ".custom-scroll { scrollbar-color: #888 transparent; scrollbar-width: thin; }"
\`\`\``,
    difficulty: "medium",
    starterCode: `function getCustomScrollbarCss() {
}`,
    solutionCode: `function getCustomScrollbarCss() {
  return (
    ".custom-scroll::-webkit-scrollbar { width: 10px; } " +
    ".custom-scroll::-webkit-scrollbar-thumb { background: #888; border-radius: 5px; } " +
    ".custom-scroll { scrollbar-color: #888 transparent; scrollbar-width: thin; }"
  );
}`,
    testCases: [
      { input: "getCustomScrollbarCss()", expected: "includes a ::-webkit-scrollbar rule setting a width", label: "Covers the WebKit/Blink scrollbar track" },
      { input: "getCustomScrollbarCss()", expected: "includes a ::-webkit-scrollbar-thumb rule", label: "Covers the WebKit/Blink scrollbar thumb specifically, not just the track" },
      { input: "getCustomScrollbarCss()", expected: "includes scrollbar-color and scrollbar-width", label: "Also covers Firefox's standardized scrollbar properties, not just the WebKit-only ones" },
    ],
    hints: [
      "Neither technique alone is cross-browser — ::-webkit-scrollbar is ignored by Firefox, and scrollbar-color/scrollbar-width are ignored by Chrome/Safari, so a real answer needs both sets of rules together.",
    ],
    orderIndex: 1261,
  },

  {
    slug: "css-specificity-cascade-order",
    companies: ["Google", "Meta", "Amazon"],
    category: "css",
    title: "CSS Specificity/Cascade Puzzle (Predict Which Rule Wins)",
    description: `The most common "explain why this doesn't work" question in CSS: given several rules that target the same element, which declaration actually wins? The cascade decides it by **specificity**, not by which rule "looks" more important.

## The problem

Specificity is compared as a tuple, most-specific category first — (inline styles, IDs, classes/attributes/pseudo-classes, elements/pseudo-elements) — comparing one category at a time. Only when two rules tie *exactly* across every category does the cascade fall back to **source order**, where the later rule in the stylesheet wins.

## Your task

Write \`sortBySpecificity(rules)\`, where \`rules\` is an array of \`[idCount, classCount, elementCount]\` specificity tuples, listed in their original source order. Return the original indices sorted from **lowest to highest** cascade precedence — ties (equal specificity) must keep their original relative order, so the winner of a tied pair is whichever one appears later in \`rules\`.

\`\`\`js
sortBySpecificity([[0, 1, 0], [1, 0, 0], [0, 0, 1]]);
// => [2, 0, 1]
// an element selector (index 2) loses to a class (index 0),
// which loses to an ID (index 1) — lowest specificity first, winner last
\`\`\``,
    difficulty: "medium",
    starterCode: `function sortBySpecificity(rules) {
}`,
    solutionCode: `function sortBySpecificity(rules) {
  return rules
    .map((specificity, index) => ({ specificity, index }))
    .sort((a, b) => {
      for (let i = 0; i < 3; i++) {
        if (a.specificity[i] !== b.specificity[i]) return a.specificity[i] - b.specificity[i];
      }
      return 0;
    })
    .map((entry) => entry.index);
}`,
    testCases: [
      { input: "sortBySpecificity([[0,1,0], [1,0,0], [0,0,1]]) — a class, an ID, an element", expected: "[2, 0, 1] — element lowest, then class, then ID highest", label: "Orders strictly by the specificity tuple when there are no ties" },
      { input: "sortBySpecificity([[0,1,0], [0,1,0]]) — two rules of identical specificity", expected: "[0, 1] — original order preserved, so index 1 (later in source) is the actual winner", label: "Ties are broken by keeping source order — the later rule wins" },
      { input: "the last element of sortBySpecificity(rules)", expected: "the index of whichever rule actually wins the cascade", label: "The last entry in the returned order is always the winning rule" },
    ],
    hints: [
      "Compare the tuple element-by-element (IDs first, then classes, then elements) and only fall through to the next element when the current one ties — and when everything ties, return 0 so the sort stays stable and preserves source order.",
    ],
    orderIndex: 1262,
  },

  {
    slug: "sub-pixel-half-border-trick",
    companies: ["Meta", "Airbnb"],
    category: "css",
    title: "0.5px Border (Sub-Pixel Border on High-DPI Screens)",
    description: `A well-known trick question: on a high-DPI (Retina) screen, a hairline **0.5px border** reads noticeably crisper than the usual 1px border — but browsers won't reliably render a literal \`0.5px\` border-width value.

## The problem

Setting \`border-width: 0.5px\` directly rounds inconsistently across browsers and device pixel ratios — sometimes down to 0 (no border at all), sometimes back up to a full 1px — so it can't be trusted to actually produce a half-pixel line.

## The idea

Draw a full, reliably-rendered \`1px\` border on a pseudo-element sized at 200% of the real element, then shrink that whole pseudo-element by half with \`transform: scale(0.5)\`. The border renders at a full 1px in its own coordinate space, but appears at exactly half that width once the transform scales it down.

## Your task

Write \`applyHalfPixelBorder(el, color)\`, giving \`el\` a visually half-width border of \`color\` using the scale-transform technique — not a literal \`0.5px\` border width.

\`\`\`js
applyHalfPixelBorder(el, "red");
// el.style.position === "relative"; el gets class "half-border-el"
// an injected ::after rule draws a real 1px red border on a
// 200%-sized pseudo-element, then transform: scale(0.5) shrinks it —
// the border renders visually at half width, without a literal 0.5px value
\`\`\``,
    difficulty: "hard",
    isPremium: true,
    starterCode: `function applyHalfPixelBorder(el, color) {
}`,
    solutionCode: `function applyHalfPixelBorder(el, color) {
  el.style.position = "relative";
  const style = document.createElement("style");
  style.textContent =
    ".half-border-el::after { content: \\"\\"; position: absolute; top: 0; left: 0; " +
    "width: 200%; height: 200%; border: 1px solid " + color + "; " +
    "transform: scale(0.5); transform-origin: top left; box-sizing: border-box; pointer-events: none; }";
  document.head.appendChild(style);
  el.classList.add("half-border-el");
}`,
    testCases: [
      { input: "applyHalfPixelBorder(el, 'red')", expected: "the ::after pseudo-element has a real, full 1px border width — not 0.5px", label: "The border itself is drawn at a full, reliably-rendered 1px width" },
      { input: "applyHalfPixelBorder(el, 'red')", expected: "the ::after pseudo-element has transform: scale(0.5) applied", label: "The visual half-width effect comes from scaling the whole pseudo-element down, not from the border-width value itself" },
    ],
    hints: [
      "Never set border-width to 0.5px directly — sub-pixel border widths round inconsistently across browsers/DPI. Draw a real 1px border on a 2×-sized pseudo-element instead, then shrink the whole thing by half with a transform.",
    ],
    orderIndex: 1263,
  },

  {
    slug: "scrollable-centered-modal",
    companies: ["Amazon", "Stripe", "Airbnb"],
    category: "css",
    title: "Modal with Max Height (Scrollable, Centers, Clips to Viewport)",
    description: `A modal whose content might be much taller than the viewport needs two things at once: it has to stay centered on screen, and its own content has to scroll internally once it hits a height cap — instead of overflowing off both edges of the viewport.

## Your task

Write \`applyScrollableModal(overlay, modal)\`. \`overlay\` should cover the full viewport and center \`modal\` within it, both horizontally and vertically; \`modal\` itself should never exceed \`80vh\` tall, scrolling its own content internally past that.

\`\`\`js
applyScrollableModal(overlay, modal);
// overlay: position: fixed; top/left/right/bottom: 0;
// display: flex; align-items: center; justify-content: center;
// modal: max-height: 80vh; overflow-y: auto;
// the modal stays centered on screen and scrolls its own content
// once that content exceeds 80% of the viewport height
\`\`\``,
    difficulty: "hard",
    starterCode: `function applyScrollableModal(overlay, modal) {
}`,
    solutionCode: `function applyScrollableModal(overlay, modal) {
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.right = "0";
  overlay.style.bottom = "0";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  modal.style.maxHeight = "80vh";
  modal.style.overflowY = "auto";
}`,
    testCases: [
      { input: "a modal containing content far taller than the viewport", expected: "the modal's rendered height never exceeds 80% of the viewport height", label: "Clips the modal to a maximum of 80vh regardless of how tall its content is" },
      { input: "the same modal", expected: "it's centered both horizontally and vertically within the viewport", label: "Stays centered on screen even though its content overflows internally" },
    ],
    hints: [
      "The centering (on the overlay) and the height-clamping (on the modal) are two independent pieces — max-height + overflow-y: auto alone won't center anything, and flex centering alone won't stop the modal from growing past the viewport.",
    ],
    orderIndex: 1264,
  }
];
