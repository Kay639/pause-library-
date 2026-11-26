/*
  THE PAUSE LIBRARY — APP LOGIC
  -----------------------------
  Three screens, chosen by the web address (the part after "#"):

    #/                         → Home (choose how you feel)
    #/feeling/overwhelmed      → Practice list for that feeling
    #/play/overwhelmed/0       → Player for practice number 0 (the first one)
    #/signin                   → Member sign-in (email magic link)

  The first practice for each feeling is a free sample anyone can play.
  The others are for members: signed-out visitors are asked to sign in.

  Using the address means the phone's Back button works naturally.
*/

const app = document.getElementById("app");
let stopPlayer = () => {}; // cleans up the player when leaving that screen

// Small icons, drawn as code so no image files are needed
const ICON = {
  back:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  play:  '<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  pause: '<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>',
  lock:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  small: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  rewind:  '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><text x="12" y="15.5" font-size="7" text-anchor="middle" fill="currentColor" stroke="none" font-family="sans-serif">15</text></svg>',
  menu:  '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  // Line-drawn lotus for the home header
  lotus: '<svg viewBox="0 0 120 72" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M60 6c-9 10-13 21-13 31s4 20 13 28c9-8 13-18 13-28S69 16 60 6z"/><path d="M60 65c-6-10-17-21-31-24 2 13 14 23 31 24z"/><path d="M60 65c6-10 17-21 31-24-2 13-14 23-31 24z"/><path d="M47 40C37 30 24 26 11 27c5 16 25 33 49 38"/><path d="M73 40c10-10 23-14 36-13-5 16-25 33-49 38"/><path d="M8 68c18 2 36 2 52-3 16 5 34 5 52 3"/></svg>',
  // Gold brush-stroke underline
  swash: '<svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true"><path d="M2 9C50 3 130 1 198 4c-60 2-130 5-196 5z" fill="currentColor"/></svg>',
  forward: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/><text x="12" y="15.5" font-size="7" text-anchor="middle" fill="currentColor" stroke="none" font-family="sans-serif">15</text></svg>'
};

/* ---------- Members (Supabase sign-in) ---------- */

/*
  Sign-in uses Supabase "magic links": the person types their email, Supabase
  emails them a link, and tapping it signs them in. No passwords.
  The settings live in config.js. If sign-in can't start (for example the
  settings are missing), free samples still work and members-only practices
  say sign-in isn't available.
*/
const sb = (window.supabase && typeof SUPABASE_URL !== "undefined" && SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;
let session = null;            // who is signed in (null = nobody)
const RETURN_KEY = "pause-return-to";   // where to go back to after tapping the email link

const isFree = index => index === 0;
const canPlay = index => isFree(index) || (!!session && !session.user.is_anonymous);

function remember(key, value) {
  try { value == null ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch (e) {}
}
function recall(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

/* ---------- Which ad brought the visitor (no cookies, no personal data) ---------- */

/*
  Ad links carry utm_source, utm_campaign and utm_content. On arrival they are
  joined into one short tag (for example meta_pl_ad001_hero_a) and kept on this
  device for 30 days. The first tag wins. The Join buttons pass it to Stripe as
  client_reference_id. The utm_* parameters are then removed from the address.
*/
const REF_KEY = "pl_ref";
const REF_DAYS = 30;
const REF_MAX_AGE = REF_DAYS * 24 * 60 * 60 * 1000;
const REF_PATTERN = /^[A-Za-z0-9_-]{1,200}$/;

function buildRef(params) {
  const parts = ["utm_source", "utm_campaign", "utm_content"]
    .map(name => (params.get(name) || "").replace(/[^A-Za-z0-9_-]/g, ""))
    .filter(Boolean);
  return parts.join("_").slice(0, 200);
}

// The saved tag, or "" if there is none, it is malformed, or it has expired
function adRef() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(REF_KEY)); } catch (e) { saved = null; }
  if (!saved) return "";
  const age = Date.now() - Number(saved.ts);
  if (typeof saved.ref === "string" && REF_PATTERN.test(saved.ref) && age >= 0 && age < REF_MAX_AGE) {
    return saved.ref;
  }
  try { localStorage.removeItem(REF_KEY); } catch (e) {}
  return "";
}

