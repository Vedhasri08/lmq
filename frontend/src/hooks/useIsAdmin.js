import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setIsAdmin(data?.role === "admin");
      setLoading(false);
    };

    checkAdmin();
  }, []);

  return { isAdmin, loading };
};

export default useIsAdmin;
