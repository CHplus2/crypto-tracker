from django.db import models

# Create your models here.
class Transaction(models.Model):
    type = models.CharField(max_length=50, default="BUY")
    wallet = models.CharField(max_length=50, blank=True, default="")
    category = models.CharField(max_length=50, blank=True, default="")
    crypto_symbol = models.CharField(max_length=10, default="BTC")
    crypto_amount = models.DecimalField(max_digits=20, decimal_places=8, default=0)
    usd_value_at_entry = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    gas_fee_usd = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    date = models.DateField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.date}: {self.crypto_amount} {self.crypto_symbol}"