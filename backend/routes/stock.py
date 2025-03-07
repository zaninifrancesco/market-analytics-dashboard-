# routes/stock.py
from flask import Blueprint, jsonify, request
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import numpy as np

stock_bp = Blueprint('stock_bp', __name__)

# Endpoint for stock data
@stock_bp.route('/api/stock_data/<string:symbol>', methods=['GET'])
def get_stock_data(symbol):
    period = request.args.get('period', default='1d', type=str)
    
    # Seleziona l'intervallo appropriato in base al periodo richiesto
    if period == '1d':
        interval = '5m'  # 5 minuti di granularità per il dato giornaliero
    elif period == '5d':
        interval = '1h'  # 15 minuti per 5 giorni
    elif period == '1mo':
        interval = '1d'  # 1 ora per 1 mese
    elif period == '3mo':
        interval = '1d'  # 1 giorno per 3 mesi
    elif period == '6mo':
        interval = '1wk'  # 1 giorno per 6 mesi
    elif period == '1y':
        interval = '1mo'  # 1 giorno per 1 anno
    elif period == '5y':
        interval = '1mo'  # 1 settimana per 5 anni
    else:
        interval = '1d'  # Default a 1 giorno
        
    try:
        stock = yf.Ticker(symbol)
        # Get company info
        company_info = stock.info
        
        # Get historical data with appropriate granularity
        data = stock.history(period=period, interval=interval)
        
        if data.empty:
            return jsonify({"error": f"No data available for {symbol}"}), 404

        # Calculate VWAP if volume is available
        if 'Volume' in data.columns and len(data) > 0:
            data['VWAP'] = (data['Close'] * data['Volume']).cumsum() / data['Volume'].cumsum()
        
        # Convert to list of dictionaries for JSON response
        result = []
        for index, row in data.iterrows():
            # Format timestamp based on interval
            if interval in ['1m', '5m', '15m', '30m', '1h']:
                timestamp_format = '%Y-%m-%d %H:%M:%S'
            else:
                timestamp_format = '%Y-%m-%d'
                
            entry = {
                'timestamp': index.strftime(timestamp_format),
                'open': float(row['Open']) if not pd.isna(row['Open']) else None,
                'high': float(row['High']) if not pd.isna(row['High']) else None,
                'low': float(row['Low']) if not pd.isna(row['Low']) else None,
                'close': float(row['Close']) if not pd.isna(row['Close']) else None,
                'volume': int(row['Volume']) if not pd.isna(row['Volume']) else None
            }
            if 'VWAP' in row and not pd.isna(row['VWAP']):
                entry['vwap'] = float(row['VWAP'])
            
            result.append(entry)
        
        # Extract key company information
        company_data = {
            'symbol': symbol,
            'name': company_info.get('longName', 'N/A'),
            'sector': company_info.get('sector', 'N/A'),
            'industry': company_info.get('industry', 'N/A'),
            'market_cap': company_info.get('marketCap', 'N/A'),
            'pe_ratio': company_info.get('trailingPE', 'N/A'),
            'dividend_yield': company_info.get('dividendYield', 'N/A'),
            'beta': company_info.get('beta', 'N/A'),
            'current_price': company_info.get('currentPrice', company_info.get('regularMarketPrice', 'N/A')),
            'target_high_price': company_info.get('targetHighPrice', 'N/A'),
            'target_low_price': company_info.get('targetLowPrice', 'N/A'),
            'target_mean_price': company_info.get('targetMeanPrice', 'N/A'),
            'recommendation': company_info.get('recommendationKey', 'N/A'),
            'logo_url': company_info.get('logo_url', ''),
            'website': company_info.get('website', ''),
            'business_summary': company_info.get('longBusinessSummary', 'N/A')
        }

        # Get financial data
        try:
            financials = stock.financials
            balance_sheet = stock.balance_sheet
            cash_flow = stock.cashflow
            
            # Extract key financial metrics (most recent quarter)
            if not financials.empty and len(financials.columns) > 0:
                latest_quarter = financials.columns[0]
                financial_data = {
                    'revenue': float(financials.loc['Total Revenue', latest_quarter]) if 'Total Revenue' in financials.index else None,
                    'net_income': float(financials.loc['Net Income', latest_quarter]) if 'Net Income' in financials.index else None,
                }
                company_data['financials'] = financial_data
            
            # Add cash data
            if not balance_sheet.empty and len(balance_sheet.columns) > 0:
                latest_bs = balance_sheet.columns[0]
                company_data['cash'] = float(balance_sheet.loc['Cash', latest_bs]) if 'Cash' in balance_sheet.index else None
            
        except Exception as e:
            print(f"Error getting financials: {e}")
            company_data['financials'] = {}
        
        # Get news
        try:
            news = stock.news
            news_data = []
            for item in news[:5]:  # Limit to 5 news items
                news_data.append({
                    'title': item.get('title', ''),
                    'publisher': item.get('publisher', ''),
                    'link': item.get('link', ''),
                    'published': datetime.fromtimestamp(item.get('providerPublishTime', 0)).strftime('%Y-%m-%d %H:%M:%S')
                })
            company_data['news'] = news_data
        except Exception as e:
            print(f"Error getting news: {e}")
            company_data['news'] = []

        return jsonify({
            'company': company_data,
            'historical_data': result
        })

    except Exception as e:
        print(f"Error fetching stock data: {e}")
        return jsonify({"error": str(e)}), 500


