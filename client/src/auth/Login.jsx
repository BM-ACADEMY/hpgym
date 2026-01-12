import React, { useState, useEffect } from "react";
import { Mail, Lock, User, ArrowLeft, Phone, KeyRound, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/Authcontext";

const Login = () => {
  const [viewState, setViewState] = useState("login");
  const navigate = useNavigate();
  const { login, register, forgotPassword, resetPassword } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    identifier: "",
    email: "",
    password: "",
    phoneNumber: "", 
  });

  const [resetData, setResetData] = useState({
      email: "",
      otp: "",
      newPassword: ""
  });

  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Updated Handle Change to ensure only numbers are typed for phone
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If typing in phoneNumber, restrict to numbers only
    if (name === "phoneNumber") {
      // Only allow numeric input
      if (value === "" || /^[0-9\b]+$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleResetChange = (e) => {
      setResetData({ ...resetData, [e.target.name]: e.target.value });
  };

  // --- SUBMIT HANDLERS ---

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    
    // --- NEW VALIDATION CHECK ---
    if (viewState === "register") {
        if (formData.phoneNumber.length !== 10) {
            alert("Please enter a valid 10-digit phone number.");
            return; // Stop the function here
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
            await register(formData.name, formData.email, formData.password, formData.phoneNumber);
            navigate("/user/dashboard");
        }
    } catch (error) {
        console.error("Auth Error", error);
        // Optional: Add an alert here for API errors
        alert("Authentication failed. Please check your details.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
          await forgotPassword(resetData.email);
          setViewState("otp");
          setTimer(60);
      } catch (error) {
          console.error(error);
      } finally {
        setIsLoading(false);
      }
  };

  const handleResetSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
          await resetPassword(resetData.email, resetData.otp, resetData.newPassword);
          setViewState("login");
      } catch (error) {
          console.error(error);
      } finally {
        setIsLoading(false);
      }
  };

  const handleResendOtp = async () => {
      if (timer === 0) {
        setIsLoading(true);
        try {
            await forgotPassword(resetData.email);
            setTimer(60);
        } catch (error) { 
            console.error(error); 
        } finally {
            setIsLoading(false);
        }
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

  const renderFormContent = () => {
    if (viewState === "forgot") {
        return (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full px-6 gap-2 mb-4 focus-within:border-red-500 transition-colors">
                    <Mail size={18} className="text-gray-500" />
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your registered Email"
                        value={resetData.email}
                        onChange={handleResetChange}
                        className="bg-transparent text-gray-700 placeholder-gray-500 outline-none text-sm w-full h-full"
                        required
                    />
                </div>
                <button 
                    onClick={handleForgotSubmit} 
                    disabled={isLoading}
                    className="w-full h-11 rounded-full text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    <ButtonContent text="Send OTP" loading={isLoading} />
                </button>
                <button 
                    onClick={() => setViewState("login")} 
                    disabled={isLoading}
                    className="mt-4 text-sm text-gray-500 hover:text-red-500 disabled:text-gray-300"
                >
                    Back to Login
                </button>
            </motion.div>
        );
    }

    if (viewState === "otp") {
        return (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-4">
                 <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full px-6 gap-2 focus-within:border-red-500 transition-colors">
                    <KeyRound size={18} className="text-gray-500" />
                    <input
                        type="text"
                        name="otp"
                        placeholder="Enter 6-digit OTP"
                        value={resetData.otp}
                        onChange={handleResetChange}
                        className="bg-transparent text-gray-700 placeholder-gray-500 outline-none text-sm w-full h-full"
                        required
                    />
                </div>
                <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full px-6 gap-2 focus-within:border-red-500 transition-colors">
                    <Lock size={18} className="text-gray-500" />
                    <input
                        type="password"
                        name="newPassword"
                        placeholder="New Password"
                        value={resetData.newPassword}
                        onChange={handleResetChange}
                        className="bg-transparent text-gray-700 placeholder-gray-500 outline-none text-sm w-full h-full"
                        required
                    />
                </div>
                
                <button 
                    onClick={handleResetSubmit} 
                    disabled={isLoading}
                    className="w-full h-11 rounded-full text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                     <ButtonContent text="Reset Password" loading={isLoading} />
                </button>

                <div className="text-center">
                    <button 
                        type="button"
                        onClick={handleResendOtp} 
                        disabled={timer > 0 || isLoading}
                        className={`text-sm ${timer > 0 || isLoading ? "text-gray-400 cursor-not-allowed" : "text-red-500 hover:underline"}`}
                    >
                        {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                    </button>
                </div>
                
                <button 
                    onClick={() => setViewState("login")} 
                    disabled={isLoading}
                    className="block w-full text-sm text-gray-500 hover:text-red-500 mt-2 disabled:text-gray-300"
                >
                    Back to Login
                </button>
            </motion.div>
        );
    }

    return (
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
                 {/* Phone - UPDATED WITH MAXLENGTH AND PATTERN */}
                 <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full px-6 gap-2 focus-within:border-red-500 transition-colors">
                  <Phone size={18} className="text-gray-500" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    maxLength={10} // Forces max 10 chars
                    pattern="[0-9]{10}" // Hint for browsers
                    className="bg-transparent text-gray-700 placeholder-gray-500 outline-none text-sm w-full h-full"
                    required={viewState === "register"}
                  />
                </div>
                {/* Register Email */}
                <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full px-6 gap-2 focus-within:border-red-500 transition-colors">
                    <Mail size={18} className="text-gray-500" />
                    <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-transparent text-gray-700 placeholder-gray-500 outline-none text-sm w-full h-full"
                    required={viewState === "register"}
                    />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Input (Email OR Phone) */}
          {viewState === "login" && (
             <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full px-6 gap-2 focus-within:border-red-500 transition-colors">
             <User size={18} className="text-gray-500" />
             <input
               type="text"
               name="identifier"
               placeholder="Email or Phone Number"
               value={formData.identifier}
               onChange={handleChange}
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
          
          {/* Forgot Password Link */}
          {viewState === "login" && (
              <div className="w-full text-right">
                  <button 
                    type="button" 
                    onClick={() => setViewState("forgot")}
                    disabled={isLoading}
                    className="text-xs text-gray-500 hover:text-red-500 disabled:text-gray-300"
                  >
                      Forgot Password?
                  </button>
              </div>
          )}

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
    );
  };

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
          {viewState === "login" ? "Welcome Back" : 
           viewState === "register" ? "Join the Club" : 
           viewState === "forgot" ? "Reset Password" : "Verify OTP"}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {viewState === "login" ? "Please sign in to continue" : 
           viewState === "register" ? "Sign up to get started" :
           viewState === "forgot" ? "Enter your email to receive OTP" : "Enter OTP sent to your email"}
        </p>

        {renderFormContent()}

        {(viewState === "login" || viewState === "register") && (
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
        )}
      </motion.div>
    </div>
  );
};

export default Login;