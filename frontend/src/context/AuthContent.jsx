import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserWithRole = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUser(null);
      setLoading(false);
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
    }

    setUser({
      ...user,
      role: profile?.role ?? "user",
    });

    setLoading(false);
  };

  useEffect(() => {
    loadUserWithRole();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUserWithRole(); // 🔁 reload role on login/logout
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
