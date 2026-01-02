import AppLayout from "components/layout/AppLayout";
import { useAuth } from "../../context/AuthContent";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  return isAuthenticated ? (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
