// src/components/RoleRequired.js
import { useAuth } from '../context/AuthContext';

function RoleRequired({ allowedRoles, children }) {
  const { user } = useAuth();

  if (user && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  return null;
}

export default RoleRequired;