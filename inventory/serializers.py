"""
Serializers for the inventory app.

Defines how complex data, such as model instances, are converted to
native Python datatypes for JSON rendering in the API.
"""

from rest_framework import serializers
from django.db import transaction
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import AuditLog
from .models import (
    User, Supplier, Product, PurchaseOrder, PurchaseOrderItem, 
    SalesOrder, SalesOrderItem, InventoryTransaction
)

# ============================================================================
#  AUTHENTICATION AND USER MANAGEMENT SERIALIZERS
# ============================================================================
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Customizes the JWT token to include user's role and username."""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        return token


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for new user registration."""
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def save(self):
        user = User(
            username=self.validated_data['username'],
            email=self.validated_data['email'],
            first_name=self.validated_data['first_name'],
            last_name=self.validated_data['last_name'],
            role=self.validated_data.get('role', User.Role.STAFF)
        )
        password = self.validated_data['password']
        password2 = self.validated_data['password2']
        if password != password2:
            raise serializers.ValidationError({'password': 'Passwords must match.'})
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for reading user data."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'first_name', 'last_name']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for updating a user's own profile."""
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']
        read_only_fields = ['username']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for handling a password change."""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError({"new_password": "New passwords must match."})
        return data

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Your old password was entered incorrectly.")
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


# ============================================================================
#  CORE MODEL SERIALIZERS (READ/WRITE)
# ============================================================================
class SupplierSerializer(serializers.ModelSerializer):
    """Serializer for reading and writing Supplier data."""
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'contact_info', 'email', 'phone']


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for reading and writing Product data."""
    class Meta:
        model = Product
        fields = ['id', 'name', 'sku', 'category', 'unit_price', 'stock_quantity', 'min_stock_level','is_active']


# ============================================================================
#  PURCHASE ORDER SERIALIZERS
# ============================================================================
class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    """Read-only serializer for items within a Purchase Order."""
    product = ProductSerializer(read_only=True)
    class Meta:
        model = PurchaseOrderItem
        fields = ['id', 'product', 'quantity', 'unit_price']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    """Read-only serializer for a complete Purchase Order."""
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    supplier = SupplierSerializer(read_only=True)
    class Meta:
        model = PurchaseOrder
        fields = ['id', 'supplier', 'order_date', 'status', 'items']


class PurchaseOrderItemWriteSerializer(serializers.ModelSerializer):
    """Write-only serializer for creating items within a Purchase Order."""
    class Meta:
        model = PurchaseOrderItem
        fields = ['product', 'quantity', 'unit_price']


class PurchaseOrderWriteSerializer(serializers.ModelSerializer):
    """Write-only serializer for creating a complete Purchase Order."""
    items = PurchaseOrderItemWriteSerializer(many=True)
    class Meta:
        model = PurchaseOrder
        fields = ['supplier', 'status', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        with transaction.atomic():
            purchase_order = PurchaseOrder.objects.create(**validated_data)
            for item_data in items_data:
                PurchaseOrderItem.objects.create(purchase_order=purchase_order, **item_data)
        return purchase_order


# ============================================================================
#  SALES ORDER SERIALIZERS
# ============================================================================
class SalesOrderItemSerializer(serializers.ModelSerializer):
    """Read-only serializer for items within a Sales Order."""
    product = ProductSerializer(read_only=True)
    class Meta:
        model = SalesOrderItem
        fields = ['id', 'product', 'quantity', 'unit_price']


class SalesOrderSerializer(serializers.ModelSerializer):
    """Read-only serializer for a complete Sales Order."""
    items = SalesOrderItemSerializer(many=True, read_only=True)
    class Meta:
        model = SalesOrder
        fields = ['id', 'customer_name', 'order_date', 'status', 'items']


class SalesOrderItemWriteSerializer(serializers.ModelSerializer):
    """Write-only serializer for creating items within a Sales Order."""
    class Meta:
        model = SalesOrderItem
        fields = ['product', 'quantity', 'unit_price']


class SalesOrderWriteSerializer(serializers.ModelSerializer):
    """
    Write-only serializer for creating a Sales Order.
    Includes logic to deduct stock and log the transaction.
    """
    items = SalesOrderItemWriteSerializer(many=True)
    class Meta:
        model = SalesOrder
        fields = ['customer_name', 'status', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user
        with transaction.atomic():
            sales_order = SalesOrder.objects.create(**validated_data)
            for item_data in items_data:
                product = item_data['product']
                quantity = item_data['quantity']
                if product.stock_quantity < quantity:
                    raise serializers.ValidationError(f"Not enough stock for {product.name}.")
                SalesOrderItem.objects.create(sales_order=sales_order, **item_data)
                product.stock_quantity -= quantity
                product.save()
                InventoryTransaction.objects.create(
                    product=product,
                    transaction_type=InventoryTransaction.TransactionType.SALE,
                    quantity_change=-quantity,
                    user=user
                )
        return sales_order


# ============================================================================
#  LOGGING SERIALIZERS
# ============================================================================
class InventoryTransactionSerializer(serializers.ModelSerializer):
    """Serializer for reading transaction logs."""
    product = ProductSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    class Meta:
        model = InventoryTransaction
        fields = ['id', 'product', 'transaction_type', 'quantity_change', 'timestamp', 'user', 'reason']


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for audit logs of user actions."""
    user = UserSerializer(read_only=True)
    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'action', 'timestamp', 'object_repr']