# Endpoint to get top traded stocks with real data
@stock_bp.route('/api/top_stocks', methods=['GET'])
def get_top_stocks():

    # Lista delle azioni più popolari/importanti da monitorare
    popular_symbols = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 
        'TSLA', 'NVDA', 'JPM', 'V', 'WMT'
    ]
    
    top_stocks = {}
    
    # Scarica i dati per ogni simbolo
    for symbol in popular_symbols:

        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist = ticker.history(period="2d")  # Ottieni 2 giorni per calcolare la variazione percentuale
        
        if not hist.empty and len(hist) > 0:
            # Ottieni il prezzo attuale
            current_price = float(hist['Close'].iloc[-1])
            
            # Calcola la variazione percentuale
            if len(hist) > 1:
                prev_close = float(hist['Close'].iloc[-2])
                change_percent = ((current_price - prev_close) / prev_close) * 100
            else:
                change_percent = 0  # Se abbiamo solo un giorno di dati
            
            # Salva i dati
            top_stocks[symbol] = {
                'name': info.get('longName', symbol),
                'current_price': current_price,
                'change_percent': change_percent
            }

    # Converti in struttura top_stocks per compatibilità col frontend
    return jsonify({"top_stocks": top_stocks})
        


@stock_bp.route('/api/market_overview', methods=['GET'])
def get_market_overview():
    try:
        # Indici principali
        indices = {
            '^GSPC': 'S&P 500',
            '^DJI': 'Dow Jones',
            '^IXIC': 'NASDAQ',
            '^FTSE': 'FTSE 100',
            '^N225': 'Nikkei 225'
        }
        
        indices_data = {}
        for symbol, name in indices.items():
            try:
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period="1d")
                if not hist.empty:
                    last_close = float(hist['Close'].iloc[-1])
                    prev_close = float(hist['Close'].iloc[-2]) if len(hist) > 1 else last_close
                    change_percent = ((last_close - prev_close) / prev_close) * 100
                    
                    indices_data[symbol] = {
                        'name': name,
                        'price': last_close,
                        'change_percent': change_percent
                    }
            except Exception as e:
                print(f"Error fetching index {symbol}: {e}")
        
        # Market trends - esempio basato sui settori
        sectors = [
            'XLK', # Technology
            'XLF', # Financial
            'XLV', # Healthcare
            'XLE', # Energy
            'XLI', # Industrial
            'XLP', # Consumer Staples
            'XLY', # Consumer Discretionary
            'XLU', # Utilities
            'XLB', # Materials
            'XLRE' # Real Estate
        ]
        
        sectors_data = {}
        sector_names = {
            'XLK': 'Technology',
            'XLF': 'Financial',
            'XLV': 'Healthcare',
            'XLE': 'Energy',
            'XLI': 'Industrial',
            'XLP': 'Consumer Staples',
            'XLY': 'Consumer Discretionary',
            'XLU': 'Utilities',
            'XLB': 'Materials',
            'XLRE': 'Real Estate'
        }
        
        for symbol in sectors:
            try:
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period="5d")
                if not hist.empty:
                    last_close = float(hist['Close'].iloc[-1])
                    prev_close = float(hist['Close'].iloc[-5]) if len(hist) >= 5 else float(hist['Close'].iloc[0])
                    change_percent = ((last_close - prev_close) / prev_close) * 100
                    
                    sectors_data[symbol] = {
                        'name': sector_names.get(symbol, symbol),
                        'price': last_close,
                        'change_percent': change_percent
                    }
            except Exception as e:
                print(f"Error fetching sector {symbol}: {e}")
        
        # Top gainers e losers
        popular_stocks = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 
            'V', 'PG', 'JNJ', 'WMT', 'MA', 'DIS', 'BAC', 'INTC', 'VZ', 'NFLX',
            'PYPL', 'CSCO', 'ADBE', 'CRM', 'XOM', 'KO', 'T', 'PFE', 'CMCSA', 'PEP'
        ]
        
        stocks_data = {}
        for symbol in popular_stocks:
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                hist = ticker.history(period="1d")
                
                if not hist.empty and 'longName' in info:
                    last_close = float(hist['Close'].iloc[-1])
                    prev_close = info.get('previousClose', last_close)
                    change_percent = ((last_close - prev_close) / prev_close) * 100
                    
                    stocks_data[symbol] = {
                        'name': info.get('longName', symbol),
                        'sector': info.get('sector', 'Unknown'),
                        'price': last_close,
                        'change_percent': change_percent,
                        'market_cap': info.get('marketCap', None)
                    }
            except Exception as e:
                print(f"Error fetching stock {symbol}: {e}")
        
        # Ordinare per performance
        if stocks_data:
            gainers = dict(sorted(stocks_data.items(), key=lambda x: x[1]['change_percent'], reverse=True)[:10])
            losers = dict(sorted(stocks_data.items(), key=lambda x: x[1]['change_percent'])[:10])
            
            # Organizza per settore
            by_sector = {}
            for symbol, data in stocks_data.items():
                sector = data.get('sector', 'Unknown')
                if sector not in by_sector:
                    by_sector[sector] = {}
                by_sector[sector][symbol] = data
        
        # Dati di mercato generali
        market_data = {
            'total_stocks': len(stocks_data),
            'advancing': sum(1 for stock in stocks_data.values() if stock['change_percent'] > 0),
            'declining': sum(1 for stock in stocks_data.values() if stock['change_percent'] < 0)
        }
        
        return jsonify({
            'indices': indices_data,
            'sectors': sectors_data,
            'gainers': gainers,
            'losers': losers,
            'by_sector': by_sector,
            'market_data': market_data,
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
        
    except Exception as e:
        print(f"Error getting market overview: {e}")
        return jsonify({"error": str(e)}), 500

@stock_bp.route('/api/stocks_by_sector', methods=['GET'])
def get_stocks_by_sector():
    sector = request.args.get('sector', 'Technology')
    limit = request.args.get('limit', 10, type=int)
    
    try:
        # Utilizziamo la libreria yfinance per ottenere titoli del settore specifico
        # In un ambiente di produzione, dovresti utilizzare un database o un'API che fornisce queste informazioni
        
        # Questo è un approccio semplificato per dimostrare la struttura
        if sector == 'Technology':
            stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'INTC', 'CSCO', 'ADBE', 'CRM']
        elif sector == 'Financial':
            stocks = ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'AXP', 'V', 'MA', 'BLK']
        elif sector == 'Healthcare':
            stocks = ['JNJ', 'PFE', 'UNH', 'MRK', 'ABT', 'ABBV', 'TMO', 'BMY', 'LLY', 'AMGN']
        else:
            stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META']  # Default
        
        stocks = stocks[:limit]
        result = {}
        
        for symbol in stocks:
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                hist = ticker.history(period="1d")
                
                if not hist.empty and 'longName' in info:
                    last_close = float(hist['Close'].iloc[-1])
                    prev_close = info.get('previousClose', last_close)
                    change_percent = ((last_close - prev_close) / prev_close) * 100
                    
                    result[symbol] = {
                        'name': info.get('longName', symbol),
                        'price': last_close,
                        'change_percent': change_percent,
                        'market_cap': info.get('marketCap', None)
                    }
            except Exception as e:
                print(f"Error fetching stock {symbol}: {e}")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error getting stocks by sector: {e}")
        return jsonify({"error": str(e)}), 500
