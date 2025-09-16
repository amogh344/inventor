from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuditLogViewSet

from .views import (
    DashboardStatsView,
    InventoryTransactionViewSet,
    ProductViewSet,
    PurchaseOrderViewSet,
    SalesOrderViewSet,
    SupplierViewSet,
    UserProfileView,
    ChangePasswordView,
    UserViewSet,
)

# ============================================================================
#  ROUTER CONFIGURATION
# ============================================================================
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchaseorder')
router.register(r'sales-orders', SalesOrderViewSet, basename='salesorder')
router.register(r'transactions', InventoryTransactionViewSet, basename='inventorytransaction')
router.register(r'audit-logs', AuditLogViewSet, basename='auditlog')

# ============================================================================
#  URL PATTERNS
# ============================================================================
urlpatterns = [
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('users/me/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('', include(router.urls)),
]