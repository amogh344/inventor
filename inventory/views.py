from .serializers import AuditLogSerializer
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
from django.dispatch import receiver
from django_rest_passwordreset.signals import reset_password_token_created
from .utils import log_activity
from .models import AuditLog

from .models import User, Supplier, Product, PurchaseOrder, SalesOrder, InventoryTransaction
from .permissions import IsAdminOrManager, IsStaffReadOnly
from .serializers import (
    UserSerializer, SupplierSerializer, ProductSerializer, RegisterSerializer,
    PurchaseOrderSerializer, PurchaseOrderWriteSerializer,
    SalesOrderSerializer, SalesOrderWriteSerializer, InventoryTransactionSerializer,
    MyTokenObtainPairSerializer, UserProfileSerializer, ChangePasswordSerializer
)

# ============================================================================
#  AUTHENTICATION & PROFILE MANAGEMENT VIEWS
# ============================================================================
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self):
        return self.request.user

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ============================================================================
#  SPECIALIZED API VIEWS
# ============================================================================
class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        total_products = Product.objects.count()
        low_stock_items = Product.objects.filter(stock_quantity__lte=models.F('min_stock_level'))
        recent_transactions = InventoryTransaction.objects.order_by('-timestamp')[:5]
        data = {
            'total_products': total_products,
            'low_stock_items': ProductSerializer(low_stock_items, many=True).data,
            'recent_transactions': InventoryTransactionSerializer(recent_transactions, many=True).data,
        }
        return Response(data)

# ============================================================================
#  CORE MODEL VIEWSETS
# ============================================================================
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsStaffReadOnly]
    ordering_fields = ['id', 'name']
    ordering = ['name']
    search_fields = ['name', 'email', 'phone']
    def perform_create(self, serializer):
        instance = serializer.save()
        log_activity(self.request.user, AuditLog.Action.CREATED, instance)
    def perform_update(self, serializer):
        instance = serializer.save()
        log_activity(self.request.user, AuditLog.Action.UPDATED, instance)
    def perform_destroy(self, instance):
        log_activity(self.request.user, AuditLog.Action.DELETED, instance)
        instance.delete()

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [IsStaffReadOnly]
    ordering_fields = ['id', 'name', 'stock_quantity']
    ordering = ['-id']
    def get_queryset(self):
        print("--- Custom get_queryset in ProductViewSet is RUNNING! ---")
        qs = super().get_queryset()
        print(f"The filter is finding {qs.count()} active products.")
        return qs

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().prefetch_related('items__product', 'supplier')
    permission_classes = [IsStaffReadOnly]
    def get_serializer_class(self):
        if self.action in ['create', 'update']:
            return PurchaseOrderWriteSerializer
        return PurchaseOrderSerializer
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def receive(self, request, pk=None):
        purchase_order = self.get_object()
        if purchase_order.status == PurchaseOrder.Status.RECEIVED:
            return Response({'error': 'This order has already been received.'}, status=status.HTTP_400_BAD_REQUEST)
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
    queryset = SalesOrder.objects.all().prefetch_related('items__product')
    permission_classes = [IsAuthenticated]
    def get_serializer_class(self):
        if self.action in ['create', 'update']:
            return SalesOrderWriteSerializer
        return SalesOrderSerializer
    def get_serializer_context(self):
        return {'request': self.request}

class InventoryTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InventoryTransaction.objects.all()
    serializer_class = InventoryTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {'timestamp': ['gte', 'lte'], 'transaction_type': ['exact']}

# ============================================================================
#  SIGNAL HANDLERS
# ============================================================================
@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    print("\n\n==============================================")
    print("--- PASSWORD RESET SIGNAL RECEIVED ---")
    print(f"Token: {reset_password_token.key}")
    print(f"User: {reset_password_token.user.email}")
    print("==============================================\n\n")

# ============================================================================
#  AUDIT LOG VIEWSET
# ============================================================================
class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminOrManager]