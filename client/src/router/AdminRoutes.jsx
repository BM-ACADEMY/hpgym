// src/Admin/AdminRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // 1. Import Navigate
import AdminDashboard from '@/Admin/AdminDashboard';
import Users from '@/Admin/Pages/Users';
import Gallery from '@/Admin/Pages/Gallery';
import Testimonial from '@/Admin/Pages/Testimonial';
// import Dashbaord from '@/Admin/Pages/Dashbaord'; // You can remove this import now

const AdminRoutes = () => {
    return (
        <Routes>
            <Route element={<AdminDashboard />}>

                {/* 2. Change the Index Route to Navigate to users */}
                <Route index element={<Navigate to="users" replace />} />

                {/* Existing Routes */}
                <Route path="users" element={<Users />} />
                <Route path="testimonials" element={<Testimonial />} />
                <Route path="gallery" element={<Gallery />} />

            </Route>
        </Routes>
    );
};

export default AdminRoutes;