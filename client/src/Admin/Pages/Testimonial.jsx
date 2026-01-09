import React, { useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance'; // Adjust path
import { showToast } from '@/utils/customToast'; // Adjust path
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Loader2, 
  Search, 
  MessageSquare,
  User,
  AlertTriangle // Imported for the delete warning
} from 'lucide-react';

const TestimonialTable = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal State
  const [itemToDelete, setItemToDelete] = useState(null); // Stores ID if modal is open, null otherwise
  const [isDeleting, setIsDeleting] = useState(false);

  // Search/Filter State
  const [searchTerm, setSearchTerm] = useState('');

  // Edit/Create Data State
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    details: ''
  });

  // --- 1. Fetch Data ---
  const fetchTestimonials = async () => {
    try {
      const res = await axiosInstance.get('/testimonials');
      setTestimonials(res.data);
    } catch (error) {
      showToast('error', 'Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // --- 2. Input Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- 3. Create/Edit Modal Handlers ---
  const openCreateModal = () => {
    setCurrentId(null);
    setFormData({ name: '', details: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (testimonial) => {
    setCurrentId(testimonial._id);
    setFormData({ name: testimonial.name, details: testimonial.details });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentId(null);
  };

  // --- 4. Submit Logic (Create/Edit) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.details) {
      return showToast('error', 'All fields are required');
    }

    setIsSubmitting(true);
    try {
      if (currentId) {
        await axiosInstance.put(`/testimonials/${currentId}`, formData);
        showToast('success', 'Updated successfully');
      } else {
        await axiosInstance.post('/testimonials', formData);
        showToast('success', 'Created successfully');
      }
      await fetchTestimonials();
      closeModal();
    } catch (error) {
      const msg = error.response?.data?.message || 'Operation failed';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 5. Delete Logic ---
  
  // Step A: Open the confirmation modal
  const initiateDelete = (id) => {
    setItemToDelete(id);
  };

  // Step B: Perform the actual delete
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/testimonials/${itemToDelete}`);
      showToast('success', 'Deleted successfully');
      setTestimonials((prev) => prev.filter((t) => t._id !== itemToDelete));
      setItemToDelete(null); // Close modal on success
    } catch (error) {
      showToast('error', 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper: Get Initials
  const getInitials = (name) => {
    return name
      ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
      : '??';
  };

  // Filter Logic
  const filteredTestimonials = testimonials.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-8xl mx-auto space-y-6">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Testimonial Management</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage user feedbacks.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Search testimonials..." 
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 w-full md:w-64 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm active:scale-95"
            >
            <Plus size={16} />
            <span>Add New</span>
            </button>
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
            <span className="text-gray-500 text-sm">Loading data...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">Client Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/2">Feedback Details</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {filteredTestimonials.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                            <div className="bg-gray-100 p-3 rounded-full mb-3">
                                <MessageSquare size={24} className="text-gray-400" />
                            </div>
                            <p>No testimonials found matching your criteria.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTestimonials.map((t) => (
                      <motion.tr
                        key={t._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="group hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-200 shadow-sm">
                              {getInitials(t.name)}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{t.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2" title={t.details}>
                            {t.details}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(t)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => initiateDelete(t._id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- Create/Edit Modal --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                 <h2 className="text-lg font-bold text-gray-800">
                    {currentId ? 'Edit Testimonial' : 'New Testimonial'}
                 </h2>
                 <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1 rounded-full transition-all">
                    <X size={20} />
                 </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <User size={14} /> Client Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Alice Johnson"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <MessageSquare size={14} /> Feedback
                    </label>
                    <textarea
                        name="details"
                        value={formData.details}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="What did the client say?"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all resize-none"
                    />
                </div>
                <div className="pt-2 flex gap-3">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (currentId ? 'Save Changes' : 'Create')}
                    </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Delete Confirmation Modal --- */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-6"
            >
              <div className="flex flex-col items-center text-center">
                {/* Warning Icon */}
                <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                  <AlertTriangle size={24} />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Testimonial?</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Are you sure you want to delete this testimonial? This action cannot be undone.
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setItemToDelete(null)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                     {isDeleting ? (
                       <>
                         <Loader2 className="animate-spin" size={16} />
                         <span>Deleting...</span>
                       </>
                     ) : (
                       <span>Delete</span>
                     )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestimonialTable;