/*
  THE PAUSE LIBRARY — CONTENT
  ---------------------------
  This is the only file you need to edit to change the words in the app.
  The 30 practices follow "Pause Library: 30-practice structure (APPROVED)",
  numbered PL01–PL30 in the same order as the recordings.

  Each feeling has:
    id      – a short web-friendly name (lowercase, no spaces). Used in links.
    name    – what people see on screen.
    prompt  – the gentle line shown at the top of that feeling's page.
    color   – the soft background colour for that feeling.
    accent  – a deeper version of the colour, used for buttons and text.
    image   – the photo shown on that feeling's tile and page header
              (in images/feelings/; no words in the picture, the app adds the name).
    inner   – the nature photo for that feeling's own page header (images/scenes/).
    scene   – the nature scene behind that feeling's page (images/scenes/<scene>-bg.jpg).
              A practice can also have its own  scene:  to choose its player backdrop.
    practices – a list of five practices.

  Each practice has:
    title   – the practice name.
    type    – e.g. Breathwork, Body scan, Grounding.
    minutes – the real recording length, rounded to the nearest minute
              (from the production and QC log; tools/update-durations.js can re-measure).
    about   – one sentence shown on the player screen.
    note    – (optional) an approved on-screen note, e.g. a safety line.
    audio   – (free samples only) the public URL of the free copy in the
              pause-library-free Storage bucket.
    memberAudio – the recording's file name inside the private
              product-content/pause-library/ folder.

  The FIRST practice in every list is automatically tagged "Free sample".
  The app plays a free sample from its "audio" field only; it never asks
  the private bucket for it.
*/

