from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Product, User


# ============================================================================
#  LOW STOCK ALERT SIGNAL
# ============================================================================
@receiver(post_save, sender=Product)
def low_stock_alert(sender, instance, **kwargs):

    if instance.stock_quantity <= instance.min_stock_level:

        # Identify all Admins and Managers with valid email
        recipients = User.objects.filter(
            role__in=[User.Role.ADMIN, User.Role.MANAGER]
        )
        recipient_emails = [user.email for user in recipients if user.email]
        

        if recipient_emails:
            subject = f"Low Stock Alert: {instance.name}"
            message = (
                f"The stock for product '{instance.name}' (SKU: {instance.sku}) is running low.\n\n"
                f"Current Stock: {instance.stock_quantity}\n"
                f"Minimum Stock Level: {instance.min_stock_level}\n\n"
                "Please create a purchase order to restock this item."
            )
            
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                recipient_emails,
                fail_silently=False,
            )