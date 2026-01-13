import React from 'react';
import { motion } from 'framer-motion';
import { Play, Dumbbell, Users, Trophy, ArrowRight } from 'lucide-react';

const WhyChooseUs = () => {
  // Animation variants for staggered reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="bg-black text-white py-16 px-4 md:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[600px]">
          
          {/* LEFT SIDE: The 2x2 Grid */}
          <motion.div 
            className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 h-full"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            
            {/* Box 1: Certified Trainers (Top Left) */}
            <motion.div 
              variants={itemVariants}
              className="group relative h-64 sm:h-auto overflow-hidden rounded-xl bg-neutral-900"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=800&auto=format&fit=crop')" }}
              />
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors duration-300" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                   Certified Trainers
                </h3>
                <p className="text-gray-300 text-sm line-clamp-3">
                  Train with certified personal trainers in Pondicherry, guiding your strength, fat loss, and muscle-building journey.
                </p>
              </div>
            </motion.div>

            {/* Box 2: The Orange Title Block (Top Right) */}
            <motion.div 
              variants={itemVariants}
              className="bg-orange-500 rounded-xl p-6 flex flex-col justify-center relative overflow-hidden h-64 sm:h-auto"
            >
              <div className="z-10 relative">
                <h2 className="text-2xl font-black uppercase mb-4 leading-tight">
                  WHY CHOOSE HP FITNESS STUDIO?

                </h2>
                <p className="text-white/90 text-sm mb-6">
                  At HP Fitness Studio in Pondicherry, we provide expert guidance, certified trainers, and modern equipment to help you reach your fitness goals
                </p>
                <a
  href="#contact"
  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:translate-x-1 transition-transform scroll-smooth"
>
  Join Now <ArrowRight size={16} />
</a>
              </div>
              {/* Decorative background element */}
              <Dumbbell className="absolute -bottom-4 -right-4 text-white/20 w-32 h-32 rotate-[-15deg]" />
            </motion.div>

            {/* Box 3: Modern Equipment (Bottom Left) */}
            <motion.div 
              variants={itemVariants}
              className="group relative h-64 sm:h-auto overflow-hidden rounded-xl bg-neutral-900"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop')" }}
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors duration-300" />
              
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-xl font-bold mb-2">Modern Equipment</h3>
                <p className="text-gray-300 text-sm line-clamp-3">
                  State-of-the-art gym equipment in Pondicherry to support all fitness levels safely.
                </p>
              </div>
            </motion.div>

            {/* Box 4: Motivational Environment (Bottom Right) */}
            <motion.div 
              variants={itemVariants}
              className="group relative h-64 sm:h-auto overflow-hidden rounded-xl bg-neutral-900"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=800&auto=format&fit=crop')" }}
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors duration-300" />
              
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-xl font-bold mb-2">Motivational Vibes</h3>
                <p className="text-gray-300 text-sm line-clamp-3">
                  Positive, high-energy gym environment in Pondicherry to motivate and push you toward your fitness goals.
                </p>
              </div>
            </motion.div>

          </motion.div>

          {/* RIGHT SIDE: Large Hero Image with Play Button */}
          <motion.div 
            className="lg:col-span-7 relative h-[500px] lg:h-full rounded-xl overflow-hidden group"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1600&auto=format&fit=crop')" }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

            
            
            {/* Bottom Text for Hero */}
            <div className="absolute bottom-8 left-8 max-w-md">
              <div className="flex items-center gap-2 mb-2 text-orange-500 font-bold tracking-widest uppercase text-sm">
                <Trophy size={16} />
                <span>Success Stories</span>
              </div>
              <h2 className="text-xl lg:text-xl font-bold text-white leading-tight">
               See how HP Fitness Studio in Pondicherry transforms lives every day through personal training and fitness programs.
              </h2>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;