import React from 'react';
import { Bike, User, HeartPulse } from 'lucide-react';
import Photo from "@/assets/images/intro-pic.png"

const AboutSection = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12 sm:p-8 font-sans overflow-x-hidden">
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        <div className="relative flex justify-center lg:justify-end pr-0 lg:pr-10 pt-4 lg:pt-12 mb-20 lg:mb-0">
          

          <div className="relative border-[10px] sm:border-[15px] lg:border-[20px] border-[#FF5400] w-[290px] h-[400px] sm:w-[350px] sm:h-[500px] lg:w-[480px] lg:h-[580px] flex-shrink-0 transition-all duration-300">
            
            <h1 
              className="absolute top-3 right-4 lg:top-6 lg:right-6 text-4xl sm:text-6xl lg:text-7xl font-bold tracking-wide text-transparent select-none z-0"
              style={{ WebkitTextStroke: '1px #a1a1aa' }} 
            >
              STRONG
            </h1>
            <div className="absolute -bottom-16 -left-14 sm:-bottom-24 sm:-left-22 lg:-bottom-30 lg:-left-22 w-[115%] sm:w-[110%] lg:w-full h-full z-10">
              <img 
                src={Photo}
                alt="Fitness Model" 
                className="w-full h-full   contrast-125 mask-image-gradient"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' 
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-6 sm:space-y-8 text-center lg:text-left">
          
          <div>
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              <span className="w-8 h-1 bg-[#FF5400]"></span>
              <span className="text-[#FF5400] font-bold uppercase tracking-widest text-sm">
                About Us
              </span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-black uppercase leading-[1.1] mb-6">
              Give a shape of <br className="hidden sm:block" /> your body
            </h2>
            
            <p className="text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
              This also meant we needed to provide a learning environment run by
              experienced and successful coaches. However, our most important goal
              was to create a welcoming atmosphere and community in which everyone
              feels a sense of belonging.
            </p>
          </div>

          {/* Button */}
          <div className="pt-2">
            <button className="bg-[#FF5400] text-white px-8 py-3 sm:px-10 sm:py-4 font-semibold text-sm uppercase tracking-wide hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200">
              Learn More
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutSection;