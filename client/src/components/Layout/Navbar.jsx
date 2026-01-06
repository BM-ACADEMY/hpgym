import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react"; // Lucide icons
import logo from "@/assets/images/logo.jpeg";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollableHeight <= 0) return;

      const scrollPercentage = (window.scrollY / scrollableHeight) * 100;
      setScrolled(scrollPercentage > 7);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Simplified toggle handler (removed the MUI specific event checks)
  const toggleDrawer = (open) => () => {
    setIsOpen(open);
  };

  const navItems = [
    { name: "Home", id: "home" },
    { name: "About", id: "about" },
    { name: "Services", id: "services" },
    { name: "Franchise", id: "franchise" },
    // { name: "Enquiry", id: "enquiry" },
    { name: "Contact", id: "contact" },
  ];

  const handleNavClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.history.pushState(null, null, `#${id}`);
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  const navbarVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  const drawerVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    exit: {
      x: "100%",
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const drawerItemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.3, ease: "easeOut" },
    }),
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 w-full text-white shadow-md z-50 backdrop-blur-[12px] border-b transition-colors duration-300 ${
          scrolled
            ? "bg-[#27303cbb] border-[rgba(255,255,255,0.3)]"
            : "bg-[#00000026] border-[rgba(255,255,255,0.2)]"
        }`}
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 md:h-24 items-center">
            <motion.div
              className="flex-shrink-0"
              transition={{ type: "spring", stiffness: 300 }}
            >
              <button
                onClick={() => handleNavClick("home")}
                className="focus:outline-none"
                aria-label="Go to home section"
              >
                <img
                  src={logo}
                  alt="Battle-Fitness-Unisex-Gym"
                  className="h-20 w-auto md:h-24 object-contain"
                  title="Battle Fitness Unisex Gym"
                />
              </button>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  custom={index}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => handleNavClick(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative px-4 py-2 font-sans font-medium text-lg hover:text-red-400 focus:outline-none"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <span
                    className={`relative z-10 transition-colors duration-300 ${
                      hoveredItem === item.id ? "text-[#dc2626]" : "text-white"
                    }`}
                  >
                    {item.name}
                  </span>
                  <motion.span
                    className="absolute left-1/2 bottom-0 h-[2px] rounded bg-[#dc2626]"
                    initial={{ width: 0, x: "-50%" }}
                    animate={{
                      width: hoveredItem === item.id ? "75%" : 0,
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                </motion.button>
              ))}
            </div>

            {/* Mobile Menu Icon (Replacement for IconButton) */}
            <div className="md:hidden">
              <button
                onClick={toggleDrawer(true)}
                className="p-2 text-white hover:bg-red-500/30 rounded-full transition-colors focus:outline-none"
                aria-label="menu"
              >
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Menu size={28} />
                </motion.div>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer (Replacement for MUI Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={toggleDrawer(false)}
            />

            {/* Side Panel */}
            <motion.div
              className="fixed top-0 right-0 h-full w-[80%] max-w-[300px] bg-[#00000026] backdrop-blur-[12px] border-l border-white/20 z-[70] shadow-2xl flex flex-col"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Close Button Row */}
              <div className="flex justify-end px-4 py-3">
                <button
                  onClick={toggleDrawer(false)}
                  className="p-2 text-white hover:bg-red-500/30 rounded-full transition-colors focus:outline-none"
                  aria-label="close menu"
                >
                  <X size={28} />
                </button>
              </div>

              {/* Drawer Nav Items (Replacement for List/ListItem) */}
              <ul className="flex flex-col py-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    custom={index}
                    variants={drawerItemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <li
                      onClick={() => handleNavClick(item.id)}
                      className="relative overflow-hidden cursor-pointer group"
                    >
                      <div className="px-4 py-3 hover:bg-red-500/20 transition-colors duration-300">
                        <motion.div
                          whileHover={{ x: 10 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="flex items-center"
                        >
                          <span className="font-sans font-medium text-[1.1rem] text-white group-hover:text-[#ef4444] transition-colors duration-300">
                            {item.name}
                          </span>
                        </motion.div>
                      </div>
                    </li>
                  </motion.div>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;