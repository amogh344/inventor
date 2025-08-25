
"""
URL configuration for the inventory app.

This file defines the API endpoints that are specific to the 'inventory'
application. It uses a DRF DefaultRouter to automatically generate the standard
CRUD routes for each ViewSet.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

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
    UserProfileView, 
    ChangePasswordView,
    ProductQRCodeView
)



router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchaseorder')
router.register(r'sales-orders', SalesOrderViewSet, basename='salesorder')
router.register(r'transactions', InventoryTransactionViewSet, basename='inventorytransaction')


urlpatterns = [
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('products/<str:sku>/qrcode/', ProductQRCodeView.as_view(), name='product-qrcode'),
    path('users/me/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('users/me/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('', include(router.urls)),
]