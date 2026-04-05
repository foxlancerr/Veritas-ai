import { createContext, useContext, useMemo } from "react";

// Create context
const AuthContext = createContext();

// Custom hook

export const useAuthContext = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const value = useMemo(
    () => ({
      serverURL: "http://localhost:8127",
    }),
    []
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
