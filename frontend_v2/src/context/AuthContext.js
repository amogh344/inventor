// src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';
import { jwtDecode } from 'jwt-decode'; // Decode JWT tokens

// ------------------------------
// Context Creation
// ------------------------------
const AuthContext = createContext(null);

// ------------------------------
// Provider Component
// ------------------------------
export const AuthProvider = ({ children }) => {
  // --------------------------
  // State Initialization
  // --------------------------
  const [tokens, setTokens] = useState(() => 
    localStorage.getItem('authTokens') 
      ? JSON.parse(localStorage.getItem('authTokens')) 
      : null
  );
  
  const [user, setUser] = useState(() => 
    localStorage.getItem('authTokens') 
      ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')).access) 
      : null
  );

  // --------------------------
  // Login / Logout Handlers
  // --------------------------
  const loginUser = (newTokens) => {
    setTokens(newTokens);
    setUser(jwtDecode(newTokens.access));
    localStorage.setItem('authTokens', JSON.stringify(newTokens));
  };

  const logoutUser = () => {
    setTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
  };
  
  // --------------------------
  // Context Data
  // --------------------------
  const contextData = {
    user,
    tokens,
    loginUser,
    logoutUser,
  };
  
  // --------------------------
  // Provider Return
  // --------------------------
  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};

// ------------------------------
// Custom Hook to use AuthContext
// ------------------------------
export const useAuth = () => {
  return useContext(AuthContext);
};