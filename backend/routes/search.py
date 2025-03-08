from flask import Blueprint, request, jsonify
import yfinance as yf
import requests
from datetime import datetime

# Import the functions from other blueprint modules
from routes.stock import get_top_stocks as fetch_top_stocks
from routes.crypto import get_top_cryptos as fetch_top_cryptos

# Create blueprint for search routes
search_bp = Blueprint('search', __name__)

@search_bp.route('/api/search_symbol', methods=['GET'])
def search_symbol():
    query = request.args.get('query', default='', type=str)
    if not query or len(query) < 2:
        return jsonify({'stocks': [], 'cryptos': [], 'stock_details': {}}), 200
    
    # Liste di simboli più complete
    stock_symbols = [
        # Top Stocks - Primi 5
        'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 
        
        # Tech
        'NVDA', 'INTC', 'CSCO', 'ORCL', 'ADBE', 'IBM', 'CRM', 'AMD', 'TSM', 'AVGO',
        
        # Finanza
        'JPM', 'BAC', 'WFC', 'GS', 'MS', 'BRK-B', 'V', 'MA', 'AXP', 'C', 'PYPL', 'SCHW',
        
        # Energia
        'XOM', 'CVX', 'COP', 'EOG', 'SLB', 'OXY', 'BP', 'DVN', 'MPC', 'VLO',
        
        # Salute
        'JNJ', 'PFE', 'MRK', 'UNH', 'ABT', 'ABBV', 'LLY', 'TMO', 'BMY', 'AMGN',
        
        # Industriali
        'CAT', 'HON', 'BA', 'UNP', 'MMM', 'GE', 'LMT', 'RTX', 'DE', 'EMR',
        
        # Retail
        'WMT', 'TGT', 'HD', 'COST', 'LOW', 'SBUX', 'MCD', 'NKE', 'BABA',
        
        # Auto
        'TSLA', 'F', 'GM', 'TM', 'RIVN', 'LCID', 'HMC', 'XPEV', 'LI', 'NIO',
        
        # Altro
        'NFLX', 'DIS', 'CMCSA', 'T', 'VZ', 'KO', 'PEP', 'PG', 'MDLZ', 'UBER'
    ]

    # Lista più ampia di criptovalute
    crypto_symbols = [
        # Top Crypto - Primi 5
        'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 
        
        # Altre criptovalute popolari
        'SOLUSDT', 'DOGEUSDT', 'LTCUSDT', 'TRXUSDT', 'ETCUSDT', 
        'LINKUSDT', 'DOTUSDT', 'UNIUSDT', 'BCHUSDT', 'XLMUSDT', 
        'ATOMUSDT', 'VETUSDT', 'FILUSDT', 'ONEUSDT', 'NEARUSDT', 
        'MATICUSDT', 'AVAXUSDT', 'SHIBUSDT', 'MANAUSDT', 'SANDUSDT',
        'ICPUSDT', 'ALGOUSDT', 'THETAUSDT', 'FTMUSDT', 'EGLDUSDT'
    ]

    # Ricerca case-insensitive con corrispondenza parziale
    matched_stocks = [s for s in stock_symbols if query.lower() in s.lower()][:15]
    matched_cryptos = [s for s in crypto_symbols if query.lower() in s.lower()][:15]

    # Se la ricerca diretta non produce risultati, prova a cercare con l'API yfinance
    if not matched_stocks and len(query) >= 1:
        try:
            yf_search = yf.Ticker(query)
            if hasattr(yf_search, 'info') and 'symbol' in yf_search.info:
                symbol = yf_search.info['symbol']
                if symbol not in matched_stocks:
                    matched_stocks.append(symbol)
        except Exception as e:
            print(f"Error during yfinance search: {e}")
    
    # Recupera nomi completi per stocks
    stock_details = {}
    for symbol in matched_stocks:
        try:
            stock = yf.Ticker(symbol)
            info = stock.info
            
            if 'longName' in info:
                stock_details[symbol] = {
                    'name': info.get('longName', symbol),
                    'exchange': info.get('exchange', 'Unknown'),
                    'industry': info.get('industry', 'Unknown'),
                    'sector': info.get('sector', 'Unknown'),
                    'country': info.get('country', 'Unknown')
                }
            else:
                stock_details[symbol] = symbol
        except Exception as e:
            print(f"Error fetching details for {symbol}: {e}")
            stock_details[symbol] = symbol

    # Restituisce i risultati
    return jsonify({
        'stocks': matched_stocks,
        'cryptos': matched_cryptos,
        'stock_details': stock_details
    })

