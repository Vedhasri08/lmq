import { supabase } from "@/lib/supabase";

export const getTotalUsers = async () => {
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  if (error) throw error;

  return count;
};