# Endpoint for stock search
@stock_bp.route('/api/search_stock', methods=['GET'])
def search_stock():
    query = request.args.get('query', '')
    if not query or len(query) < 2:
        return jsonify([])
    
    try:
        # This is a simplified search. In production, you'd use a better search mechanism
        results = yf.Tickers(query).tickers
        search_results = []
        
        for symbol, ticker in results.items():
            try:
                info = ticker.info
                if 'longName' in info:
                    search_results.append({
                        'symbol': symbol,
                        'name': info.get('longName', 'N/A'),
                        'exchange': info.get('exchange', 'N/A')
                    })
            except:
                pass
                
        return jsonify(search_results[:10])  # Limit to 10 results
    
    except Exception as e:
        print(f"Error searching stocks: {e}")
        return jsonify([])
    
# backend/routes/stock.py
@stock_bp.route('/api/stock_batch', methods=['GET'])
def get_stock_batch():
    symbols = request.args.get('symbols', '')
    if not symbols:
        return jsonify({'error': 'No symbols provided'}), 400
    
    symbol_list = symbols.split(',')
    result = {}
    
    for symbol in symbol_list:
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.info
            
            result[symbol] = {
                'symbol': symbol,
                'current_price': data.get('currentPrice', None),
                'price_change_24h': data.get('regularMarketChange', 0),
                'price_change_percentage_24h': data.get('regularMarketChangePercent', 0) * 100,
                'name': data.get('shortName', symbol)
            }
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
    
    return jsonify(result)