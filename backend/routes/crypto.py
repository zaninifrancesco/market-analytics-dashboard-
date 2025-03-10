from flask import Blueprint, jsonify, request
import requests
from datetime import datetime, timedelta
from config import COINGECKO_API_KEY

crypto_bp = Blueprint('crypto_bp', __name__)

# API Constants
COINGECKO_API_BASE = "https://api.coingecko.com/api/v3"
COINGECKO_PRO_API_BASE = "https://api.coingecko.com/api/v3"

def make_coingecko_request(endpoint, params=None):
    """
    Makes a request to the CoinGecko API using the API key if available.
    Falls back to public API with rate limits if no key is available.
    
    Args:
        endpoint: API endpoint to call
        params: Optional query parameters
        
    Returns:
        Response from the API
    """
    if COINGECKO_API_KEY:
        url = f"{COINGECKO_PRO_API_BASE}/{endpoint}"
        if params is None:
            params = {}
        params['x_cg_demo_api_key'] = COINGECKO_API_KEY
        response = requests.get(url, params=params)
        print(response.url)
    else:
        url = f"{COINGECKO_API_BASE}/{endpoint}"
        response = requests.get(url, params=params)
        print(f"Using public API: {url}")
    
    return response

@crypto_bp.route('/api/crypto_data/<string:symbol>', methods=['GET'])
def get_crypto_data(symbol):
    """
    Get detailed cryptocurrency data for a specific symbol with historical price data.
    
    Args:
        symbol: Cryptocurrency symbol (e.g. 'btc', 'eth')
        
    Query Parameters:
        period: Time period for historical data (default: '1d')
        
    Returns:
        JSON with cryptocurrency data and historical price chart data
    """
    period = request.args.get('period', default='1d', type=str)
    
    coingecko_symbol = symbol.lower().replace('usdt', '')
    
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
    
    crypto_data = {}
    
    try:
        search_response = make_coingecko_request(f"search", {"query": coingecko_symbol})
        print(search_response)
        
        if search_response.status_code != 200 or not search_response.json().get('coins'):
            return jsonify({"error": f"Symbol not found: {symbol}"}), 404
        
        coins = search_response.json().get('coins', [])
        if not coins:
            return jsonify({"error": f"Symbol not found: {symbol}"}), 404
            
        coin_id = coins[0]['id']
        
        chart_response = make_coingecko_request(f"coins/{coin_id}/market_chart", {"vs_currency": "usd", "days": days})
        
        if (chart_response.status_code != 200):
            return jsonify({"error": f"Failed to fetch market data: {chart_response.status_code}"}), chart_response.status_code
        
        chart_data = chart_response.json()
        
        prices = chart_data.get('prices', [])
        volumes = chart_data.get('total_volumes', [])
        
        data_points = min(300, len(prices))
        step = max(1, len(prices) // data_points)
        
        historical_data = []
        for i in range(0, len(prices), step):
            timestamp, price = prices[i]
            volume = volumes[i][1] if i < len(volumes) else 0
            
            high = price
            low = price
            
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
        
        coin_response = make_coingecko_request(f"coins/{coin_id}", {
            "localization": "false", 
            "tickers": "false", 
            "community_data": "false", 
            "developer_data": "false"
        })
        
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

@crypto_bp.route('/api/top_cryptos', methods=['GET'])
def get_top_cryptos():
    """
    Get data for top cryptocurrencies by market capitalization.
    
    Returns:
        JSON with top cryptocurrencies data including current price and 24-hour change
    """
    try:
        response = make_coingecko_request("coins/markets", {
            "vs_currency": "usd",
            "order": "market_cap_desc",
            "per_page": 10,
            "page": 1
        })
        
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

@crypto_bp.route('/api/crypto_news', methods=['GET'])
def get_crypto_news():
    """
    Get trending cryptocurrency news based on trending coins.
    
    Returns:
        JSON with news items featuring trending cryptocurrencies
    """
    try:
        trending_response = make_coingecko_request("search/trending")
        
        if trending_response.status_code != 200:
            return jsonify({"error": f"Failed to fetch trending data: {trending_response.status_code}"}), 500
            
        trending_data = trending_response.json()
        trending_coins = trending_data.get('coins', [])
        
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

@crypto_bp.route('/api/crypto_market_overview', methods=['GET'])
def get_crypto_market_overview():
    """
    Provide a comprehensive cryptocurrency market overview.
    
    Returns:
        JSON with market summary, indices, categories, top gainers, losers and market trend data
    """
    try:
        global_response = make_coingecko_request("global")
        
        if global_response.status_code != 200:
            return jsonify({"error": f"Failed to fetch global market data: {global_response.status_code}"}), 500
            
        global_data = global_response.json().get('data', {})
        
        market_response = make_coingecko_request("coins/markets", {
            "vs_currency": "usd",
            "order": "market_cap_desc",
            "per_page": 100,
            "page": 1
        })
        
        if market_response.status_code != 200:
            return jsonify({"error": f"Failed to fetch market data: {market_response.status_code}"}), 500
            
        coins_data = market_response.json()
        
        total_coins = len(coins_data)
        up_trending_coins = sum(1 for coin in coins_data if coin.get('price_change_percentage_24h', 0) > 0)
        down_trending_coins = total_coins - up_trending_coins
        
        up_trending_percent = round((up_trending_coins / total_coins) * 100) if total_coins > 0 else 0
        down_trending_percent = round((down_trending_coins / total_coins) * 100) if total_coins > 0 else 0
        
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
                "up_trending": up_trending_percent,
                "down_trending": down_trending_percent
            },
            "gainers": {},
            "losers": {},
            "last_updated": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        valid_coins = [c for c in coins_data if c.get('price_change_percentage_24h') is not None]
        sorted_by_change = sorted(valid_coins, key=lambda x: x.get('price_change_percentage_24h', 0), reverse=True)
        
        for coin in sorted_by_change[:5]:
            market_overview["gainers"][coin['symbol'].upper()] = {
                "name": coin['name'],
                "price": coin['current_price'],
                "change_percent": coin['price_change_percentage_24h']
            }
            
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
    """
    Get cryptocurrencies filtered by category.
    
    Query Parameters:
        category: Cryptocurrency category to filter by (default: '' which returns top coins)
        
    Returns:
        JSON with cryptocurrencies in the specified category
    """
    category = request.args.get('category', default='', type=str)
    
    try:
        if (category and category.lower() != 'all'):
            category_map = {
                'defi': 'decentralized-finance-defi',
                'layer-1': 'layer-1',
                'gaming': 'gaming',
                'nft': 'non-fungible-tokens-nft',
                'stablecoins': 'stablecoins',
                'dex': 'decentralized-exchange'
            }
            
            category_id = category_map.get(category.lower(), category.lower())
            url = f"{COINGECKO_API_BASE}/coins/markets?vs_currency=usd&category={category_id}&order=market_cap_desc&per_page=20&page=1"
        else:
            url = f"{COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1"
            
        response = requests.get(url)
        
        if response.status_code != 200:
            return jsonify({"error": f"Failed to fetch cryptocurrency data: {response.status_code}"}), 500
            
        data = response.json()
        category_coins = {}
        
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

