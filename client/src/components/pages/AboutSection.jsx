import React from 'react';
import { ArrowRight } from 'lucide-react';
import Photo from "@/assets/images/intro-pic.png";

const AboutSection = () => {
  // Define the text content
  const phrases = ["HUMBLE", "BE PROUD", "BELIEVE IN YOURSELF", "RISE UP", "NEVER GIVE UP", "TRAIN HARD", "PUSH YOUR LIMITS"];

  return (
    <section className="relative min-h-screen w-full bg-white flex items-center justify-center px-4 py-12 sm:p-8 font-sans overflow-hidden" id='about'>
      
      {/* CSS for infinite scroll */}
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-left {
          animation: scroll-left 20s linear infinite;
        }
      `}</style>

      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center z-10 pb-20"> 
        {/* pb-20 added to main container so content doesn't touch the bottom bar */}

        {/* --- Image Column --- */}
        <div className="relative flex justify-center lg:justify-end pr-0 lg:pr-10 pt-4 lg:pt-12 pb-40 lg:mb-0">
          <div className="
            relative 
            flex-shrink-0 
            transition-all duration-300
            border-[10px] sm:border-[15px] lg:border-[20px] border-[#FF5400] 
            w-[80vw] max-w-[340px] h-[400px]
            sm:w-[380px] sm:h-[500px] sm:max-w-none
            md:w-[450px] md:h-[550px] 
            lg:w-[480px] lg:h-[580px]
          ">
            <h1 
              className="absolute top-3 right-4 lg:top-6 lg:right-6 text-4xl sm:text-6xl lg:text-7xl font-bold tracking-wide text-transparent select-none z-0"
              style={{ WebkitTextStroke: '1px #a1a1aa' }} 
            >
              STRONG
            </h1>
            
            <div className="absolute -bottom-16 -left-10 sm:-bottom-24 sm:-left-16 lg:-bottom-30 lg:-left-20 w-[115%] sm:w-[110%] lg:w-full h-full z-10">
              <img 
                src={Photo}
                alt="Fitness Model" 
                className="w-full h-full contrast-125 mask-image-gradient object-cover"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' 
                }}
              />
            </div>
          </div>
        </div>

        {/* --- Text Column --- */}
        <div className="flex flex-col space-y-6 sm:space-y-8 text-center lg:text-left z-20">
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

          <div className="pt-2">
            <a 
              href="#enquiry"
              className="group inline-flex items-center justify-center gap-2 bg-[#FF5400] text-white px-8 py-3 sm:px-10 sm:py-4 font-semibold text-sm uppercase tracking-wide shadow-lg shadow-orange-200 transition-all duration-300 ease-in-out hover:bg-orange-600 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <span>Learn More</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>

      {/* --- STRAIGHT BOTTOM MARQUEE --- */}
      <div className="absolute bottom-0 left-0 w-full z-20">
        <div className="bg-[#d5bda2] py-4 overflow-hidden relative shadow-lg">
          <div className="flex whitespace-nowrap animate-scroll-left">
            {/* Duplicated loop for seamless infinite scroll */}
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex shrink-0 items-center">
                {phrases.map((text, index) => (
                  <span key={index} className="mx-6 text-black font-black italic text-xl uppercase tracking-wider flex items-center">
                    {text}
                    {/* Divider Icon/Symbol */}
                    <span className="ml-6 text-black/50 text-lg">›</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

export default AboutSection;