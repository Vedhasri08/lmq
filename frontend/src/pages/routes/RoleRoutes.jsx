import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContent";

const RoleRoute = ({ role, children }) => {
  const { user } = useAuth();

  if (!user) return null; // or loader

  if (user.role !== role) {
    return (
      <Navigate to={role === "admin" ? "/profile" : "/admin/profile"} replace />
    );
  }

  return children;
};

export default RoleRoute;
