import React, { useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance'; // Adjust path if needed
import { showToast } from '@/utils/customToast';   // Adjust path if needed
import { Trash2, Edit, Plus, X, UploadCloud } from 'lucide-react';

const Gallery = () => {
  // --- State Management ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // --- Fetch Data ---
  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/gallery');
      setItems(res.data);
    } catch (error) {
      showToast('error', 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // --- Handlers ---

  const handleOpenModal = (item = null) => {
    if (item) {
      // Edit Mode
      setEditItem(item);
      setTitle(item.title);
      // Use the base URL directly from your axios configuration
      setPreviewUrl(`${axiosInstance.defaults.baseURL}/${item.image}`);
      setImageFile(null);
    } else {
      // Create Mode
      setEditItem(null);
      setTitle('');
      setPreviewUrl('');
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditItem(null);
    setImageFile(null);
    setPreviewUrl('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 5MB Limit Validation
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'File size exceeds 5MB limit');
      e.target.value = null;
      return;
    }

    setImageFile(file);
    // Create local preview URL
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!title) return showToast('error', 'Title is required');
    if (!editItem && !imageFile) return showToast('error', 'Image is required');

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editItem) {
        // --- Edit Mode (PUT) ---
        await axiosInstance.put(`/gallery/${editItem._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('success', 'Image updated successfully');
      } else {
        // --- Create Mode (POST) ---
        await axiosInstance.post('/gallery', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('success', 'Image uploaded successfully');
      }

      handleCloseModal();
      fetchGallery(); // Refresh table
    } catch (error) {
      const msg = error.response?.data?.message || 'Upload failed';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await axiosInstance.delete(`/gallery/${id}`);
      showToast('success', 'Image deleted');
      setItems(items.filter((item) => item._id !== id));
    } catch (error) {
      showToast('error', 'Delete failed');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* --- Header --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gallery Manager</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={20} /> Upload Image
        </button>
      </div>

      {/* --- Table --- */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-4">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-4 text-gray-500">No images found.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* --- USE AXIOS BASE URL --- */}
                    <img
                      src={`${axiosInstance.defaults.baseURL}/${item.image}`}
                      alt={item.title}
                      className="h-16 w-24 object-cover rounded border"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <h2 className="text-xl font-bold mb-4">
              {editItem ? 'Edit Image' : 'Upload New Image'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter image title"
                />
              </div>

              {/* Image Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image (Max 5MB)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center pointer-events-none">
                    <UploadCloud className="text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-500">
                      {imageFile ? imageFile.name : 'Click to select or drag file'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Preview:</p>
                  <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg border" />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-2 px-4 rounded-lg text-white font-medium transition
                  ${submitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  editItem ? 'Update Gallery Item' : 'Upload Image'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
