import type { UiBattleChallengeSeed } from "./types";

// Feature 53's pilot challenge — proves the full Playground → UI Battles
// pipeline end-to-end (list thumbnail, login-gated editor, live target vs.
// live output compare pane). Remaining challenges are a separate,
// user-supplied content pass, same precedent as Feature 49's pilot-then-
// full-run. Slug matches the teaser already referenced in
// features/playground/lib/previewData.ts before this feature shipped.
export const UI_BATTLE_CHALLENGES: UiBattleChallengeSeed[] = [
  {
    slug: "login-card-recreate",
    title: "Login Card",
    description:
      "Recreate this login card pixel-for-pixel using vanilla HTML, CSS, and JavaScript. Pay attention to spacing, the input focus states, and the button's click interaction — clicking \"Sign In\" should change its own label.",
    difficulty: "easy",
    targetImageUrl: "/playground/battles/login-card-recreate.png",
    targetWidth: 400,
    targetHeight: 480,
    targetHtml: `<div class="card">
  <h1>Welcome back</h1>
  <p class="subtitle">Sign in to your account</p>
  <label for="email">Email</label>
  <input id="email" type="email" placeholder="you@example.com" />
  <label for="password">Password</label>
  <input id="password" type="password" placeholder="••••••••" />
  <button id="signin">Sign In</button>
</div>
`,
    targetCss: `* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef1f6;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.card {
  width: 320px;
  padding: 32px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
}
.card h1 {
  margin: 0;
  font-size: 22px;
  color: #0f172a;
}
.subtitle {
  margin: 6px 0 18px;
  font-size: 14px;
  color: #64748b;
}
label {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  margin-top: 10px;
}
input {
  margin-top: 6px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  font-family: inherit;
}
input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}
button {
  margin-top: 20px;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #4f46e5;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
button:hover {
  background: #4338ca;
}
`,
    targetJs: `document.getElementById("signin").addEventListener("click", function () {
  var btn = document.getElementById("signin");
  btn.textContent = "Signing in...";
  setTimeout(function () {
    btn.textContent = "Signed in ✓";
  }, 700);
});
`,
    starterHtml: `<!-- Recreate the login card shown in the target pane -->
<div class="card">

</div>
`,
    starterCss: `body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef1f6;
}
`,
    starterJs: "",
    // The official solution — a real, working recreation, commented for
    // readability (distinct in spirit from targetHtml/Css/Js, which is
    // optimized to just render correctly, not to be read by a learner).
    solutionHtml: `<!-- The whole battle is one centered card -->
<div class="card">
  <h1>Welcome back</h1>
  <p class="subtitle">Sign in to your account</p>

  <!-- Label + input pairs, not placeholder-only inputs — placeholder text
       disappears on focus, a label never does -->
  <label for="email">Email</label>
  <input id="email" type="email" placeholder="you@example.com" />

  <label for="password">Password</label>
  <input id="password" type="password" placeholder="••••••••" />

  <button id="signin">Sign In</button>
</div>
`,
    solutionCss: `* { box-sizing: border-box; }

body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef1f6;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.card {
  width: 320px;
  padding: 32px;
  background: #ffffff;
  border-radius: 16px;
  /* A soft, wide shadow reads as "elevated card", not a hard drop shadow */
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
}

.card h1 {
  margin: 0;
  font-size: 22px;
  color: #0f172a;
}

.subtitle {
  margin: 6px 0 18px;
  font-size: 14px;
  color: #64748b;
}

label {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  margin-top: 10px;
}

input {
  margin-top: 6px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  font-family: inherit;
}

/* A visible focus ring is an accessibility requirement, not decoration */
input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

button {
  margin-top: 20px;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #4f46e5;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

button:hover {
  background: #4338ca;
}
`,
    solutionJs: `// Give the button real feedback on click instead of doing nothing —
// a disabled/relabeled state while "signing in" is the whole point of
// this file existing at all.
document.getElementById("signin").addEventListener("click", function () {
  var btn = document.getElementById("signin");
  btn.textContent = "Signing in...";
  setTimeout(function () {
    btn.textContent = "Signed in ✓";
  }, 700);
});
`,
    orderIndex: 1,
  },
];
