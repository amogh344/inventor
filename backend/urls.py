
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

from inventory.views import RegisterView, MyTokenObtainPairView

urlpatterns = [
    # 1. Django Admin Panel
    path('admin/', admin.site.urls),

    # 2. User Authentication Endpoints
    path('api/register/', RegisterView.as_view(), name='auth_register'),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),


    # 3. Core Application API Endpoints
    # Includes all URLs from the 'inventory' app (Products, Orders, etc.)
    path('api/', include('inventory.urls')),
]