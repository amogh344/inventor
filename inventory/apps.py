from django.apps import AppConfig

# ============================================================================
#  INVENTORY APP CONFIGURATION
# ============================================================================
class InventoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'inventory'

    # =========================================================================
    #  READY HOOK
    # =========================================================================
    def ready(self):
        # Import signals to connect them when the app is ready
        import inventory.signals