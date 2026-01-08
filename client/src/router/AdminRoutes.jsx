// src/Admin/AdminRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '@/Admin/AdminDashboard';
import Users from '@/Admin/Pages/Users';
import Gallery from '@/Admin/Pages/Gallery';

const AdminHome = () => <div className="text-2xl font-bold">Admin Dashboard Home</div>;
const AdminChat = () => <div className="text-xl">Admin Chat Module</div>;

const AdminRoutes = () => {
    return (
        <Routes>
            {/* The Layout wraps all child routes */}
            <Route element={<AdminDashboard />}>

                {/* Path: /admin/ */}
                <Route index element={<AdminHome />} />

                {/* Path: /admin/overview */}
                <Route path="users" element={<Users />} />

                {/* Path: /admin/chat */}
                <Route path="gallery" element={<Gallery />} />

            </Route>
        </Routes>
    );
};

export default AdminRoutes;
