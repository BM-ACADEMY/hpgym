import React, { useEffect, useState } from 'react';
import axiosInstance from '@/api/axiosInstance';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Activity,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

const Overviews = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- Data States ---
  const [users, setUsers] = useState([]); // Store all users
  const [stats, setStats] = useState({
    totalUsers: 0,
    active: 0,
    expiringSoon: 0,
    expired: 0,
    inactive: 0,
    newUsersThisMonth: 0
  });

  // --- Filter & Pagination States ---
  const [planFilter, setPlanFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Show 5 per page for the overview widget

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get('/users');
        const fetchedUsers = response.data;
        setUsers(fetchedUsers); // Save full list

        // --- 1. Calculate Stats ---
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const calculatedStats = fetchedUsers.reduce(
          (acc, user) => {
            acc.totalUsers++;

            // Growth
            const createdDate = new Date(user.createdAt);
            if (createdDate >= thirtyDaysAgo) {
              acc.newUsersThisMonth++;
            }

            // Plan Status Helper Logic
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

            // Attach calculated status to user object for easy filtering later
            user.calculatedStatus = status;

            return acc;
          },
          { totalUsers: 0, active: 0, expiringSoon: 0, expired: 0, inactive: 0, newUsersThisMonth: 0 }
        );

        setStats(calculatedStats);
        setLoading(false);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load dashboard data.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- Filtering Logic ---
  const filteredUsers = users.filter((user) => {
    if (planFilter === 'all') return true;
    return user.calculatedStatus === planFilter;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Keep sorted by newest

  // --- Pagination Logic ---
  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filter changes
  }, [planFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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

        {/* --- 3. User Table with Filter & Pagination --- */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          
          {/* Header with Filter */}
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">User Directory</h3>
              <p className="text-xs text-gray-500">Manage and view user statuses</p>
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <div className="absolute left-3 top-2.5 pointer-events-none text-gray-400">
                <Filter size={14} />
              </div>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors appearance-none cursor-pointer hover:border-gray-300 font-medium text-gray-700 min-w-[160px]"
              >
                <option value="all">All Plans</option>
                <option value="active">Active</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="expired">Expired</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="absolute right-3 top-3 pointer-events-none text-gray-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto flex-grow">
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
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <StatusBadge status={user.calculatedStatus} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right font-medium whitespace-nowrap">
                        {user.subscription?.endDate
                          ? new Date(user.subscription.endDate).toLocaleDateString()
                          : <span className="text-gray-400">-</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                      No users found matching filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredUsers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Page <span className="font-medium text-gray-700">{currentPage}</span> of <span className="font-medium text-gray-700">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 shadow-sm transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 shadow-sm transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
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

// Updated to accept calculated Status string
const StatusBadge = ({ status }) => {
  if (status === 'expired') return <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">Expired</span>;
  if (status === 'expiring_soon') return <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">Expiring</span>;
  if (status === 'active') return <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700">Active</span>;
  return <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">Inactive</span>;
};

export default Overviews;