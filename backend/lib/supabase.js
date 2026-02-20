import { createClient } from "@supabase/supabase-js";

let supabaseAdmin = null;
let supabaseAuth = null;

export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }
  console.log("🔑 SUPABASE URL:", process.env.SUPABASE_URL);
  console.log(
    "🔑 SERVICE KEY PREFIX:",
    process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 15),
  );

  return supabaseAdmin;
}

export function getSupabaseAuth() {
  if (!supabaseAuth) {
    supabaseAuth = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
    );
  }
  return supabaseAuth;
}
