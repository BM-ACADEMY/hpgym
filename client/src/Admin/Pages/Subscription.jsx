// import React, { useState, useEffect, useRef } from "react";
// import axiosInstance from "@/api/axiosInstance";
// import { showToast } from "@/utils/customToast";
// import {
//     Search, CheckCircle, Clock, AlertCircle, Info, Calendar, Save, Loader2, Filter, ChevronDown, Check, ChevronLeft, ChevronRight, CreditCard, Edit2, Trash2, FileText, MessageCircle
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// const Subscription = () => {
//     const [users, setUsers] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [planFilter, setPlanFilter] = useState("all");
//     const [isFilterOpen, setIsFilterOpen] = useState(false);
//     const filterRef = useRef(null);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [itemsPerPage] = useState(10);
//     const [isDetailsOpen, setIsDetailsOpen] = useState(false);
//     const [selectedUser, setSelectedUser] = useState(null);
//     const [detailsTab, setDetailsTab] = useState("overview");
//     const [userHistory, setUserHistory] = useState([]);
//     const [loadingHistory, setLoadingHistory] = useState(false);
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     // Track which user is currently having a reminder sent
//     const [sendingReminder, setSendingReminder] = useState(null);

//     const [isEditingPlan, setIsEditingPlan] = useState(false);

//     // 1. Add billingDate to state
//     const [subPlan, setSubPlan] = useState({
//         isActive: false, planName: "", startDate: "", endDate: "", billingDate: "", billedBy: "", packageFee: "", totalAmount: "", paidAmount: "", remainingAmount: 0, paymentMode: "Cash",
//     });
//     const [timeLeft, setTimeLeft] = useState({ isExpired: false, days: 0, hours: 0 });

//     // --- FETCH DATA ---
//     const fetchUsers = async () => {
//         try {
//             const res = await axiosInstance.get(`/users?t=${new Date().getTime()}`);
//             setUsers(res.data);
//         } catch (err) {
//             console.error("Failed to load users");
//         }
//     };

//     useEffect(() => {
//         const initFetch = async () => { setLoading(true); await fetchUsers(); setLoading(false); }
//         initFetch();
//         const handleClickOutside = (event) => { if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false); };
//         window.addEventListener("click", handleClickOutside);
//         return () => window.removeEventListener("click", handleClickOutside);
//     }, []);

//     const fetchUserHistory = async (userId) => {
//         setLoadingHistory(true);
//         try { const res = await axiosInstance.get(`/users/${userId}/history`); setUserHistory(res.data); } catch (error) { console.error("Failed to load history"); } finally { setLoadingHistory(false); }
//     };

//     useEffect(() => {
//         const total = parseFloat(subPlan.totalAmount) || 0;
//         const paid = parseFloat(subPlan.paidAmount) || 0;
//         setSubPlan(prev => ({ ...prev, remainingAmount: total - paid }));
//     }, [subPlan.totalAmount, subPlan.paidAmount]);

//     useEffect(() => {
//         if (!isDetailsOpen || isEditingPlan || !subPlan.isActive || !subPlan.endDate) { setTimeLeft({ isExpired: false, days: 0, hours: 0 }); return; }
//         const calculateTimeLeft = () => {
//             const now = new Date();
//             const end = new Date(subPlan.endDate);
//             end.setHours(23, 59, 59, 999);
//             const diff = end - now;
//             if (diff <= 0) { setTimeLeft({ isExpired: true, days: 0, hours: 0 }); }
//             else {
//                 const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//                 const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
//                 setTimeLeft({ isExpired: false, days, hours });
//             }
//         };
//         calculateTimeLeft();
//         const timer = setInterval(calculateTimeLeft, 60000);
//         return () => clearInterval(timer);
//     }, [subPlan.endDate, subPlan.isActive, isDetailsOpen, isEditingPlan]);

//     const getDaysRemaining = (endDate) => {
//         if (!endDate) return -999;
//         const now = new Date();
//         const end = new Date(endDate);
//         now.setHours(0,0,0,0);
//         end.setHours(0,0,0,0);
//         const diff = end - now;
//         return Math.ceil(diff / (1000 * 60 * 60 * 24));
//     };

//     const updateModalStateFromUser = (user) => {
//         setSelectedUser(user);
//         const status = user.subscription?.planStatus?.toLowerCase() || "inactive";
//         const hasActivePlan = status === "active" || status === "expiring_soon";
//         setIsEditingPlan(!hasActivePlan);
//         const total = user.subscription?.totalAmount || 0;
//         const paid = user.subscription?.paidAmount || 0;

//         // 2. Populate billingDate (default to today if missing)
//         setSubPlan({
//             isActive: hasActivePlan,
//             planName: user.subscription?.planName || "",
//             startDate: user.subscription?.startDate?.split("T")[0] || "",
//             endDate: user.subscription?.endDate?.split("T")[0] || "",
//             billingDate: user.subscription?.billingDate?.split("T")[0] || new Date().toISOString().split("T")[0],
//             billedBy: user.subscription?.billedBy || "Admin",
//             packageFee: user.subscription?.packageFee || "",
//             totalAmount: total || "",
//             paidAmount: paid || "",
//             remainingAmount: total - paid,
//             paymentMode: user.subscription?.paymentMode || "Cash",
//         });
//     }

