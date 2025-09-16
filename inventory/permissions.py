from rest_framework.permissions import BasePermission, SAFE_METHODS

# ============================================================================
#  CUSTOM PERMISSIONS
# ============================================================================

class IsAdminOrManager(BasePermission):
    """
    Allows access only to users with 'Admin' or 'Manager' roles.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.role in ['Admin', 'Manager'])


class IsStaffReadOnly(BasePermission):
    """
    Allows read-only access to any authenticated user (including 'Staff'),
    but write access only to 'Admin' or 'Manager' roles.
    """
    def has_permission(self, request, view):
        # Allow read-only methods (GET, HEAD, OPTIONS) for any authenticated user
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # For write methods (POST, PUT, DELETE), only allow Admins or Managers
        return request.user and request.user.is_authenticated and (request.user.role in ['Admin', 'Manager'])