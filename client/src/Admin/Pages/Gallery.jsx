import React, { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";
import { showToast } from "@/utils/customToast";
import { 
  Trash2, Edit, Plus, X, UploadCloud, AlertTriangle, 
  ChevronLeft, ChevronRight, Image as ImageIcon 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Gallery = () => {
  // --- State Management ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // Adjust number of items per page here

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Delete Modal State
  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Data State
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // --- Fetch Data ---
  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/gallery");
      setItems(res.data);
    } catch (error) {
      console.log(error);
      showToast("error", "Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Reset to page 1 if items change significantly (optional, but good for UX)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [items.length, totalPages, currentPage]);

  // --- Handlers ---

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setTitle(item.title);
      setPreviewUrl(item.image);
      setImageFile(null);
    } else {
      setEditItem(null);
      setTitle("");
      setPreviewUrl("");
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditItem(null);
    setImageFile(null);
    setPreviewUrl("");
  };

  const handleDeleteClick = (id) => {
    setDeleteItem(id);
  };

  const closeDeleteModal = () => {
    setDeleteItem(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "File size exceeds 5MB limit");
      e.target.value = null;
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title) return showToast("error", "Title is required");
    if (!editItem && !imageFile) return showToast("error", "Image is required");

    setSubmitting(true);
    const formData = new FormData();
    formData.append("title", title);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (editItem) {
        await axiosInstance.put(`/gallery/${editItem._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("success", "Image updated successfully");
      } else {
        await axiosInstance.post("/gallery", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("success", "Image uploaded successfully");
      }

      handleCloseModal();
      fetchGallery();
    } catch (error) {
      const msg = error.response?.data?.message || "Upload failed";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/gallery/${deleteItem}`);
      showToast("success", "Image deleted");
      setItems(items.filter((item) => item._id !== deleteItem));
      closeDeleteModal();
    } catch (error) {
      console.log(error);
      showToast("error", "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Animation Variants ---
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", duration: 0.5 } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
  };

  return (
    <div className="p-4 md:p-6 max-w-8xl mx-auto min-h-screen bg-gray-50/50">
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gallery Manager</h1>
          <p className="text-sm text-gray-500">Manage your website images</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-red-500/20"
        >
          <Plus size={20} /> <span className="sm:inline">Upload Image</span>
        </button>
      </div>

      {/* --- Content Area --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <div className="animate-spin mb-2">
            <UploadCloud size={24} className="text-gray-300" />
          </div>
          Loading gallery...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No images found</h3>
          <p className="text-gray-500 mt-1">Get started by uploading your first image.</p>
        </div>
      ) : (
        <>
          {/* --- View 1: Card Grid (Mobile/Tablet) --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden mb-6">
            <AnimatePresence mode="popLayout">
              {currentItems.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="relative aspect-video bg-gray-50 border-b border-gray-100 group">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x300?text=Error"; }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 truncate mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-500 mb-4">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item._id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* --- View 2: Table (Desktop) --- */}
          <div className="hidden md:block bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Uploaded Date</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence mode="wait">
                  {currentItems.map((item) => (
                    <motion.tr 
                      key={item._id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-16 w-24 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150?text=Error"; }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleOpenModal(item)} className="text-blue-600 hover:text-blue-900 mr-4 p-2 hover:bg-blue-50 rounded-full transition">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteClick(item._id)} className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* --- Pagination Footer --- */}
          {items.length > itemsPerPage && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-xl shadow-sm">
              <div className="hidden sm:flex flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, items.length)}</span> of <span className="font-medium">{items.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {/* Simple Page Numbers */}
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === i + 1
                            ? "z-10 bg-red-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
              {/* Mobile Pagination */}
              <div className="flex sm:hidden flex-1 justify-between items-center">
                 <button 
                    onClick={prevPage} 
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                 >
                    Previous
                 </button>
                 <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                 <button 
                    onClick={nextPage} 
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                 >
                    Next
                 </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* --- Create/Edit Modal with AnimatePresence --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative z-10 mx-4"
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold mb-1 text-gray-800">
                {editItem ? "Edit Image" : "Upload New Image"}
              </h2>
              <p className="text-sm text-gray-500 mb-6">Add details about your image below.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none transition-all"
                    placeholder="Enter image title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image (Max 5MB)</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 hover:border-red-200 transition-all relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center pointer-events-none">
                      <div className="p-3 bg-red-50 text-red-500 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        {imageFile ? imageFile.name : "Click to upload or drag & drop"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF</p>
                    </div>
                  </div>
                </div>

                {previewUrl && (
                  <div className="mt-2 relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-md backdrop-blur-md">Preview</div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-2.5 px-4 rounded-lg text-white font-medium transition shadow-lg shadow-red-500/20
                    ${submitting ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">Processing...</span>
                  ) : editItem ? (
                    "Update Gallery Item"
                  ) : (
                    "Upload Image"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Delete Confirmation Modal with AnimatePresence --- */}
      <AnimatePresence>
        {deleteItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={closeDeleteModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10 mx-4"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-red-50 rounded-full mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Image?</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Are you sure you want to delete this image? This action cannot be undone.
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-lg shadow-red-600/20 transition flex items-center justify-center gap-2"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
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

export default Gallery;