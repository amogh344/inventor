import { useAuth } from '../context/AuthContext';

// ------------------------------
// RoleRequired Component
// Restricts access to child components based on user roles
// ------------------------------
function RoleRequired({ allowedRoles, children }) {
  // --------------------------
  // Access user from AuthContext
  // --------------------------
  const { user } = useAuth();

  // --------------------------
  // Render children if user's role is allowed
  // --------------------------
  if (user && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // --------------------------
  // Return null if access is denied
  // --------------------------
  return null;
}

// ------------------------------
// Export Component
// ------------------------------
export default RoleRequired;