function captureAdRef() {
  let params;
  try { params = new URLSearchParams(location.search); } catch (e) { return; }
  const names = [...params.keys()].filter(name => /^utm_/i.test(name));
  if (!names.length) return;

  const ref = buildRef(params);
  if (ref && !adRef()) {
    try { localStorage.setItem(REF_KEY, JSON.stringify({ ref, ts: Date.now() })); } catch (e) {}
  }

  // Tidy the address bar, keeping the path, any other parameters and the #/ route
  names.forEach(name => params.delete(name));
  const query = params.toString();
  try { history.replaceState(history.state, "", location.pathname + (query ? "?" + query : "") + location.hash); } catch (e) {}
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// The little line at the top of Home: "Sign in" or "Signed in as … · Sign out"
function accountBar() {
  if (!sb) return "";
  if (session) {
    return `<div class="account">Signed in as <strong>${escapeHtml(session.user.email || "member")}</strong> · <button class="link-btn sign-out">Sign out</button></div>`;
  }
  return `<div class="account">Member? <a class="link-btn" href="#/signin">Sign in</a></div>`;
}

// The menu behind the ☰ button on Home: sign in / out and manage membership
function homeMenu() {
  const manage = (typeof MEMBERSHIP !== "undefined" && MEMBERSHIP.manageUrl)
    ? `<a class="menu-link" href="${escapeHtml(MEMBERSHIP.manageUrl)}" target="_blank" rel="noopener">Manage membership</a>` : "";
  let account = "";
  if (sb && session) {
    account = `<p class="menu-who">Signed in as <strong>${escapeHtml(session.user.email || "member")}</strong></p>
      <button class="menu-link sign-out">Sign out</button>`;
  } else if (sb) {
    account = `<a class="menu-link" href="#/signin">Member sign-in</a>`;
  }
  return `
    <button class="menu-btn" aria-label="Menu" aria-expanded="false" aria-controls="home-menu">${ICON.menu}</button>
    <nav class="menu-panel" id="home-menu" hidden>
      <button class="menu-close" aria-label="Close menu">${ICON.close}</button>
      ${account}${manage}
    </nav>`;
}

function wireHomeMenu() {
  const btn = app.querySelector(".menu-btn");
  const panel = app.querySelector(".menu-panel");
  if (!btn || !panel) return;
  const setOpen = open => { panel.hidden = !open; btn.setAttribute("aria-expanded", String(open)); };
  btn.addEventListener("click", () => setOpen(panel.hidden));
  app.querySelector(".menu-close").addEventListener("click", () => { setOpen(false); btn.focus(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); }, { once: true });
}

// Join buttons (monthly and yearly) and the "manage membership" link.
// A signed-in visitor's email is prefilled at checkout, so access lands on
// the same email they sign in with.
// If the visitor arrived from a tagged ad link, the tag goes to Stripe as
// client_reference_id, so each trial shows which ad brought it.
function joinBlock() {
  if (typeof MEMBERSHIP === "undefined") return "";
  const email = session && !session.user.is_anonymous ? session.user.email : "";
  const ref = adRef();
  const link = plan => {
    let url = plan.url;
    try {
      const u = new URL(plan.url);
      if (email) u.searchParams.set("prefilled_email", email);
      if (ref) u.searchParams.set("client_reference_id", ref);
      url = u.toString();
    } catch (e) {}
    return `<a class="primary-btn join-btn" href="${escapeHtml(url)}" target="_blank" rel="noopener">${plan.label}<span class="join-price">${plan.price}</span></a>`;
  };
  return `
    <div class="join">
      <p class="join-intro">Both plans start with a 7-day free trial.</p>
      <div class="join-buttons">${link(MEMBERSHIP.monthly)}${link(MEMBERSHIP.yearly)}</div>
      <p class="small-print">A card is needed to start the trial. Use the same email you sign in with here, so your access matches.
        Already a member? <a class="link-btn" href="${escapeHtml(MEMBERSHIP.manageUrl)}" target="_blank" rel="noopener">Manage membership</a></p>
    </div>`;
}

function wireAccountBar() {
  const out = app.querySelector(".sign-out");
  if (out) out.addEventListener("click", async () => {
    out.disabled = true;
    await sb.auth.signOut();
    location.hash = "#/";
  });
}

// Turn Supabase's error into a friendly sentence
function friendlyError(error) {
  const msg = (error && error.message) || "";
  if ((error && error.status === 429) || /rate limit|security purposes|seconds/i.test(msg)) {
    return "Too many sign-in emails were sent just now. Please wait a few minutes and try again.";
  }
  if (/invalid|email/i.test(msg)) return "That email address doesn't look right. Please check it and try again.";
  return "Something went wrong sending your link. Please try again in a moment.";
}

/*
  The sign-in form. Used on its own screen (#/signin) and in place of the
  player when a signed-out visitor opens a members-only practice.
    heading  – the big title
    intro    – the sentence under it
    returnTo – the screen to come back to once they're signed in
    notice   – an optional message (e.g. "that link has expired")
*/
function signInBlock({ heading, intro, returnTo, notice }) {
  if (!sb) {
    return `
      <h1>${heading}</h1>
      <p class="about">Member sign-in isn't available right now. Please try again later.</p>`;
  }
  return `
    <h1>${heading}</h1>
    <p class="about">${intro}</p>
    ${notice ? `<p class="notice">${notice}</p>` : ""}
    <form class="signin" novalidate data-return="${escapeHtml(returnTo)}">
      <label for="email">Your email</label>
      <input id="email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" required>
      <button class="primary-btn" type="submit">Email me a sign-in link</button>
      <p class="form-msg" role="status"></p>
    </form>
    <p class="small-print">New here? The same link creates a free account, which opens the free samples. Membership opens all 30 practices. No password needed.</p>`;
}

function wireSignInForm() {
  const form = app.querySelector("form.signin");
  if (!form) return;
  const input = form.querySelector("input");
  const button = form.querySelector("button");
  const msg = form.querySelector(".form-msg");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.className = "form-msg error";
      msg.textContent = "Please enter your email address, like name@example.com.";
      input.focus();
      return;
    }
    button.disabled = true;
    button.textContent = "Sending…";
    msg.className = "form-msg";
    msg.textContent = "";

    remember(RETURN_KEY, form.dataset.return || "#/");
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: location.origin + location.pathname }
    });

    if (error) {
      button.disabled = false;
      button.textContent = "Email me a sign-in link";
      msg.className = "form-msg error";
      msg.textContent = friendlyError(error);
      return;
    }
    form.outerHTML = `
      <div class="sent">
        <h2>Check your email</h2>
        <p>We sent a sign-in link to <strong>${escapeHtml(email)}</strong>.
        Tap it to finish signing in. It may take a minute to arrive, so check your spam folder too.</p>
      </div>`;
  });
}

