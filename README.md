# The Pause Library

Short mindfulness practices for how you feel right now.

**Flow:** Open → choose how you feel → pick a practice → listen.

## What's here (so far)

Three screens, using sample content:

1. **Home** – "How are you feeling right now?" with six soft-coloured feelings.
2. **Practice list** – five practices for the chosen feeling (title, type, length).
   The first one is tagged **Free sample**.
3. **Player** – a calm "breathing" circle, progress bar, play/pause, and skip ±15 seconds.
   Practices with a recording play the real audio (so far: **The Long Exhale**, `the-long-exhale.mp3`).
   The rest use a *placeholder*: a silent timer for the practice's length.

**Members:** the first practice for each feeling is a free sample anyone can play.
The others are for members, who sign in with an emailed link (no passwords), using Supabase.
No payments yet.

## The files, in plain language

| File | What it is |
|---|---|
| `index.html` | The empty "frame" the browser opens. You rarely need to touch it. |
| `data.js` | **All the words**: feelings, colours, practice titles, types, lengths. Edit this to change content. |
| `styles.css` | **The look**: fonts, spacing, colours, rounded corners. |
| `app.js` | **The behaviour**: which screen to show, how the player works, and member sign-in. |
| `config.js` | **Supabase settings**: your project address and *publishable* key (both safe to be public). |
| `vendor/supabase.js` | The Supabase sign-in library (a copy, so the app doesn't depend on another site). Don't edit. |

## How to view it

Download the folder and double-click `index.html`. It opens in your web browser.
To see it as a phone would, make the browser window narrow, or open it on your phone once it's hosted online.

## Common changes

- **Rename a practice or change its length:** open `data.js`, find it, edit the text between the quotes or the number after `minutes:`.
- **Change a feeling's colour:** in `data.js`, change `color` (the soft background) and `accent` (the deeper shade).
  Colours are written as codes like `#DDE8F1`. Any "hex colour picker" website will give you these.
- **Add a real recording:** upload the mp3 to this folder, then in `data.js` put its file name between the quotes after `audio:`, e.g.
  `audio: "put-it-down.mp3"` (a full web link works too). The player then plays the real file, shows its real length,
  and the "placeholder" note disappears.

## Member sign-in (Supabase)

- Settings live in `config.js`: the **Project URL** and **publishable key**. Both are safe to be public.
- ⚠️ **Never** put the **secret key** (`sb_secret_…` / `service_role`) or the **database password** in this repository.
- In Supabase → Authentication → URL Configuration, the **Site URL** and a **Redirect URL** must be the site's address
  (`https://kay639.github.io/pause-library-/`), or the email links won't bring people back to the app.
- Supabase's built-in email sender only sends a few emails per hour. Before inviting real members, set up a custom email (SMTP) service in Supabase.
- The locks are in the app's screens. Recordings stored in this repository can still be downloaded by anyone who knows
  the file's address, so put members-only recordings in private Supabase Storage before adding them.
