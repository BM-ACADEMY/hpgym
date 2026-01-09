import React, { useEffect, useState } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { showToast } from '@/utils/customToast.jsx';
import { 
  Users, 
  MessageSquare, 
  Image as ImageIcon, 
  TrendingUp,
  Loader2,
  MoreVertical
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('month'); // Default filter

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/dashboard/stats?filter=${filter}`);
        setStats(data);
      } catch (error) {
        console.error("Dashboard error:", error);
        showToast('error', error.response?.data?.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [filter]);

  // Helper for filter buttons
  const FilterButton = ({ label, value }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 
        ${filter === value 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-transparent'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen">
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, Admin</p>
        </div>
        
        {/* Filter Controls */}
        <div className="flex items-center p-1 bg-white rounded-xl border border-gray-200 shadow-sm">
          <FilterButton label="Today" value="today" />
          <FilterButton label="Yesterday" value="yesterday" />
          <FilterButton label="Month" value="month" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* --- Modern Stat Cards --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard 
              title="New Users" 
              count={stats?.counts?.users} 
              icon={<Users />} 
              color="blue"
              filter={filter}
            />
            <StatCard 
              title="Reviews Received" 
              count={stats?.counts?.testimonials} 
              icon={<MessageSquare />} 
              color="green"
              filter={filter}
            />
            <StatCard 
              title="Gallery Uploads" 
              count={stats?.counts?.gallery} 
              icon={<ImageIcon />} 
              color="purple"
              filter={filter}
            />
          </div>

          {/* --- Charts Section --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 1. Wave Graph (Area Chart) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Growth Trend</h2>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{filter} view</p>
                  </div>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.charts?.userGrowth}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 12}} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 12}} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                        padding: '12px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorUsers)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Subscription Status (Pie Chart) */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-bold text-slate-800">User Status</h2>
                 <MoreVertical size={20} className="text-gray-400 cursor-pointer" />
              </div>
              
              <div className="flex-1 min-h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.charts?.userStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats?.charts?.userStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Stats */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                  <span className="text-3xl font-bold text-slate-800">
                    {stats?.charts?.userStatus.reduce((acc, curr) => acc + curr.value, 0)}
                  </span>
                  <p className="text-xs text-gray-400 font-medium uppercase mt-1">Total Users</p>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

// --- Modern Stat Card Component ---
const StatCard = ({ title, count, icon, color, filter }) => {
  const styles = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
    purple: { bg: 'bg-violet-50', text: 'text-violet-600', badge: 'bg-violet-100 text-violet-700' },
  };

  const currentStyle = styles[color] || styles.blue;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <p className="text-gray-400 text-xs font-bold tracking-wider uppercase mb-2">
            {title}
          </p>
          <h3 className="text-4xl font-extrabold text-slate-800">
            {count || 0}
          </h3>
          
          <div className="flex items-center gap-2 mt-4">
             {/* Mock trend data for visuals */}
            <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${currentStyle.badge} flex items-center`}>
              ↗ +12%
            </span>
            <span className="text-gray-400 text-xs">
              vs last {filter === 'month' ? 'month' : 'day'}
            </span>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${currentStyle.bg} ${currentStyle.text} ring-4 ring-white shadow-sm transition-transform group-hover:scale-110`}>
          {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;