// src/Mainroutes.jsx
import { Routes, Route } from "react-router-dom";
import Homeroutes from "./Homeroutes";
import Login from "@/auth/Login";
import PrivateRoute from "@/Context/PrivateRoute";
import PublicRoute from "@/Context/PublicRoute";
import UserRoutes from "./UserRoutes";
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

      {/* --- User Routes --- */}
      {/* Changed path to /user/* and element to UserRoutes */}
      <Route 
        path="/user/*" 
        element={
            <PrivateRoute allowedRoles={['user']}> 
                <UserRoutes />
            </PrivateRoute>
        } 
      />

      {/* --- Admin Routes --- */}
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