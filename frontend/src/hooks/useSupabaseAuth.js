import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const useSupabaseAuth = () => {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return user;
};

export default useSupabaseAuth;
