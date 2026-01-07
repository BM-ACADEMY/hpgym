import React from 'react';
import { useAuth } from '../Context/Authcontext';

const UserDashboard = () => {
    const { user, logout } = useAuth();
    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold">User Dashboard</h1>
            <p>Welcome, {user?.name}</p>
            <p>Gym ID: {user?.customerId}</p>
            <button onClick={logout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Logout</button>
        </div>
    );
};
export default UserDashboard;