import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Background from "@/assets/images/testimonial.jpg";
import axiosInstance from "@/api/axiosInstance"; 

const TestimonialSection = () => {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axiosInstance.get('/testimonials'); 
        
        const formattedReviews = res.data.map(item => ({
            id: item._id,
            name: item.name || "Anonymous",
            role: "Clients", 
            content: item.details
        }));

        setReviews(formattedReviews);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    if (isPaused || reviews.length === 0) return; 

    const interval = setInterval(() => {
      handleNext();
    }, 5000); 

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, reviews.length]);

  const handleNext = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  if (loading) {
      return (
        <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
            <Loader2 className="animate-spin text-orange-500" size={48} />
        </div>
      );
  }

  if (!loading && reviews.length === 0) {
      return null;
  }

  return (
    <div className="relative w-full min-h-screen bg-gray-900 flex items-center justify-center overflow-hidden font-sans">
      
      <div className="absolute inset-0 z-0">
        <img 
          src={Background} 
          alt="Gym Background" 
          className="w-full h-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center h-full">
        
        <div className="w-full md:w-1/2 lg:w-6/12 pt-10 md:pt-0 md:pl-12 lg:pl-24">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-[2px] bg-orange-500"></span>
              <span className="text-orange-500 font-bold tracking-widest uppercase text-sm">
                Fitness Expert
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white uppercase leading-tight italic">
              What Our Clients <br /> Say
            </h1>
          </motion.div>

          <div 
            className="relative h-[320px] w-full max-w-lg"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          > 
            <motion.div 
              className="absolute -right-6 -bottom-6 w-full h-full border-2 border-orange-500 rounded-sm hidden md:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            />

            <div className="bg-white p-8 md:p-10 shadow-2xl relative w-full h-full flex flex-col justify-between z-10">
              
              <AnimatePresence mode='wait'>
                <motion.div
                  key={reviews[currentIndex].id || currentIndex} // Use ID for key
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 uppercase tracking-wide">
                        {reviews[currentIndex].name}
                      </h3>
                      <p className="text-orange-500 text-sm font-semibold mt-1">
                        {reviews[currentIndex].role}
                      </p>
                    </div>
                    <div className="text-gray-200">
                        <Quote size={50} fill="#e5e7eb" className="transform scale-x-[-1]" />
                    </div>
                  </div>

                  <p className="text-gray-600 leading-relaxed text-sm md:text-base line-clamp-4">
                    {reviews[currentIndex].content}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between mt-6">
                
                <div className="flex gap-2">
                  {reviews.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentIndex === index 
                          ? 'bg-black w-4' 
                          : 'border border-gray-400 hover:bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handlePrev}
                    className="p-2 border border-gray-200 rounded-full hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors duration-300"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button 
                    onClick={handleNext}
                    className="p-2 border border-gray-200 rounded-full hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors duration-300"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 lg:w-6/12 hidden md:block"></div>

      </div>
    </div>
  );
};

export default TestimonialSection;