import React, { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";
import { showToast } from "@/utils/customToast";
import {
  MoreVertical,
  UserPlus,
  Search,
  Edit2,
  Ban,
  Trash2,
  Key,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  AlertTriangle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Users = () => {
  // --- MAIN STATE ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // --- MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- DELETE USER MODAL STATE ---
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null,
    userName: "",
  });

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    password: "",
  });

  // --- API CALLS ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration if API fails or is not present
      // const res = await axiosInstance.get("/users");
      // setUsers(res.data);
      
      // Temporary: using empty array or replace with your actual API call above
      const res = await axiosInstance.get("/users");
      setUsers(res.data);
    } catch (err) {
      showToast("error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // --- INITIAL LOAD & OUTSIDE CLICK ---
  useEffect(() => {
    fetchUsers();

    const handleClickOutside = (event) => {
      // Close dropdown if clicking anywhere else
      if (!event.target.closest(".action-menu-container")) {
        setOpenDropdownId(null);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // --- FILTERING & SORTING ---
  const filteredUsers = users
    .filter((user) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (user.name?.toLowerCase() || "").includes(term) ||
        (user.customerId?.toLowerCase() || "").includes(term);

      const matchesTab =
        activeTab === "blocked" ? user.isBlocked : !user.isBlocked;

      return matchesTab && matchesSearch;
    })
    .sort((a, b) => (a.customerId || "").localeCompare(b.customerId || ""));

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

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
    setIsSubmitting(true);
    try {
      if (modalType === "add") {
        await axiosInstance.post("/users", formData);
        showToast("success", "User added successfully");
      } else if (modalType === "edit") {
        await axiosInstance.put(`/users/${selectedUser._id}`, formData);
        showToast("success", "User updated");
      } else if (modalType === "password") {
        await axiosInstance.put(`/users/${selectedUser._id}/password`, {
          password: formData.password,
        });
        showToast("success", "Password changed");
      }
      await fetchUsers();
      closeModal();
    } catch (error) {
      showToast("error", error.response?.data?.message || "Action failed");
    } finally {
      setIsSubmitting(false);
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

  // --- DELETE USER LOGIC ---
  const initiateDelete = (user) => {
    setDeleteModal({
      isOpen: true,
      userId: user._id,
      userName: user.name,
    });
    setOpenDropdownId(null);
  };

  const confirmDelete = async () => {
    if (!deleteModal.userId) return;
    setIsSubmitting(true);
    try {
      await axiosInstance.delete(`/users/${deleteModal.userId}`);
      showToast("success", "User deleted successfully");
      await fetchUsers();
      setDeleteModal({ isOpen: false, userId: null, userName: "" });
    } catch (error) {
      showToast("error", "Delete failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- MODAL OPENERS ---
  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    if (user && type === "edit") {
      setFormData({
        name: user.name,
        phoneNumber: user.phoneNumber,
        password: "",
      });
    } else {
      setFormData({ name: "", phoneNumber: "", password: "" });
    }
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const openDetailsModal = (user) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
    setOpenDropdownId(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDetailsOpen(false);
    setSelectedUser(null);
  };

  // --- ACTION MENU COMPONENT ---
  const ActionMenu = ({ user, index, totalItems }) => {
    // If it's one of the last 2 items, flip the menu upwards to avoid screen clipping
    const isLastItems = index >= totalItems - 2 && totalItems > 4;

    return (
      <div className="relative inline-block text-left action-menu-container">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenDropdownId(openDropdownId === user._id ? null : user._id);
          }}
          className={`p-2 rounded-full transition-all duration-200 ${
            openDropdownId === user._id
              ? "bg-red-50 text-red-600 shadow-sm"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          }`}
        >
          <MoreVertical size={18} />
        </button>

        <AnimatePresence>
          {openDropdownId === user._id && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: isLastItems ? 10 : -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: isLastItems ? 10 : -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={`absolute right-0 w-56 bg-white rounded-xl shadow-xl ring-1 ring-[#b9b6b68c] ring-opacity-5 z-[100] overflow-hidden ${
                isLastItems
                  ? "bottom-full mb-2 origin-bottom-right"
                  : "mt-2 origin-top-right"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-1.5 flex flex-col gap-0.5">
                <button
                  onClick={() => openDetailsModal(user)}
                  className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50 gap-3 font-medium transition-colors"
                >
                  <Eye size={16} className="text-gray-400" /> View Profile
                </button>
                <div className="h-px bg-gray-100 my-0.5 mx-2"></div>
                <button
                  onClick={() => openModal("edit", user)}
                  className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50 gap-3 transition-colors"
                >
                  <Edit2 size={16} className="text-blue-500" /> Edit Details
                </button>
                <button
                  onClick={() => openModal("password", user)}
                  className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50 gap-3 transition-colors"
                >
                  <Key size={16} className="text-amber-500" /> Change Password
                </button>
                <button
                  onClick={() => {
                    handleBlock(user._id);
                    setOpenDropdownId(null);
                  }}
                  className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50 gap-3 transition-colors"
                >
                  {user.isBlocked ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <Ban size={16} className="text-purple-500" />
                  )}
                  {user.isBlocked ? "Unblock User" : "Block User"}
                </button>
                <div className="h-px bg-gray-100 my-0.5 mx-2"></div>
                <button
                  onClick={() => initiateDelete(user)}
                  className="flex items-center w-full px-3 py-2.5 text-sm text-red-600 rounded-lg hover:bg-red-50 gap-3 transition-colors"
                >
                  <Trash2 size={16} /> Delete User
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">All Users</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage user accounts and access controls
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            openModal("add");
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 font-medium active:scale-95"
        >
          <UserPlus size={18} /> <span className="sm:inline">Add New User</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col xl:flex-row justify-between items-center bg-white p-2 rounded-xl shadow-sm mb-6 gap-4 border border-gray-100">
        <div className="flex w-full xl:w-auto p-1 bg-gray-100/80 rounded-lg">
          {["active", "blocked"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-none px-6 py-2 text-sm font-semibold rounded-md transition-all capitalize ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full xl:w-72">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 bg-transparent transition-all text-sm"
          />
        </div>
      </div>

      {/* FIX: Removed 'overflow-hidden' from this container.
         This allows the Dropdown to overflow visibly over the pagination.
      */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative z-0">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-gray-500">
             <Loader2 size={32} className="animate-spin mb-4 text-red-500" />
             <p>Loading users data...</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-visible min-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    {/* Added rounded corners manually to headers since container doesn't clip anymore */}
                    <th className="px-6 py-4 rounded-tl-xl border-b border-gray-100">Customer ID</th>
                    <th className="px-6 py-4 border-b border-gray-100">Name</th>
                    <th className="px-6 py-4 border-b border-gray-100">Phone Number</th>
                    <th className="px-6 py-4 border-b border-gray-100">Status</th>
                    <th className="px-6 py-4 rounded-tr-xl text-right border-b border-gray-100">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <tr
                        key={user._id}
                        className={`hover:bg-gray-50/80 transition duration-150 relative group ${
                           // FIX: High z-index for the active row so its menu isn't covered by rows below
                           openDropdownId === user._id ? "z-50 bg-gray-50" : "z-0"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {user.customerId || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                                {user.name.charAt(0).toUpperCase()}
                             </div>
                             <p className="font-medium text-gray-900">{user.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                          {user.phoneNumber}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              user.isBlocked
                                ? "bg-red-50 text-red-700 border-red-100"
                                : "bg-emerald-50 text-emerald-700 border-emerald-100"
                            }`}
                          >
                            {user.isBlocked ? (
                              <XCircle size={12} />
                            ) : (
                              <CheckCircle size={12} />
                            )}
                            {user.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ActionMenu
                            user={user}
                            index={index}
                            totalItems={currentUsers.length}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-16 text-center text-gray-400"
                      >
                        <div className="flex flex-col items-center gap-3">
                           <div className="p-3 bg-gray-50 rounded-full">
                             <Search size={24} className="text-gray-300"/>
                           </div>
                           <p>No users found matching your search.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW */}
            <div className="md:hidden flex flex-col gap-4 p-4 bg-gray-50">
              {currentUsers.map((user, index) => (
                <div
                  key={user._id}
                  className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm relative"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                         {user.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-400 block tracking-wide">
                          #{user.customerId}
                        </span>
                        <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
                      </div>
                    </div>
                    {/* Z-index fix for mobile as well */}
                    <div className={`${openDropdownId === user._id ? "z-20" : "z-0"}`}>
                      <ActionMenu
                        user={user}
                        index={index}
                        totalItems={currentUsers.length}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mt-4 pt-4 border-t border-gray-100">
                     <div>
                        <p className="text-gray-400 text-xs mb-1">Status</p>
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${user.isBlocked ? 'text-red-600' : 'text-emerald-600'}`}>
                           <div className={`w-2 h-2 rounded-full ${user.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                           {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                     </div>
                     <div className="text-right">
                        <p className="text-gray-400 text-xs mb-1">Phone</p>
                        <p className="text-gray-700 font-mono">{user.phoneNumber}</p>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PAGINATION */}
        {filteredUsers.length > 0 && (
          // Added rounded-b-xl here to finish the card design
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl gap-4">
            <span className="text-sm text-gray-500 font-medium">
              Page <span className="text-gray-900">{currentPage}</span> of{" "}
              {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={18} className="text-gray-600" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS (Add/Edit, Delete, Details) --- */}
      {/* Kept your existing modals logic as is, just ensuring they render via AnimatePresence */}
      
      {/* ADD/EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative z-10"
            >
              <h2 className="text-xl font-bold mb-1 text-gray-900">
                {modalType === "add"
                  ? "Add New User"
                  : modalType === "edit"
                  ? "Edit Details"
                  : "Change Password"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                {modalType !== "password" && (
                  <>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Full Name</label>
                        <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all font-medium"
                        placeholder="e.g. John Doe"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Phone Number</label>
                        <input
                        type="tel"
                        name="phoneNumber"
                        required
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all font-mono"
                        placeholder="+91 98765 43210"
                        />
                    </div>
                  </>
                )}
                {(modalType === "add" || modalType === "password") && (
                   <div>
                       <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Password</label>
                       <input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all"
                        placeholder="••••••••"
                      />
                   </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center justify-center gap-2 font-medium shadow-lg shadow-red-500/20 transition-all"
                  >
                    {isSubmitting && <Loader2 size={18} className="animate-spin" />} Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setDeleteModal({ isOpen: false, userId: null, userName: "" })
              }
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10 text-center"
            >
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 ring-8 ring-red-50/50">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Delete User?
              </h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-bold text-gray-800">
                  {deleteModal.userName}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setDeleteModal({ isOpen: false, userId: null, userName: "" })
                  }
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center justify-center gap-2 font-medium shadow-lg shadow-red-500/20"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

       {/* DETAILS MODAL */}
       <AnimatePresence>
        {isDetailsOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
              <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div><h2 className="text-lg font-bold text-gray-900">User Profile</h2><p className="text-xs text-gray-500 uppercase font-bold tracking-wide mt-1">ID: {selectedUser.customerId}</p></div>
                <button onClick={closeModal} className="p-2 hover:bg-gray-200/50 rounded-full transition"><X size={20} className="text-gray-400" /></button>
              </div>
              <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-2xl font-bold">
                          {selectedUser.name.charAt(0)}
                      </div>
                      <div>
                          <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border mt-1 ${selectedUser.isBlocked ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                            {selectedUser.isBlocked ? "Blocked" : "Active"}
                          </span>
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                      <div><label className="text-gray-400 text-xs uppercase font-bold tracking-wide block mb-1">Phone Number</label><p className="font-medium text-gray-900 font-mono text-base">{selectedUser.phoneNumber}</p></div>
                      <div><label className="text-gray-400 text-xs uppercase font-bold tracking-wide block mb-1">Joined Date</label><p className="font-medium text-gray-900 text-base">{new Date(selectedUser.createdAt || Date.now()).toLocaleDateString()}</p></div>
                      <div><label className="text-gray-400 text-xs uppercase font-bold tracking-wide block mb-1">Role</label><p className="font-medium text-gray-900 capitalize text-base">{selectedUser.role || "User"}</p></div>
                  </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;