import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ------------------------------
// ProtectedRoute Component
// Restricts access to authenticated users only
// ------------------------------
function ProtectedRoute({ children }) {
  // --------------------------
  // Access user from AuthContext
  // --------------------------
  const { user } = useAuth();

  // --------------------------
  // Redirect unauthenticated users to login
  // --------------------------
  if (!user) {
    return <Navigate to="/login" />;
  }

  // --------------------------
  // Render child components if authenticated
  // --------------------------
  return children;
}

// ------------------------------
// Export Component
// ------------------------------
export default ProtectedRoute;