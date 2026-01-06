import React, { useState } from 'react';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Expanded dataset to 12 items to demonstrate pagination
const galleryImages = [
  { id: 1, category: "Bodybuilding", src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Man lifting heavy weights" },
  { id: 2, category: "Cardio", src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Women running on treadmills" },
  { id: 3, category: "Crossfit", src: "https://images.unsplash.com/photo-1517963879466-cd115eb9244b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Gym ropes workout" },
  { id: 4, category: "Boxing", src: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Boxing training session" },
  { id: 5, category: "Yoga", src: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Stretching and yoga" },
  { id: 6, category: "Equipment", src: "https://images.unsplash.com/photo-1637666062717-8c698ee7ad52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Modern gym equipment" },
  // Page 2 Data
  { id: 7, category: "HIIT", src: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "HIIT workout" },
  { id: 8, category: "Running", src: "https://images.unsplash.com/photo-1552674605-469523170d98?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Man running" },
  { id: 9, category: "Stretching", src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Woman stretching" },
  { id: 10, category: "Strength", src: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Gym strength training" },
  { id: 11, category: "Pilates", src: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Pilates pose" },
  { id: 12, category: "Zumba", src: "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Dance class" },
];

const GymGallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Calculate Indices
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = galleryImages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(galleryImages.length / itemsPerPage);

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

        {/* --- Grid Layout --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {currentItems.map((image) => (
            <div 
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className="group relative h-80 overflow-hidden cursor-pointer rounded-lg shadow-lg"
            >
              {/* Image */}
              <img 
                src={image.src} 
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-[#F94C30]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                <Plus className="text-white w-12 h-12 mb-2 scale-0 group-hover:scale-100 transition-transform duration-300 delay-100" />
                <span className="text-white font-bold uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                  {image.category}
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

      </div>

      {/* --- Lightbox Modal --- */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close Button */}
          <button 
            className="absolute top-6 right-6 text-white hover:text-[#F94C30] transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={40} />
          </button>

          {/* Full Image */}
          <div className="relative max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage.src} 
              alt={selectedImage.alt} 
              className="w-full h-full object-contain rounded-sm"
            />
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                <p className="text-lg font-bold uppercase italic">{selectedImage.category}</p>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default GymGallery;