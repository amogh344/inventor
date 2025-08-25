from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, Product, Supplier, PurchaseOrder, 
    PurchaseOrderItem, SalesOrder, SalesOrderItem, InventoryTransaction
)

# --- Full CRUD for User Management ---
# This remains fully editable for the superuser/admin.
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Role Information', {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Role Information', {'fields': ('role',)}),
    )
admin.site.register(User, CustomUserAdmin)


# --- Read-Only Admin for ALL Inventory Models ---
class ReadOnlyModelAdmin(admin.ModelAdmin):
    """
    Disables all add, change, and delete permissions for any model
    this is applied to, making it strictly read-only for all users.
    """
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


# --- Inline Models for Read-Only Display ---
class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 0
    can_delete = False
    readonly_fields = [f.name for f in PurchaseOrderItem._meta.fields]
    def has_add_permission(self, request, obj=None): return False
    def has_change_permission(self, request, obj=None): return False

class SalesOrderItemInline(admin.TabularInline):
    model = SalesOrderItem
    extra = 0
    can_delete = False
    readonly_fields = [f.name for f in SalesOrderItem._meta.fields]
    def has_add_permission(self, request, obj=None): return False
    def has_change_permission(self, request, obj=None): return False


# --- Registering Inventory Models with Read-Only Permissions ---
@admin.register(Product)
class ProductAdmin(ReadOnlyModelAdmin):
    list_display = ('name', 'sku', 'category', 'stock_quantity', 'unit_price')
    search_fields = ('name', 'sku')

@admin.register(Supplier)
class SupplierAdmin(ReadOnlyModelAdmin):
    list_display = ('name', 'email', 'phone')
    search_fields = ('name',)

@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(ReadOnlyModelAdmin):
    list_display = ('id', 'supplier', 'status', 'order_date')
    inlines = [PurchaseOrderItemInline]

@admin.register(SalesOrder)
class SalesOrderAdmin(ReadOnlyModelAdmin):
    list_display = ('id', 'customer_name', 'status', 'order_date')
    inlines = [SalesOrderItemInline]

@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(ReadOnlyModelAdmin):
    list_display = ('timestamp', 'product', 'transaction_type', 'quantity_change', 'user')