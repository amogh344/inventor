from django.contrib.contenttypes.models import ContentType
from .models import AuditLog

# ============================================================================
#  AUDIT LOGGING UTILITY
# ============================================================================
def log_activity(user, action, instance):
    """A helper function to create an AuditLog entry."""
    AuditLog.objects.create(
        user=user,
        action=action,
        content_type=ContentType.objects.get_for_model(instance),
        object_id=instance.pk,
        object_repr=str(instance)
    )