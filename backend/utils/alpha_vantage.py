# utils/alpha_vantage.py

import requests
import pandas as pd
from config import ALPHA_VANTAGE_API_KEY

def get_historical_data(symbol):
    url = f'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}'
    response = requests.get(url)
    data = response.json()
    timeseries = data.get('Time Series (Daily)', {})
    prices = []

    for date, price_data in timeseries.items():
        prices.append(float(price_data['4. close']))

    return pd.Series(prices)
