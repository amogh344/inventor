// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
// Note: We no longer need to import 'api' here

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
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
  
  // The useEffect that set the api header is no longer needed.
  
  const contextData = {
    user,
    tokens,
    loginUser,
    logoutUser,
  };
  
  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};