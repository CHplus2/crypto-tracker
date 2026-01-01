from django.shortcuts import render
from rest_framework import generics, status
from .models import Transaction
from .serializers import TransactionSerializer
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
import requests
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json 
from django.core.cache import cache
from .utils.pricing import get_spot_prices
from decimal import Decimal

# Create your views here.
@method_decorator(csrf_protect, name='dispatch')
class TransactionListCreate(generics.ListCreateAPIView):
    queryset = Transaction.objects.all().order_by('created_at')
    serializer_class = TransactionSerializer

class TransactionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

def index(request):
    return render(request, 'frontend.html')


SYMBOL_TO_ID = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "SOL": "solana",
    "USDT": "tether",
    "DOGE": "dogecoin",
    "BNB": "binancecoin",
}

@csrf_exempt
def crypto_prices(request):    
    try:
        body = json.loads(request.body)
        symbols = body.get("symbols", [])

        ids = []
        id_to_symbol = {}

        for sym in symbols:
            cg_id = SYMBOL_TO_ID.get(sym.upper())
            
            if cg_id:
                ids.append(cg_id)
                id_to_symbol[cg_id] = sym.upper()

        if not ids:
            return JsonResponse({})

        cache_key = "prices:" + ",".join(sorted(ids))
        cached = cache.get(cache_key)
        if cached:
            return JsonResponse(cached)

        r = requests.get(
            "https://api.coingecko.com/api/v3/simple/price",
            params={
                "ids": ",".join(ids),
                "vs_currencies": "usd"
            },
            timeout=5
        )
        raw = r.json()

        data = {
            id_to_symbol[cg_id]: raw[cg_id]["usd"]
            for cg_id in raw
        }

        cache.set(cache_key, data, 60)
        return data
    
    except Exception as e:
        return {}
    
def all_pnl(request):
    transactions = Transaction.objects.all().order_by("date", "created_at")

    realized = Decimal("0")
    unrealized = Decimal("0")

    realized_cost = Decimal("0")
    unrealized_cost = Decimal("0")

    cryptocurrencies = {}

    def pnl(sold, sell_price, buy_price):
        return (sell_price - buy_price) * sold

    for tx in transactions:
        if not tx.crypto_symbol:
            continue

        symbol = tx.crypto_symbol.upper()
        cryptocurrencies.setdefault(symbol, [])

        type = tx.type.lower()

        if type in ("buy", "transfer in", "reward"):
            cost_basis = tx.usd_value_at_entry + tx.gas_fee_usd
            cryptocurrencies[symbol].append(
                [tx.crypto_amount, tx.crypto_amount, cost_basis]
            )

        elif type == "sell": 
            amount = tx.crypto_amount
            sell_price = (tx.usd_value_at_entry - tx.gas_fee_usd) / tx.crypto_amount 

            total_owned = sum(lot[0] for lot in cryptocurrencies[symbol])
            if amount > total_owned:
                continue

            while amount > 0 and cryptocurrencies[symbol]:
                lot = cryptocurrencies[symbol][0]
                buy_price = lot[2] / lot[1]

                used = min(amount, lot[0])
                realized += pnl(used, sell_price, buy_price)
                realized_cost += buy_price * used

                lot[0] -= used 
                amount -= used

                if lot[0] == 0:
                    cryptocurrencies[symbol].pop(0)
    
        elif type == "transfer out":
            amount = tx.crypto_amount
            while amount > 0 and cryptocurrencies[symbol]:
                lot = cryptocurrencies[symbol][0]

                used = min(amount, lot[0])

                lot[0] -= used 
                amount -= used

                if lot[0] == 0:
                    cryptocurrencies[symbol].pop(0)

    prices = get_spot_prices(cryptocurrencies.keys())

    for symbol, lots in cryptocurrencies.items():
        for remaining, original, cost in lots:
            buy_price = cost / original
            unrealized += (prices[symbol] - buy_price) * remaining
            unrealized_cost += buy_price * remaining

    return JsonResponse({
        "realized": str(realized),
        "unrealized": str(unrealized),
        "realized_cost": str(realized_cost),
        "unrealized_cost": str(unrealized_cost)
    })


@csrf_exempt
def signup_view(request):
    if request.method == "POST":
        data = json.loads(request.body.decode("utf-8"))
        username = data.get("username")
        password = data.get("password")
        confirm_password = data.get("confirmPassword")

        if not username or not password or not confirm_password:
            return JsonResponse({"error": "Missing username or password"}, status=400)
        
        if password != confirm_password:
            return JsonResponse({"error": "Passwords do not match"}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "Username already exists"}, status=400)

        # create user
        user = User.objects.create_user(username=username, password=password)
        user.save()

        # automatically log them in after sign-up
        login(request, user)

        return JsonResponse({"message": "User created and logged in successfully"}, status=201)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)

    if user:
        login(request, user)
        return Response({"message": "Logged in"})
    else: 
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

def logout_view(request):
    logout(request)
    return JsonResponse({"message": "Logged out successfully"})

def check_auth(request):
    if request.user.is_authenticated:
        return JsonResponse({
            "authenticated": True,
            "username": request.user.username
        })
    return JsonResponse({"authenticated": False})