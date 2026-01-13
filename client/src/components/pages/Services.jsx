import React from "react";
import { Dumbbell, PersonStanding, Play, Trophy, Activity } from "lucide-react";
import Personaltrainer from "@/assets/images/personaltrainer.jpg"
import weightloss from "@/assets/images/weightloss.jpg"
import bodytone from "@/assets/images/bodytone.jpg"

const services = [
  {
    id: 1,
    title: "PERSONAL TRAINING",
    description: "One-on-one coaching at HP Fitness Studio, Pondicherry for strength & muscle goals.",
    // Image: Trainer helping client
    image: Personaltrainer, 
    icon: <Dumbbell className="w-8 h-8 text-white mb-2" />,
    alt:"Personal training session at HP Fitness Studio in Pondicherry",
  },
  {
    id: 2,
    title: "BODY TONE UP",
    alt:"Body toning workout at HP Fitness Studio in Pondicherry",
    description: "Targeted workouts to sculpt muscles and improve overall fitness.",
    // Image: Woman lifting weights/toning
    image: bodytone, 
    icon: <PersonStanding className="w-8 h-8 text-white mb-2" />,
  },
  {
    id: 3,
    title: "WEIGHT LOSS",
    alt:"Weight loss and fat burning program at HP Fitness Studio in Pondicherry",
    description: "High-intensity programs for fat loss and cardio results.",
    // Image: High intensity rope workout
    image: weightloss, 
    icon: <Activity className="w-8 h-8 text-white mb-2" />,
  },
  {
    id: 4,
    title: "CONTEST PREP",
    alt:"Contest preparation bodybuilding training at HP Fitness Studio in Pondicherry",
    description: "Coaching for bodybuilding & fitness competitions, including diet & training.",
    // Image: Bodybuilder posing
    image: "https://anbfnatural.com/wp-content/uploads/2024/09/ANBF-natural-bodybuilding-Mens-physique-2-portrait.png", 
    icon: <Trophy className="w-8 h-8 text-white mb-2" />,
  },
];

const GymServicesSection = () => {
  return (
    <section className="relative w-full bg-white pb-20 overflow-hidden" id="services">
      
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
          <h2 className="text-2xl md:text-4xl font-bold uppercase leading-tight max-w-5xl mx-auto">
            PERSONAL TRAINING & FITNESS SOLUTIONS IN PONDICHERRY instead of SOLUTIONS FOR MOVING BETTER & FEELING HEALTHIER

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
                alt={service.alt}
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