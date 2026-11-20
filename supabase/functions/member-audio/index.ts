import { createClient } from "npm:@supabase/supabase-js@2";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

const url = Deno.env.get("SUPABASE_URL")!;
const auth = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!);
const storage = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!).storage;

function reply(body: Record<string, string>, status = 200) {
  return Response.json(body, { status, headers });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers });
  if (request.method !== "POST") return reply({ error: "Method not allowed" }, 405);

  const token = request.headers.get("Authorization")?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token) return reply({ error: "Sign-in required" }, 401);
  const { data, error } = await auth.auth.getUser(token);
  if (error || !data.user || data.user.is_anonymous) {
    return reply({ error: "Sign-in required" }, 401);
  }

  const body = await request.json().catch(() => null);
  const path = body?.path;
  if (typeof path !== "string" || path.length > 200 ||
      !/^(?:[a-z0-9-]+\/)*[a-z0-9-]+\.(?:mp3|m4a|ogg|wav)$/.test(path)) {
    return reply({ error: "Invalid recording path" }, 400);
  }

  const result = await storage.from("member-audio").createSignedUrl(path, 15 * 60);
  if (result.error || !result.data) return reply({ error: "Recording unavailable" }, 404);
  return reply({ signedUrl: result.data.signedUrl });
});
