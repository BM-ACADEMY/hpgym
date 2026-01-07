// src/Mainroutes.jsx
import { Routes, Route } from "react-router-dom";
import Homeroutes from "./Homeroutes";
import Login from "@/auth/Login";
import UserDashboard from "@/pages/UserDashboard"; 
import PrivateRoute from "@/Context/PrivateRoute";
import PublicRoute from "@/Context/PublicRoute";
import AdminRoutes from "./AdminRoutes";

const Mainroutes = () => {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/*" element={<Homeroutes />} />
      
      <Route 
        path="/login" 
        element={
            <PublicRoute>
                <Login />
            </PublicRoute>
        } 
      />

      <Route 
        path="/user/dashboard" 
        element={
            <PrivateRoute allowedRoles={['user']}> 
                <UserDashboard />
            </PrivateRoute>
        } 
      />
      <Route 
        path="/admin/*" 
        element={
            <PrivateRoute allowedRoles={['admin']}>
                <AdminRoutes />
            </PrivateRoute>
        } 
      />
      
    </Routes>
  );
};

export default Mainroutes;