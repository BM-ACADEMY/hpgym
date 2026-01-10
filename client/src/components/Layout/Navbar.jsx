import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react"; 
import { useNavigate } from "react-router-dom"; 
import { useAuth } from "@/Context/Authcontext"; 
import logo from "@/assets/images/logo.jpeg";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); 
  const [dropdownOpen, setDropdownOpen] = useState(false); 
  const [hoveredItem, setHoveredItem] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
  const toggleDrawer = (open) => () => setIsOpen(open);

  const navItems = [
    { name: "Home", id: "home" },
    { name: "About", id: "about" },
    { name: "Services", id: "services" },
    { name: "Enquiry", id: "enquiry" },
  ];

  // --- FIX 1: UPDATED NAVIGATION LOGIC ---
  const handleNavClick = (id) => {
    // 1. Close the menu first to start the exit animation
    setIsOpen(false);
    setDropdownOpen(false);

    if (id === "login") {
      navigate("/login"); 
      return;
    }

    // 2. Wait for the exit animation (0.3s) to finish BEFORE scrolling
    // We set timeout to 350ms to be safe
    const animationDelay = 350; 

    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, animationDelay);
    } else {
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          window.history.pushState(null, null, `#${id}`);
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, animationDelay);
    }
  };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setIsOpen(false);
    navigate("/");
  };

  const handleDashboardClick = () => {
    setDropdownOpen(false);
    setIsOpen(false);
    if (user?.role === 'admin') {
      navigate("/admin");
    } else {
      navigate("/user");
    }
  };

  const navbarVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  const drawerVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } },
    exit: { x: "100%", opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.1 } }
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 w-full text-white shadow-md z-50 backdrop-blur-[12px] border-b transition-colors duration-300 ${
          scrolled ? "bg-[#27303cbb] border-[rgba(255,255,255,0.3)]" : "bg-[#00000026] border-[rgba(255,255,255,0.2)]"
        }`}
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 md:h-24 items-center">
            
            <motion.div className="flex-shrink-0" transition={{ type: "spring", stiffness: 300 }}>
              <button onClick={() => handleNavClick("home")} className="focus:outline-none">
                <img src={logo} alt="Logo" className="h-20 w-auto md:h-24 object-contain" />
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
                >
                  <span className={`relative z-10 transition-colors duration-300 ${hoveredItem === item.id ? "text-[#dc2626]" : "text-white"}`}>
                    {item.name}
                  </span>
                  <motion.span
                    className="absolute left-1/2 bottom-0 h-[2px] rounded bg-[#dc2626]"
                    initial={{ width: 0, x: "-50%" }}
                    animate={{ width: hoveredItem === item.id ? "75%" : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              ))}

              <div className="ml-4 relative" ref={dropdownRef}>
                {user ? (
                  <div>
                    <motion.button
                      variants={navItemVariants}
                      custom={navItems.length}
                      initial="hidden"
                      animate="visible"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700 border border-gray-600 rounded-full transition-all"
                    >
                      <User size={18} className="text-[#dc2626]" />
                      <span className="font-medium max-w-[100px] truncate">{user.name?.split(" ")[0]}</span>
                      <ChevronDown size={16} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </motion.button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          key="user-dropdown" // Added Key
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-200"
                        >
                          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Signed in as</p>
                            <p className="text-sm font-bold truncate text-[#dc2626]">{user.name}</p>
                          </div>
                          
                          <button 
                            onClick={handleDashboardClick}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 hover:text-red-600 flex items-center gap-2 transition-colors"
                          >
                            <LayoutDashboard size={16} />
                            Dashboard
                          </button>
                          
                          <button 
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 hover:text-red-600 flex items-center gap-2 transition-colors border-t border-gray-100"
                          >
                            <LogOut size={16} />
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.button
                    variants={navItemVariants}
                    custom={navItems.length}
                    initial="hidden"
                    animate="visible"
                    onClick={() => handleNavClick("login")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 py-2 bg-[#dc2626] hover:bg-red-700 text-white font-medium rounded-full transition-colors shadow-lg"
                  >
                    <LogIn size={18} />
                    <span>Login</span>
                  </motion.button>
                )}
              </div>
            </div>

            <div className="md:hidden">
              <button onClick={toggleDrawer(true)} className="p-2 text-white hover:bg-red-500/30 rounded-full transition-colors">
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <Menu size={28} />
                </motion.div>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* --- FIX 2: MOBILE DRAWER KEYS --- */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="drawer-backdrop" // Added Unique Key
              className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={toggleDrawer(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              key="drawer-panel" // Added Unique Key
              className="fixed top-0 right-0 h-full w-[80%] max-w-[300px] bg-[#00000026] backdrop-blur-[12px] border-l border-white/20 z-[70] shadow-2xl flex flex-col"
              variants={drawerVariants} 
              initial="hidden" 
              animate="visible" 
              exit="exit"
            >
              <div className="flex justify-end px-4 py-3">
                <button onClick={toggleDrawer(false)} className="p-2 text-white hover:bg-red-500/30 rounded-full">
                  <X size={28} />
                </button>
              </div>

              {user && (
                 <div className="px-6 py-4 border-b border-white/10 mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-xs text-gray-300 capitalize">{user.role}</p>
                        </div>
                    </div>
                 </div>
              )}

              <ul className="flex flex-col py-2">
                {navItems.map((item, index) => (
                  <motion.li
                    key={item.id}
                    custom={index}
                    onClick={() => handleNavClick(item.id)}
                    className="px-4 py-3 hover:bg-red-500/20 cursor-pointer"
                  >
                     <span className="font-sans font-medium text-[1.1rem] text-white hover:text-[#ef4444] transition-colors">
                       {item.name}
                     </span>
                  </motion.li>
                ))}

                <div className="mt-6 px-4 space-y-3">
                  {user ? (
                    <>
                        <button 
                            onClick={handleDashboardClick}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600"
                        >
                            <LayoutDashboard size={20} />
                            Dashboard
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-3 border border-red-500 text-red-400 rounded-lg font-medium hover:bg-red-500/10"
                        >
                            <LogOut size={20} />
                            Logout
                        </button>
                    </>
                  ) : (
                    <button 
                        onClick={() => handleNavClick("login")}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-[#dc2626] text-white rounded-lg font-medium hover:bg-red-700"
                    >
                        <LogIn size={20} />
                        Login
                    </button>
                  )}
                </div>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;