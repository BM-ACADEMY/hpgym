import React from 'react';
import Footerlogo from '@/assets/images/logo.jpeg';
import FooterBackground from '@/assets/images/FIT0019.png';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';


const Footer = () => {
  return (
    <>
     <div className="w-full h-64 overflow-hidden shadow-sm grayscale transition-all duration-500 border border-gray-200">
          <iframe
            title="Battle Fitness Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3911.456789!2d79.634567!3d10.765432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ1JzU1LjYiTiA3OcKwMzgnMDQuNCJF!5e0!3m2!1sen!2sin!4v1234567890"
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
              Discover Battle Fitness A/C - a premier gym in Thiruvarur and Mannargudi offering elite training programs and a lifestyle of wellness, strength, and transformation.
            </p>
          </div>

          {/* Column 2: Useful Links */}
          <div>
            <h3 className="text-lg font-bold text-black mb-4 font-quicksand">USEFUL LINKS</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="text-gray-500 hover:text-red-400 transition">Home</a></li>
              <li><a href="#about" className="text-gray-500 hover:text-red-400 transition">About</a></li>
              <li><a href="#services" className="text-gray-500 hover:text-red-400 transition">Services</a></li>
              <li><a href="#trainers" className="text-gray-500 hover:text-red-400 transition">Trainers</a></li>
              <li><a href="#franchise" className="text-gray-500 hover:text-red-400 transition">Franchise</a></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-black mb-4 font-quicksand">CONTACT</h3>
            <address className="not-italic space-y-4">
              {/* Pulivalam Branch */}
              <div className="space-y-2">
                <div className="flex items-start">
                  <MapPin className="mt-1 mr-3 text-rose-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-500">Pulivalam Branch</p>
                    <p className="text-gray-500">Thiruvarur - 610109</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-3 text-rose-500" />
                  <a href="tel:+919751351156" className="text-gray-500">+91 97513 51156</a>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-3 text-rose-500" />
                  <a href="mailto:battlefitnesstvr@gmail.com" className="text-gray-500">battlefitnesstvr@gmail.com</a>
                </div>
              </div>

            </address>
          </div>

          {/* Column 4: Social Media */}
          <div>
            <h3 className="text-lg font-bold text-black mb-4 font-quicksand">FOLLOW US</h3>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/battle_fitness_field/?igsh=bjVhNml2dGNpdzg4#" target="_blank" className="text-gray-500 hover:text-red-400 transition">
                <Instagram size={30} className="text-red-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-6 border-t border-gray-400 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-700">
            © {new Date().getFullYear()} <a href="https://bmtechx.in" className="hover:text-red-400" target="_blank" rel="noopener noreferrer">BMTechx.in.</a> All rights reserved.
          </p>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;