import React, { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";
import { useAuth } from "@/Context/Authcontext"; 
import { showToast } from "@/utils/customToast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquareQuote, 
  User, 
  Plus, 
  X, 
  Loader2, 
  Send, 
  CheckCircle2, 
  Pencil, 
  Trash2,
  Save,
  AlertTriangle // Added for the warning icon
} from "lucide-react";

const TestimonialSection = () => {
  const auth = useAuth();
  const user = auth?.user;

  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false); // Add/Edit Modal
  const [deleteId, setDeleteId] = useState(null); // Delete Confirmation Modal (null = closed, ID = open)
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Separate loading state for deletion
  const [editingId, setEditingId] = useState(null); 

  const [formData, setFormData] = useState({
    details: "",
    name: ""
  });

  // --- 1. Fetch Data ---
  const fetchTestimonials = async () => {
    try {
      const res = await axiosInstance.get("/testimonials");
      setTestimonials(res.data);
    } catch (err) {
      console.error("Failed to fetch testimonials", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // --- 2. Action Handlers ---

  // Open Modal for Creating
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: user?.name || "", details: "" });
    setIsModalOpen(true);
  };

  // Open Modal for Editing
  const handleOpenEdit = (testimonial) => {
    setEditingId(testimonial._id);
    setFormData({ name: testimonial.name, details: testimonial.details });
    setIsModalOpen(true);
  };

  // Trigger Delete Modal
  const confirmDeleteClick = (id) => {
    setDeleteId(id); // Opens the confirmation modal
  };

  // Execute Delete
  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/testimonials/${deleteId}`);
      showToast("success", "Review deleted successfully");
      
      // Optimistic update
      setTestimonials(prev => prev.filter(t => t._id !== deleteId));
      setDeleteId(null); // Close modal
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to delete review";
      showToast("error", msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Submit (Create OR Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.details) return showToast("error", "Please write a review content");

    setIsSubmitting(true);
    try {
      if (editingId) {
        // UPDATE Existing
        await axiosInstance.put(`/testimonials/${editingId}`, {
          name: formData.name,
          details: formData.details
        });
        showToast("success", "Review updated successfully!");
      } else {
        // CREATE New
        await axiosInstance.post("/testimonials", {
          name: formData.name,
          details: formData.details
        });
        showToast("success", "Review submitted successfully!");
      }
      
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: user?.name || "", details: "" });
      fetchTestimonials(); 
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to submit review";
      showToast("error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Animation Variants ---
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="bg-gray-50/50">
      <div className="max-w-8xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Community <span className="text-red-600">Feedback</span>
            </h2>
            <p className="text-gray-500 mt-2 text-sm md:text-base max-w-lg">
              Transparent reviews from our verified members. See what the community is saying.
            </p>
          </div>

          {user ? (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-800 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-gray-200 transition-all active:scale-95 text-sm"
            >
              <Plus size={18} /> Add Review
            </button>
          ) : (
            <div className="text-xs font-medium text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
              Log in to contribute
            </div>
          )}
        </div>

        {/* Table / List Layout */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">User</div>
            <div className="col-span-6">Review Details</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="animate-spin text-red-600" size={32} />
              <p className="text-sm text-gray-400">Loading reviews...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquareQuote className="text-gray-400" size={30} />
              </div>
              <h3 className="text-gray-900 font-medium">No reviews yet</h3>
              <p className="text-gray-500 text-sm mt-1">Be the first to share your experience with the community.</p>
            </div>
          ) : (
            <motion.div 
              variants={tableVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-gray-100"
            >
              {testimonials.map((t) => {
                const isOwner = user && user.name === t.name;

                return (
                  <motion.div
                    key={t._id}
                    variants={rowVariants}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 hover:bg-gray-50/50 transition-colors group"
                  >
                    {/* Column 1: User Info */}
                    <div className="col-span-1 md:col-span-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0 border border-white shadow-sm">
                        {t.name ? t.name.charAt(0).toUpperCase() : <User size={18} />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{t.name || "Anonymous"}</h4>
                        <span className="text-xs text-gray-400 md:hidden inline-block mr-2">Verified Member</span>
                      </div>
                    </div>

                    {/* Column 2: Review Text */}
                    <div className="col-span-1 md:col-span-6">
                      <div className="relative">
                         <MessageSquareQuote className="absolute -left-5 -top-1 text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" size={16} />
                         <p className="text-gray-600 text-sm leading-relaxed">
                           {t.details}
                         </p>
                      </div>
                    </div>

                    {/* Column 3: Actions & Status */}
                    <div className="col-span-1 md:col-span-3 flex items-center justify-start md:justify-end gap-3">
                        
                       {isOwner && (
                         <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleOpenEdit(t)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit Review"
                            >
                              <Pencil size={16} />
                            </button>
                            <button 
                              onClick={() => confirmDeleteClick(t._id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete Review"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div className="h-4 w-px bg-gray-200 mx-1 hidden md:block"></div>
                         </div>
                       )}

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* --- ADD / EDIT Modal --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden z-10"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {editingId ? "Edit Your Review" : "Write a Review"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {editingId ? "Make changes to your existing feedback" : "Share your experience with others"}
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={formData.name}
                      readOnly
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Feedback</label>
                  <textarea 
                    rows={4}
                    value={formData.details}
                    onChange={(e) => setFormData({...formData, details: e.target.value})}
                    placeholder="How was your experience working with us?"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-gray-300"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold text-sm transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-red-200"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} /> {editingId ? "Updating..." : "Submitting..."}
                      </>
                    ) : (
                      <>
                        {editingId ? <Save size={16} /> : <Send size={16} />} 
                        {editingId ? "Update Review" : "Post Review"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DELETE CONFIRMATION Modal --- */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 z-10 text-center"
            >
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Review?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>

              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setDeleteId(null)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors text-sm flex items-center gap-2 shadow-lg shadow-red-200"
                >
                  {isDeleting ? <Loader2 className="animate-spin" size={16} /> : "Yes, Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default TestimonialSection;