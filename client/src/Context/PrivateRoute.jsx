// src/Context/PrivateRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/Authcontext";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  // 1. Not logged in -> Go to Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Logged in, but wrong role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // ✅ FIX: Redirect to "/user" if they are a normal user
    return <Navigate to={user.role === "admin" ? "/admin" : "/user"} replace />;
  }

  return children;
};

export default PrivateRoute;