import React, { useState } from "react";
import { Mail, Lock, User, ArrowLeft, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/Authcontext"; // Check path

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "", // Added phoneNumber
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if (isLogin) {
            const user = await login(formData.email, formData.password);
            // Redirect based on role
            if (user.role === 'admin') navigate("/admin");
            else navigate("/user/dashboard");
        } else {
            const user = await register(formData.name, formData.email, formData.password, formData.phoneNumber);
            // Redirect based on role (defaults to user usually)
            navigate("/user/dashboard");
        }
    } catch (error) {
        console.error("Authentication Error", error);
        // Toast is handled in AuthContext
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 px-4 relative overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" 
            alt="Gym Background" 
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
          {isLogin ? "Welcome Back" : "Join the Club"}
        </h1>
        <p className="text-gray-500 text-sm">
          {isLogin ? "Please sign in to continue" : "Sign up to get started"}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Name Input */}
                <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full px-6 gap-2 focus-within:border-red-500 transition-colors">
                  <User size={18} className="text-gray-500" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-transparent text-gray-700 placeholder-gray-500 outline-none text-sm w-full h-full"
                    required={!isLogin}
                  />
                </div>

                 {/* Phone Input (New) */}
                 <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full px-6 gap-2 focus-within:border-red-500 transition-colors">
                  <Phone size={18} className="text-gray-500" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="bg-transparent text-gray-700 placeholder-gray-500 outline-none text-sm w-full h-full"
                    required={!isLogin}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Input */}
          <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full px-6 gap-2 focus-within:border-red-500 transition-colors">
            <Mail size={18} className="text-gray-500" />
            <input
              type="email"
              name="email"
              placeholder="Email id"
              value={formData.email}
              onChange={handleChange}
              className="bg-transparent text-gray-700 placeholder-gray-500 outline-none text-sm w-full h-full"
              required
            />
          </div>

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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full h-11 mt-6 rounded-full text-white bg-red-500 hover:opacity-90 transition-opacity font-medium shadow-lg shadow-red-500/30"
          >
            {isLogin ? "Login" : "Sign Up"}
          </motion.button>
        </form>

        <p className="text-gray-500 text-sm mt-6">
          {isLogin ? "Don’t have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-red-500 font-medium hover:underline focus:outline-none"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;