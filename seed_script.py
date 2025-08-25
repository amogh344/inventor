import os
import django
import random
from decimal import Decimal
from faker import Faker

# Set up the Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from inventory.models import (
    Supplier, Product, PurchaseOrder, PurchaseOrderItem, 
    SalesOrder, SalesOrderItem, InventoryTransaction
)

def seed_data(num_suppliers=15, num_products=50, num_po=20, num_so=35):
    """
    Seeds the database with a specified number of related objects.
    """
    print("Starting to seed the database...")
    fake = Faker()

    # --- Clean Database ---
    print("Deleting old data...")
    SalesOrderItem.objects.all().delete()
    PurchaseOrderItem.objects.all().delete()
    InventoryTransaction.objects.all().delete()
    SalesOrder.objects.all().delete()
    PurchaseOrder.objects.all().delete()
    Product.objects.all().delete()
    Supplier.objects.all().delete()
    
    # --- Create Suppliers ---
    suppliers = []
    for _ in range(num_suppliers):
        supplier = Supplier.objects.create(
            name=fake.company(),
            contact_info=fake.address(),
            email=fake.unique.email(),
            phone=fake.phone_number()
        )
        suppliers.append(supplier)
    print(f"Successfully created {num_suppliers} suppliers.")

    # --- Create Products ---
    product_categories = ['Electronics', 'Office Supplies', 'Furniture', 'Hardware', 'Software']
    products = []
    for i in range(num_products):
        product = Product.objects.create(
            name=f"{fake.bs().title()} - Model {i}",
            sku=fake.unique.bothify(text='SKU-????-####').upper(),
            category=random.choice(product_categories),
            unit_price=round(random.uniform(20.0, 800.0), 2),
            stock_quantity=random.randint(50, 250),
            min_stock_level=random.randint(10, 25)
        )
        products.append(product)
    print(f"Successfully created {num_products} products.")

    # --- Create Purchase Orders ---
    for _ in range(num_po):
        supplier = random.choice(suppliers)
        po = PurchaseOrder.objects.create(
            supplier=supplier,
            status=random.choice(['Pending', 'Shipped', 'Received'])
        )
        for _ in range(random.randint(1, 5)):
            product = random.choice(products)
            quantity = random.randint(10, 50)
            
            # **THE FIX IS HERE**
            # Convert both numbers to Decimal before multiplying
            product_price = Decimal(str(product.unit_price))
            discount = Decimal(str(round(random.uniform(0.7, 0.9), 2)))
            
            PurchaseOrderItem.objects.create(
                purchase_order=po,
                product=product,
                quantity=quantity,
                unit_price=product_price * discount
            )
            if po.status == 'Received':
                product.stock_quantity += quantity
                product.save()
                InventoryTransaction.objects.create(
                    product=product,
                    transaction_type='Purchase',
                    quantity_change=quantity,
                    reason=f'Stock from PO-{po.id}'
                )
    print(f"Successfully created {num_po} purchase orders.")

    # --- Create Sales Orders ---
    for _ in range(num_so):
        so = SalesOrder.objects.create(
            customer_name=fake.name(),
            status=random.choice(['Pending', 'Fulfilled'])
        )
        for _ in range(random.randint(1, 3)):
            product = random.choice(products)
            if product.stock_quantity > 5:
                quantity_to_sell = random.randint(1, min(5, product.stock_quantity))
                SalesOrderItem.objects.create(
                    sales_order=so,
                    product=product,
                    quantity=quantity_to_sell,
                    unit_price=product.unit_price
                )
                if so.status == 'Fulfilled':
                    product.stock_quantity -= quantity_to_sell
                    product.save()
                    InventoryTransaction.objects.create(
                        product=product,
                        transaction_type='Sale',
                        quantity_change=-quantity_to_sell,
                    )
    print(f"Successfully created {num_so} sales orders and updated stock.")

    print("Data seeding complete!")

if __name__ == '__main__':
    seed_data()