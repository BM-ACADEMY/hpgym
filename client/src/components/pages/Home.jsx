import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import your images here
import GymImage1 from "@/assets/images/gym2.jpg";
import GymImage2 from "@/assets/images/gym.jpg"; // Example
// import GymImage3 from "@/assets/images/gym4.jpg"; // Example

// Define your slides data
const slides = [
  {
    id: 1,
    image: GymImage1,
    alt:"HP Fitness Studio strength training session in Pondicherry",
    // We can use JSX inside the data for custom highlighting
    title: (
      <>
        "Become the <span className="text-[#dc2626]">Strongest</span> Version
        of Yourself at <span className="text-[#dc2626]">Battle Fitness</span>"
      </>
    ),
    subtitle: "Train Hard. Stay Consistent. Level Up.",
    
  },
  {
    id: 2,
    image: GymImage2, // Replace with GymImage2
    alt:"HP Fitness Studio personal training and performance workout in Pondicherry",
    title: (
      <>
        "Push Your <span className="text-[#dc2626]">Limits</span> and Break
        Every <span className="text-[#dc2626]">Barrier</span>"
      </>
    ),
    subtitle: "No Pain. No Gain. Just Results.",
  },
  
];

export default function HomeSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Animation variants
  const fadeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 1 } },
    exit: { opacity: 0, transition: { duration: 1 } },
  };

  const textVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.3 } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.5, ease: "easeIn" } },
  };

  return (
    <section id="home" className="relative h-screen overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {/* We key the container by currentSlide so React detects it as a new element */}
        <motion.div
          key={currentSlide}
          className="absolute inset-0 w-full h-full"
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Background Image Layer */}
         <motion.div
  variants={fadeVariants}
  className="absolute inset-0 w-full h-full"
>
  <img
    src={slides[currentSlide].image}
    alt={slides[currentSlide].alt}
    className="w-full h-full object-cover object-top"
  />
  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-black/50"></div>
</motion.div>


          {/* Content Layer */}
          <div className="relative z-10 flex h-full items-center justify-center px-4 sm:px-6 md:px-8 lg:px-10 text-center">
            <div className="max-w-3xl px-2 text-white">
              
              {/* Title */}
              <motion.h1
                variants={textVariants}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-quicksand mb-4 sm:mb-6 leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
              >
                {slides[currentSlide].title}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={textVariants}
                className="text-base sm:text-lg md:text-xl lg:text-2xl font-commissioner drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]"
              >
                {slides[currentSlide].subtitle}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Optional: Navigation Dots (Visual indicator) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              index === currentSlide ? "bg-[#dc2626]" : "bg-white/50 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}