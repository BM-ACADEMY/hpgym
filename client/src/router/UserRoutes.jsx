// src/User/UserRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserDashboard from '@/User/UserDashboard';
import Profile from '@/User/Page/Profile';
import Testimonial from '@/User/Page/Testimonial';



const UserRoutes = () => {
    return (
        <Routes>
            <Route element={<UserDashboard />}>
                
                {/* Path: /user - Renders Profile by default */}
                <Route index element={<Profile />} />

                {/* Path: /user/testimonial */}
                <Route path="testimonial" element={<Testimonial />} />


            </Route>
        </Routes>
    );
};

export default UserRoutes;