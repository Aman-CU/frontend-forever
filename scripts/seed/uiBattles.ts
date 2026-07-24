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
  {
    slug: "profile-card-recreate",
    title: "Profile Card",
    description:
      "Recreate this profile card pixel-for-pixel using vanilla HTML, CSS, and JavaScript. Pay attention to the avatar, spacing, and the social icon row — clicking \"Contact me\" should give the button real feedback.",
    difficulty: "easy",
    targetImageUrl: "/playground/battles/profile-card-recreate.png",
    targetWidth: 400,
    targetHeight: 460,
    targetHtml: `<div class="card">
  <div class="avatar">SD</div>
  <h1 class="name">Sarah Dole</h1>
  <p class="role">Front End Engineer @ Microsoft</p>
  <p class="bio">I turn coffee into bugs which are fixed by someone else. Certified Stack Overflow and ChatGPT developer.</p>
  <button id="contact" class="contact">Contact me</button>
  <div class="socials">
    <a href="#" class="social" aria-label="GitHub"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.08.78 2.18 0 1.57-.01 2.84-.01 3.23 0 .3.2.66.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z"/></svg></a>
    <a href="#" class="social" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6.5 0h3.83v1.64h.05c.53-1 1.84-2.06 3.79-2.06 4.06 0 4.81 2.67 4.81 6.15V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z"/></svg></a>
    <a href="#" class="social" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg></a>
    <a href="#" class="social" aria-label="X"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.24 2H21l-6.55 7.49L22.2 22h-6.19l-4.85-6.34L5.6 22H2.83l7.02-8.02L2 2h6.35l4.38 5.79L18.24 2Zm-1.08 18.17h1.72L7.02 3.75H5.17l12 16.42Z"/></svg></a>
  </div>
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
  padding: 32px 28px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #4f46e5;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.name {
  margin: 16px 0 2px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}
.role {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}
.bio {
  margin: 14px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}
.contact {
  margin-top: 20px;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: #4f46e5;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.contact:hover {
  background: #4338ca;
}
.socials {
  display: flex;
  gap: 14px;
  margin-top: 18px;
}
.social {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4f46e5;
  background: #eef2ff;
  transition: background 0.15s;
}
.social:hover {
  background: #e0e7ff;
}
.social svg {
  width: 16px;
  height: 16px;
}
`,
    targetJs: `document.getElementById("contact").addEventListener("click", function () {
  var btn = document.getElementById("contact");
  btn.textContent = "Message sent ✓";
  setTimeout(function () {
    btn.textContent = "Contact me";
  }, 1200);
});
`,
    starterHtml: `<!-- Recreate the profile card shown in the target pane -->
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
    solutionHtml: `<!-- The whole battle is one centered card -->
<div class="card">
  <div class="avatar">SD</div>
  <h1 class="name">Sarah Dole</h1>
  <p class="role">Front End Engineer @ Microsoft</p>
  <p class="bio">I turn coffee into bugs which are fixed by someone else. Certified Stack Overflow and ChatGPT developer.</p>

  <!-- Real feedback on click, not a dead button -->
  <button id="contact" class="contact">Contact me</button>

  <!-- Inline SVGs, not icon-font glyphs — no external font/icon dependency -->
  <div class="socials">
    <a href="#" class="social" aria-label="GitHub"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.08.78 2.18 0 1.57-.01 2.84-.01 3.23 0 .3.2.66.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z"/></svg></a>
    <a href="#" class="social" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6.5 0h3.83v1.64h.05c.53-1 1.84-2.06 3.79-2.06 4.06 0 4.81 2.67 4.81 6.15V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z"/></svg></a>
    <a href="#" class="social" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg></a>
    <a href="#" class="social" aria-label="X"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.24 2H21l-6.55 7.49L22.2 22h-6.19l-4.85-6.34L5.6 22H2.83l7.02-8.02L2 2h6.35l4.38 5.79L18.24 2Zm-1.08 18.17h1.72L7.02 3.75H5.17l12 16.42Z"/></svg></a>
  </div>
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
  padding: 32px 28px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Initials avatar, not a photo — no real headshot needed for a recreate target */
.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #4f46e5;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.name {
  margin: 16px 0 2px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.role {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.bio {
  margin: 14px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

.contact {
  margin-top: 20px;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: #4f46e5;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.contact:hover {
  background: #4338ca;
}

.socials {
  display: flex;
  gap: 14px;
  margin-top: 18px;
}

.social {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4f46e5;
  background: #eef2ff;
  transition: background 0.15s;
}

.social:hover {
  background: #e0e7ff;
}

.social svg {
  width: 16px;
  height: 16px;
}
`,
    solutionJs: `// Give the button real feedback on click instead of doing nothing.
document.getElementById("contact").addEventListener("click", function () {
  var btn = document.getElementById("contact");
  btn.textContent = "Message sent ✓";
  setTimeout(function () {
    btn.textContent = "Contact me";
  }, 1200);
});
`,
    orderIndex: 2,
  },
];
