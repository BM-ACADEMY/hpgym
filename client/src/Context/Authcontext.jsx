// Context/Authcontext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance.jsx"; // Ensure this path matches your project structure
import { showToast } from "../utils/customToast.jsx"; // Ensure this path matches your project structure

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for token in localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // --- REGISTER ---
  const register = async (name, email, password, phoneNumber) => {
    try {
      const res = await axiosInstance.post("/auth/register", { name, email, password, phoneNumber });
      
      const userData = res.data;
      setUser(userData);
      localStorage.setItem("userInfo", JSON.stringify(userData)); // Persist login
      
      showToast("success", "Registered successfully");
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      showToast("error", msg);
      throw err;
    }
  };

  // --- LOGIN (Email OR Phone) ---
  const login = async (identifier, password) => {
    try {
      // We send 'identifier' which matches the backend expectation for Email or Phone
      const res = await axiosInstance.post("/auth/login", { identifier, password });
      
      const userData = res.data;
      setUser(userData);
      localStorage.setItem("userInfo", JSON.stringify(userData)); // Persist login

      showToast("success", "Login successful");
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      showToast("error", msg);
      throw err;
    }
  };

  // --- LOGOUT ---
  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      localStorage.removeItem("userInfo");
      setUser(null);
      showToast("success", "Logged out successfully");
    } catch (err) {
      console.log(err);
      // Force logout on frontend even if backend fails
      localStorage.removeItem("userInfo");
      setUser(null); 
    }
  };

  // --- FORGOT PASSWORD (Send OTP) ---
  const forgotPassword = async (email) => {
      try {
          await axiosInstance.post("/auth/forgot-password", { email });
          showToast("success", "OTP sent to your email");
      } catch (err) {
          const msg = err.response?.data?.message || "Failed to send OTP";
          showToast("error", msg);
          throw err;
      }
  };

  // --- RESET PASSWORD (Verify OTP & Set New Password) ---
  const resetPassword = async (email, otp, newPassword) => {
      try {
          await axiosInstance.post("/auth/reset-password", { email, otp, newPassword });
          showToast("success", "Password reset successfully. Please Login.");
      } catch (err) {
          const msg = err.response?.data?.message || "Reset failed";
          showToast("error", msg);
          throw err;
      }
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        setUser, 
        loading, 
        login, 
        register, 
        logout,
        forgotPassword,
        resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};