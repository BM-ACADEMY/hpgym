import React, { useState, useEffect } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Loader2, ImageOff } from 'lucide-react';
import axiosInstance from '@/api/axiosInstance'; // Adjust path based on your folder structure

const GymGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Number of images per page

  // --- Fetch Data from API ---
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        // Assuming your public route is /gallery or /public/gallery
        // If your backend protects /gallery, ensure you have a public endpoint
        const res = await axiosInstance.get("/gallery");
        setImages(res.data);
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = images.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(images.length / itemsPerPage);

  // Handlers
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <section className="relative w-full bg-neutral-50 py-20" id="gallery">
      <div className="max-w-6xl mx-auto px-4">

        {/* --- Header --- */}
        <div className="text-center mb-12">
          <h3 className="text-[#F94C30] uppercase tracking-[0.2em] text-sm font-bold mb-2">
            Our Gallery
          </h3>
          <h2 className="text-4xl md:text-5xl font-extrabold uppercase italic text-gray-900 leading-tight">
            See The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F94C30] to-[#E02D2D]">Results</span>
          </h2>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            Take a look inside our facility and see the community in action.
          </p>
        </div>

        {/* --- Content Area --- */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-[#F94C30] w-12 h-12" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
             <ImageOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
             <p className="text-lg">No images uploaded yet.</p>
          </div>
        ) : (
          <>
            {/* --- Grid Layout --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {currentItems.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setSelectedImage(item)}
                  className="group relative h-80 overflow-hidden cursor-pointer rounded-lg shadow-lg bg-gray-200"
                >
                  {/* Image */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#F94C30]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                    <Plus className="text-white w-12 h-12 mb-2 scale-0 group-hover:scale-100 transition-transform duration-300 delay-100" />
                    <span className="text-white font-bold uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100 text-center px-4">
                      {item.title} {/* Using Title as Category/Label */}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* --- Pagination Controls --- */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-2">
                {/* Previous Button */}
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 text-gray-600 hover:border-[#F94C30] hover:text-[#F94C30] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Page Numbers */}
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold text-sm transition-all
                      ${currentPage === index + 1
                        ? 'bg-[#F94C30] border-[#F94C30] text-white shadow-lg scale-110'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-[#F94C30] hover:text-[#F94C30]'
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 text-gray-600 hover:border-[#F94C30] hover:text-[#F94C30] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}

      </div>

      {/* --- Lightbox Modal --- */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 text-white hover:text-[#F94C30] transition-colors z-50"
            onClick={() => setSelectedImage(null)}
          >
            <X size={40} />
          </button>

          {/* Full Image */}
          <div className="relative max-w-5xl max-h-[90vh] w-full flex justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.image}
              alt={selectedImage.title}
              className="w-auto h-auto max-h-[85vh] max-w-full object-contain rounded-sm shadow-2xl"
            />
            <div className="absolute -bottom-10 left-0 w-full text-center text-white">
                <p className="text-lg font-bold uppercase italic tracking-wider">{selectedImage.title}</p>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default GymGallery;
