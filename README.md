# The Pause Library

Short mindfulness practices for how you feel right now.

**Flow:** Open → choose how you feel → pick a practice → listen.

## What's here (so far)

Three screens, using sample content:

1. **Home** – "How are you feeling right now?" with six soft-coloured feelings.
2. **Practice list** – five practices for the chosen feeling (title, type, length).
   The first one is tagged **Free sample**.
3. **Player** – a calm "breathing" circle, progress bar, play/pause, and skip ±15 seconds.
   All 30 approved recordings are in private Supabase Storage, and member practices play them for members with access.
   The six free samples play from the public `pause-library-free` Storage bucket, which holds only those six files.

**Members:** the first practice for each feeling is a free sample anyone can play.
The others are for members, who sign in with an emailed link (no passwords), using Supabase.
Membership is US$10 a month or US$100 a year, each with a 7-day free trial (card required), through the Stripe links in `config.js`.
Checkout gives access to the email used at checkout, so members sign in with that same email. Signed-in visitors without membership see the Join buttons.
Member recordings require an active Pause Library entitlement for the signed-in email address.

## The files, in plain language

| File | What it is |
|---|---|
| `index.html` | The empty "frame" the browser opens. You rarely need to touch it. |
| `data.js` | **All the words**: feelings, colours, practice titles, types, lengths. Edit this to change content. |
| `styles.css` | **The look**: fonts, spacing, colours, rounded corners. |
| `app.js` | **The behaviour**: which screen to show, how the player works, and member sign-in. |
| `config.js` | **Supabase and membership settings**: your project address, *publishable* key, and the Stripe Join and Manage links (all safe to be public). |
| `vendor/supabase.js` | The Supabase sign-in library (a copy, so the app doesn't depend on another site). Don't edit. |

## How to view it

Download the folder and double-click `index.html`. It opens in your web browser.
To see it as a phone would, make the browser window narrow, or open it on your phone once it's hosted online.

## Common changes

- **Rename a practice or change its length:** open `data.js`, find it, edit the text between the quotes or the number after `minutes:`.
- **Change a feeling's colour:** in `data.js`, change `color` (the soft background) and `accent` (the deeper shade).
  Colours are written as codes like `#DDE8F1`. Any "hex colour picker" website will give you these.
- **Add a free recording:** the Supabase operator copies it into the public `pause-library-free` bucket. Set the free sample's `audio` field to its public URL. Keep audio files out of this repository.
- **Add a member recording:** upload it to the private `product-content` Storage bucket under `pause-library/` through the authorised Supabase operator. Set the practice's `memberAudio` to its path relative to that folder. The approved recordings use the production log's names, such as `PL02_Overwhelmed_Put-It-Down.m4a`: letters, digits, hyphens and underscores, with an MP3, M4A, OGG or WAV extension. Keep the recording outside the Git checkout.
- **Update recording lengths:** with Node.js and FFmpeg's `ffprobe` installed, run `node tools/update-durations.js /path/to/private-recordings`. Keep private files in the same relative paths as in the bucket. The script updates whole-minute labels from measured durations. The player shows the actual time in minutes and seconds.

## Member sign-in (Supabase)

- Settings live in `config.js`: the **Project URL** and **publishable key**. Both are safe to be public.
- ⚠️ **Never** put the **secret key** (`sb_secret_…` / `service_role`) or the **database password** in this repository.
- In Supabase → Authentication → URL Configuration, the **Site URL** and a **Redirect URL** must be the site's address
  (`https://pause.kayjoyflowers.online/`), or the email links won't bring people back to the app.
- The app's address is `https://pause.kayjoyflowers.online/`, set by the `CNAME` file in this repository and a
  CNAME record (`pause` → `kay639.github.io`) in Spaceship DNS. Don't delete the `CNAME` file, or the address stops working.
- Supabase's built-in email sender only sends a few emails per hour. Before inviting real members, set up a custom email (SMTP) service in Supabase.

## Private member recordings

After approval, the Supabase operator applies the migration in `supabase/migrations/`. It registers the `pause-library` product in the existing access schemas. The Storage policies use `access.has_access` for `product-content` and `access_test.has_access` for `product-content-test`. A signed-in account needs an unrevoked entitlement for its email address before Storage will issue a signed URL. The player requests a 15-minute URL. Anyone who receives that URL can use it until it expires.

For a test, use a local app configuration with `const PAUSE_LIBRARY_TEST_STORAGE = true;`, a private sample under `product-content-test/pause-library/`, and a test user. The Supabase operator can manually insert an entitlement in `access_test.entitlements` with the test user's lowercase email, product code `pause-library`, and a unique manual test transaction ID. Verify that signed-out users, users without an entitlement and users with a revoked entitlement are denied, and that the test user with an active entitlement can play the sample. The six free samples still play publicly. Keep the test setting out of the published configuration.

The migration registers the product only. Billing and production entitlement grants are separate decisions.
