// src/Context/PublicRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./Authcontext";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (user) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    // ✅ FIX: Redirect to "/user", which is the main entry point defined in Mainroutes
    return <Navigate to="/user" replace />;
  }

  return children;
};

export default PublicRoute;