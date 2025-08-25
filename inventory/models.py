from django.contrib.auth.models import AbstractUser
from django.db import models


# === USER AND SUPPLIER MODELS ===

class User(AbstractUser):
    """
    Custom user model extending Django's built-in user.
    Adds a 'role' to differentiate between user permission levels.
    """
    class Role(models.TextChoices):
        ADMIN = 'Admin', 'Admin'
        MANAGER = 'Manager', 'Manager'
        STAFF = 'Staff', 'Staff'

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STAFF)

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

class Supplier(models.Model):
    """Represents a supplier or vendor who provides products."""
    name = models.CharField(max_length=255, help_text="The name of the supplier company.")
    contact_info = models.TextField(blank=True, help_text="Physical address or other contact details.")
    email = models.EmailField(unique=True, help_text="Contact email for the supplier.")
    phone = models.CharField(max_length=255, help_text="Contact phone number for the supplier.")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Supplier'
        verbose_name_plural = 'Suppliers'


# === PRODUCT AND STOCK MODELS ===

class Product(models.Model):
    """Represents an item in the inventory."""
    name = models.CharField(max_length=255, help_text="The name of the product.")
    sku = models.CharField(max_length=100, unique=True, help_text="Unique Stock Keeping Unit (SKU) for the product.")
    category = models.CharField(max_length=100, blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="The selling price for one unit of the product.")
    stock_quantity = models.PositiveIntegerField(default=0, help_text="Current number of units in stock.")
    min_stock_level = models.PositiveIntegerField(default=10, help_text="The stock level at which a reorder alert is triggered.")

    def __str__(self):
        return f"{self.name} ({self.sku})"

    class Meta:
        verbose_name = 'Product'
        verbose_name_plural = 'Products'


# === ORDER MODELS ===

class PurchaseOrder(models.Model):
    """Represents an order placed with a supplier to replenish stock."""
    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        SHIPPED = 'Shipped', 'Shipped'
        RECEIVED = 'Received', 'Received'

    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name='purchase_orders')
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)

    def __str__(self):
        return f"PO-{self.id} from {self.supplier.name}"

    class Meta:
        verbose_name = 'Purchase Order'
        verbose_name_plural = 'Purchase Orders'

class PurchaseOrderItem(models.Model):
    """Represents a single line item within a Purchase Order."""
    purchase_order = models.ForeignKey(PurchaseOrder, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="The cost per unit from the supplier.")

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in PO-{self.purchase_order.id}"

class SalesOrder(models.Model):
    """Represents a sales order from a customer."""
    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        FULFILLED = 'Fulfilled', 'Fulfilled'
        CANCELLED = 'Cancelled', 'Cancelled'
    
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    customer_name = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"SO-{self.id} for {self.customer_name or 'N/A'}"
        
    class Meta:
        verbose_name = 'Sales Order'
        verbose_name_plural = 'Sales Orders'

class SalesOrderItem(models.Model):
    """Represents a single line item within a Sales Order."""
    sales_order = models.ForeignKey(SalesOrder, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="The selling price per unit at the time of sale.")
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name} in SO-{self.sales_order.id}"


# === LOGGING MODEL ===

class InventoryTransaction(models.Model):
    """Logs every movement of stock (in or out)."""
    class TransactionType(models.TextChoices):
        PURCHASE = 'Purchase', 'Purchase'
        SALE = 'Sale', 'Sale'
        ADJUSTMENT = 'Adjustment', 'Adjustment'

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TransactionType.choices)
    quantity_change = models.IntegerField(help_text="Positive for stock in, negative for stock out.")
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    reason = models.CharField(max_length=255, blank=True, help_text="Reason for a manual adjustment.")

    def __str__(self):
        return f"{self.transaction_type} of {self.product.name}: {self.quantity_change}"
        
    class Meta:
        verbose_name = 'Inventory Transaction'
        verbose_name_plural = 'Inventory Transactions'
        ordering = ['-timestamp']