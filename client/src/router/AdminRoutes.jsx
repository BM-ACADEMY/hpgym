// src/router/AdminRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from '@/Admin/AdminDashboard';
import Users from '@/Admin/Pages/Users';
import Subscription from '@/Admin/Pages/Subscription'; // Import the new page
import Gallery from '@/Admin/Pages/Gallery';
import Testimonial from '@/Admin/Pages/Testimonial';
import Overviews from '@/Admin/Pages/Overviews';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route element={<AdminDashboard />}>
                <Route index element={<Navigate to="overview" replace />} />
                
                <Route path="users" element={<Users />} />
                <Route path="subscription" element={<Subscription />} /> 
                <Route path="testimonials" element={<Testimonial />} />
                <Route path="gallery" element={<Gallery />} />
                <Route path="overview" element={<Overviews />} />
            </Route>
        </Routes>
    );
};

export default AdminRoutes;