//     const handleSavePlan = async () => {
//         // 3. Add billingDate to validation
//         if (!subPlan.startDate || !subPlan.endDate || !subPlan.planName || !subPlan.totalAmount || !subPlan.billingDate) { showToast("error", "Please fill required fields"); return; }
//         setIsSubmitting(true);
//         try {
//             const res = await axiosInstance.put(`/users/${selectedUser._id}/subscription`, { ...subPlan, isActive: true });
//             const updatedUser = res.data;
//             showToast("success", "Subscription plan saved");
//             updateModalStateFromUser(updatedUser);
//             setUsers(prevUsers => prevUsers.map(u => u._id === updatedUser._id ? updatedUser : u));
//             fetchUserHistory(selectedUser._id);
//         } catch (error) { showToast("error", "Update failed"); } finally { setIsSubmitting(false); }
//     };

//     const handleDeletePlan = async () => {
//         if (!window.confirm("Cancel subscription?")) return;
//         setIsSubmitting(true);
//         try {
//             const res = await axiosInstance.put(`/users/${selectedUser._id}/subscription`, { isActive: false });
//             const updatedUser = res.data;
//             showToast("success", "Subscription Cancelled");
//             updateModalStateFromUser(updatedUser);
//             setUsers(prevUsers => prevUsers.map(u => u._id === updatedUser._id ? updatedUser : u));
//             fetchUserHistory(selectedUser._id);
//         } catch (error) { showToast("error", "Failed to cancel plan"); } finally { setIsSubmitting(false); }
//     };

//     const handleSendReminder = async (userId) => {
//         if (!window.confirm("Send WhatsApp expiry reminder manually?")) return;
//         setSendingReminder(userId);
//         try {
//             await axiosInstance.post(`/users/${userId}/reminder`);
//             showToast("success", "Reminder sent successfully");
//         }
//         catch (error) {
//             showToast("error", error.response?.data?.message || "Failed to send reminder");
//         }
//         finally {
//             setSendingReminder(null);
//         }
//     };

//     const openDetailsModal = (user) => { setDetailsTab("overview"); updateModalStateFromUser(user); fetchUserHistory(user._id); setIsDetailsOpen(true); };
//     const closeDetailsModal = () => { setIsDetailsOpen(false); setSelectedUser(null); };

//     const getStatusBadge = (status) => {
//         const configs = {
//             active: { color: "bg-green-50 text-green-700 border-green-200", icon: <CheckCircle size={12} /> },
//             expiring_soon: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: <Clock size={12} /> },
//             expired: { color: "bg-red-50 text-red-700 border-red-200", icon: <AlertCircle size={12} /> },
//             inactive: { color: "bg-gray-50 text-gray-600 border-gray-200", icon: <Info size={12} /> },
//             cancelled: { color: "bg-gray-50 text-gray-500 border-gray-200", icon: <Trash2 size={12} /> },
//         };
//         const config = configs[status] || configs.inactive;
//         return (<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${config.color}`}>{config.icon} {status?.replace("_", " ")}</span>);
//     };

//     const filteredUsers = users.filter((user) => {
//         const term = searchTerm.toLowerCase();
//         const matchesSearch = (user.name?.toLowerCase() || "").includes(term) || (user.customerId?.toLowerCase() || "").includes(term);
//         let matchesPlan = true;
//         if (planFilter !== "all") { const userPlan = user.subscription?.planStatus || "inactive"; matchesPlan = userPlan === planFilter; }
//         return matchesSearch && matchesPlan;
//     }).sort((a, b) => (a.customerId || "").localeCompare(b.customerId || ""));

//     const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
//     const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

//     return (
//         <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//                 <div><h1 className="text-2xl font-bold text-gray-800">Subscription Management</h1><p className="text-gray-500 text-sm">Assign and manage user plans</p></div>
//             </div>

//             <div className="flex flex-col xl:flex-row justify-between items-center bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-6 gap-4 border border-gray-100">
//                 <div ref={filterRef} className="relative w-full sm:w-56 z-20">
//                     <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-gray-300">
//                         <div className="flex items-center gap-2 text-gray-700"><Filter size={16} className="text-gray-400" /><span className="text-sm font-medium">{planFilter === "all" ? "All Plans" : planFilter.replace('_', ' ')}</span></div><ChevronDown size={16} className="text-gray-400" />
//                     </button>
//                     <AnimatePresence>{isFilterOpen && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 z-30">{["all", "active", "expiring_soon", "expired", "inactive"].map((opt) => (<button key={opt} onClick={() => { setPlanFilter(opt); setIsFilterOpen(false); }} className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 ${planFilter === opt ? 'text-red-600 font-medium' : 'text-gray-600'}`}>{opt.replace('_', ' ')} {planFilter === opt && <Check size={16} />}</button>))}</motion.div>)}</AnimatePresence>
//                 </div>
//                 <div className="relative w-full xl:w-64"><Search className="absolute left-3 top-2.5 text-gray-400" size={18} /><input type="text" placeholder="Search User..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-red-500 outline-none text-sm bg-gray-50 focus:bg-white" /></div>
//             </div>

//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//                 {loading ? <div className="p-20 text-center text-gray-500">Loading...</div> : (
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-left">
//                             <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
//                                 <tr>
//                                     <th className="px-6 py-4">Customer</th>
//                                     <th className="px-6 py-4">Current Status</th>
//                                     <th className="px-6 py-4">Plan Name</th>
//                                     <th className="px-6 py-4 text-right">Action</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-100">
//                                 {currentUsers.map((user) => {
//                                     const daysRemaining = getDaysRemaining(user.subscription?.endDate);
//                                     const showReminder = daysRemaining >= 0 && daysRemaining <= 3 && user.subscription?.planStatus !== 'inactive';