/* ---------- Helpers ---------- */

function findFeeling(id) {
  return FEELINGS.find(f => f.id === id);
}

// Apply a feeling's soft colour to the page
function setColors(feeling) {
  const root = document.documentElement.style;
  root.setProperty("--tint", feeling ? feeling.color : "#EFEAE2");
  root.setProperty("--accent", feeling ? feeling.accent : "#6F6862");
}

// 125 seconds → "2:05"
function formatTime(seconds) {
  const s = Math.max(0, Math.round(seconds));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

function minLabel(m) {
  return m + " min";
}

/* ---------- Screen 1: Home ---------- */

function renderHome() {
  setColors(null);
  document.title = "The Pause Library";

  const tiles = FEELINGS.map(f => `
    <li>
      <a class="feeling" href="#/feeling/${f.id}" style="--tint:${f.color};--accent:${f.accent}">
        ${f.image ? `<img class="feeling-img" src="${f.image}" alt="" loading="lazy" decoding="async">` : ""}
        <span class="feeling-name">${f.name}</span>
        <span class="feeling-swash">${ICON.swash}</span>
      </a>
    </li>`).join("");

  app.innerHTML = `
    <section class="screen home">
      <header class="hero">
        ${homeMenu()}
        <div class="lotus">${ICON.lotus}</div>
        <h1 class="hero-title"><span>The</span> Pause Library</h1>
        <div class="hero-swash">${ICON.swash}</div>
        <p class="hero-tagline">30 short practices<br>for real life</p>
      </header>
      <h2 class="visually-hidden">How are you feeling right now? Choose one.</h2>
      <ul class="feelings">${tiles}</ul>
    </section>`;
  wireHomeMenu();
  wireAccountBar();
}

/* ---------- Screen 2: Practice list ---------- */

function renderList(feeling) {
  setColors(feeling);
  document.title = feeling.name + " · The Pause Library";

  const items = feeling.practices.map((p, i) => `
    <li>
      <a class="practice${canPlay(i) ? "" : " locked"}" href="#/play/${feeling.id}/${i}">
        <span class="practice-dot">${canPlay(i) ? ICON.small : ICON.lock}</span>
        <span class="practice-text">
          ${isFree(i) ? '<span class="tag">Free sample</span>' : (session ? "" : '<span class="tag tag-members">Members</span>')}
          <span class="practice-title" style="display:block">${p.title}</span>
          <span class="practice-meta">${p.type} · ${minLabel(p.minutes)}</span>
        </span>
      </a>
    </li>`).join("");

  app.innerHTML = `
    <section class="screen">
      <a class="back" href="#/">${ICON.back} All feelings</a>
      <header class="list-header${feeling.image ? " has-image" : ""}">
        ${feeling.image ? `<img class="list-header-img" src="${feeling.image}" alt="">` : ""}
        <h1>${feeling.name}</h1>
        <p>${feeling.prompt}</p>
      </header>
      <ul class="practices">${items}</ul>
    </section>`;
}

/* ---------- Screen 3: Player ---------- */

async function renderPlayer(feeling, index) {
  const p = feeling.practices[index];
  setColors(feeling);
  document.title = p.title + " · The Pause Library";

  if (!canPlay(index)) { renderLocked(feeling, p); return; }

  const memberAudio = !isFree(index) && p.memberAudio;
  app.innerHTML = `
    <section class="screen player">
      <div style="text-align:left">
        <a class="back" href="#/feeling/${feeling.id}">${ICON.back} ${feeling.name}</a>
      </div>

      <div class="orb-wrap"><div class="orb" aria-hidden="true"></div></div>

      ${index === 0 ? '<span class="tag">Free sample</span>' : ""}
      <h1>${p.title}</h1>
      <div class="practice-meta">${p.type} · ${minLabel(p.minutes)}</div>
      <p class="about">${p.about}</p>
      ${p.note ? `<p class="practice-note">${escapeHtml(p.note)}</p>` : ""}

      <div class="progress" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <div class="progress-fill"></div>
      </div>
      <div class="times"><span class="elapsed">0:00</span><span class="total">${formatTime(p.minutes * 60)}</span></div>

      <div class="controls">
        <button class="icon-btn rewind" aria-label="Back 15 seconds">${ICON.rewind}</button>
        <button class="play-btn" aria-label="Play">${ICON.play}</button>
        <button class="icon-btn forward" aria-label="Forward 15 seconds">${ICON.forward}</button>
      </div>

      <div class="done"></div>
      ${(isFree(index) ? p.audio : memberAudio) ? "" : '<p class="note">Placeholder player — the real recording will go here.</p>'}
    </section>`;

  if (!memberAudio) {
    startPlayer(p, isFree(index) ? p.audio : "");
    return;
  }

  const screen = app.querySelector(".player");
  const controls = screen.querySelectorAll(".controls button");
  const status = screen.querySelector(".done");
  status.setAttribute("role", "status");
  const loadRecording = async () => {
    controls.forEach(button => { button.disabled = true; });
    status.textContent = "Loading recording…";
    await new Promise(resolve => setTimeout(resolve, 0));
    if (!screen.isConnected) return;
    const bucket = typeof PAUSE_LIBRARY_TEST_STORAGE !== "undefined" && PAUSE_LIBRARY_TEST_STORAGE
      ? "product-content-test"
      : "product-content";
    const result = await sb.storage.from(bucket)
      .createSignedUrl("pause-library/" + memberAudio, 15 * 60)
      .catch(() => null);
    if (!screen.isConnected) return;
    if (result?.error && [400, 403, 404].includes(Number(result.error.statusCode))) {
      status.textContent = "";
      status.insertAdjacentHTML("afterend", `
        <p class="about">This practice is for members. Your account (${escapeHtml(session.user.email || "")}) doesn't have Pause Library membership yet. Membership opens all 30 practices.</p>
        ${joinBlock()}`);
      screen.querySelectorAll(".controls, .progress, .times").forEach(el => { el.style.display = "none"; });
      return;
    }
    if (!result?.data?.signedUrl || result.error) {
      status.textContent = "Recording unavailable. Choose Play to try again.";
      screen.querySelector(".play-btn").disabled = false;
      screen.querySelector(".play-btn").addEventListener("click", loadRecording, { once: true });
      return;
    }
    status.textContent = "";
    controls.forEach(button => { button.disabled = false; });
    startPlayer(p, result.data.signedUrl);
  };
  await loadRecording();
}

// Shown instead of the player when a signed-out visitor opens a members-only practice
function renderLocked(feeling, p) {
  app.innerHTML = `
    <section class="screen player locked-screen">
      <div style="text-align:left">
        <a class="back" href="#/feeling/${feeling.id}">${ICON.back} ${feeling.name}</a>
      </div>
      <div class="lock-badge" aria-hidden="true">${ICON.lock}</div>
      <span class="tag tag-members">Members</span>
      ${signInBlock({
        heading: p.title,
        intro: "This practice is for members. Already a member? Sign in with the email you joined with. The free sample for each feeling is always open.",
        returnTo: location.hash
      })}
      ${joinBlock()}
    </section>`;
  wireSignInForm();
}

/* ---------- Screen 4: Sign in ---------- */

function renderSignIn(notice) {
  setColors(null);
  document.title = "Sign in · The Pause Library";
  app.innerHTML = `
    <section class="screen player">
      <div style="text-align:left">
        <a class="back" href="#/">${ICON.back} All feelings</a>
      </div>
      ${session ? `
        <h1>You're signed in</h1>
        <p class="about">Signed in as <strong>${escapeHtml(session.user.email || "member")}</strong>. Member recordings require Pause Library membership for this email.</p>
        <p><a class="primary-btn" href="#/">Choose how you feel</a></p>
        ${joinBlock()}` :
      signInBlock({
        heading: "Member sign-in",
        intro: "Enter your email and we'll send you a link. Tap it to sign in. No password needed.",
        returnTo: "#/",
        notice
      })}
    </section>`;
  wireSignInForm();
}

/*
  The player works two ways:
   • If the practice has a recording URL, it plays that real file.
   • If not (for now), it runs a silent timer for the practice's length,
     so the screen behaves exactly as it will with real audio.
*/
function startPlayer(practice, audioUrl) {
  const screen   = app.querySelector(".player");
  const playBtn  = app.querySelector(".play-btn");
  const fill     = app.querySelector(".progress-fill");
  const bar      = app.querySelector(".progress");
  const elapsedEl = app.querySelector(".elapsed");
  const totalEl  = app.querySelector(".total");
  const doneEl   = app.querySelector(".done");

  const audio = audioUrl ? new Audio(audioUrl) : null;
  let total = practice.minutes * 60;
  let position = 0;   // seconds listened (used by the placeholder timer)
  let timer = null;
  let playing = false;

  const now = () => (audio ? audio.currentTime : position);

  function draw() {
    const pct = total ? Math.min(100, (now() / total) * 100) : 0;
    fill.style.width = pct + "%";
    bar.setAttribute("aria-valuenow", Math.round(pct));
    elapsedEl.textContent = formatTime(now());
    totalEl.textContent = formatTime(total);
  }

  function setPlaying(on) {
    playing = on;
    screen.classList.toggle("playing", on);
    playBtn.innerHTML = on ? ICON.pause : ICON.play;
    playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
  }

  function finish() {
    pause();
    position = total;
    draw();
    doneEl.textContent = "Well done. Take this calm with you.";
  }

  function play() {
    if (now() >= total) { seek(0); }   // start again if it had finished
    doneEl.textContent = "";
    setPlaying(true);
    if (audio) {
      audio.play().catch(() => setPlaying(false));
    } else {
      timer = setInterval(() => {
        position += 0.25;
        if (position >= total) finish(); else draw();
      }, 250);
    }
  }

  function pause() {
    setPlaying(false);
    if (audio) audio.pause();
    clearInterval(timer);
  }

  function seek(seconds) {
    const t = Math.min(Math.max(0, seconds), total);
    if (audio) audio.currentTime = t; else position = t;
    draw();
  }

  if (audio) {
    audio.addEventListener("loadedmetadata", () => { if (audio.duration) total = audio.duration; draw(); });
    audio.addEventListener("timeupdate", draw);
    audio.addEventListener("ended", finish);
  }

  playBtn.addEventListener("click", () => (playing ? pause() : play()));
  app.querySelector(".rewind").addEventListener("click", () => seek(now() - 15));
  app.querySelector(".forward").addEventListener("click", () => seek(now() + 15));

  draw();

  // When the person leaves this screen, stop the sound/timer
  stopPlayer = () => { pause(); if (audio) audio.src = ""; };
}

/* ---------- Choosing which screen to show ---------- */

function route() {
  stopPlayer();
  stopPlayer = () => {};

  // A sign-in link that has expired or was already used comes back with an error
  if (/error_description=|error_code=/.test(location.hash)) {
    history.replaceState(null, "", location.pathname + "#/signin");
    renderSignIn("That sign-in link has expired or was already used. Enter your email to get a new one.");
    window.scrollTo(0, 0);
    return;
  }

  const parts = location.hash.replace(/^#\/?/, "").split("/");
  const feeling = findFeeling(parts[1]);
  const isHome = !(parts[0] === "signin" || (parts[0] === "feeling" && feeling) || (parts[0] === "play" && feeling && feeling.practices[Number(parts[2])]));
  document.body.classList.toggle("is-home", isHome);

  if (parts[0] === "signin") {
    renderSignIn();
  } else if (parts[0] === "feeling" && feeling) {
    renderList(feeling);
  } else if (parts[0] === "play" && feeling && feeling.practices[Number(parts[2])]) {
    renderPlayer(feeling, Number(parts[2]));
  } else {
    renderHome();
  }
  window.scrollTo(0, 0);
}

/* ---------- Starting the app ---------- */

async function start() {
  captureAdRef();
  if (sb) {
    // This also finishes signing in if the person just tapped their email link
    try {
      const { data } = await sb.auth.getSession();
      session = data.session;
    } catch (e) { session = null; }

    // Re-draw the screen when someone signs in or out (e.g. in another tab)
    sb.auth.onAuthStateChange((event, newSession) => {
      const previousUser = session?.user?.id;
      session = newSession;
      if (previousUser !== session?.user?.id) route();
    });

    // Just signed in from the email link? Go back to where they were.
    const back = recall(RETURN_KEY);
    if (session && back) {
      remember(RETURN_KEY, null);
      if (location.hash !== back) { location.hash = back; }
    }
  }
  window.addEventListener("hashchange", route);
  route();
}

start();
