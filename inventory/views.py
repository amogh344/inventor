# import io

# import barcode
# from barcode.writer import ImageWriter
# from django.db import models, transaction
# from django.http import Http404, HttpResponse
# from django_filters.rest_framework import DjangoFilterBackend
# from rest_framework import generics, viewsets
# from rest_framework.decorators import action
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from rest_framework_simplejwt.views import TokenObtainPairView

# from .models import (InventoryTransaction, Product, PurchaseOrder, SalesOrder,
#                    Supplier, User)
# from .permissions import IsAdminOrManager, IsStaffReadOnly
# from .serializers import (InventoryTransactionSerializer,
#                           MyTokenObtainPairSerializer, ProductSerializer,
#                           PurchaseOrderSerializer, PurchaseOrderWriteSerializer,
#                           RegisterSerializer, SalesOrderSerializer,
#                           SalesOrderWriteSerializer, SupplierSerializer,
#                           UserSerializer)


# class MyTokenObtainPairView(TokenObtainPairView):
#     """Custom token obtain pair view to include user data in the response."""
#     serializer_class = MyTokenObtainPairSerializer


# class RegisterView(generics.CreateAPIView):
#     """API view for user registration."""
#     queryset = User.objects.all()
#     permission_classes = (AllowAny,)
#     serializer_class = RegisterSerializer


# class DashboardStatsView(APIView):
#     """API view to provide statistics for the main dashboard."""
#     permission_classes = [IsAuthenticated]

#     def get(self, request, *args, **kwargs):
#         """Returns key inventory metrics."""
#         total_products = Product.objects.count()
#         low_stock_items = Product.objects.filter(
#             stock_quantity__lte=models.F('min_stock_level')
#         )
#         recent_transactions = InventoryTransaction.objects.order_by('-timestamp')[:5]

#         data = {
#             'total_products': total_products,
#             'low_stock_items': ProductSerializer(low_stock_items, many=True).data,
#             'recent_transactions': InventoryTransactionSerializer(
#                 recent_transactions, many=True
#             ).data,
#         }
#         return Response(data)


# class ProductBarcodeView(APIView):
#     """API view to generate and return a barcode for a product."""
#     permission_classes = [IsAuthenticated]

#     def get(self, request, sku, *args, **kwargs):
#         """Generates a Code 128 barcode image from a product SKU."""
#         if not Product.objects.filter(sku=sku).exists():
#             raise Http404

#         try:
#             code128 = barcode.get_barcode_class('code128')
#             barcode_instance = code128(sku, writer=ImageWriter())

#             buffer = io.BytesIO()
#             barcode_instance.write(
#                 buffer,
#                 options={
#                     "module_height": 10.0,
#                     "font_size": 14,
#                     "text_distance": 3.0
#                 }
#             )
#             buffer.seek(0)
#             return HttpResponse(buffer, content_type='image/svg+xml')
#         except Exception as e:
#             return Response(
#                 {'error': 'Could not generate barcode', 'details': str(e)},
#                 status=400
#             )


# class UserViewSet(viewsets.ReadOnlyModelViewSet):
#     """Read-only API endpoint for users."""
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [IsAuthenticated]


# class SupplierViewSet(viewsets.ModelViewSet):
#     """API endpoint that allows suppliers to be viewed or edited."""
#     queryset = Supplier.objects.all()
#     serializer_class = SupplierSerializer
#     permission_classes = [IsStaffReadOnly]


# class ProductViewSet(viewsets.ModelViewSet):
#     """API endpoint that allows products to be viewed or edited."""
#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer
#     permission_classes = [IsStaffReadOnly]


# class PurchaseOrderViewSet(viewsets.ModelViewSet):
#     """
#     API endpoint for purchase orders.
#     Uses different serializers for read and write actions.
#     """
#     queryset = PurchaseOrder.objects.all().prefetch_related('items__product', 'supplier')
#     permission_classes = [IsAdminOrManager]

#     def get_serializer_class(self):
#         """Return appropriate serializer class based on the action."""
#         if self.action in ['create', 'update']:
#             return PurchaseOrderWriteSerializer
#         return PurchaseOrderSerializer

#     @action(detail=True, methods=['post'])
#     @transaction.atomic
#     def receive(self, request, pk=None):
#         """Mark a purchase order as 'Received' and update stock levels."""
#         purchase_order = self.get_object()
#         if purchase_order.status == 'Received':
#             return Response(
#                 {'error': 'This order has already been received.'},
#                 status=400
#             )

#         for item in purchase_order.items.all():
#             product = item.product
#             product.stock_quantity += item.quantity
#             product.save()

#             InventoryTransaction.objects.create(
#                 product=product,
#                 transaction_type='Purchase',
#                 quantity_change=item.quantity,
#                 user=request.user,
#                 reason=f'Received from PO-{purchase_order.id}'
#             )

#         purchase_order.status = 'Received'
#         purchase_order.save()
#         return Response(self.get_serializer(purchase_order).data)


# class SalesOrderViewSet(viewsets.ModelViewSet):
#     """
#     API endpoint for sales orders.
#     Uses different serializers for read and write actions.
#     """
#     queryset = SalesOrder.objects.all().prefetch_related('items__product')
#     permission_classes = [IsAuthenticated]

#     def get_serializer_class(self):
#         """Return appropriate serializer class based on the action."""
#         if self.action in ['create', 'update']:
#             return SalesOrderWriteSerializer
#         return SalesOrderSerializer


# class InventoryTransactionViewSet(viewsets.ReadOnlyModelViewSet):
#     """
#     Read-only API endpoint for inventory transactions.
#     Supports filtering by date range and transaction type.
#     """
#     queryset = InventoryTransaction.objects.all().order_by('-timestamp')
#     serializer_class = InventoryTransactionSerializer
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend]
#     filterset_fields = {
#         'timestamp': ['gte', 'lte'],
#         'transaction_type': ['exact']
#     }


