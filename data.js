/*
  THE PAUSE LIBRARY — CONTENT
  ---------------------------
  This is the only file you need to edit to change the words in the app.

  Each feeling has:
    id      – a short web-friendly name (lowercase, no spaces). Used in links.
    name    – what people see on screen.
    prompt  – the gentle line shown at the top of that feeling's page.
    color   – the soft background colour for that feeling.
    accent  – a deeper version of the colour, used for buttons and text.
    practices – a list of five practices.

  Each practice has:
    title   – the practice name.
    type    – e.g. Breathwork, Body scan, Grounding.
    minutes – how long it lasts (2–5).
    about   – one sentence shown on the player screen.
    audio   – (optional) a link to an audio file. Leave as "" until you have one.

  The FIRST practice in every list is automatically tagged "Free sample".
*/

const FEELINGS = [
  {
    id: "overwhelmed",
    name: "Overwhelmed",
    prompt: "When everything feels like too much.",
    color: "#DDE8F1",
    accent: "#4F7396",
    practices: [
      { title: "Set It Down",         type: "Breathwork",        minutes: 3, about: "A slow breath to put down what you're carrying, just for now.", audio: "" },
      { title: "One Thing at a Time", type: "Guided meditation", minutes: 4, about: "Narrow your attention to a single, simple thing.", audio: "" },
      { title: "The Long Exhale",     type: "Breathwork",        minutes: 2, about: "Lengthen each out-breath to tell your body it's safe.", audio: "" },
      { title: "Shoulders Down",      type: "Body scan",         minutes: 5, about: "Soften the places where stress likes to hide.", audio: "" },
      { title: "Clear the Desk",      type: "Visualization",     minutes: 4, about: "Picture clearing a cluttered space, one item at a time.", audio: "" }
    ]
  },
  {
    id: "scattered",
    name: "Scattered",
    prompt: "When your mind is in a hundred places.",
    color: "#DFEBE1",
    accent: "#55805F",
    practices: [
      { title: "Come Back Here",      type: "Grounding",         minutes: 2, about: "Use your senses to gently return to this moment.", audio: "" },
      { title: "Five Things",         type: "Grounding",         minutes: 3, about: "Notice five things you can see, four you can hear…", audio: "" },
      { title: "Counting Breaths",    type: "Breathwork",        minutes: 4, about: "Count each breath up to ten, then begin again.", audio: "" },
      { title: "Feet on the Floor",   type: "Body scan",         minutes: 3, about: "Feel the ground holding you steady.", audio: "" },
      { title: "A Single Thread",     type: "Guided meditation", minutes: 5, about: "Follow one calm thought from beginning to end.", audio: "" }
    ]
  },
  {
    id: "reactive",
    name: "Reactive",
    prompt: "When you're about to snap, or just did.",
    color: "#F4E0DD",
    accent: "#A65F57",
    practices: [
      { title: "The Pause Before",    type: "Breathwork",        minutes: 2, about: "Find the small space between feeling and reacting.", audio: "" },
      { title: "Cool Down",           type: "Breathwork",        minutes: 3, about: "A cooling breath to bring the heat down.", audio: "" },
      { title: "Name It to Tame It",  type: "Guided meditation", minutes: 4, about: "Put a gentle name to what you're feeling.", audio: "" },
      { title: "Unclench",            type: "Body scan",         minutes: 3, about: "Release your jaw, your hands, your chest.", audio: "" },
      { title: "Soft Response",       type: "Reflection",        minutes: 5, about: "Imagine responding the way you'd like to.", audio: "" }
    ]
  },
  {
    id: "drained",
    name: "Drained",
    prompt: "When you have nothing left to give.",
    color: "#F5E7D6",
    accent: "#A2733F",
    practices: [
      { title: "Refill",              type: "Guided meditation", minutes: 3, about: "Let yourself receive, instead of give, for a few minutes.", audio: "" },
      { title: "Rest Is Allowed",     type: "Body scan",         minutes: 5, about: "Permission to do nothing at all.", audio: "" },
      { title: "Gentle Energy",       type: "Breathwork",        minutes: 2, about: "A soft, brightening breath to lift you a little.", audio: "" },
      { title: "Warm Light",          type: "Visualization",     minutes: 4, about: "Imagine warmth slowly filling your body.", audio: "" },
      { title: "Small Kindness",      type: "Reflection",        minutes: 3, about: "Choose one small kind thing to do for yourself.", audio: "" }
    ]
  },
  {
    id: "numb",
    name: "Numb",
    prompt: "When you can't quite feel anything.",
    color: "#E7E2F0",
    accent: "#76679A",
    practices: [
      { title: "Gentle Return",       type: "Grounding",         minutes: 3, about: "Slowly reconnect with the feeling of being here.", audio: "" },
      { title: "Hands on Heart",      type: "Body scan",         minutes: 2, about: "Feel the warmth and rhythm under your hands.", audio: "" },
      { title: "Texture and Touch",   type: "Grounding",         minutes: 4, about: "Notice what you can feel against your skin.", audio: "" },
      { title: "Waking Breath",       type: "Breathwork",        minutes: 3, about: "A steady breath to bring gentle sensation back.", audio: "" },
      { title: "Something Small",     type: "Reflection",        minutes: 5, about: "Look for one small thing you can feel, even faintly.", audio: "" }
    ]
  },
  {
    id: "doubting-myself",
    name: "Doubting Myself",
    prompt: "When the inner critic is loud.",
    color: "#F2EBCF",
    accent: "#8E7A32",
    practices: [
      { title: "You Are Enough",      type: "Affirmation",       minutes: 3, about: "Kind words to quiet the critic, just for now.", audio: "" },
      { title: "Remember When",       type: "Reflection",        minutes: 4, about: "Recall a time you handled something hard.", audio: "" },
      { title: "Steady Ground",       type: "Grounding",         minutes: 2, about: "Feel how solidly you're already standing.", audio: "" },
      { title: "A Friend's Voice",    type: "Guided meditation", minutes: 5, about: "Speak to yourself the way a good friend would.", audio: "" },
      { title: "Tall and Rooted",     type: "Body scan",         minutes: 3, about: "Settle into a posture of quiet confidence.", audio: "" }
    ]
  }
];
