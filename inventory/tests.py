from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Product, Supplier, PurchaseOrder, PurchaseOrderItem, SalesOrder, SalesOrderItem, InventoryTransaction

# ============================================================================
#  COMPREHENSIVE API TEST CASES
# ============================================================================
class ComprehensiveAPITests(TestCase):

    # ============================================================================
    #  SETUP
    # ============================================================================
    def setUp(self):
        """Set up the necessary objects for all tests."""
        # Create users with different roles
        self.admin_user = User.objects.create_superuser(
            username='testadmin', password='password123', role='Admin', email='admin@test.com'
        )
        self.manager_user = User.objects.create_user(
            username='testmanager', password='password123', role='Manager', email='manager@test.com'
        )
        self.staff_user = User.objects.create_user(
            username='teststaff', password='password123', role='Staff', email='staff@test.com'
        )

        # Create API clients
        self.client = APIClient()  # Unauthenticated client
        self.manager_client = APIClient()
        self.staff_client = APIClient()

        # Authenticate clients
        self.manager_client.force_authenticate(user=self.manager_user)
        self.staff_client.force_authenticate(user=self.staff_user)
        
        # Create initial data
        self.supplier = Supplier.objects.create(name="Test Supplier", email="supplier@test.com", phone="12345")
        self.product = Product.objects.create(name="Test Keyboard", sku="KEY-001", stock_quantity=100, unit_price=50.00)

    # ============================================================================
    #  AUTHENTICATION AND ROLES TESTS
    # ============================================================================
    def test_unauthenticated_access_denied(self):
        """Ensure unauthenticated users get 401 Unauthorized for protected endpoints."""
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_registration(self):
        """Test the user registration endpoint."""
        data = {
            "username": "newuser",
            "password": "newpassword123",
            "password2": "newpassword123",
            "email": "new@test.com",
            "role": "Staff",
            "first_name": "New",
            "last_name": "User"
        }
        response = self.client.post('/api/register/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 4)

    # ============================================================================
    #  PRODUCT AND SUPPLIER RBAC TESTS
    # ============================================================================
    def test_staff_can_list_products(self):
        """Staff should have read-only access to products."""
        response = self.staff_client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_staff_cannot_create_product(self):
        """Staff should be forbidden from creating products."""
        data = {"name": "Staff Mouse", "sku": "MOUSE-STAFF", "stock_quantity": 10, "unit_price": 10.00}
        response = self.staff_client.post('/api/products/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_manager_can_create_product(self):
        """Managers should be able to create products."""
        data = {"name": "Manager Mouse", "sku": "MOUSE-MANAGER", "stock_quantity": 20, "unit_price": 20.00}
        response = self.manager_client.post('/api/products/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Product.objects.filter(sku="MOUSE-MANAGER").exists())

    # ============================================================================
    #  PURCHASE ORDER WORKFLOW TEST
    # ============================================================================
    def test_receive_purchase_order_updates_stock(self):
        """Test that receiving a PO increases stock and creates a transaction log."""
        initial_stock = self.product.stock_quantity
        order_quantity = 50
        
        po = PurchaseOrder.objects.create(supplier=self.supplier, status='Pending')
        PurchaseOrderItem.objects.create(purchase_order=po, product=self.product, quantity=order_quantity, unit_price=40.00)
        
        response = self.manager_client.post(f'/api/purchase-orders/{po.id}/receive/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh product from DB
        self.product.refresh_from_db()
        
        # Check stock quantity
        self.assertEqual(self.product.stock_quantity, initial_stock + order_quantity)
        
        # Check transaction log
        self.assertTrue(InventoryTransaction.objects.filter(product=self.product, transaction_type='Purchase', quantity_change=order_quantity).exists())
        
        # Check PO status
        po.refresh_from_db()
        self.assertEqual(po.status, 'Received')

    # ============================================================================
    #  SALES ORDER WORKFLOW TESTS
    # ============================================================================
    def test_sales_order_deducts_stock(self):
        """Test that creating a sales order decreases stock and creates a transaction log."""
        initial_stock = self.product.stock_quantity
        sale_quantity = 10
        
        so_data = {
            "customer_name": "Test Customer",
            "items": [{"product": self.product.id, "quantity": sale_quantity, "unit_price": self.product.unit_price}]
        }
        
        response = self.staff_client.post('/api/sales-orders/', so_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, initial_stock - sale_quantity)
        self.assertTrue(InventoryTransaction.objects.filter(product=self.product, transaction_type='Sale', quantity_change=-sale_quantity).exists())

    def test_cannot_sell_out_of_stock_product(self):
        """Test that an order for more items than in stock fails."""
        sale_quantity = self.product.stock_quantity + 1
        
        so_data = {
            "customer_name": "Greedy Customer",
            "items": [{"product": self.product.id, "quantity": sale_quantity, "unit_price": self.product.unit_price}]
        }
        
        response = self.staff_client.post('/api/sales-orders/', so_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ============================================================================
    #  REPORTING TEST
    # ============================================================================
    def test_transaction_report_filtering(self):
        """Test that the transaction report can be filtered by type."""
        # Create a sale transaction
        SalesOrder.objects.create(customer_name="Filter Test Customer")
        # (This assumes the create logic inside the serializer works, which is tested above)
        
        # Filter for only 'Sale' transactions
        response = self.staff_client.get('/api/transactions/?transaction_type=Sale')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check that all returned transactions are of type 'Sale'
        for transaction in response.data:
            self.assertEqual(transaction['transaction_type'], 'Sale')