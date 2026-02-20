import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error } = await supabase
    .from("courses")
    .update({
      status: "published",
      is_published: true,
    })
    .eq("status", "scheduled")
    .lte("publish_at", new Date().toISOString());

  if (error) {
    console.error("Auto publish failed:", error);
    return new Response("Error publishing courses", { status: 500 });
  }

  return new Response("Scheduled courses published", { status: 200 });
});
