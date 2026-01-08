import React, { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance"; // Check your path
import { showToast } from "@/utils/customToast"; // Check your path
import {
  MoreVertical, UserPlus, Search, Edit2, Ban, Trash2, Key,
  CheckCircle, XCircle, ChevronLeft, ChevronRight, Eye, Calendar, Clock, Save, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // --- MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false); // New Details Modal
  const [modalType, setModalType] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Button Loading State

  // --- SUBSCRIPTION STATE (For Details Modal) ---
  const [subPlan, setSubPlan] = useState({
    isActive: false,
    startDate: "",
    endDate: "",
    totalDays: 0
  });

  // --- DROPDOWN STATE ---
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    name: "", email: "", phoneNumber: "", password: ""
  });

  // --- API CALLS ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/users");
      setUsers(res.data);
    } catch (err) {
      showToast("error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const handleClickOutside = () => setOpenDropdownId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // --- SUBSCRIPTION CALCULATION LOGIC ---
  useEffect(() => {
    if (subPlan.startDate && subPlan.endDate) {
      const start = new Date(subPlan.startDate);
      const end = new Date(subPlan.endDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setSubPlan(prev => ({ ...prev, totalDays: diffDays > 0 ? diffDays : 0 }));
    } else {
      setSubPlan(prev => ({ ...prev, totalDays: 0 }));
    }
  }, [subPlan.startDate, subPlan.endDate]);

  // --- FILTERING & SORTING LOGIC ---
  const filteredUsers = users
    .filter((user) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (user.name?.toLowerCase() || "").includes(term) ||
        (user.email?.toLowerCase() || "").includes(term) ||
        (user.customerId?.toLowerCase() || "").includes(term); // Added Customer ID Search

      if (activeTab === "blocked") return user.isBlocked && matchesSearch;
      return !user.isBlocked && matchesSearch;
    })
    .sort((a, b) => (a.customerId || "").localeCompare(b.customerId || "")); // Sort by Customer ID

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // Pagination Slice
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start Loading
    try {
      if (modalType === "add") {
        await axiosInstance.post("/users", formData);
        showToast("success", "User added successfully");
      } else if (modalType === "edit") {
        await axiosInstance.put(`/users/${selectedUser._id}`, formData);
        showToast("success", "User updated");
      } else if (modalType === "password") {
        await axiosInstance.put(`/users/${selectedUser._id}/password`, { password: formData.password });
        showToast("success", "Password changed");
      }
      await fetchUsers();
      closeModal();
    } catch (error) {
      showToast("error", error.response?.data?.message || "Action failed");
    } finally {
      setIsSubmitting(false); // Stop Loading
    }
  };

  const handleBlock = async (userId) => {
    try {
      await axiosInstance.put(`/users/${userId}/block`);
      showToast("success", "User status updated");
      fetchUsers();
    } catch (error) {
      showToast("error", "Failed to update status");
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axiosInstance.delete(`/users/${userId}`);
        showToast("success", "User deleted");
        fetchUsers();
      } catch (error) {
        showToast("error", "Delete failed");
      }
    }
  };

  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    if (user && type === 'edit') {
      setFormData({ name: user.name, email: user.email, phoneNumber: user.phoneNumber, password: "" });
    } else {
      setFormData({ name: "", email: "", phoneNumber: "", password: "" });
    }
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const openDetailsModal = (user) => {
    setSelectedUser(user);
    // Reset or Fetch subscription details here if available from backend
    setSubPlan({
      isActive: false, // Default or fetch from user
      startDate: "",
      endDate: "",
      totalDays: 0
    });
    setIsDetailsOpen(true);
    setOpenDropdownId(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDetailsOpen(false);
    setSelectedUser(null);
  };

  // --- ACTION MENU COMPONENT (UPDATED TO FIX HIDING) ---
  const ActionMenu = ({ user, index, totalItems }) => {
    // Determine if this is one of the last items to flip direction
    const isLastItems = index >= totalItems - 2;

    return (
      <div className="relative inline-block text-left">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenDropdownId(openDropdownId === user._id ? null : user._id);
          }}
          className={`p-2 rounded-full transition-all duration-200 ${openDropdownId === user._id
            ? "bg-red-50 text-red-600"
            : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            }`}
        >
          <MoreVertical size={18} />
        </button>

        <AnimatePresence>
          {openDropdownId === user._id && (
            <motion.div
              // Animate from bottom up if last item, else top down
              initial={{ opacity: 0, scale: 0.95, y: isLastItems ? 10 : -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: isLastItems ? 10 : -10 }}
              transition={{ duration: 0.1 }}
              // Conditionally apply classes for positioning
              className={`absolute right-0 w-56 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden ${
                isLastItems 
                  ? "bottom-full mb-2 origin-bottom-right" // Opens Upwards
                  : "mt-2 origin-top-right"                // Opens Downwards
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-1.5 flex flex-col gap-0.5">
                <button onClick={() => openDetailsModal(user)} className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 gap-3 font-medium">
                  <Eye size={14} className="text-gray-500" /> View Details & Plan
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button onClick={() => openModal("edit", user)} className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 gap-3">
                  <Edit2 size={14} className="text-blue-500" /> Edit Details
                </button>
                <button onClick={() => openModal("password", user)} className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 gap-3">
                  <Key size={14} className="text-amber-500" /> Change Password
                </button>
                <button onClick={() => { handleBlock(user._id); setOpenDropdownId(null); }} className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 gap-3">
                  {user.isBlocked ? <CheckCircle size={14} className="text-green-500" /> : <Ban size={14} className="text-purple-500" />}
                  {user.isBlocked ? "Unblock User" : "Block User"}
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button onClick={() => { handleDelete(user._id); setOpenDropdownId(null); }} className="flex items-center w-full px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 gap-3">
                  <Trash2 size={14} /> Delete User
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 text-sm">Manage access and user details</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); openModal("add"); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition shadow-md shadow-red-500/20"
        >
          <UserPlus size={18} /> <span className="sm:inline">Add New User</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-6 gap-4 border border-gray-100">
        <div className="flex w-full md:w-auto gap-2 p-1 bg-gray-100 rounded-lg">
          {["active", "blocked"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all capitalize ${activeTab === tab ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-900"
                }`}
            >
              {tab} Users
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search ID, Name, Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-gray-50 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-gray-500">Loading users...</div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block overflow-visible min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">Customer ID</th>
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <tr key={user._id} className="hover:bg-gray-50/50 transition relative group">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.customerId || "N/A"}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.phoneNumber}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${user.isBlocked ? "bg-red-50 text-red-700 border-red-100" : "bg-green-50 text-green-700 border-green-100"
                            }`}>
                            {user.isBlocked ? <XCircle size={12} /> : <CheckCircle size={12} />}
                            {user.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-right relative ${openDropdownId === user._id ? "z-50" : "z-0"}`}>
                          {/* PASS INDEX AND TOTAL ITEMS HERE */}
                          <ActionMenu 
                            user={user} 
                            index={index} 
                            totalItems={currentUsers.length} 
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="md:hidden flex flex-col gap-4 p-4">
              {currentUsers.length > 0 ? (
                currentUsers.map((user, index) => (
                  <div key={user._id} className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm relative">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                          #{user.customerId || "N/A"}
                        </span>
                        <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className={`${openDropdownId === user._id ? "z-20" : "z-0"}`}>
                        {/* PASS INDEX AND TOTAL ITEMS HERE */}
                        <ActionMenu 
                            user={user} 
                            index={index} 
                            totalItems={currentUsers.length} 
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mt-2 pt-3 border-t border-gray-50">
                      <span>{user.phoneNumber}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${user.isBlocked ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                        }`}>
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400">No users found.</div>
              )}
            </div>
          </>
        )}

        {/* PAGINATION FOOTER */}
        {filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/50 gap-4">
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium text-gray-900">{Math.min(indexOfLastItem, filteredUsers.length)}</span>{" "}
              of <span className="font-medium text-gray-900">{filteredUsers.length}</span> results
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-600">
                <ChevronLeft size={18} />
              </button>
              <div className="hidden sm:flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button key={number} onClick={() => setCurrentPage(number)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === number ? "bg-red-500 text-white shadow-sm" : "text-gray-600 hover:bg-white border border-transparent"}`}>
                    {number}
                  </button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-600">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative z-10">
              <h2 className="text-xl font-bold mb-1 text-gray-800">
                {modalType === 'add' ? "Add New User" : modalType === 'edit' ? "Edit Details" : "Change Password"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                {modalType !== 'password' && (
                  <>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" placeholder="Full Name" />
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" placeholder="Email Address" />
                    <input type="tel" name="phoneNumber" required value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" placeholder="Phone Number" />
                  </>
                )}
                {(modalType === 'add' || modalType === 'password') && (
                  <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" placeholder={modalType === 'add' ? "Password" : "New Password"} />
                )}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2">
                    {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- USER DETAILS & PLAN MODAL --- */}
      <AnimatePresence>
        {isDetailsOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-0 relative z-10 overflow-hidden">
              
              {/* Modal Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">User Details</h2>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-0.5">ID: {selectedUser.customerId || "N/A"}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${selectedUser.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {selectedUser.isBlocked ? "Blocked" : "Active"}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-400 text-xs uppercase font-bold tracking-wider">Full Name</label>
                    <p className="font-medium text-gray-800 mt-0.5">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase font-bold tracking-wider">Joined Date</label>
                    <p className="font-medium text-gray-800 mt-0.5">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-gray-400 text-xs uppercase font-bold tracking-wider">Email Address</label>
                    <p className="font-medium text-gray-800 mt-0.5">{selectedUser.email}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-gray-400 text-xs uppercase font-bold tracking-wider">Phone Number</label>
                    <p className="font-medium text-gray-800 mt-0.5">{selectedUser.phoneNumber}</p>
                  </div>
                </div>

                <div className="h-px bg-gray-100"></div>

                {/* Subscription Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-bold text-gray-900 flex items-center gap-2">
                      <Calendar size={18} className="text-red-500" /> Subscription Plan
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSubPlan(prev => ({ ...prev, isActive: !prev.isActive }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${subPlan.isActive ? 'bg-green-500' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${subPlan.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className={`space-y-4 transition-opacity ${subPlan.isActive ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={subPlan.startDate}
                          onChange={(e) => setSubPlan({ ...subPlan, startDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={subPlan.endDate}
                          onChange={(e) => setSubPlan({ ...subPlan, endDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-3 flex items-center justify-between border border-red-100">
                      <div className="flex items-center gap-2 text-red-700">
                        <Clock size={16} />
                        <span className="text-sm font-medium">Total Duration</span>
                      </div>
                      <span className="text-lg font-bold text-red-700">
                        {subPlan.totalDays} <span className="text-xs font-normal">Days</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                  Close
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 shadow-sm flex items-center gap-2">
                  <Save size={16} /> Save Plan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;