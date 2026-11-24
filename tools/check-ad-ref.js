/*
  Checks the ad tag (client_reference_id) on the Join links.
  Run with:  node tools/check-ad-ref.js
  It loads the real config.js and app.js with a pretend browser, so nothing
  is sent anywhere and no Supabase sign-in happens.
*/
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const configSource = fs.readFileSync(path.join(root, "config.js"), "utf8");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const DAY = 24 * 60 * 60 * 1000;

// A pretend browser opened at the given address
function load(address, { store = {}, brokenStorage = false } = {}) {
  const url = new URL(address);
  const location = {
    get search() { return url.search; },
    get pathname() { return url.pathname; },
    get hash() { return url.hash; },
    set hash(value) { url.hash = value; }
  };
  const storage = {
    getItem: k => { if (brokenStorage) throw new Error("blocked"); return k in store ? store[k] : null; },
    setItem: (k, v) => { if (brokenStorage) throw new Error("blocked"); store[k] = String(v); },
    removeItem: k => { if (brokenStorage) throw new Error("blocked"); delete store[k]; }
  };
  const context = {
    URL, URLSearchParams, JSON, Date, console,
    location,
    localStorage: storage,
    history: { state: null, replaceState: (state, title, next) => { const u = new URL(next, url); url.search = u.search; url.hash = u.hash; url.pathname = u.pathname; } },
    document: {
      documentElement: { style: { setProperty: () => {} } },
      getElementById: () => ({ innerHTML: "", querySelector: () => null, querySelectorAll: () => [] })
    },
    scrollTo: () => {}
  };
  context.window = context;
  context.window.addEventListener = () => {};
  vm.createContext(context);
  vm.runInContext(configSource, context);
  vm.runInContext("const FEELINGS = [];", context);
  vm.runInContext(appSource, context);
  return {
    url, store,
    signIn: email => vm.runInContext(`session = { user: { email: ${JSON.stringify(email)}, is_anonymous: false } };`, context),
    joinHrefs: () => {
      const html = vm.runInContext("joinBlock()", context);
      return [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1].replace(/&amp;/g, "&"));
    }
  };
}

// The Join links as the app built them before this change
function previousHrefs(email) {
  const ctx = vm.createContext({});
  vm.runInContext(configSource + "\nthis.M = MEMBERSHIP;", ctx);
  const M = ctx.M;
  const link = plan => email ? plan.url + "?prefilled_email=" + encodeURIComponent(email) : plan.url;
  return [link(M.monthly), link(M.yearly), M.manageUrl];
}

const AD = "https://pause.kayjoyflowers.online/?utm_source=meta&utm_medium=paid_social&utm_campaign=pl_ad001&utm_content=hero_a";
let passed = 0;
function check(name, fn) { fn(); passed++; console.log("ok  " + name); }

check("no tag: Join links are exactly as before (signed out)", () => {
  assert.deepEqual(load("https://pause.kayjoyflowers.online/#/").joinHrefs(), previousHrefs(""));
});

check("no tag: Join links are exactly as before (signed in)", () => {
  const b = load("https://pause.kayjoyflowers.online/#/");
  b.signIn("member@example.com");
  assert.deepEqual(b.joinHrefs(), previousHrefs("member@example.com"));
});

check("with a tag: Join links carry client_reference_id", () => {
  const [monthly, yearly, manage] = load(AD).joinHrefs();
  for (const href of [monthly, yearly]) {
    const u = new URL(href);
    assert.equal(u.searchParams.get("client_reference_id"), "meta_pl_ad001_hero_a");
    assert.equal(u.searchParams.has("prefilled_email"), false);
  }
  assert.equal(manage, previousHrefs("")[2], "Manage membership link unchanged");
});

check("signed in with a tag: Join links carry prefilled_email and client_reference_id", () => {
  const b = load(AD);
  b.signIn("member+trial@example.com");
  const [monthly, yearly, manage] = b.joinHrefs();
  for (const href of [monthly, yearly]) {
    const u = new URL(href);
    assert.equal(u.search.split("?").length, 2, "exactly one ?");
    assert.equal(u.searchParams.get("prefilled_email"), "member+trial@example.com");
    assert.equal(u.searchParams.get("client_reference_id"), "meta_pl_ad001_hero_a");
  }
  assert.equal(manage, previousHrefs("")[2], "Manage membership link unchanged");
});

check("utm_* removed from the address; path and #/ route kept", () => {
  const b = load("https://pause.kayjoyflowers.online/?utm_source=meta&utm_campaign=pl_ad001&utm_content=hero_a&other=1#/feeling/overwhelmed");
  assert.equal(b.url.pathname, "/");
  assert.equal(b.url.search, "?other=1");
  assert.equal(b.url.hash, "#/feeling/overwhelmed");
});

check("tag saved under pl_ref with a timestamp", () => {
  const saved = JSON.parse(load(AD).store.pl_ref);
  assert.equal(saved.ref, "meta_pl_ad001_hero_a");
  assert.ok(Math.abs(Date.now() - saved.ts) < 5000);
});

check("first tag is kept within 30 days", () => {
  const store = { pl_ref: JSON.stringify({ ref: "first_tag", ts: Date.now() - 10 * DAY }) };
  const b = load(AD, { store });
  assert.equal(JSON.parse(store.pl_ref).ref, "first_tag");
  assert.equal(new URL(b.joinHrefs()[0]).searchParams.get("client_reference_id"), "first_tag");
});

check("expired tag is ignored and removed", () => {
  const store = { pl_ref: JSON.stringify({ ref: "old_tag", ts: Date.now() - 31 * DAY }) };
  const b = load("https://pause.kayjoyflowers.online/", { store });
  assert.deepEqual(b.joinHrefs(), previousHrefs(""));
  assert.equal("pl_ref" in store, false);
});

check("expired tag is replaced by a new ad visit", () => {
  const store = { pl_ref: JSON.stringify({ ref: "old_tag", ts: Date.now() - 31 * DAY }) };
  load(AD, { store });
  assert.equal(JSON.parse(store.pl_ref).ref, "meta_pl_ad001_hero_a");
});

check("tag keeps only A-Z a-z 0-9 _ - and is at most 200 characters", () => {
  const b = load("https://pause.kayjoyflowers.online/?utm_source=me%20ta!&utm_campaign=" + "x".repeat(300) + "&utm_content=%3Cscript%3E");
  const ref = JSON.parse(b.store.pl_ref).ref;
  assert.match(ref, /^[A-Za-z0-9_-]+$/);
  assert.equal(ref.length, 200);
  assert.ok(ref.startsWith("meta_xxx"));
});

check("malformed saved tag is ignored and removed", () => {
  const store = { pl_ref: JSON.stringify({ ref: "bad tag<>", ts: Date.now() }) };
  assert.deepEqual(load("https://pause.kayjoyflowers.online/", { store }).joinHrefs(), previousHrefs(""));
  assert.equal("pl_ref" in store, false);
});

check("blocked storage: app still starts and Join links are as before", () => {
  const b = load(AD, { brokenStorage: true });
  assert.deepEqual(b.joinHrefs(), previousHrefs(""));
  assert.equal(b.url.search, "");
});

console.log(`\n${passed} checks passed`);
