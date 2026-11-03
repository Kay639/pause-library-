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
const canPlay = index => isFree(index) || !!session;

function remember(key, value) {
  try { value == null ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch (e) {}
}
function recall(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
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
    <p class="small-print">New here? The same link creates your free member account. No password needed.</p>`;
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
        <span class="feeling-name">${f.name}</span>
      </a>
    </li>`).join("");

  app.innerHTML = `
    <section class="screen">
      ${accountBar()}
      <header class="home-header">
        <div class="brand">The Pause Library</div>
        <h1>How are you feeling right now?</h1>
        <p>Choose one. There's no wrong answer.</p>
      </header>
      <ul class="feelings">${tiles}</ul>
    </section>`;
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
      <header class="list-header">
        <h1>${feeling.name}</h1>
        <p>${feeling.prompt}</p>
      </header>
      <ul class="practices">${items}</ul>
    </section>`;
}

/* ---------- Screen 3: Player ---------- */

function renderPlayer(feeling, index) {
  const p = feeling.practices[index];
  setColors(feeling);
  document.title = p.title + " · The Pause Library";

  if (!canPlay(index)) { renderLocked(feeling, p); return; }

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
      ${p.audio ? "" : '<p class="note">Placeholder player — the real recording will go here.</p>'}
    </section>`;

  startPlayer(p);
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
        intro: "This practice is for members. Sign in with your email to listen. The free sample for each feeling is always open.",
        returnTo: location.hash
      })}
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
        <p class="about">Signed in as <strong>${escapeHtml(session.user.email || "member")}</strong>. All practices are open to you.</p>
        <p><a class="primary-btn" href="#/">Choose how you feel</a></p>` :
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
   • If the practice has an "audio" link in data.js, it plays that real file.
   • If not (for now), it runs a silent timer for the practice's length,
     so the screen behaves exactly as it will with real audio.
*/
function startPlayer(practice) {
  const screen   = app.querySelector(".player");
  const playBtn  = app.querySelector(".play-btn");
  const fill     = app.querySelector(".progress-fill");
  const bar      = app.querySelector(".progress");
  const elapsedEl = app.querySelector(".elapsed");
  const totalEl  = app.querySelector(".total");
  const doneEl   = app.querySelector(".done");

  const audio = practice.audio ? new Audio(practice.audio) : null;
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
  if (sb) {
    // This also finishes signing in if the person just tapped their email link
    try {
      const { data } = await sb.auth.getSession();
      session = data.session;
    } catch (e) { session = null; }

    // Re-draw the screen when someone signs in or out (e.g. in another tab)
    sb.auth.onAuthStateChange((event, newSession) => {
      const wasIn = !!session;
      session = newSession;
      if (wasIn !== !!session) route();
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
