import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import Background from "@/assets/images/testimonial.jpg"

const reviews = [
  {
    id: 1,
    name: "Jack London",
    role: "client",
    content: "The program works every part of the body and helps everyone achieve their goals. I'm feeling the best I have ever felt in my life.... I feel healthier physically as well as mentally."
  },
  {
    id: 2,
    name: "Sarah Jenkins",
    role: "client",
    content: "I was skeptical at first, but the results speak for themselves. My endurance has doubled in just three months. The trainers really understand how to push you without causing injury."
  },
  {
    id: 3,
    name: "Mike Ross",
   role: "client",
    content: "This gym has the best equipment and atmosphere I've ever experienced. The community is supportive, and the custom plans are actually tailored to your specific body type."
  },
  {
    id: 4,
    name: "Emily Blunt",
    role: "client",
    content: "A perfect balance of strength and flexibility training. I love how the coaches integrate mobility work into the heavy lifting sessions. It’s a game changer for longevity."
  },
  {
    id: 5,
    name: "David Goggins",
    role: "client",
    content: "Hard work pays off here. The facility is top-notch, clean, and always open when I need it. If you want to get serious about your health, this is the only place to be."
  }
];

const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // --- Auto Slide Logic ---
  useEffect(() => {
    if (isPaused) return; // Don't slide if paused

    const interval = setInterval(() => {
      handleNext();
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [currentIndex, isPaused]);

  // --- Handlers ---
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <div className="relative w-full min-h-screen bg-gray-900 flex items-center justify-center overflow-hidden font-sans">
      
      {/* --- Background Image & Overlay --- */}
      <div className="absolute inset-0 z-0">
        <img 
          src={Background} 
          alt="Gym Background" 
          className="w-full h-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      </div>

      {/* --- Main Content Container --- */}
      <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center h-full">
        
        {/* Left Side: Text and Card */}
        {/* Preserved the padding to keep it moved to the right side */}
        <div className="w-full md:w-1/2 lg:w-6/12 pt-10 md:pt-0 md:pl-12 lg:pl-24">
          
          {/* Header Section */}
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
              What Our Clients <br /> Says?
            </h1>
          </motion.div>

          {/* Testimonial Card Wrapper */}
          <div 
            className="relative h-[320px] w-full max-w-lg"
            onMouseEnter={() => setIsPaused(true)} // Pause auto-slide on hover
            onMouseLeave={() => setIsPaused(false)} // Resume on leave
          > 
            
            {/* Orange Outline Box */}
            <motion.div 
              className="absolute -right-6 -bottom-6 w-full h-full border-2 border-orange-500 rounded-sm hidden md:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            />

            {/* The White Card */}
            <div className="bg-white p-8 md:p-10 shadow-2xl relative w-full h-full flex flex-col justify-between z-10">
              
              {/* Animated Content Switcher */}
              <AnimatePresence mode='wait'>
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Card Header */}
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

                  {/* Review Text */}
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    {reviews[currentIndex].content}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Footer: Pagination Dots AND Navigation Buttons */}
              <div className="flex items-center justify-between mt-6">
                
                {/* Dots */}
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
                      aria-label={`Go to review ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Navigation Buttons (Prev/Next) */}
                <div className="flex gap-2">
                  <button 
                    onClick={handlePrev}
                    className="p-2 border border-gray-200 rounded-full hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors duration-300"
                    aria-label="Previous Review"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button 
                    onClick={handleNext}
                    className="p-2 border border-gray-200 rounded-full hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors duration-300"
                    aria-label="Next Review"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* Right Side spacer */}
        <div className="w-full md:w-1/2 lg:w-6/12 hidden md:block"></div>

      </div>
    </div>
  );
};

export default TestimonialSection;