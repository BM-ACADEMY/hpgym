import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance.jsx"; // Ensure this path is correct
import { showToast } from "../utils/customToast.jsx"; // Ensure this path is correct

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const res = await axiosInstance.get("/auth/me"); // Ensure you have this route on backend or rely on local storage logic
      // If /auth/me isn't implemented, we usually rely on the login response. 
      // For this example, I'll assume the login/register response sets the user state.
    } catch (err) {
      console.log(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check for token in localStorage on mount (Alternative to /auth/me if that API doesn't exist)
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (name, email, password, phoneNumber) => {
    try {
      // Sending 'phoneNumber' to match your Mongoose Model
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

  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post("/auth/login", { email, password });
      
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

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};