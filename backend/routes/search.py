# routes/search.py
from flask import Blueprint, request, jsonify
import yfinance as yf

# Crea il blueprint per le route di ricerca
search_bp = Blueprint('search', __name__)

@search_bp.route('/api/search_symbol', methods=['GET'])
def search_symbol():
    query = request.args.get('query', default='', type=str)
    if not query:
        return jsonify({'error': 'No query provided'}), 400
    
    # Liste di simboli più complete
    stock_symbols = [
        # Tech
        'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NVIDIA', 'INTC', 'CSCO', 'ORACLE', 'ADBE',
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
        'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 
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