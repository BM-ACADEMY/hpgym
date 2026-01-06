import React from "react";
import { Dumbbell, PersonStanding, Play, Trophy, Activity } from "lucide-react";

const services = [
  {
    id: 1,
    title: "PERSONAL TRAINING",
    description: "One-on-one coaching tailored to your specific goals.",
    // Image: Trainer helping client
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
    icon: <Dumbbell className="w-8 h-8 text-white mb-2" />,
  },
  {
    id: 2,
    title: "BODY TONE UP",
    description: "Sculpt and define muscles with targeted resistance.",
    // Image: Woman lifting weights/toning
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
    icon: <PersonStanding className="w-8 h-8 text-white mb-2" />,
  },
  {
    id: 3,
    title: "WEIGHT LOSS",
    description: "High-intensity cardio circuits designed to burn fat fast.",
    // Image: High intensity rope workout
    image: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
    icon: <Activity className="w-8 h-8 text-white mb-2" />,
  },
  {
    id: 4,
    title: "CONTEST PREP",
    description: "Professional physique coaching for stage competition.",
    // Image: Bodybuilder posing
    image: "https://anbfnatural.com/wp-content/uploads/2024/09/ANBF-natural-bodybuilding-Mens-physique-2-portrait.png", 
    icon: <Trophy className="w-8 h-8 text-white mb-2" />,
  },
];

const GymServicesSection = () => {
  return (
    <section className="relative w-full bg-white pb-20 overflow-hidden">
      
      {/* --- Background Section (Orange Gradient) --- */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-r from-[#F94C30] to-[#E02D2D] z-0">
        
        {/* Decorative Background Icons (Only Dumbbells) */}
        <div className="absolute top-20 -left-20 text-white/10 rotate-12 transform">
          <Dumbbell size={400} />
        </div>

        <div className="absolute top-40 -right-20 text-white/10 -rotate-12 transform">
          <Dumbbell size={400} />
        </div>
      </div>

      {/* --- Content Container --- */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-20">
        {/* Header Text */}
        <div className="text-center mb-16 text-white">
          <h3 className="uppercase tracking-[0.2em] text-sm font-semibold mb-3">
            Our Services
          </h3>
          <h2 className="text-4xl md:text-4xl font-extrabold uppercase leading-tight max-w-3xl mx-auto">
            Solutions For Moving Better <br /> & Feeling Healthier
          </h2>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative h-[450px] overflow-hidden cursor-pointer"
            >
              {/* Background Image */}
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 p-8 w-full">
                {/* Icon */}
                <div className="mb-2">{service.icon}</div>
                <div className="mb-6 font-extralight inset-0.5 object-cover"></div>

                {/* Title */}
                <h3 className="text-white text-2xl font-bold uppercase italic mb-2 tracking-wide font-sans">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-1 line-clamp-2">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GymServicesSection;