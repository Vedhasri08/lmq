import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;