//                                     return (
//                                     <tr key={user._id} className="hover:bg-gray-50/50">
//                                         <td className="px-6 py-4"><p className="font-bold text-gray-900">{user.name}</p><p className="text-xs text-gray-500">{user.customerId}</p></td>
//                                         <td className="px-6 py-4">{getStatusBadge(user.subscription?.planStatus)}</td>
//                                         <td className="px-6 py-4 text-sm text-gray-600">{user.subscription?.planName || "-"}</td>
//                                         <td className="px-6 py-4 text-right">
//                                             <div className="flex items-center justify-end gap-2">
//                                                 {showReminder && (
//                                                     <button
//                                                         onClick={() => handleSendReminder(user._id)}
//                                                         disabled={sendingReminder === user._id}
//                                                         className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
//                                                         title={`Expires in ${daysRemaining} days`}
//                                                     >
//                                                         {sendingReminder === user._id ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} />}
//                                                         <span className="hidden sm:inline">Remind ({daysRemaining}d)</span>
//                                                     </button>
//                                                 )}
//                                                 <button onClick={() => openDetailsModal(user)} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"><CreditCard size={14} /> Manage</button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 )})}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//                 {filteredUsers.length > 0 && (<div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50"><span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span><div className="flex gap-2"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 border rounded hover:bg-white"><ChevronLeft size={16} /></button><button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 border rounded hover:bg-white"><ChevronRight size={16} /></button></div></div>)}
//             </div>

//             <AnimatePresence>
//                 {isDetailsOpen && selectedUser && (
//                     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDetailsModal} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
//                         <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
//                             <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
//                                 <div><h2 className="text-lg font-bold text-gray-900">Manage Subscription</h2><p className="text-xs text-gray-500">For {selectedUser.name}</p></div>
//                                 <div className="flex gap-2">
//                                     <div className="flex rounded bg-gray-200 p-0.5">
//                                         <button onClick={() => setDetailsTab("overview")} className={`px-3 py-1 text-xs font-bold rounded ${detailsTab === "overview" ? "bg-white shadow text-gray-800" : "text-gray-500"}`}>Plan</button>
//                                         <button onClick={() => setDetailsTab("history")} className={`px-3 py-1 text-xs font-bold rounded ${detailsTab === "history" ? "bg-white shadow text-gray-800" : "text-gray-500"}`}>History</button>
//                                     </div>
//                                     <button onClick={closeDetailsModal}><div className="p-1 hover:bg-gray-200 rounded-full"><ChevronDown size={20} className="rotate-180" /></div></button>
//                                 </div>
//                             </div>
//                             <div className="p-6 overflow-y-auto">
//                                 {detailsTab === "overview" ? (
//                                     <div>
//                                         <div className="flex justify-between items-center mb-5">
//                                             <div className="flex items-center gap-2"><Calendar size={18} className="text-red-500" /><span className="font-bold text-gray-800">Current Subscription</span></div>
//                                             {subPlan.isActive && !isEditingPlan ? (
//                                                 <div className="flex gap-2"><button onClick={() => setIsEditingPlan(true)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button><button onClick={handleDeletePlan} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button></div>
//                                             ) : null}
//                                         </div>
//                                         {subPlan.isActive && !isEditingPlan ? (
//                                             <div className="bg-red-50 rounded-xl p-6 border border-red-100 relative overflow-hidden">
//                                                 <div className="relative z-10 grid grid-cols-2 gap-6">
//                                                     <div><p className="text-xs text-red-500 font-bold uppercase tracking-wider mb-1">Plan Name</p><h3 className="text-xl font-bold text-gray-900">{subPlan.planName}</h3><p className="text-xs text-gray-500">Billed by {subPlan.billedBy}</p></div>
//                                                     <div className="text-right"><p className="text-xs text-red-500 font-bold uppercase tracking-wider mb-1">Total Amount</p><h3 className="text-xl font-bold text-gray-900">₹{subPlan.totalAmount}</h3><p className="text-xs text-gray-500 capitalize">{subPlan.paymentMode}</p></div>
//                                                     <div><p className="text-xs text-gray-500 mb-1">Valid From</p><p className="font-medium">{new Date(subPlan.startDate).toLocaleDateString()}</p></div>
//                                                     <div className="text-right"><p className="text-xs text-gray-500 mb-1">Valid To</p><p className="font-medium">{new Date(subPlan.endDate).toLocaleDateString()}</p></div>

//                                                     {/* DISPLAY BILLING DATE HERE IF NEEDED */}
//                                                     <div className="col-span-2 pt-2 text-center text-xs text-gray-400">
//                                                         Billed On: {new Date(subPlan.billingDate).toLocaleDateString()}
//                                                     </div>

