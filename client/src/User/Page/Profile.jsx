import React, { useState, useEffect } from 'react';
import { useAuth } from '@/Context/Authcontext'; 
import axiosInstance from '@/api/axiosInstance'; 
import { showToast } from '@/utils/customToast'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Hash, ShieldCheck, 
  Edit3, KeyRound, X, Save, Loader2, AlertTriangle // <--- Added AlertTriangle
} from 'lucide-react';
import { format, isValid, differenceInDays } from 'date-fns'; 

const Profile = () => {
  const { user, setUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // 1. FETCH FRESH DATA ON MOUNT
  useEffect(() => {
    const fetchLatestUserData = async () => {
      if (!user?._id) return;
      
      setLoadingData(true);
      try {
        const res = await axiosInstance.get(`/users/${user._id}`); 
        
        if (res.data) {
           setUser(prev => ({ ...prev, ...res.data }));
           const currentStorage = JSON.parse(localStorage.getItem("userInfo") || "{}");
           localStorage.setItem("userInfo", JSON.stringify({ ...currentStorage, ...res.data }));
        }
      } catch (error) {
        console.error("Could not refresh user data", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchLatestUserData();
  }, []);

  // --- Animation Variants ---
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  // Helper to safely format dates
  const safeFormatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'PP') : '-';
  };

  // Helper to get days remaining
  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const today = new Date();
    return differenceInDays(end, today);
  };

  return (
    <div className="max-w-8xl mx-auto space-y-8 pb-10">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            My Profile
            {loadingData && <Loader2 size={20} className="animate-spin text-red-500" />}
          </h1>
          <p className="text-gray-500 mt-1">Manage your account details and subscription</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all active:scale-95 font-medium"
            >
                <Edit3 size={18} /> Edit Profile
            </button>
            <button 
                onClick={() => setIsPassModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-all active:scale-95 font-medium"
            >
                <KeyRound size={18} /> Security
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Left Column: Personal Info --- */}
        <div className="lg:col-span-2 space-y-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
            >
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <User className="text-red-500" size={24} /> Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-8">
                    <ProfileField 
                        label="Full Name" 
                        value={user?.name} 
                        icon={<User size={18} />} 
                    />
                    <ProfileField 
                        label="Email Address" 
                        value={user?.email} 
                        icon={<Mail size={18} />} 
                    />
                    <ProfileField 
                        label="Phone Number" 
                        value={user?.phoneNumber} 
                        icon={<Phone size={18} />} 
                    />
                    <ProfileField 
                        label="Customer ID" 
                        value={user?.customerId || "N/A"} 
                        icon={<Hash size={18} />} 
                        isReadOnly={true}
                    />
                </div>
            </motion.div>
        </div>

        {/* --- Right Column: Subscription --- */}
        <div className="lg:col-span-1 space-y-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col"
            >
                 <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <ShieldCheck className="text-purple-500" size={24} /> Subscription
                </h3>

                {/* --- ⚠️ EXPIRING SOON ALERT --- */}
                {user?.subscription?.planStatus === 'expiring_soon' && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3 animate-pulse">
                        <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm font-bold text-yellow-800">Plan Expiring Soon!</p>
                            <p className="text-xs text-yellow-700 mt-1 leading-relaxed">
                                Your plan expires in <span className="font-bold">{getDaysRemaining(user?.subscription?.endDate)} days</span>. 
                                Please contact admin to renew.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 py-4">
                    {/* Status Badge */}
                    <StatusBadge status={user?.subscription?.planStatus} />
                    
                    <div className="w-full border-t border-gray-100 my-4"></div>

                    {/* Dates Display */}
                    <div className="w-full space-y-4 text-left">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">Start Date</span>
                            <span className="font-medium text-gray-800">
                                {safeFormatDate(user?.subscription?.startDate)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">End Date</span>
                            <span className="font-medium text-gray-800">
                                {safeFormatDate(user?.subscription?.endDate)}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
      </div>

      {/* --- Modals --- */}
      <AnimatePresence>
        {isEditModalOpen && (
            <EditProfileModal 
                user={user} 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                setUser={setUser}
                variants={modalVariants}
                backdropVariants={backdropVariants}
            />
        )}
        {isPassModalOpen && (
            <ChangePasswordModal 
                user={user}
                isOpen={isPassModalOpen} 
                onClose={() => setIsPassModalOpen(false)}
                variants={modalVariants}
                backdropVariants={backdropVariants}
            />
        )}
      </AnimatePresence>

    </div>
  );
};

// --- Sub-components ---

const ProfileField = ({ label, value, icon, isReadOnly }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
            {icon} {label}
        </label>
        <div className={`text-base font-medium px-4 py-3 rounded-xl border ${isReadOnly ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-200 text-gray-800'}`}>
            {value || "Not provided"}
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const currentStatus = status || 'inactive';

    const styles = {
        active: "bg-green-100 text-green-700 border-green-200",
        expiring_soon: "bg-yellow-100 text-yellow-700 border-yellow-200",
        expired: "bg-red-100 text-red-700 border-red-200",
        inactive: "bg-gray-100 text-gray-600 border-gray-200",
    };
    
    const labels = {
        active: "Active Plan",
        expiring_soon: "Expiring Soon",
        expired: "Plan Expired",
        inactive: "No Active Plan",
    };

    return (
        <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${styles[currentStatus] || styles.inactive}`}>
            {labels[currentStatus] || "Inactive"}
        </span>
    );
};

// --- Edit Profile Modal ---
const EditProfileModal = ({ user, onClose, setUser, variants, backdropVariants }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axiosInstance.put(`/users/${user._id}`, formData);
            
            setUser((prev) => ({ ...prev, ...res.data }));
            
            const currentStorage = JSON.parse(localStorage.getItem("userInfo") || "{}");
            localStorage.setItem("userInfo", JSON.stringify({ ...currentStorage, ...res.data }));

            showToast("success", "Profile updated successfully!");
            onClose();
        } catch (error) {
            showToast("error", error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                variants={backdropVariants}
                initial="hidden" animate="visible" exit="exit"
                onClick={onClose}
            />
            <motion.div 
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                variants={variants}
                initial="hidden" animate="visible" exit="exit"
            >
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">Edit Profile</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            type="email" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div className="opacity-60">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID (Cannot be changed)</label>
                         <input 
                            type="text" 
                            value={user?.customerId || ''} 
                            disabled 
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 cursor-not-allowed"
                        />
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// --- Change Password Modal ---
const ChangePasswordModal = ({ user, onClose, variants, backdropVariants }) => {
    const [loading, setLoading] = useState(false);
    const [passData, setPassData] = useState({ password: '', confirmPassword: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(passData.password !== passData.confirmPassword) {
            return showToast("error", "Passwords do not match");
        }
        
        setLoading(true);
        try {
            await axiosInstance.put(`/users/${user._id}/password`, { password: passData.password });
            showToast("success", "Password updated successfully!");
            onClose();
        } catch (error) {
            showToast("error", error.response?.data?.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                variants={backdropVariants}
                initial="hidden" animate="visible" exit="exit"
                onClick={onClose}
            />
            
            <motion.div 
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                variants={variants}
                initial="hidden" animate="visible" exit="exit"
            >
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">Change Password</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                            value={passData.password}
                            onChange={(e) => setPassData({...passData, password: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                            value={passData.confirmPassword}
                            onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-semibold transition-all disabled:opacity-70"
                        >
                             {loading ? <Loader2 className="animate-spin" size={20} /> : "Update Password"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Profile;