@crypto_bp.route('/api/crypto_batch', methods=['GET'])
def get_crypto_batch():
    """
    Get basic data for multiple cryptocurrencies in a single request.
    
    Query Parameters:
        symbols: Comma-separated list of cryptocurrency symbols
        
    Returns:
        JSON with data for all requested cryptocurrencies
    """
    symbols = request.args.get('symbols', '')
    if not symbols:
        return jsonify({'error': 'No symbols provided'}), 400
    
    symbol_list = symbols.split(',')
    result = {}
    
    try:
        search_results = {}
        for symbol in symbol_list:
            clean_symbol = symbol.lower().replace('usdt', '')
            
            search_response = make_coingecko_request("search", {"query": clean_symbol})
            
            if search_response.status_code == 200:
                data = search_response.json()
                coins = data.get('coins', [])
                if coins:
                    search_results[symbol.upper()] = {
                        'id': coins[0]['id'],
                        'name': coins[0]['name']
                    }
                    print(f"Found ID for {symbol}: {coins[0]['id']}")
                else:
                    print(f"No coins found for symbol: {symbol}")
            else:
                print(f"Search API returned status code {search_response.status_code} for {symbol}")
        
        if search_results:
            ids = [info['id'] for info in search_results.values()]
            
            response = make_coingecko_request("coins/markets", {
                "vs_currency": "usd",
                "ids": ",".join(ids),
                "order": "market_cap_desc",
                "per_page": 100,
                "page": 1
            })
            
            if response.status_code != 200:
                print(f"Markets API returned status code: {response.status_code}")
                print(f"Response content: {response.text[:200]}...")
                return jsonify({'error': f'Failed to fetch crypto data: {response.status_code}'}), 500
                
            coins_data = response.json()
            print(f"Got data for {len(coins_data)} coins")
            
            id_to_symbol = {info['id']: symbol for symbol, info in search_results.items()}
            
            for coin in coins_data:
                coin_id = coin.get('id')
                if coin_id in id_to_symbol:
                    symbol = id_to_symbol[coin_id]
                    result[symbol] = {
                        'symbol': symbol,
                        'current_price': coin.get('current_price'),
                        'price_change_24h': coin.get('price_change_24h'),
                        'price_change_percentage_24h': coin.get('price_change_percentage_24h'),
                        'name': coin.get('name')
                    }
            
            for symbol in symbol_list:
                upper_symbol = symbol.upper()
                if upper_symbol not in result:
                    result[upper_symbol] = {
                        'symbol': upper_symbol,
                        'current_price': 0,
                        'price_change_24h': 0,
                        'price_change_percentage_24h': 0,
                        'name': f"Unknown ({upper_symbol})"
                    }
        else:
            print("No valid search results found for any symbols")
            for symbol in symbol_list:
                upper_symbol = symbol.upper()
                result[upper_symbol] = {
                    'symbol': upper_symbol,
                    'current_price': 0,
                    'price_change_24h': 0,
                    'price_change_percentage_24h': 0,
                    'name': f"Unknown ({upper_symbol})"
                }
    except Exception as e:
        print(f"Error fetching crypto batch data: {e}")
        for symbol in symbol_list:
            upper_symbol = symbol.upper()
            if upper_symbol not in result:
                result[upper_symbol] = {
                    'symbol': upper_symbol,
                    'current_price': 0,
                    'price_change_24h': 0,
                    'price_change_percentage_24h': 0,
                    'name': f"Error: {upper_symbol}"
                }
    
    print("Returning result:", result)
    return jsonify(result)