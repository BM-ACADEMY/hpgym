// src/Admin/AdminDashboard.jsx
import React from 'react';
import { useAuth } from '../Context/Authcontext';
import { NavLink, Outlet } from 'react-router-dom';
import { MessageSquare, LogOut, Users, ImageDownIcon, ChartNoAxesCombined, CreditCard } from 'lucide-react';

const AdminDashboard = () => {
    const { user, logout } = useAuth();

    const sidebarLinks = [
        { name: "Overviews", path: "/admin/overview", icon: <ChartNoAxesCombined  size={20} /> },
        { name: "All Users", path: "/admin/users", icon: <Users size={20} /> },
        { name: "Subscription", path: "/admin/subscription", icon: <CreditCard size={20} /> },
        { name: "Gallery", path: "/admin/gallery", icon: <ImageDownIcon size={20} /> },
        { name: "Testimonials", path: "/admin/testimonials", icon: <MessageSquare size={20} /> },
    ];

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-200 py-3 bg-white shadow-sm z-10">
                <a href="/" className="flex items-center gap-2 font-bold text-xl text-gray-600">
                    Hp Fitness Studio
                </a>

                <div className="flex items-center gap-4 text-gray-600">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-800">{user?.name || "Admin User"}</p>
                        <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                    <button
                        onClick={logout}
                        className='flex items-center gap-2 border border-gray-300 rounded-full text-sm px-4 py-1.5 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors'
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-16 md:w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300">
                    <div className="flex flex-col pt-6 gap-1">
                        {sidebarLinks.map((item, index) => (
                            <NavLink
                                key={index}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center py-3 px-4 gap-3 border-r-4 transition-colors duration-200
                                    ${isActive
                                        ? "border-red-500 bg-red-50 text-red-600"
                                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`
                                }
                            >
                                {item.icon}
                                <span className="md:block hidden font-medium">{item.name}</span>
                            </NavLink>
                        ))}
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto p-6 md:p-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;