//                                                 </div>
//                                                 <div className="mt-4 pt-4 border-t border-red-100 flex justify-between items-center text-sm font-medium text-red-700">
//                                                     <div className="flex items-center gap-2"><Clock size={16} /> {timeLeft.isExpired ? "Plan Expired" : `${timeLeft.days} days remaining`}</div>
//                                                     {subPlan.remainingAmount > 0 && <div className="text-red-600">Due: ₹{subPlan.remainingAmount}</div>}
//                                                 </div>
//                                             </div>
//                                         ) : (
//                                             <div className="space-y-4">
//                                                 {!isEditingPlan && !subPlan.isActive && (<div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl mb-4"><p className="text-gray-500 text-sm mb-3">No active plan found.</p><button onClick={() => setIsEditingPlan(true)} className="text-red-600 font-medium hover:underline text-sm">Create New Subscription</button></div>)}
//                                                 {isEditingPlan && (
//                                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
//                                                         <div className="md:col-span-2"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Plan Details</h4></div>
//                                                         <div><label className="text-xs font-semibold text-gray-700">Package Name</label><input type="text" placeholder="e.g. Gold Membership" value={subPlan.planName} onChange={e => setSubPlan({ ...subPlan, planName: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-red-500" /></div>

//                                                         {/* 4. Billing Date Input */}
//                                                         <div className="flex flex-col"><label className="text-xs font-semibold text-gray-700">Billing Date</label><input type="date" value={subPlan.billingDate} onChange={e => setSubPlan({ ...subPlan, billingDate: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-red-500" /></div>

//                                                         <div className="flex flex-col"><label className="text-xs font-semibold text-gray-700">Duration</label><div className="grid grid-cols-2 gap-2 mt-1"><div><p className="text-[10px] text-gray-400 mb-0.5">Start Date</p><input type="date" value={subPlan.startDate} onChange={e => setSubPlan({ ...subPlan, startDate: e.target.value })} className="w-full px-2 py-2 border rounded-lg text-sm focus:outline-none focus:border-red-500" /></div><div><p className="text-[10px] text-gray-400 mb-0.5">End Date</p><input type="date" value={subPlan.endDate} onChange={e => setSubPlan({ ...subPlan, endDate: e.target.value })} className="w-full px-2 py-2 border rounded-lg text-sm focus:outline-none focus:border-red-500" /></div></div></div>
//                                                         <div><label className="text-xs font-semibold text-gray-700">Billed By</label><input type="text" placeholder="Admin Name" value={subPlan.billedBy} onChange={e => setSubPlan({ ...subPlan, billedBy: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-red-500" /></div>
//                                                         <div className="md:col-span-2 mt-2"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Info</h4></div>
//                                                         <div><label className="text-xs font-semibold text-gray-700">Package Fees</label><input type="number" placeholder="Base Amount" value={subPlan.packageFee} onChange={e => setSubPlan({ ...subPlan, packageFee: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-red-500" /></div>
//                                                         <div><label className="text-xs font-semibold text-gray-700">Total Amount</label><input type="number" placeholder="Final Bill" value={subPlan.totalAmount} onChange={e => setSubPlan({ ...subPlan, totalAmount: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-red-500" /></div>
//                                                         <div><label className="text-xs font-semibold text-gray-700">Paid Amount</label><input type="number" placeholder="Amount Recvd" value={subPlan.paidAmount} onChange={e => setSubPlan({ ...subPlan, paidAmount: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-red-500" /></div>
//                                                         <div><label className="text-xs font-semibold text-gray-700">Remaining Amount</label><input type="number" readOnly value={subPlan.remainingAmount} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-gray-100 text-gray-500" /></div>
//                                                         <div className="md:col-span-2"><label className="text-xs font-semibold text-gray-700">Payment Via</label><select value={subPlan.paymentMode} onChange={e => setSubPlan({ ...subPlan, paymentMode: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-red-500 bg-white"><option value="Cash">Cash</option><option value="UPI">UPI</option><option value="Card">Card</option><option value="Online">Online</option></select></div>
//                                                         <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200"><button onClick={() => { setIsEditingPlan(false); updateModalStateFromUser(selectedUser); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-white rounded-lg transition">Cancel</button><button onClick={handleSavePlan} disabled={isSubmitting} className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm flex items-center gap-2">{isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Plan</button></div>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         )}
//                                     </div>
//                                 ) : (
//                                     <div className="space-y-4">
//                                         {/* History Tab */}
//                                         {loadingHistory ? <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-red-500" /></div> : (
//                                             userHistory.length > 0 ? (
//                                                 <div className="border border-gray-100 rounded-lg overflow-hidden">
//                                                     <table className="w-full text-sm text-left">
//                                                         <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold border-b border-gray-100"><tr><th className="px-4 py-3">Plan Details</th><th className="px-4 py-3">Billing</th><th className="px-4 py-3">Financials</th><th className="px-4 py-3 text-right">Status</th></tr></thead>
//                                                         <tbody className="divide-y divide-gray-100">
//                                                             {userHistory.map(h => {
//                                                                 const total = h.totalAmount || h.amount || 0; const paid = h.paidAmount || h.amount || 0; const due = total - paid;
//                                                                 return (
//                                                                 <tr key={h._id} className="hover:bg-gray-50/50 align-top group">
//                                                                     <td className="px-4 py-3"><p className="font-bold text-gray-800">{h.planName || "Subscription"}</p><div className="text-xs text-gray-500 mt-1 space-y-0.5"><div className="flex items-center gap-1"><span className="w-8">Start:</span> {new Date(h.startDate).toLocaleDateString()}</div><div className="flex items-center gap-1"><span className="w-8">End:</span> {new Date(h.endDate).toLocaleDateString()}</div></div></td>
//                                                                     <td className="px-4 py-3"><p className="text-sm font-medium text-gray-700">{h.billedBy || 'Admin'}</p><p className="text-xs text-gray-500">{h.paymentMode || 'Cash'}</p><p className="text-[10px] text-gray-400 mt-1">{new Date(h.billingDate || h.createdAt).toLocaleDateString()}</p></td>
//                                                                     <td className="px-4 py-3"><div className="text-xs space-y-1"><div className="flex justify-between min-w-[120px]"><span className="text-gray-500">Total:</span><span className="font-medium">₹{total}</span></div><div className="flex justify-between min-w-[120px]"><span className="text-gray-500">Paid:</span><span className="font-bold text-green-600">₹{paid}</span></div>{due > 0 && <span className="text-red-500 font-bold block text-right">Due: ₹{due}</span>}</div></td>
//                                                                     <td className="px-4 py-3 text-right"><div className="flex flex-col items-end gap-2">{getStatusBadge(h.planStatus)}<a href={`/invoice/${h._id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition"><FileText size={12} /> Invoice</a></div></td>
//                                                                 </tr>
//                                                             )})}
//                                                         </tbody>
//                                                     </table>
//                                                 </div>
//                                             ) : <div className="text-center py-10 text-gray-400">No history found.</div>
//                                         )}
//                                     </div>
//                                 )}
//                             </div>
//                         </motion.div>
//                     </div>
//                 )}
//             </AnimatePresence>
//         </div>
//     );
// };