@search_bp.route('/api/unified_search', methods=['GET'])
def unified_search():
    """Endpoint di ricerca unificato che combina azioni e crypto"""
    query = request.args.get('query', default='', type=str)
    if not query or len(query) < 2:
        return jsonify({'results': []}), 200

    results = []
    
    # Cerca azioni
    try:
        # Usa yfinance per cercare azioni
        stock_ticker = yf.Ticker(query)
        info = stock_ticker.info
        
        if 'longName' in info:
            results.append({
                'type': 'stock',
                'symbol': info.get('symbol', query.upper()),
                'name': info.get('longName', 'N/A'),
                'exchange': info.get('exchange', 'N/A'),
                'price': info.get('currentPrice', info.get('regularMarketPrice', 0)),
                'change_percent': info.get('regularMarketChangePercent', 0),
                'url': f"/stock/{info.get('symbol', query.upper())}"
            })
    except Exception as e:
        print(f"Error searching stock: {e}")
    
    # Cerca azioni simili
    try:
        stock_symbols = [
            'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NVDA', 'TSLA', 'JPM', 'V', 'WMT',
            'JNJ', 'PG', 'HD', 'BAC', 'DIS', 'NFLX', 'INTC', 'CSCO', 'ADBE', 'PFE'
        ]
        
        matched_stocks = [s for s in stock_symbols if query.lower() in s.lower()]
        
        for symbol in matched_stocks[:3]:  # Limita a 3 risultati
            if not any(r.get('symbol') == symbol for r in results):  # Evita duplicati
                try:
                    stock = yf.Ticker(symbol)
                    info = stock.info
                    if 'longName' in info:
                        results.append({
                            'type': 'stock',
                            'symbol': symbol,
                            'name': info.get('longName', symbol),
                            'exchange': info.get('exchange', 'N/A'),
                            'price': info.get('currentPrice', info.get('regularMarketPrice', 0)),
                            'change_percent': info.get('regularMarketChangePercent', 0),
                            'url': f"/stock/{symbol}"
                        })
                except Exception:
                    pass
    except Exception as e:
        print(f"Error searching similar stocks: {e}")
    
    # Cerca crypto direttamente su CoinGecko invece di limitarci a una lista predefinita
    try:
        # Usa l'API di CoinGecko search per cercare tutte le crypto che corrispondono alla query
        coingecko_search_url = f"https://api.coingecko.com/api/v3/search?query={query}"
        search_response = requests.get(coingecko_search_url, timeout=5)
        
        if search_response.status_code == 200:
            search_data = search_response.json()
            coins = search_data.get('coins', [])
            
            # Prendi i primi 5 risultati rilevanti
            for coin in coins[:5]:
                symbol = coin.get('symbol', '').upper()
                
                # Evita duplicati
                if not any(r.get('symbol') == symbol and r.get('type') == 'crypto' for r in results):
                    results.append({
                        'type': 'crypto',
                        'symbol': symbol,
                        'id': coin.get('id', ''),
                        'name': coin.get('name', f"{symbol} Cryptocurrency"),
                        'image': coin.get('large', ''),
                        'market_cap_rank': coin.get('market_cap_rank', 'N/A'),
                        'url': f"/crypto/{symbol}"
                    })
        else:
            print(f"CoinGecko API returned status code: {search_response.status_code}")
            
            # Fallback a ricerca limitata se l'API fallisce
            crypto_symbols = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE', 'DOT', 'MATIC']
            matched_cryptos = [s for s in crypto_symbols if query.lower() in s.lower()]
            
            for symbol in matched_cryptos[:3]:
                results.append({
                    'type': 'crypto',
                    'symbol': symbol,
                    'name': f"{symbol} Cryptocurrency",
                    'url': f"/crypto/{symbol}"
                })
            
    except Exception as e:
        print(f"Error searching cryptos with CoinGecko API: {e}")
        
        # Fallback in caso di errore con l'API
        try:
            crypto_symbols = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE', 'DOT', 'MATIC']
            matched_cryptos = [s for s in crypto_symbols if query.lower() in s.lower()]
            
            for symbol in matched_cryptos[:3]:
                results.append({
                    'type': 'crypto',
                    'symbol': symbol,
                    'name': f"{symbol} Cryptocurrency",
                    'url': f"/crypto/{symbol}"
                })
        except Exception:
            pass
    
    print(f"Search results for '{query}': {len(results)} items found")
    return jsonify({'results': results[:10]})  # Limita a 10 risultati totali


@search_bp.route('/api/top_symbols', methods=['GET'])
def get_top_symbols():
    try:
        # Call the functions directly without making HTTP requests
        # This is much more efficient
        
        # Get top stocks data
        stocks_response = fetch_top_stocks()
        stocks_data = stocks_response.get_json()
        stock_details = stocks_data.get('top_stocks', {})
        
        # Get top cryptos data
        cryptos_response = fetch_top_cryptos()
        cryptos_data = cryptos_response.get_json()
        crypto_details = cryptos_data.get('top_cryptos', {})
        
        return jsonify({
            'top_stocks': stock_details,
            'top_cryptos': crypto_details
        })
        
    except Exception as e:
        print(f"Error in get_top_symbols: {e}")
        return jsonify({
            'error': str(e),
            'top_stocks': {},
            'top_cryptos': {}
        }), 500