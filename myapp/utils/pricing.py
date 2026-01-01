import requests
from django.core.cache import cache
from decimal import Decimal

SYMBOL_TO_ID = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "SOL": "solana",
    "USDT": "tether",
    "DOGE": "dogecoin",
    "BNB": "binancecoin",
}

def get_spot_prices(symbols):    
    cg_ids = []
    id_to_symbol = {}

    for sym in symbols:
        cg_id = SYMBOL_TO_ID.get(sym.upper())
        if cg_id:
            cg_ids.append(cg_id)
            id_to_symbol[cg_id] = sym.upper()

    if not cg_ids:
        return {}
    
    cache_key = f"prices:{','.join(sorted(cg_ids))}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    r = requests.get(
        "https://api.coingecko.com/api/v3/simple/price",
        params={ "ids": ",".join(cg_ids), "vs_currencies": "usd"},
        timeout=5
    )
    r.raise_for_status()
    data = r.json()

    prices = { 
        id_to_symbol[cg_id]: Decimal.from_float((data[cg_id]["usd"]))
        for cg_id in data 
    }

    cache.set(cache_key, prices, 60)
    return prices

def get_historical_price(symbol, date):
    id = SYMBOL_TO_ID.get(symbol.upper())
    if not id:
        raise ValueError("Unsupported coin")
    
    date_str = date.strftime("%d-%m-%Y")

    url = f"https://api.coingecko.com/api/v3/coins/{id}/history"
    res = requests.get(url, params={"date": date_str})

    res.raise_for_status()
    data = res.json()

    return Decimal.from_float(data["market_data"]["current_price"]["usd"])
