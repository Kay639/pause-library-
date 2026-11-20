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
The app currently uses a signed-in email account for member access.

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
- **Add a free recording:** put the file in the repository and set the free sample's `audio` field to its path.
- **Add a member recording:** upload it to the private `member-audio` Storage bucket through the authorised Supabase operator. Set the practice's `memberAudio` to its bucket-relative path, such as `overwhelmed/put-it-down.mp3`. Use lowercase letters, digits and hyphens in the path, with an MP3, M4A, OGG or WAV extension. Keep the recording outside the Git checkout.
- **Update recording lengths:** with Node.js and FFmpeg's `ffprobe` installed, run `node tools/update-durations.js /path/to/private-recordings`. Keep private files in the same relative paths as in the bucket. The script updates whole-minute labels from measured durations. The player shows the actual time in minutes and seconds.

## Member sign-in (Supabase)

- Settings live in `config.js`: the **Project URL** and **publishable key**. Both are safe to be public.
- ⚠️ **Never** put the **secret key** (`sb_secret_…` / `service_role`) or the **database password** in this repository.
- In Supabase → Authentication → URL Configuration, the **Site URL** and a **Redirect URL** must be the site's address
  (`https://kay639.github.io/pause-library-/`), or the email links won't bring people back to the app.
- Supabase's built-in email sender only sends a few emails per hour. Before inviting real members, set up a custom email (SMTP) service in Supabase.

## Private member recordings

After approval, the Supabase operator applies the migration in `supabase/migrations/` and deploys `member-audio` with `--no-verify-jwt`. The function independently validates each caller's bearer token through Supabase Auth, so it works with the project's signing keys. Its service role key comes from the Edge Function environment.

The Storage bucket is private. Browser roles cannot fetch its objects or sign their own URLs. A signed-in email member receives a URL valid for 15 minutes. Anyone who receives that signed URL can use it until it expires. Free samples still play from their existing public paths.

On a local or authorised test project, check that a signed-out visitor can play The Long Exhale, that the signing function returns 401 without a valid session, and that a direct private object URL is refused. With a member session and a test recording, check that playback works and that the signed URL expires.