const FEELINGS = [
  {
    id: "overwhelmed",
    image: "images/feelings/overwhelmed.jpg",
    inner: "images/scenes/river-stones.jpg",
    scene: "river-stones",
    name: "Overwhelmed",
    prompt: "When everything feels like too much.",
    color: "#DDE8F1",
    accent: "#4F7396",
    practices: [
      { title: "The Long Exhale",     type: "Breathwork",        minutes: 4, about: "Lengthen each out-breath to tell your body it's safe.", audio: "https://zsdcuoxdlbbytuoiwbsn.supabase.co/storage/v1/object/public/pause-library-free/PL01_Overwhelmed_The-Long-Exhale.m4a", memberAudio: "PL01_Overwhelmed_The-Long-Exhale.m4a" },
      { title: "Put It Down",         type: "Visualization",     minutes: 3, about: "Picture setting down what you're carrying, just for now.", memberAudio: "PL02_Overwhelmed_Put-It-Down.m4a" },
      { title: "One Next Thing",      type: "Journal prompt",    minutes: 3, about: "Write down the one small next step, and let the rest wait.", memberAudio: "PL03_Overwhelmed_One-Next-Thing.m4a" },
      { title: "Feet on the Floor",   type: "Grounding",         minutes: 2, about: "Feel the ground holding you steady.", memberAudio: "PL04_Overwhelmed_Feet-on-the-Floor.m4a" },
      { title: "Clear the Table",     type: "Visualization",     minutes: 4, about: "Picture clearing a cluttered table, one item at a time.", memberAudio: "PL05_Overwhelmed_Clear-the-Table.m4a" }
    ]
  },
  {
    id: "scattered",
    image: "images/feelings/scattered.jpg",
    inner: "images/scenes/ferns.jpg",
    scene: "ferns",
    name: "Scattered",
    prompt: "When your mind is in a hundred places.",
    color: "#DFEBE1",
    accent: "#55805F",
    practices: [
      { title: "Gather Yourself",     type: "Body scan",         minutes: 2, about: "A quick scan from head to feet that brings all of you back to one place.", audio: "https://zsdcuoxdlbbytuoiwbsn.supabase.co/storage/v1/object/public/pause-library-free/PL06_Scattered_Gather-Yourself.m4a", memberAudio: "PL06_Scattered_Gather-Yourself.m4a" },
      { title: "Five Things",         type: "Grounding",         minutes: 2, about: "Count down from five to one through your senses, back to the room you're in.", memberAudio: "PL07_Scattered_Five-Things.m4a" },
      { title: "Counting Breaths",    type: "Breathwork",        minutes: 3, about: "Count each out-breath up to ten, then begin again.", memberAudio: "PL08_Scattered_Counting-Breaths.m4a" },
      { title: "A Single Thread",     type: "Focus",             minutes: 4, about: "Rest your attention on one sound or object nearby.", memberAudio: "PL09_Scattered_A-Single-Thread.m4a" },
      { title: "Come Back Here",      type: "Grounding",         minutes: 2, about: "A few simple questions to bring you back to where you are.", memberAudio: "PL10_Scattered_Come-Back-Here.m4a" }
    ]
  },
  {
    id: "reactive",
    image: "images/feelings/reactive.jpg",
    inner: "images/scenes/water-ripples.jpg",
    scene: "water-ripples",
    name: "Reactive",
    prompt: "When you're about to snap, or just did.",
    color: "#F4E0DD",
    accent: "#A65F57",
    practices: [
      { title: "The Pause Before",    type: "Breathwork",        minutes: 2, about: "Find the small space between feeling and reacting.", audio: "https://zsdcuoxdlbbytuoiwbsn.supabase.co/storage/v1/object/public/pause-library-free/PL11_Reactive_The-Pause-Before.m4a", memberAudio: "PL11_Reactive_The-Pause-Before.m4a" },
      { title: "Cool the Fire",       type: "Breathwork",        minutes: 2, about: "Cool air in, a soft sigh out, to let some of the heat go.", memberAudio: "PL12_Reactive_Cool-the-Fire.m4a" },
      { title: "What's Underneath?",  type: "Inquiry",           minutes: 3, about: "Gently look beneath a strong reaction to what's really there.", memberAudio: "PL13_Reactive_Whats-Underneath.m4a" },
      { title: "Shake It Out",        type: "Movement",          minutes: 2, about: "Shake off some of the charge, standing or seated.", memberAudio: "PL14_Reactive_Shake-It-Out.m4a" },
      { title: "Choose Your Response", type: "Journal prompt",   minutes: 3, about: "Write it through, and choose your response rather than have it chosen for you.", memberAudio: "PL15_Reactive_Choose-Your-Response.m4a" }
    ]
  },
  {
    id: "drained",
    image: "images/feelings/drained.jpg",
    inner: "images/scenes/tree-roots.jpg",
    scene: "tree-roots",
    name: "Drained",
    prompt: "When you have nothing left to give.",
    color: "#F5E7D6",
    accent: "#A2733F",
    practices: [
      { title: "Rest Is Allowed",     type: "Guided rest",       minutes: 3, about: "Permission to stop, with nothing to do and nowhere to be.", note: "Best enjoyed lying down or reclining somewhere safe. Do not use while driving.", audio: "https://zsdcuoxdlbbytuoiwbsn.supabase.co/storage/v1/object/public/pause-library-free/PL16_Drained_Rest-Is-Allowed.m4a", memberAudio: "PL16_Drained_Rest-Is-Allowed.m4a" },
      { title: "Refill",              type: "Visualization",     minutes: 3, about: "Let a soft, warm light fill you back up.", memberAudio: "PL17_Drained_Refill.m4a" },
      { title: "Small Kindness",      type: "Reflection",        minutes: 2, about: "Choose one small kind thing to do for yourself today.", memberAudio: "PL18_Drained_Small-Kindness.m4a" },
      { title: "Slow Sip",            type: "Mindful drink",     minutes: 3, about: "Turn a cup of tea or water into a few minutes of rest.", memberAudio: "PL19_Drained_Slow-Sip.m4a" },
      { title: "Gentle Energy",       type: "Breathwork",        minutes: 2, about: "A soft, brightening breath to lift you a little.", memberAudio: "PL20_Drained_Gentle-Energy.m4a" }
    ]
  },
  {
    id: "numb",
    image: "images/feelings/numb.jpg",
    inner: "images/scenes/lavender-mountains.jpg",
    scene: "lavender-mountains",
    name: "Numb",
    prompt: "When you can't quite feel anything.",
    color: "#E7E2F0",
    accent: "#76679A",
    practices: [
      { title: "Find One Sensation",  type: "Grounding",         minutes: 2, about: "Look for just one small sensation. Even a faint one is enough.", audio: "https://zsdcuoxdlbbytuoiwbsn.supabase.co/storage/v1/object/public/pause-library-free/PL21_Numb_Find-One-Sensation.m4a", memberAudio: "PL21_Numb_Find-One-Sensation.m4a" },
      { title: "Hands on Heart",      type: "Warming touch",     minutes: 2, about: "Feel the warmth and rhythm under your hands.", memberAudio: "PL22_Numb_Hands-on-Heart.m4a" },
      { title: "Name It to Feel It",  type: "Journal prompt",    minutes: 2, about: "Put a few words on the page and see what's there.", memberAudio: "PL23_Numb_Name-It-to-Feel-It.m4a" },
      { title: "Sound Landing",       type: "Listening",         minutes: 2, about: "Listen from far away to close by, and land on one sound.", memberAudio: "PL24_Numb_Sound-Landing.m4a" },
      { title: "Soft Return",         type: "Self-compassion",   minutes: 4, about: "Meet yourself with softness instead of pressure.", memberAudio: "PL25_Numb_Soft-Return.m4a" }
    ]
  },
  {
    id: "doubting-myself",
    image: "images/feelings/doubting-myself.jpg",
    inner: "images/scenes/woodland-path.jpg",
    scene: "woodland-path",
    name: "Doubting Myself",
    prompt: "When the inner critic is loud.",
    color: "#F2EBCF",
    accent: "#8E7A32",
    practices: [
      { title: "Remember Who You Are", type: "Reconnection",     minutes: 3, about: "Move the critic to the edge of the room, and remember who you are.", audio: "https://zsdcuoxdlbbytuoiwbsn.supabase.co/storage/v1/object/public/pause-library-free/PL26_Doubting-Myself_Remember-Who-You-Are.m4a", memberAudio: "PL26_Doubting-Myself_Remember-Who-You-Are.m4a" },
      { title: "Ask Your Body",       type: "Intuition check-in", minutes: 3, about: "Check in with your body, and notice what it has to say.", memberAudio: "PL27_Doubting-Myself_Ask-Your-Body.m4a" },
      { title: "Boundary Breath",     type: "Breathwork",        minutes: 3, about: "Breathe in for four and out for six, and make a little space around you.", memberAudio: "PL28_Doubting-Myself_Boundary-Breath.m4a" },
      { title: "Sovereign Stance",    type: "Affirmation",       minutes: 2, about: "Stand or sit tall, and take your sovereign stance.", memberAudio: "PL29_Doubting-Myself_Sovereign-Stance.m4a" },
      { title: "Evening Reclaim",     type: "Evening release",   minutes: 4, about: "Put down the day, and come back to yourself before you rest.", note: "Best enjoyed lying down or reclining somewhere safe. Do not use while driving.", memberAudio: "PL30_Doubting-Myself_Evening-Reclaim.m4a" }
    ]
  }
];
