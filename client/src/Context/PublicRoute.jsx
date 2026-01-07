import { Navigate } from "react-router-dom";
import { useAuth } from "./Authcontext";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (user) {
    if (user.role === "admin") {
      // ✅ FIX: Redirect to /admin (which auto-redirects to /admin/gallery)
      return <Navigate to="/admin" replace />;
    }
    // Normal user redirect
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;