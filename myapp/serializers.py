from rest_framework import serializers
from django.utils import timezone
import secrets
from decimal import Decimal

from .models import Transaction
from .utils.pricing import *

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'type', 'wallet', 'category', 'crypto_symbol', 'crypto_amount', 'usd_value_at_entry', 
                  'gas_fee_usd', 'date', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def generate_wallet(self):
        return "0x" + secrets.token_hex(20)

    def _resolve_usd_value(self, validated_data, instance=None):
        usd = validated_data.get("usd_value_at_entry", 0)
        if usd is not None and usd >= 0:
            return usd
        
        symbol = validated_data.get(
            "crypto_symbol",
            instance.crypto_symbol if instance else None
        )
        amount = validated_data.get(
            "crypto_amount",
            instance.crypto_amount if instance else None
        )
        date = validated_data.get(
            "date",
            instance.date if instance else None)

        if not symbol or not amount or not date:
            return usd

        today = timezone.now().date()
        
        if date < today:
            price = get_historical_price(symbol, date)
        else:
            price = get_spot_prices([symbol])[symbol]
    
        return price * amount
    
    def create(self, validated_data):
        if not validated_data.get("wallet"):
            validated_data["wallet"] = self.generate_wallet()

        validated_data["usd_value_at_entry"] = self._resolve_usd_value(validated_data)
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        if not validated_data.get("wallet"):
            validated_data["wallet"] = self.generate_wallet()

        validated_data["usd_value_at_entry"] = self._resolve_usd_value(
            validated_data, 
            instance=instance
        )
        
        return super().update(instance, validated_data)
        