"""
Views for the inventory app.

This file contains all the API endpoints for the application, including
user management, core model CRUD operations, and special actions like
receiving orders and generating reports.
"""

# Standard Library Imports


from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction, models
from django.http import HttpResponse, Http404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
import barcode
from barcode.writer import ImageWriter
import io
from django.dispatch import receiver
from django_rest_passwordreset.signals import reset_password_token_created


from .models import User, Supplier, Product, PurchaseOrder, SalesOrder, InventoryTransaction
from .permissions import IsAdminOrManager, IsStaffReadOnly
from .serializers import (
    UserSerializer, SupplierSerializer, ProductSerializer, RegisterSerializer,
    PurchaseOrderSerializer, PurchaseOrderWriteSerializer,
    SalesOrderSerializer, SalesOrderWriteSerializer, InventoryTransactionSerializer,
    MyTokenObtainPairSerializer, UserProfileSerializer, ChangePasswordSerializer
)

# === Authentication & Profile Management Views ===

class MyTokenObtainPairView(TokenObtainPairView):
    """Custom token view to include user role in the JWT response."""
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """Public endpoint for new user registration."""
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Endpoint for the authenticated user to view and update their own profile."""
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Returns the currently authenticated user."""
        return self.request.user


class ChangePasswordView(APIView):
    """
    An endpoint for an authenticated user to change their own password.
    """
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# === Specialized API Views ===

class DashboardStatsView(APIView):
    """Endpoint to provide aggregated statistics for the main dashboard."""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """Returns key inventory metrics in a single response."""
        total_products = Product.objects.count()
        low_stock_items = Product.objects.filter(
            stock_quantity__lte=models.F('min_stock_level')
        )
        recent_transactions = InventoryTransaction.objects.order_by('-timestamp')[:5]

        data = {
            'total_products': total_products,
            'low_stock_items': ProductSerializer(low_stock_items, many=True).data,
            'recent_transactions': InventoryTransactionSerializer(
                recent_transactions, many=True
            ).data,
        }
        return Response(data)


class ProductQRCodeView(APIView):
    """API view to generate and return a QR code for a product."""
    permission_classes = [IsAuthenticated]

    def get(self, request, sku, *args, **kwargs):
        """Generates a QR code image from a product SKU."""
        if not Product.objects.filter(sku=sku).exists():
            raise Http404

        try:
            # Create a QR code instance
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            # The data encoded in the QR code is the product's SKU
            qr.add_data(sku)
            qr.make(fit=True)

            # Create an SVG image from the QR Code instance
            img = qr.make_image(image_factory=qrcode.image.svg.SvgPathImage)
            
            # Create an in-memory binary stream
            buffer = io.BytesIO()
            img.save(buffer)
            buffer.seek(0)
            
            # Return the SVG image as an HTTP response
            return HttpResponse(buffer, content_type='image/svg+xml')
        except Exception as e:
            return Response(
                {'error': 'Could not generate QR code', 'details': str(e)},
                status=400
            )

# === Core Model ViewSets ===

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only endpoint for viewing user data."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class SupplierViewSet(viewsets.ModelViewSet):
    """CRUD endpoint for suppliers with role-based permissions."""
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsStaffReadOnly]


class ProductViewSet(viewsets.ModelViewSet):
    """CRUD endpoint for products with role-based permissions."""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsStaffReadOnly]


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    """CRUD endpoint for purchase orders, restricted to managers/admins."""
    queryset = PurchaseOrder.objects.all().prefetch_related('items__product', 'supplier')
    permission_classes = [IsAdminOrManager]

    def get_serializer_class(self):
        """Return appropriate serializer class based on the action."""
        if self.action in ['create', 'update']:
            return PurchaseOrderWriteSerializer
        return PurchaseOrderSerializer

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def receive(self, request, pk=None):
        """Custom action to mark a PO as 'Received' and update stock levels."""
        purchase_order = self.get_object()
        if purchase_order.status == PurchaseOrder.Status.RECEIVED:
            return Response(
                {'error': 'This order has already been received.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        for item in purchase_order.items.all():
            product = item.product
            product.stock_quantity += item.quantity
            product.save()

            InventoryTransaction.objects.create(
                product=product,
                transaction_type=InventoryTransaction.TransactionType.PURCHASE,
                quantity_change=item.quantity,
                user=request.user,
                reason=f'Received from PO-{purchase_order.id}'
            )

        purchase_order.status = PurchaseOrder.Status.RECEIVED
        purchase_order.save()
        return Response(self.get_serializer(purchase_order).data)


class SalesOrderViewSet(viewsets.ModelViewSet):
    """CRUD endpoint for sales orders, accessible by all authenticated users."""
    queryset = SalesOrder.objects.all().prefetch_related('items__product')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        """Return appropriate serializer class based on the action."""
        if self.action in ['create', 'update']:
            return SalesOrderWriteSerializer
        return SalesOrderSerializer

    def get_serializer_context(self):
        """Pass request context to the serializer."""
        return {'request': self.request}


class InventoryTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only endpoint for transaction logs with filtering enabled."""
    queryset = InventoryTransaction.objects.all()
    serializer_class = InventoryTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'timestamp': ['gte', 'lte'],
        'transaction_type': ['exact']
    }
    

@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    """
    This function is a "listener" that runs when a password reset token is created.
    We are using it to print information to the console to confirm the process is working.
    """
    print("\n\n==============================================")
    print("--- PASSWORD RESET SIGNAL RECEIVED ---")
    print(f"Token: {reset_password_token.key}")
    print(f"User: {reset_password_token.user.email}")
    print("==============================================\n\n")
