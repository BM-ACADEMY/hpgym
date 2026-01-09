import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BackgroundImage from '@/assets/images/enquiry.jpg';
import { Play, Loader2 } from 'lucide-react'; // Import Loader2
import axiosInstance from '@/api/axiosInstance'; // Adjust path if needed
import { showToast } from '@/utils/customToast'; // Adjust path if needed

const Enquirypage = () => {
  // 1. Manage Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);

  // 2. Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      showToast('error', 'Please fill in required fields (Name, Email, Message)');
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post('/enquiry/send', formData);

      if (res.data.success) {
        showToast('success', 'Message sent successfully!');
        // Reset form
        setFormData({
          name: '',
          phone: '',
          email: '',
          subject: '',
          message: ''
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Something went wrong. Try again.';
      showToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="absolute inset-0 bg-black/30"></div>
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

          <form className="space-y-6" onSubmit={handleSubmit}>
            <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.4 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name *"
                className="w-full bg-white rounded-full px-6 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="w-full bg-white rounded-full px-6 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
              />
            </motion.div>
            <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.5 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email *"
                className="w-full bg-white rounded-full px-6 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
              />
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                className="w-full bg-white rounded-full px-6 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
              />
            </motion.div>
            <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.6 }}>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Message *"
                className="w-full bg-white rounded-[2rem] px-6 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 resize-none"
              ></textarea>
            </motion.div>
            <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.7 }} className="flex items-center">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-3 text-white font-bold uppercase text-lg hover:text-red-400 transition-colors duration-300 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Sending...' : 'Send now'}</span>
                <div className={`bg-red-500 p-2 rounded-full group-hover:bg-red-400 transition-colors duration-300 ${loading ? 'animate-spin' : ''}`}>
                  {loading ? (
                    <Loader2 className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                  )}
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
