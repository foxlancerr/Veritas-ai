// context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import apiHelpers from "../../api/apiHelper";

const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
 
  const getMe = async () => {
    try {
      const response = await apiHelpers.get(`/user/get-current-user`, {
        withCredentials: true,
      });
      setUser(response.user || null);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function – to be called from your Login page
  const login = async (email, password) => {
    try {
      const response = await apiHelpers.post("/auth/login", {
        email,
        password,
      });

      const { user, token } = response; // assuming your backend returns { user, token }

      // Store token in localStorage
      if (token) localStorage.setItem("token", token);

      // Update state
      setUser(user);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.replace("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getMe();
    } else {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ user, setUser, loading, login, logout }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);

