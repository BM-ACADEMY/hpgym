import React, { useEffect, useState } from 'react';
import axiosInstance from '@/api/axiosInstance'; // Adjust path based on your folder structure
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Activity
} from 'lucide-react';

const Overviews = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    active: 0,
    expiringSoon: 0,
    expired: 0,
    inactive: 0,
    newUsersThisMonth: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get('/users');
        const users = response.data;

        // --- 1. Calculate Subscription Stats ---
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const calculatedStats = users.reduce(
          (acc, user) => {
            acc.totalUsers++;

            // Calculate Growth (New users in last 30 days)
            const createdDate = new Date(user.createdAt);
            if (createdDate >= thirtyDaysAgo) {
              acc.newUsersThisMonth++;
            }

            // Calculate Live Plan Status
            // We use the helper function logic directly here to ensure accuracy
            let status = 'inactive';
            if (user.subscription?.endDate) {
              const end = new Date(user.subscription.endDate);
              const diffTime = end - now;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays < 0) status = 'expired';
              else if (diffDays <= 7) status = 'expiring_soon';
              else status = 'active';
            }

            if (status === 'active') acc.active++;
            else if (status === 'expiring_soon') acc.expiringSoon++;
            else if (status === 'expired') acc.expired++;
            else acc.inactive++;

            return acc;
          },
          { totalUsers: 0, active: 0, expiringSoon: 0, expired: 0, inactive: 0, newUsersThisMonth: 0 }
        );

        setStats(calculatedStats);

        // --- 2. Get Recent Users (Top 5) ---
        // Assuming the API returns sorted by createdAt -1, otherwise we slice the first 5
        setRecentUsers(users.slice(0, 5));

        setLoading(false);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load dashboard data.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Chart Data
  const chartData = [
    { name: 'Active', value: stats.active, color: '#10B981' },
    { name: 'At Risk', value: stats.expiringSoon, color: '#F59E0B' },
    { name: 'Expired', value: stats.expired, color: '#EF4444' },
    { name: 'Inactive', value: stats.inactive, color: '#9CA3AF' },
  ].filter(item => item.value > 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-gray-500">
      <Activity className="w-6 h-6 animate-spin mr-2" /> Loading Dashboard...
    </div>
  );

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Overview Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time subscription and user insights</p>
      </div>

      {/* --- 1. Key Metrics Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          count={stats.totalUsers}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-100"
          subtext={`${stats.newUsersThisMonth} joined this month`}
        />
        <StatCard
          title="Active Plans"
          count={stats.active}
          icon={CheckCircle}
          color="text-emerald-600"
          bg="bg-emerald-100"
        />
        <StatCard
          title="Expiring Soon"
          count={stats.expiringSoon}
          icon={AlertTriangle}
          color="text-amber-600"
          bg="bg-amber-100"
          subtext="Action needed"
        />
        <StatCard
          title="Expired / Inactive"
          count={stats.expired + stats.inactive}
          icon={XCircle}
          color="text-rose-600"
          bg="bg-rose-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

        {/* --- 2. Analytics Chart --- */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Subscription Health</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Breakdown</h4>
            <ProgressBar label="Active Conversion" value={stats.active} total={stats.totalUsers} color="bg-emerald-500" />
            <ProgressBar label="Churn Rate" value={stats.expired} total={stats.totalUsers} color="bg-rose-500" />
          </div>
        </div>

        {/* --- 3. Recent Users Table --- */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Recent Registrations</h3>
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">Last 5 Users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-500">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Join Date</th>
                  <th className="px-6 py-4 text-right">Plan End</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <StatusBadge endDate={user.subscription?.endDate} />
                    </td>
                    <td className="px-6 py-4">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {user.subscription?.endDate
                        ? new Date(user.subscription.endDate).toLocaleDateString()
                        : <span className="text-gray-400">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Sub-Components ---

const StatCard = ({ title, count, icon: Icon, color, bg, subtext }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
      <h4 className="text-3xl font-bold text-gray-900">{count}</h4>
      {subtext && (
        <div className="flex items-center mt-2 text-xs font-medium text-gray-500">
          <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
          {subtext}
        </div>
      )}
    </div>
    <div className={`p-3 rounded-lg ${bg} ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

const ProgressBar = ({ label, value, total, color }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-xs font-medium text-gray-900">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const StatusBadge = ({ endDate }) => {
  if (!endDate) return <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">Inactive</span>;

  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">Expired</span>;
  if (diffDays <= 7) return <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">Expiring</span>;
  return <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">Active</span>;
};

export default Overviews;
