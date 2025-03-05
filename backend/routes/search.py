# routes/search.py
from flask import Blueprint, request, jsonify
import yfinance as yf
import requests

# Crea il blueprint per le route di ricerca
search_bp = Blueprint('search', __name__)

@search_bp.route('/api/search_symbol', methods=['GET'])
def search_symbol():
    query = request.args.get('query', default='', type=str)
    if not query:
        return jsonify({'error': 'No query provided'}), 400
    
    # Liste di simboli più complete
    stock_symbols = [
        # Top Stocks - Primi 5
        'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 
        
        # Tech
        'NVIDIA', 'INTC', 'CSCO', 'ORACLE', 'ADBE',
        
        # Finanza
        'JPM', 'BAC', 'WFC', 'GS', 'MS', 'BRK-B', 'V', 'MA',
        
        # Energia
        'XOM', 'CVX', 'COP', 'EOG', 'SLB',
        
        # Salute
        'JNJ', 'PFE', 'MRK', 'UNH', 'ABT',
        
        # Industriali
        'CAT', 'HON', 'BA', 'UNP', 'MMM',
        
        # Retail
        'WMT', 'TGT', 'HD', 'COST', 'LOW',
        
        # Altro
        'TSLA', 'NFLX', 'PYPL', 'CRM', 'UBER'
    ]

    # Lista più ampia di criptovalute
    crypto_symbols = [
        # Top Crypto - Primi 5
        'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 
        
        # Altre criptovalute
        'DOGEUSDT', 'LTCUSDT', 'TRXUSDT', 'ETCUSDT', 'LINKUSDT',
        'DOTUSDT', 'UNIUSDT', 'BCHUSDT', 'XLMUSDT', 'ATOMUSDT',
        'VETUSDT', 'FILUSDT', 'ONEUSDT', 'NEARUSDT', 'MATICUSDT'
    ]

    # Ricerca case-insensitive con corrispondenza parziale
    matched_stocks = [s for s in stock_symbols if query.lower() in s.lower()]
    matched_cryptos = [s for s in crypto_symbols if query.lower() in s.lower()]

    # Recupera nomi completi per stocks (opzionale, può rallentare la ricerca)
    stock_details = {}
    for symbol in matched_stocks:
        try:
            stock = yf.Ticker(symbol)
            stock_details[symbol] = stock.info.get('longName', symbol)
        except Exception:
            stock_details[symbol] = symbol

    # Restituisce i risultati
    return jsonify({
        'stocks': matched_stocks,
        'cryptos': matched_cryptos,
        'stock_details': stock_details
    })

@search_bp.route('/api/top_symbols', methods=['GET'])
def get_top_symbols():
    # Liste dei simboli più famosi e importanti
    top_stocks = [
        # Tech Giants
        'AAPL',   # Apple
        'GOOGL',  # Google (Alphabet)
        'MSFT',   # Microsoft
        'AMZN',   # Amazon
        'META',   # Meta (Facebook)
    ]

    top_cryptos = [
        'BTCUSDT',  # Bitcoin
        'ETHUSDT',  # Ethereum
        'BNBUSDT',  # Binance Coin
        'XRPUSDT',  # Ripple
        'ADAUSDT',  # Cardano
    ]

    # Recupera i dettagli per gli stock
    stock_details = {}
    for symbol in top_stocks:
        try:
            stock = yf.Ticker(symbol)
            stock_details[symbol] = {
                'name': stock.info.get('longName', symbol),
                'current_price': stock.history(period='1d')['Close'].iloc[-1] if not stock.history(period='1d').empty else None,
                'change_percent': stock.info.get('regularMarketChangePercent', 0)
            }
        except Exception as e:
            stock_details[symbol] = {
                'name': symbol,
                'current_price': None,
                'change_percent': 0
            }

    # Recupera i dettagli per le crypto
    crypto_details = {}
    for symbol in top_cryptos:
        try:
            url = f"https://api.binance.com/api/v3/ticker/24hr?symbol={symbol}"
            response = requests.get(url)
            data = response.json()
            
            crypto_details[symbol] = {
                'name': symbol.replace('USDT', ''),
                'current_price': float(data['lastPrice']),
                'change_percent': float(data['priceChangePercent'])
            }
        except Exception as e:
            crypto_details[symbol] = {
                'name': symbol.replace('USDT', ''),
                'current_price': None,
                'change_percent': 0
            }

    return jsonify({
        'top_stocks': stock_details,
        'top_cryptos': crypto_details
    })