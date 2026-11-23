/*
  THE PAUSE LIBRARY — SUPABASE SETTINGS
  -------------------------------------
  These two values connect the app to your Supabase project for member sign-in.
  Both are SAFE to be public: they only let the app ask Supabase to sign someone in.

  ⚠️ NEVER put the "secret" key (starts with sb_secret_ or is called service_role)
     or your database password in this file or anywhere in this repository.
*/

const SUPABASE_URL = "https://zsdcuoxdlbbytuoiwbsn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_OtEJXNPJxQM3WFN2AcB2jw_F-ZaqEgS";

/*
  THE PAUSE LIBRARY — MEMBERSHIP LINKS (Stripe)
  ---------------------------------------------
  Public Stripe Payment Links and the customer portal login. Safe to be public.
  Both plans start with a 7-day free trial (card required). Checkout gives
  Pause Library access to the email address used at checkout, so members
  must sign in to the app with that same email.
*/
const MEMBERSHIP = {
  monthly: { label: "Join monthly", price: "US$10 a month", url: "https://buy.stripe.com/9B65kE4B00pRcXM2qo7bW00" },
  yearly:  { label: "Join yearly",  price: "US$100 a year", url: "https://buy.stripe.com/4gMfZi2sS1tV7Ds6GE7bW01" },
  manageUrl: "https://billing.stripe.com/p/login/9B65kE4B00pRcXM2qo7bW00"
};
