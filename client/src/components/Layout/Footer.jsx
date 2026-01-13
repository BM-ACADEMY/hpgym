import React from 'react';
import Footerlogo from '@/assets/images/logoblack.jpeg';
import FooterBackground from '@/assets/images/FIT0019.png';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <>
      <div className="w-full h-64 overflow-hidden shadow-sm transition-all duration-500 border border-gray-200">
        <iframe
          title="Battle Fitness Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4208.120479737972!2d79.83597870000001!3d11.961744399999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a53639a0b2f5b53%3A0x437de4aae9db4fc4!2sHp%20fitness%20studio%20unisex!5e1!3m2!1sen!2sin!4v1768030670438!5m2!1sen!2singht="
          className="w-full h-full border-0"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      <footer className="relative py-12 px-4 text-gray-600" id="contact">
        <div className="absolute inset-0 z-0">
          <img
            src={FooterBackground}
            alt="Footer Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 text-gray-500"></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1: Logo & Content */}
            <div className="space-y-4">
              <div className="flex items-center">
                <img src={Footerlogo} alt="Footer Logo" className="h-28" />
              </div>
              <p className="text-gray-500 text-sm text-justify">
                Discover HP Fitness Studio – a premium gym in Pondicherry offering expert personal training, modern equipment, and complete fitness solutions.
              </p>
              <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="https://www.instagram.com/battle_fitness_field/?igsh=bjVhNml2dGNpdzg4#" target="_blank" className="text-gray-500 hover:text-red-400 transition">
                <Instagram size={30} className="text-red-600" />
              </a>
            </div>
            </div>

            {/* Column 2: Useful Links */}
            <div>
              <h3 className="text-lg font-bold text-black mb-4 font-quicksand">USEFUL LINKS</h3>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-500 hover:text-red-400 transition">Home</a></li>
                <li><a href="#about" className="text-gray-500 hover:text-red-400 transition">About</a></li>
                <li><a href="#services" className="text-gray-500 hover:text-red-400 transition">Services</a></li>
              </ul>
            </div>

            {/* Column 3: Contact Info */}
            <div>
              <h3 className="text-lg font-bold text-black mb-4 font-quicksand">CONTACT</h3>
              <address className="not-italic space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start">
                    <MapPin className="mt-1 mr-3 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500">
                        First floor, No:252, Mahatma Gandhi Rd, Kottakuppam, Tamil Nadu 605104
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="mr-3 text-red-500" />
                    <a href="tel:+919787755755" className="text-gray-500">+91 97877 55755</a>
                  </div>
                  <div className="flex items-center">
                    <Mail className="mr-3 text-red-500" />
                    <a href="mailto:battlefitnesstvr@gmail.com" className="text-gray-500">battlefitnesstvr@gmail.com</a>
                  </div>
                </div>
              </address>
            </div>

            {/* Column 4: Opening Hours */}
            <div>
              <h3 className="text-lg font-bold text-black mb-4 font-quicksand">OPENING HOURS</h3>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li className="flex justify-between"><span>Sunday</span><span className="text-red-500 font-medium">Closed</span></li>
                <li className="flex justify-between"><span>Monday</span><span>5:30 am – 9:30 pm</span></li>
                <li className="flex justify-between"><span>Tuesday</span><span>5:30 am – 9:30 pm</span></li>
                <li className="flex justify-between"><span>Wednesday</span><span>5:30 am – 9:30 pm</span></li>
                <li className="flex justify-between"><span>Thursday</span><span>5:30 am – 9:30 pm</span></li>
                <li className="flex justify-between"><span>Friday</span><span>5:30 am – 9:30 pm</span></li>
                <li className="flex justify-between"><span>Saturday</span><span>5:30 am – 9:30 pm</span></li>

              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="mt-12 pt-6 border-t border-gray-400 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-700">
              © {new Date().getFullYear()} <a href="https://bmtechx.in" className="hover:text-red-600" target="_blank" rel="noopener noreferrer">BMTechx.in.</a> All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