// export default Subscription;

import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "@/api/axiosInstance";
import { showToast } from "@/utils/customToast";
import {
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Info,
  Calendar,
  Save,
  Loader2,
  Filter,
  ChevronDown,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Edit2,
  Trash2,
  FileText,
  MessageCircle,
  Send,
  ExternalLink,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Subscription = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsTab, setDetailsTab] = useState("overview");
  const [userHistory, setUserHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loadingActivation, setLoadingActivation] = useState(null);
  const [isEditingPlan, setIsEditingPlan] = useState(false);

  const [subPlan, setSubPlan] = useState({
    isActive: false,
    planName: "",
    startDate: "",
    endDate: "",
    billingDate: "",
    billedBy: "",
    packageFee: "",
    totalAmount: "",
    paidAmount: "",
    remainingAmount: 0,
    paymentMode: "Cash",
  });

  const [timeLeft, setTimeLeft] = useState({
    isExpired: false,
    days: 0,
    hours: 0,
    status: "Active", // Added status to handle "Upcoming" vs "Active"
  });

  // ─── FETCH USERS ────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(`/users?t=${new Date().getTime()}`);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users");
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      await fetchUsers();
      setLoading(false);
    };
    initFetch();

    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // ─── FETCH HISTORY ──────────────────────────────────────────────
  const fetchUserHistory = async (userId) => {
    setLoadingHistory(true);
    try {
      const res = await axiosInstance.get(`/users/${userId}/history`);
      setUserHistory(res.data);
    } catch (error) {
      console.error("Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  };

  // ─── AUTO CALCULATE REMAINING AMOUNT ────────────────────────────
  useEffect(() => {
    const total = parseFloat(subPlan.totalAmount) || 0;
    const paid = parseFloat(subPlan.paidAmount) || 0;
    setSubPlan((prev) => ({ ...prev, remainingAmount: total - paid }));
  }, [subPlan.totalAmount, subPlan.paidAmount]);

  // ─── TIME LEFT CALCULATION (FIXED: Uses Start Date) ────────
  useEffect(() => {
    if (!isDetailsOpen || isEditingPlan || !subPlan.isActive || !subPlan.endDate || !subPlan.startDate) {
      setTimeLeft({ isExpired: false, days: 0, hours: 0, status: "Inactive" });
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      // LOGIC FIX: strictly use startDate to check validity
      const start = new Date(subPlan.startDate);
      const end = new Date(subPlan.endDate);
      
      // Set hours to compare strictly by date boundaries
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      // Case 1: Plan hasn't started yet
      if (now < start) {
        const diffStart = start - now;
        const daysToStart = Math.ceil(diffStart / (1000 * 60 * 60 * 24));
        setTimeLeft({ isExpired: false, days: daysToStart, hours: 0, status: "Upcoming" });
        return;
      }

      // Case 2: Plan is active or expired
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft({ isExpired: true, days: 0, hours: 0, status: "Expired" });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        setTimeLeft({ isExpired: false, days, hours, status: "Active" });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [subPlan.startDate, subPlan.endDate, subPlan.isActive, isDetailsOpen, isEditingPlan]);

  // ─── DAYS REMAINING (FIXED: Uses Start Date) ─────────────────────────────
  const getDaysRemaining = (startDate, endDate) => {
    if (!endDate) return -999;
    if (!startDate) return -999;

    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // LOGIC FIX: If today is before Start Date, return placeholder for "Not Started"
    if (now < start) {
      return 999; // Represents "Not Started Yet"
    }

    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const updateModalStateFromUser = (user) => {
    setSelectedUser(user);
    const status = user.subscription?.planStatus?.toLowerCase() || "inactive";
    const hasActivePlan = status === "active" || status === "expiring_soon";
    setIsEditingPlan(!hasActivePlan);

    const total = user.subscription?.totalAmount || 0;
    const paid = user.subscription?.paidAmount || 0;

    setSubPlan({
      isActive: hasActivePlan,
      planName: user.subscription?.planName || "",
      startDate: user.subscription?.startDate?.split("T")[0] || "",
      endDate: user.subscription?.endDate?.split("T")[0] || "",
      billingDate:
        user.subscription?.billingDate?.split("T")[0] ||
        new Date().toISOString().split("T")[0],
      billedBy: user.subscription?.billedBy || "Admin",
      packageFee: user.subscription?.packageFee || "",
      totalAmount: total || "",
      paidAmount: paid || "",
      remainingAmount: total - paid,
      paymentMode: user.subscription?.paymentMode || "Cash",
    });
  };

  const handleSavePlan = async () => {
    if (
      !subPlan.startDate ||
      !subPlan.endDate ||
      !subPlan.planName ||
      !subPlan.totalAmount ||
      !subPlan.billingDate
    ) {
      showToast("error", "Please fill required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axiosInstance.put(
        `/users/${selectedUser._id}/subscription`,
        { ...subPlan, isActive: true }
      );
      const updatedUser = res.data;
      showToast("success", "Subscription plan saved");
      updateModalStateFromUser(updatedUser);
      setUsers((prev) =>
        prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
      );
      fetchUserHistory(selectedUser._id);
    } catch (error) {
      showToast("error", "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!window.confirm("Cancel subscription?")) return;
    setIsSubmitting(true);
    try {
      const res = await axiosInstance.put(
        `/users/${selectedUser._id}/subscription`,
        { isActive: false }
      );
      const updatedUser = res.data;
      showToast("success", "Subscription Cancelled");
      updateModalStateFromUser(updatedUser);
      setUsers((prev) =>
        prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
      );
      fetchUserHistory(selectedUser._id);
    } catch (error) {
      showToast("error", "Failed to cancel plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── MANUAL REMINDER (EXPIRY) ───────────────────────────────────
  const handleManualReminder = (user) => {
    if (!user.phoneNumber) {
      showToast("error", "User has no phone number");
      return;
    }

    let phone = user.phoneNumber.replace(/\D/g, "");
    if (phone.length === 10) phone = "91" + phone;

    const name = user.name || "Member";
    const id = user.customerId || "N/A";
    const plan = user.subscription?.planName || "Plan";
    const total = parseFloat(user.subscription?.totalAmount || 0);
    const paid = parseFloat(user.subscription?.paidAmount || 0);
    const due = total - paid;

    const message = `Hello ${name},

This is a reminder from HP Fitness Studio Unisex

Membership ID: ${id}
Package: ${plan}

Total Amount: Rs ${total.toLocaleString("en-IN")}
Paid: Rs ${paid.toLocaleString("en-IN")}
Pending Amount: Rs ${due.toLocaleString("en-IN")}

Kindly complete the remaining payment at the earliest.

Note: Membership fees once paid are non-refundable.

Thank you,
HP Fitness Studio Unisex`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    showToast("success", "Opening WhatsApp...");
  };

  // ─── MANUAL ACTIVATION / WELCOME MESSAGE ────────────────────────
  const handleManualActivation = async (user) => {
    if (!user.phoneNumber) {
      showToast("error", "No phone number found");
      return;
    }

    setLoadingActivation(user._id);

    let invoiceLink = "Invoice not available yet";

    try {
      const historyRes = await axiosInstance.get(`/users/${user._id}/history`);
      if (historyRes.data && historyRes.data.length > 0) {
        const latestInvoiceId = historyRes.data[0]._id;
        invoiceLink = `${window.location.origin}/invoice/${latestInvoiceId}`;
      }
    } catch (err) {
      console.error("Failed to fetch invoice for link", err);
    }

    let phone = user.phoneNumber.replace(/\D/g, "");
    if (phone.length === 10) phone = "91" + phone;

    const name = user.name;
    const id = user.customerId;
    const sub = user.subscription || {};

    const formatDate = (d) =>
      d
        ? new Date(d).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-";

    const bStart = formatDate(sub.billingDate || sub.startDate);
    const start = formatDate(sub.startDate);
    const end = formatDate(sub.endDate);

    const pkgFee = parseFloat(sub.packageFee || 0);
    const total = parseFloat(sub.totalAmount || 0);
    const paid = parseFloat(sub.paidAmount || 0);
    const due = total - paid;

    const message = `Hello ${name},

Welcome to HP Fitness Studio Unisex

Your membership has been successfully activated.

Membership ID: ${id}
Package Name: ${sub.planName}

Billing Start: ${bStart}
Start Date: ${start}
End Date: ${end}
Billed By: ${sub.billedBy || "Admin"}

Package Fees: Rs ${pkgFee.toLocaleString("en-IN")}
Total Amount: Rs ${total.toLocaleString("en-IN")}
Paid Amount: Rs ${paid.toLocaleString("en-IN")}
Remaining Amount: Rs ${due.toLocaleString("en-IN")}

Payment Via: ${sub.paymentMode || "Cash"}

Invoice Link : ${invoiceLink}

Terms & Conditions
• Membership fees once paid are non-refundable
• Payment cannot be reversed under any circumstances

Thank you for choosing HP Fitness Studio Unisex`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setLoadingActivation(null);
  };

  const openDetailsModal = (user) => {
    setDetailsTab("overview");
    updateModalStateFromUser(user);
    fetchUserHistory(user._id);
    setIsDetailsOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsOpen(false);
    setSelectedUser(null);
  };

  const getStatusBadge = (status) => {
    const configs = {
      active: { color: "bg-green-50 text-green-700 border-green-200", icon: <CheckCircle size={12} /> },
      expiring_soon: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: <Clock size={12} /> },
      expired: { color: "bg-red-50 text-red-700 border-red-200", icon: <AlertCircle size={12} /> },
      inactive: { color: "bg-gray-50 text-gray-600 border-gray-200", icon: <Info size={12} /> },
      cancelled: { color: "bg-gray-50 text-gray-500 border-gray-200", icon: <Trash2 size={12} /> },
    };
    const config = configs[status?.toLowerCase()] || configs.inactive;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${config.color}`}
      >
        {config.icon} {status?.replace("_", " ")}
      </span>
    );
  };

  const filteredUsers = users
    .filter((user) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (user.name?.toLowerCase() || "").includes(term) ||
        (user.customerId?.toLowerCase() || "").includes(term);
      let matchesPlan = true;
      if (planFilter !== "all") {
        const userPlan = user.subscription?.planStatus || "inactive";
        matchesPlan = userPlan === planFilter;
      }
      return matchesSearch && matchesPlan;
    })
    .sort((a, b) => (a.customerId || "").localeCompare(b.customerId || ""));

  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Subscription Management</h1>
          <p className="text-gray-500 text-sm">Assign and manage user plans</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col xl:flex-row justify-between items-center bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-6 gap-4 border border-gray-100">
        <div ref={filterRef} className="relative w-full sm:w-56 z-20">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-gray-300"
          >
            <div className="flex items-center gap-2 text-gray-700">
              <Filter size={16} className="text-gray-400" />
              <span className="text-sm font-medium">
                {planFilter === "all" ? "All Plans" : planFilter.replace("_", " ")}
              </span>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 z-30"
              >
                {["all", "active", "expiring_soon", "expired", "inactive"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setPlanFilter(opt);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 ${
                      planFilter === opt ? "text-red-600 font-medium" : "text-gray-600"
                    }`}
                  >
                    {opt.replace("_", " ")}
                    {planFilter === opt && <Check size={16} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative w-full xl:w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search User..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-red-500 outline-none text-sm bg-gray-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4">Plan Name</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentUsers.map((user) => {
                  // LOGIC FIX: Pass startDate instead of billingDate
                  const daysRemaining = getDaysRemaining(
                    user.subscription?.startDate,
                    user.subscription?.endDate
                  );

                  const isExpiring = daysRemaining <= 7 && daysRemaining >= 0;
                  const isActive = user.subscription?.planStatus === "active";
                  const isNotInactive =
                    user.subscription?.planStatus !== "inactive" &&
                    user.subscription?.planStatus !== "cancelled";

                  const showReminder = isExpiring && isNotInactive;
                  const showActivation = isActive && !isExpiring;

                  return (
                    <tr key={user._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.customerId}</p>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(user.subscription?.planStatus)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.subscription?.planName || "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {showReminder && (
                            <button
                              onClick={() => handleManualReminder(user)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition"
                              title="Send Expiry Reminder"
                            >
                              <Send size={14} />
                              <span className="hidden sm:inline">Remind</span>
                            </button>
                          )}

                          {showActivation && (
                            <button
                              onClick={() => handleManualActivation(user)}
                              disabled={loadingActivation === user._id}
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
                              title="Send Activation Details"
                            >
                              {loadingActivation === user._id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Send size={14} />
                              )}
                              <span className="hidden sm:inline">Send Info</span>
                            </button>
                          )}

                          <button
                            onClick={() => openDetailsModal(user)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                          >
                            <CreditCard size={14} /> Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredUsers.length > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border rounded hover:bg-white"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border rounded hover:bg-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── DETAILS MODAL ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isDetailsOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDetailsModal}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col relative z-10"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Manage Subscription</h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {selectedUser.name} • {selectedUser.customerId || "—"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-lg p-1 flex">
                    <button
                      onClick={() => setDetailsTab("overview")}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        detailsTab === "overview"
                          ? "bg-white shadow text-gray-900"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      Plan Details
                    </button>
                    <button
                      onClick={() => setDetailsTab("history")}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        detailsTab === "history"
                          ? "bg-white shadow text-gray-900"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      History
                    </button>
                  </div>

                  <button
                    onClick={closeDetailsModal}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1 bg-gray-50/40">
                {detailsTab === "overview" ? (
                  <>
                    {/* Active Plan Display */}
                    {subPlan.isActive && !isEditingPlan ? (
                      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 text-white flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <CheckCircle size={20} />
                            <div>
                              <h3 className="font-semibold">{subPlan.planName}</h3>
                              <p className="text-xs opacity-90">Billed by {subPlan.billedBy}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              ₹{Number(subPlan.totalAmount).toLocaleString("en-IN")}
                            </div>
                            <div className="text-xs opacity-90 capitalize">
                              {subPlan.paymentMode}
                            </div>
                          </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Valid From
                            </div>
                            <div className="font-medium">
                              {new Date(subPlan.startDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Valid Until
                            </div>
                            <div className="font-medium">
                              {new Date(subPlan.endDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Billing Date
                            </div>
                            <div className="font-medium">
                              {new Date(subPlan.billingDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
                          <div className="flex items-center gap-3">
                            {timeLeft.status === "Upcoming" ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                <Calendar size={16} /> Starts in {timeLeft.days} days
                              </span>
                            ) : timeLeft.isExpired ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                <AlertCircle size={16} /> Expired
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                <Clock size={16} />
                                {timeLeft.days} days {timeLeft.hours > 0 && `and ${timeLeft.hours}h`} left
                              </span>
                            )}
                          </div>

                          {subPlan.remainingAmount > 0 && (
                            <div className="text-red-600 font-semibold">
                              Due: ₹{Number(subPlan.remainingAmount).toLocaleString("en-IN")}
                            </div>
                          )}

                          <div className="flex gap-2 ml-auto">
                            <button
                              onClick={() => setIsEditingPlan(true)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                            >
                              <Edit2 size={16} /> Edit
                            </button>
                            <button
                              onClick={handleDeletePlan}
                              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition"
                            >
                              <Trash2 size={16} /> Cancel Plan
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Edit / Create Form */
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                          <CreditCard size={18} className="text-red-600" />
                          {subPlan.isActive ? "Edit Subscription" : "Create New Subscription"}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-5">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Package Name
                              </label>
                              <input
                                type="text"
                                value={subPlan.planName}
                                onChange={(e) =>
                                  setSubPlan({ ...subPlan, planName: e.target.value })
                                }
                                placeholder="Gold Membership / Silver / etc."
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Billed By
                              </label>
                              <input
                                type="text"
                                value={subPlan.billedBy}
                                onChange={(e) =>
                                  setSubPlan({ ...subPlan, billedBy: e.target.value })
                                }
                                placeholder="Trainer name / Admin"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Payment Mode
                              </label>
                              <select
                                value={subPlan.paymentMode}
                                onChange={(e) =>
                                  setSubPlan({ ...subPlan, paymentMode: e.target.value })
                                }
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/30 focus:border-red-500 bg-white outline-none"
                              >
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Card">Card</option>
                                <option value="Online">Online</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-5">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Billing Date
                              </label>
                              <input
                                type="date"
                                value={subPlan.billingDate}
                                onChange={(e) =>
                                  setSubPlan({ ...subPlan, billingDate: e.target.value })
                                }
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                  Start Date
                                </label>
                                <input
                                  type="date"
                                  value={subPlan.startDate}
                                  onChange={(e) =>
                                    setSubPlan({ ...subPlan, startDate: e.target.value })
                                  }
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                  End Date
                                </label>
                                <input
                                  type="date"
                                  value={subPlan.endDate}
                                  onChange={(e) =>
                                    setSubPlan({ ...subPlan, endDate: e.target.value })
                                  }
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                  Package Fees
                                </label>
                                <input
                                  type="number"
                                  value={subPlan.packageFee}
                                  onChange={(e) =>
                                    setSubPlan({ ...subPlan, packageFee: e.target.value })
                                  }
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                  Total Amount
                                </label>
                                <input
                                  type="number"
                                  value={subPlan.totalAmount}
                                  onChange={(e) =>
                                    setSubPlan({ ...subPlan, totalAmount: e.target.value })
                                  }
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Paid Amount
                              </label>
                              <input
                                type="number"
                                value={subPlan.paidAmount}
                                onChange={(e) =>
                                  setSubPlan({ ...subPlan, paidAmount: e.target.value })
                                }
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Remaining
                              </label>
                              <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium">
                                ₹{Number(subPlan.remainingAmount).toLocaleString("en-IN")}
                              </div>
                            </div>

                            <div className="flex items-end justify-end pb-1">
                              <button
                                onClick={handleSavePlan}
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md transition disabled:opacity-60 disabled:pointer-events-none"
                              >
                                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                <Save size={16} />
                                Save Subscription
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* History Tab */
                  <div>
                    {loadingHistory ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                      </div>
                    ) : userHistory.length > 0 ? (
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                            <tr>
                              <th className="px-6 py-3 text-left">Plan</th>
                              <th className="px-6 py-3 text-left">Period</th>
                              <th className="px-6 py-3 text-left">Billing</th>
                              <th className="px-6 py-3 text-right">Financials</th>
                              <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {userHistory.map((h) => {
                              const total = h.totalAmount || h.amount || 0;
                              const paid = h.paidAmount || h.amount || 0;
                              const due = total - paid;

                              return (
                                <tr key={h._id} className="hover:bg-gray-50/70">
                                  <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">
                                      {h.planName || "—"}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {getStatusBadge(h.planStatus)}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-gray-600">
                                    <div>
                                      {new Date(h.startDate).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                      })}{" "}
                                      →{" "}
                                      {new Date(h.endDate).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                      })}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-gray-600">
                                    <div>{h.billedBy || "Admin"}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {h.paymentMode} •{" "}
                                      {new Date(h.billingDate || h.createdAt).toLocaleDateString()}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="space-y-1">
                                      <div>
                                        Total:{" "}
                                        <span className="font-medium">
                                          ₹{total.toLocaleString("en-IN")}
                                        </span>
                                      </div>
                                      <div className="text-green-600 font-medium">
                                        Paid: ₹{paid.toLocaleString("en-IN")}
                                      </div>
                                      {due > 0 && (
                                        <div className="text-red-600 font-semibold">
                                          Due: ₹{due.toLocaleString("en-IN")}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <a
                                      href={`/invoice/${h._id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                                    >
                                      <FileText size={14} />
                                      Invoice
                                    </a>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-16 text-gray-400">
                        No subscription history available yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Subscription;