import React, { useState } from "react";
import { Lock, User, ArrowLeft, Phone, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/Authcontext";

const Login = () => {
  const [viewState, setViewState] = useState("login");
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    identifier: "", // This will be the phone number for login
    password: "",
    phoneNumber: "", // This is for registration
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Logic to ensure only numbers are typed for phoneNumber AND identifier (since login is phone only now)
    if (name === "phoneNumber" || name === "identifier") {
      if (value === "" || /^[0-9\b]+$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // --- SUBMIT HANDLERS ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    
    // --- VALIDATION CHECK ---
    if (viewState === "register") {
        if (formData.phoneNumber.length !== 10) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }
    }
    
    if (viewState === "login") {
        if (formData.identifier.length !== 10) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }
    }
    // ---------------------------

    setIsLoading(true);
    try {
        if (viewState === "login") {
            const user = await login(formData.identifier, formData.password);
            if (user.role === 'admin') navigate("/admin");
            else navigate("/user/dashboard");
        } else if (viewState === "register") {
            // Register without email
            await register(formData.name, formData.password, formData.phoneNumber);
            navigate("/user/dashboard");
        }
    } catch (error) {
        console.error("Auth Error", error);
    } finally {
        setIsLoading(false);
    }
  };

  const ButtonContent = ({ text, loading }) => (
    <div className="flex items-center justify-center gap-2">
        {loading && (
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
                <Loader2 size={18} />
            </motion.div>
        )}
        <span>{loading ? "Processing..." : text}</span>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 px-4 relative overflow-hidden">
      
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" 
            alt="Background" 
            className="w-full h-full object-cover"
        />
      </div>

      <button 
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-20 text-white flex items-center gap-2 hover:text-red-400 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Home
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 max-w-96 w-full text-center border border-gray-300/60 rounded-2xl px-8 py-10 bg-white shadow-2xl"
      >
        <h1 className="text-gray-900 text-3xl font-medium mb-2">
          {viewState === "login" ? "Welcome Back" : "Join the Club"}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {viewState === "login" ? "Please sign in to continue" : "Sign up to get started"}
        </p>

        <form onSubmit={handleAuthSubmit} className="mt-8 space-y-4">
          <AnimatePresence mode="popLayout">
            {viewState === "register" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Name */}
                <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full px-6 gap-2 focus-within:border-red-500 transition-colors">
                  <User size={18} className="text-gray-500" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-transparent text-gray-700 placeholder-gray-500 outline-none text-sm w-full h-full"
                    required={viewState === "register"}
                  />
                </div>
                 {/* Register Phone */}
                 <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full px-6 gap-2 focus-within:border-red-500 transition-colors">
                  <Phone size={18} className="text-gray-500" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    maxLength={10} 
                    pattern="[0-9]{10}"
                    className="bg-transparent text-gray-700 placeholder-gray-500 outline-none text-sm w-full h-full"
                    required={viewState === "register"}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Input (Phone Only) */}
          {viewState === "login" && (
             <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full px-6 gap-2 focus-within:border-red-500 transition-colors">
             <Phone size={18} className="text-gray-500" />
             <input
               type="tel"
               name="identifier"
               placeholder="Phone Number"
               value={formData.identifier}
               onChange={handleChange}
               maxLength={10}
               pattern="[0-9]{10}"
               className="bg-transparent text-gray-700 placeholder-gray-500 outline-none text-sm w-full h-full"
               required={viewState === "login"}
             />
           </div>
          )}

          {/* Password Input */}
          <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full px-6 gap-2 focus-within:border-red-500 transition-colors">
            <Lock size={18} className="text-gray-500" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="bg-transparent text-gray-700 placeholder-gray-500 outline-none text-sm w-full h-full"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-1 rounded-full text-white bg-red-500 hover:opacity-90 disabled:bg-red-300 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-red-500/30"
          >
            <ButtonContent 
                text={viewState === "login" ? "Login" : "Sign Up"} 
                loading={isLoading} 
            />
          </motion.button>
        </form>

        <p className="text-gray-500 text-sm mt-6">
        {viewState === "login" ? "Don’t have an account? " : "Already have an account? "}
        <button
            type="button"
            onClick={() => setViewState(viewState === "login" ? "register" : "login")}
            disabled={isLoading}
            className="text-red-500 font-medium hover:underline focus:outline-none disabled:text-red-300"
        >
            {viewState === "login" ? "Sign up" : "Login"}
        </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;