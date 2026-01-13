import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance.jsx";
import { showToast } from "../utils/customToast.jsx";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // --- REGISTER (Name, Phone, Password) ---
  const register = async (name, password, phoneNumber) => {
    try {
      // Removed email from request body
      const res = await axiosInstance.post("/auth/register", { name, password, phoneNumber });
      
      const userData = res.data;
      setUser(userData);
      localStorage.setItem("userInfo", JSON.stringify(userData));
      
      showToast("success", "Registered successfully");
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      showToast("error", msg);
      throw err;
    }
  };

  // --- LOGIN (Phone Only) ---
  const login = async (identifier, password) => {
    try {
      const res = await axiosInstance.post("/auth/login", { identifier, password });
      
      const userData = res.data;
      setUser(userData);
      localStorage.setItem("userInfo", JSON.stringify(userData)); 

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
      localStorage.removeItem("userInfo");
      setUser(null); 
    }
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        setUser, 
        loading, 
        login, 
        register, 
        logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};