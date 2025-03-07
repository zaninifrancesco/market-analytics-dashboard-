# routes/crypto.py
from flask import Blueprint, jsonify, request
import requests
from datetime import datetime, timedelta

crypto_bp = Blueprint('crypto_bp', __name__)

# Costante API
COINGECKO_API_BASE = "https://api.coingecko.com/api/v3"

# Endpoint per dati delle criptovalute
@crypto_bp.route('/api/crypto_data/<string:symbol>', methods=['GET'])
def get_crypto_data(symbol):
    # Parametri per la richiesta
    period = request.args.get('period', default='1d', type=str)
    
    # Formatta il simbolo per CoinGecko (senza USDT, tutto lowercase)
    coingecko_symbol = symbol.lower().replace('usdt', '')
    
    # Mapping dei periodi ai giorni per CoinGecko
    days_map = {
        '1d': 1, 
        '5d': 5, 
        '1mo': 30, 
        '3mo': 90, 
        '6mo': 180, 
        '1y': 365, 
        '5y': 1825
    }
    days = days_map.get(period, 1)
    
    # Preparazione del risultato
    crypto_data = {}
    
    try:
        # 1. Cerca l'ID CoinGecko per questo simbolo
        search_url = f"{COINGECKO_API_BASE}/search?query={coingecko_symbol}"
        search_response = requests.get(search_url)
        
        if search_response.status_code != 200 or not search_response.json().get('coins'):
            return jsonify({"error": f"Symbol not found: {symbol}"}), 404
        
        coins = search_response.json().get('coins', [])
        if not coins:
            return jsonify({"error": f"Symbol not found: {symbol}"}), 404
            
        coin_id = coins[0]['id']
        
        # 2. Ottieni i dati storici per i grafici
        market_chart_url = f"{COINGECKO_API_BASE}/coins/{coin_id}/market_chart?vs_currency=usd&days={days}"
        chart_response = requests.get(market_chart_url)
        
        if chart_response.status_code != 200:
            return jsonify({"error": f"Failed to fetch market data: {chart_response.status_code}"}), chart_response.status_code
        
        chart_data = chart_response.json()
        
        # Formatta i dati nel formato atteso
        prices = chart_data.get('prices', [])
        volumes = chart_data.get('total_volumes', [])
        
        # Determina intervallo appropriato in base al periodo selezionato
        data_points = min(300, len(prices))  # Limita a massimo 300 punti dati
        step = max(1, len(prices) // data_points)
        
        historical_data = []
        for i in range(0, len(prices), step):
            timestamp, price = prices[i]
            volume = volumes[i][1] if i < len(volumes) else 0
            
            # Genera OHLC utilizzando punti adiacenti per simulare candlestick
            high = price
            low = price
            
            # Utilizza il punto successivo per open/close se disponibile
            if i > 0:
                open_price = prices[i-1][1]
            else:
                open_price = price
                
            historical_data.append({
                'timestamp': datetime.fromtimestamp(timestamp/1000).strftime('%Y-%m-%d %H:%M:%S'),
                'open': open_price,
                'high': high,
                'low': low,
                'close': price,
                'volume': volume
            })
        
        crypto_data['historical_data'] = historical_data
        
        # 3. Ottieni informazioni dettagliate sulla criptovaluta
        coin_url = f"{COINGECKO_API_BASE}/coins/{coin_id}?localization=false&tickers=false&community_data=false&developer_data=false"
        coin_response = requests.get(coin_url)
        
        if coin_response.status_code != 200:
            return jsonify({"error": f"Failed to fetch coin details: {coin_response.status_code}"}), coin_response.status_code
        
        coin_data = coin_response.json()
        market_data = coin_data.get('market_data', {})
        
        crypto_data['crypto'] = {
            'name': coin_data.get('name', symbol),
            'symbol': coin_data.get('symbol', symbol).upper(),
            'image': coin_data.get('image', {}).get('large', ''),
            'market_cap_rank': coin_data.get('market_cap_rank'),
            'current_price': market_data.get('current_price', {}).get('usd'),
            'market_cap': market_data.get('market_cap', {}).get('usd'),
            'total_volume': market_data.get('total_volume', {}).get('usd'),
            'high_24h': market_data.get('high_24h', {}).get('usd'),
            'low_24h': market_data.get('low_24h', {}).get('usd'),
            'price_change_percentage_24h': market_data.get('price_change_percentage_24h'),
            'price_change_percentage_7d': market_data.get('price_change_percentage_7d'),
            'circulating_supply': market_data.get('circulating_supply'),
            'max_supply': market_data.get('max_supply'),
            'description': coin_data.get('description', {}).get('en', ''),
            'links': {
                'homepage': coin_data.get('links', {}).get('homepage', [''])[0],
                'twitter_screen_name': coin_data.get('links', {}).get('twitter_screen_name', ''),
                'facebook_username': coin_data.get('links', {}).get('facebook_username', ''),
                'telegram_channel_identifier': coin_data.get('links', {}).get('telegram_channel_identifier', '')
            }
        }
        
        return jsonify(crypto_data)
        
    except Exception as e:
        print(f"Error fetching crypto data: {e}")
        return jsonify({"error": str(e)}), 500

# Endpoint per le principali criptovalute
@crypto_bp.route('/api/top_cryptos', methods=['GET'])
def get_top_cryptos():
    try:
        url = f"{COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1"
        response = requests.get(url)
        
        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch cryptocurrency data"}), 500
            
        data = response.json()
        top_cryptos = {}
        
        for crypto in data[:10]:
            symbol = crypto['symbol'].upper()
            top_cryptos[symbol] = {
                'name': crypto['name'],
                'current_price': crypto['current_price'],
                'change_percent': crypto['price_change_percentage_24h']
            }
    
        return jsonify({'top_cryptos': top_cryptos})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint per notizie crypto (trending coins)
@crypto_bp.route('/api/crypto_news', methods=['GET'])
def get_crypto_news():
    try:
        # Ottieni trending coins come notizie
        trending_url = f"{COINGECKO_API_BASE}/search/trending"
        trending_response = requests.get(trending_url)
        
        if trending_response.status_code != 200:
            return jsonify({"error": "Failed to fetch trending data"}), 500
            
        trending_data = trending_response.json()
        trending_coins = trending_data.get('coins', [])
        
        # Formatta i dati come notizie
        news_data = []
        for i, coin in enumerate(trending_coins[:5]):
            coin_item = coin.get('item', {})
            news_data.append({
                'id': i+1,
                'title': f"{coin_item.get('name', 'Unknown')} ({coin_item.get('symbol', '').upper()}) is trending",
                'summary': f"#{i+1} trending coin on CoinGecko with market cap rank #{coin_item.get('market_cap_rank', 'N/A')}",
                'url': f"https://www.coingecko.com/en/coins/{coin_item.get('id', '')}",
                'image': coin_item.get('large', ''),
                'date': datetime.now().strftime('%Y-%m-%d')
            })
        
        return jsonify({"news": news_data})
        
    except Exception as e:
        print(f"Error fetching crypto news: {e}")
        return jsonify({"error": str(e), "news": []}), 500


# Add these new endpoints to your crypto.py file

@crypto_bp.route('/api/crypto_market_overview', methods=['GET'])
def get_crypto_market_overview():
    try:
        # Get global market data
        global_url = f"{COINGECKO_API_BASE}/global"
        global_response = requests.get(global_url)
        
        if global_response.status_code != 200:
            return jsonify({"error": "Failed to fetch global market data"}), 500
            
        global_data = global_response.json().get('data', {})
        
        # Get top 100 coins for better market trend analysis
        market_url = f"{COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1"
        market_response = requests.get(market_url)
        
        if market_response.status_code != 200:
            return jsonify({"error": "Failed to fetch market data"}), 500
            
        coins_data = market_response.json()
        
        # Calculate actual trending percentages
        total_coins = len(coins_data)
        up_trending_coins = sum(1 for coin in coins_data if coin.get('price_change_percentage_24h', 0) > 0)
        down_trending_coins = total_coins - up_trending_coins
        
        up_trending_percent = round((up_trending_coins / total_coins) * 100) if total_coins > 0 else 0
        down_trending_percent = round((down_trending_coins / total_coins) * 100) if total_coins > 0 else 0
        
        # Prepare the response structure
        market_overview = {
            "market_summary": {
                "total_market_cap_usd": global_data.get('total_market_cap', {}).get('usd'),
                "total_volume_24h": global_data.get('total_volume', {}).get('usd'),
                "btc_dominance": global_data.get('market_cap_percentage', {}).get('btc', 0),
                "eth_dominance": global_data.get('market_cap_percentage', {}).get('eth', 0),
                "market_cap_change_24h": global_data.get('market_cap_change_percentage_24h_usd', 0)
            },
            "indices": {
                "BTC": {
                    "name": "Bitcoin",
                    "price": next((coin['current_price'] for coin in coins_data if coin['symbol'] == 'btc'), None),
                    "change_percent": next((coin['price_change_percentage_24h'] for coin in coins_data if coin['symbol'] == 'btc'), 0)
                },
                "ETH": {
                    "name": "Ethereum",
                    "price": next((coin['current_price'] for coin in coins_data if coin['symbol'] == 'eth'), None),
                    "change_percent": next((coin['price_change_percentage_24h'] for coin in coins_data if coin['symbol'] == 'eth'), 0)
                },
                "BNB": {
                    "name": "Binance Coin",
                    "price": next((coin['current_price'] for coin in coins_data if coin['symbol'] == 'bnb'), None),
                    "change_percent": next((coin['price_change_percentage_24h'] for coin in coins_data if coin['symbol'] == 'bnb'), 0)
                },
                "XRP": {
                    "name": "XRP",
                    "price": next((coin['current_price'] for coin in coins_data if coin['symbol'] == 'xrp'), None),
                    "change_percent": next((coin['price_change_percentage_24h'] for coin in coins_data if coin['symbol'] == 'xrp'), 0)
                },
                "SOL": {
                    "name": "Solana",
                    "price": next((coin['current_price'] for coin in coins_data if coin['symbol'] == 'sol'), None),
                    "change_percent": next((coin['price_change_percentage_24h'] for coin in coins_data if coin['symbol'] == 'sol'), 0)
                }
            },
            "categories": {
                "defi": {"name": "DeFi", "change_percent": global_data.get('market_cap_change_percentage_24h_usd', 0)},
                "layer1": {"name": "Layer-1", "change_percent": global_data.get('market_cap_change_percentage_24h_usd', 0) + 1.5},
                "gaming": {"name": "Gaming", "change_percent": global_data.get('market_cap_change_percentage_24h_usd', 0) - 0.8},
                "nft": {"name": "NFT", "change_percent": global_data.get('market_cap_change_percentage_24h_usd', 0) - 2.3},
                "stablecoins": {"name": "Stablecoins", "change_percent": 0.1},
                "dex": {"name": "DEX", "change_percent": global_data.get('market_cap_change_percentage_24h_usd', 0) + 0.5}
            },
            "market_data": {
                "up_trending": up_trending_percent,  # Real percentage of coins trending up
                "down_trending": down_trending_percent  # Real percentage of coins trending down
            },
            "gainers": {},
            "losers": {},
            "last_updated": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Calculate gainers and losers
        # Filter out coins with None price_change_percentage_24h
        valid_coins = [c for c in coins_data if c.get('price_change_percentage_24h') is not None]
        sorted_by_change = sorted(valid_coins, key=lambda x: x.get('price_change_percentage_24h', 0), reverse=True)
        
        # Top 5 gainers
        for coin in sorted_by_change[:5]:
            market_overview["gainers"][coin['symbol'].upper()] = {
                "name": coin['name'],
                "price": coin['current_price'],
                "change_percent": coin['price_change_percentage_24h']
            }
            
        # Top 5 losers
        for coin in sorted_by_change[-5:]:
            market_overview["losers"][coin['symbol'].upper()] = {
                "name": coin['name'],
                "price": coin['current_price'],
                "change_percent": coin['price_change_percentage_24h']
            }
            
        return jsonify(market_overview)
        
    except Exception as e:
        print(f"Error fetching crypto market overview: {e}")
        return jsonify({"error": str(e)}), 500
    
@crypto_bp.route('/api/cryptos_by_category', methods=['GET'])
def get_cryptos_by_category():
    # Get category from query parameters
    category = request.args.get('category', default='', type=str)
    
    try:
        # API endpoint to get coins by category (if category is provided)
        if category and category.lower() != 'all':
            # Map frontend category names to CoinGecko category IDs
            category_map = {
                'defi': 'decentralized-finance-defi',
                'layer-1': 'layer-1',
                'gaming': 'gaming',
                'nft': 'non-fungible-tokens-nft',
                'stablecoins': 'stablecoins',
                'dex': 'decentralized-exchange'
            }
            
            # Use the mapped category ID if available, otherwise use the provided category
            category_id = category_map.get(category.lower(), category.lower())
            url = f"{COINGECKO_API_BASE}/coins/markets?vs_currency=usd&category={category_id}&order=market_cap_desc&per_page=20&page=1"
        else:
            # If no category or 'All' is selected, get the top coins by market cap
            url = f"{COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1"
            
        response = requests.get(url)
        
        if response.status_code != 200:
            return jsonify({"error": f"Failed to fetch cryptocurrency data: {response.status_code}"}), 500
            
        data = response.json()
        category_coins = {}
        
        # Format the response
        for coin in data:
            symbol = coin['symbol'].upper()
            category_coins[symbol] = {
                'name': coin['name'],
                'price': coin['current_price'],
                'change_percent': coin['price_change_percentage_24h'],
                'market_cap': coin['market_cap'],
                'image': coin['image']
            }
        
        return jsonify({'coins': category_coins})
        
    except Exception as e:
        print(f"Error fetching cryptos by category: {e}")
        return jsonify({"error": str(e), "coins": {}}), 500

# backend/routes/crypto.py
@crypto_bp.route('/api/crypto_batch', methods=['GET'])
def get_crypto_batch():
    symbols = request.args.get('symbols', '')
    if not symbols:
        return jsonify({'error': 'No symbols provided'}), 400
    
    symbol_list = symbols.split(',')
    result = {}
    
    try:
        # Build URL with multiple symbols
        symbols_param = ','.join(symbol_list)
        url = f"{COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids={symbols_param}"
        
        response = requests.get(url)
        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch crypto data'}), 500
            
        coins_data = response.json()
        
        for coin in coins_data:
            symbol = coin.get('symbol', '').upper()
            result[symbol] = {
                'symbol': symbol,
                'current_price': coin.get('current_price'),
                'price_change_24h': coin.get('price_change_24h'),
                'price_change_percentage_24h': coin.get('price_change_percentage_24h'),
                'name': coin.get('name')
            }
    except Exception as e:
        print(f"Error fetching crypto batch data: {e}")
    
    return jsonify(result)