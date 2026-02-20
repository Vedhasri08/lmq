import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import AppLayout from "components/layout/AppLayout";
import useSupabaseAuth from "../../hooks/useSupabaseAuth";

const ProtectedRoute = () => {
  const user = useSupabaseAuth();

  // While checking auth state
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return user ? (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
