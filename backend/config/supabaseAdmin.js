import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default supabaseAdmin;
