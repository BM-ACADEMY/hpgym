import React from 'react';
import { motion } from 'framer-motion';
import BackgroundImage from '@/assets/images/enquiry.jpg'; // Replace with your image path
import { Play } from 'lucide-react';

const Enquirypage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-end py-20 px-4 sm:px-6 lg:px-8 overflow-hidden" id="contact">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={BackgroundImage}
          alt="Gym Background"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/30"></div> {/* Optional Overlay */}
      </div>

      {/* Form Content */}
      <div className="relative z-10 w-full max-w-xl lg:mr-54">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-left"
        >
          <motion.h3 {...fadeInUp} className="text-red-500 font-bold uppercase tracking-wider mb-2">
            CONTACT US
          </motion.h3>
          <motion.h2 {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.2 }} className="text-4xl sm:text-5xl font-extrabold text-white uppercase leading-tight mb-8">
            SEND US A MESSAGE & JOIN OUR TEAM
          </motion.h2>

          <form className="space-y-6">
            <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.4 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Name"
                className="w-full bg-white rounded-full px-6 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
              />
              <input
                type="tel"
                placeholder="Phone"
                className="w-full bg-white rounded-full px-6 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
              />
            </motion.div>
            <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.5 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-white rounded-full px-6 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
              />
              <input
                type="text"
                placeholder="Subject"
                className="w-full bg-white rounded-full px-6 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
              />
            </motion.div>
            <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.6 }}>
              <textarea
                rows="5"
                placeholder="Message"
                className="w-full bg-white rounded-[2rem] px-6 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 resize-none"
              ></textarea>
            </motion.div>
            <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.7 }} className="flex items-center">
              <button
                type="submit"
                className="flex items-center space-x-3 text-white font-bold uppercase text-lg hover:text-red-400 transition-colors duration-300 group"
              >
                <span>Send now</span>
                <div className="bg-red-500 p-2 rounded-full group-hover:bg-red-400 transition-colors duration-300">
                  <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                </div>
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Enquirypage;