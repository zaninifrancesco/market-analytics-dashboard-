# routes/stock.py
from flask import Blueprint, jsonify, request
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import numpy as np

stock_bp = Blueprint('stock_bp', __name__)

# Endpoint per i dati azionari
@stock_bp.route('/api/stock_data/<string:symbol>', methods=['GET'])
def get_stock_data(symbol):
    """
    Recupera dati azionari dettagliati per un dato simbolo con intervalli di tempo appropriati.
    
    Args:
        symbol: Simbolo ticker dell'azione
        
    Query Parameters:
        period: Periodo di tempo per i dati storici (default: '1d')
        
    Returns:
        JSON con informazioni sull'azienda e dati storici dei prezzi
    """
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
        # Ottieni informazioni sull'azienda
        company_info = stock.info
        
        # Ottieni dati storici con la granularità appropriata
        data = stock.history(period=period, interval=interval)
        
        if data.empty:
            return jsonify({"error": f"Nessun dato disponibile per {symbol}"}), 404

        # Calcola VWAP se il volume è disponibile
        if 'Volume' in data.columns and len(data) > 0:
            data['VWAP'] = (data['Close'] * data['Volume']).cumsum() / data['Volume'].cumsum()
        
        # Converti in lista di dizionari per la risposta JSON
        result = []
        for index, row in data.iterrows():
            # Formatta il timestamp in base all'intervallo
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
        
        # Estrai le informazioni chiave dell'azienda
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

        # Ottieni dati finanziari
        try:
            financials = stock.financials
            balance_sheet = stock.balance_sheet
            cash_flow = stock.cashflow
            
            # Estrai le metriche finanziarie chiave (trimestre più recente)
            if not financials.empty and len(financials.columns) > 0:
                latest_quarter = financials.columns[0]
                financial_data = {
                    'revenue': float(financials.loc['Total Revenue', latest_quarter]) if 'Total Revenue' in financials.index else None,
                    'net_income': float(financials.loc['Net Income', latest_quarter]) if 'Net Income' in financials.index else None,
                }
                company_data['financials'] = financial_data
            
            # Aggiungi dati sulla liquidità
            if not balance_sheet.empty and len(balance_sheet.columns) > 0:
                latest_bs = balance_sheet.columns[0]
                company_data['cash'] = float(balance_sheet.loc['Cash', latest_bs]) if 'Cash' in balance_sheet.index else None
            
        except Exception as e:
            print(f"Errore nel recupero dei dati finanziari: {e}")
            company_data['financials'] = {}
        
        # Ottieni notizie
        try:
            news = stock.news
            news_data = []
            for item in news[:5]:  # Limita a 5 notizie
                news_data.append({
                    'title': item.get('title', ''),
                    'publisher': item.get('publisher', ''),
                    'link': item.get('link', ''),
                    'published': datetime.fromtimestamp(item.get('providerPublishTime', 0)).strftime('%Y-%m-%d %H:%M:%S')
                })
            company_data['news'] = news_data
        except Exception as e:
            print(f"Errore nel recupero delle notizie: {e}")
            company_data['news'] = []

        return jsonify({
            'company': company_data,
            'historical_data': result
        })

    except Exception as e:
        print(f"Errore nel recupero dei dati azionari: {e}")
        return jsonify({"error": str(e)}), 500


# Endpoint per ottenere le azioni più scambiate con dati reali
@stock_bp.route('/api/top_stocks', methods=['GET'])
def get_top_stocks():
    """
    Ottieni dati per una lista di azioni popolari/principali.
    
    Returns:
        JSON con i dati delle azioni principali, inclusi prezzo corrente e variazione percentuale del prezzo
    """
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
    """
    Fornisce una panoramica completa del mercato che include indici, settori e performance azionarie.
    
    Returns:
        JSON con indici di mercato, performance dei settori, top gainers, losers e suddivisione per settore
    """
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
                hist = ticker.history(period="1d") # Modificato da 2d a 1d per coerenza con altri endpoint e per evitare errori se ci sono meno di 2 giorni di dati disponibili
                if not hist.empty:
                    last_close = float(hist['Close'].iloc[-1])
                    # Usa il prezzo di chiusura precedente da info se disponibile, altrimenti l'ultimo prezzo di chiusura se hist ha solo una riga
                    prev_close_info = ticker.info.get('previousClose')
                    if prev_close_info:
                         prev_close = float(prev_close_info)
                    elif len(hist) > 1:
                        prev_close = float(hist['Close'].iloc[-2])
                    else:
                        prev_close = last_close # Se c'è solo un giorno, la variazione è 0

                    change_percent = ((last_close - prev_close) / prev_close) * 100 if prev_close != 0 else 0
                    
                    indices_data[symbol] = {
                        'name': name,
                        'price': last_close,
                        'change_percent': change_percent
                    }
            except Exception as e:
                print(f"Errore nel recupero dell'indice {symbol}: {e}")
        

        sectors = [
            'XLK', # Tecnologia
            'XLF', # Finanziario
            'XLV', # Sanitario
            'XLE', # Energia
            'XLI', # Industriale
            'XLP', # Beni di consumo primari
            'XLY', # Beni di consumo discrezionali
            'XLU', # Utilities
            'XLB', # Materiali
            'XLRE' # Immobiliare
        ]
        
        sectors_data = {}
        sector_names = {
            'XLK': 'Tecnologia',
            'XLF': 'Finanziario',
            'XLV': 'Sanitario',
            'XLE': 'Energia',
            'XLI': 'Industriale',
            'XLP': 'Beni di consumo primari',
            'XLY': 'Beni di consumo discrezionali',
            'XLU': 'Utilities',
            'XLB': 'Materiali',
            'XLRE': 'Immobiliare'
        }
        
        for symbol in sectors:
            try:
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period="5d")
                if not hist.empty:
                    last_close = float(hist['Close'].iloc[-1])
                    prev_close = float(hist['Close'].iloc[-5]) if len(hist) >= 5 else float(hist['Close'].iloc[0])
                    change_percent = ((last_close - prev_close) / prev_close) * 100 if prev_close != 0 else 0
                    
                    sectors_data[symbol] = {
                        'name': sector_names.get(symbol, symbol),
                        'price': last_close,
                        'change_percent': change_percent
                    }
            except Exception as e:
                print(f"Errore nel recupero del settore {symbol}: {e}")
        
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
                hist = ticker.history(period="1d") # Coerenza con l'endpoint degli indici
                
                if not hist.empty and 'longName' in info:
                    last_close = float(hist['Close'].iloc[-1])
                    prev_close = info.get('previousClose', last_close) # Usa previousClose da info per maggiore accuratezza
                    change_percent = ((last_close - prev_close) / prev_close) * 100 if prev_close != 0 else 0
                    
                    stocks_data[symbol] = {
                        'name': info.get('longName', symbol),
                        'sector': info.get('sector', 'Sconosciuto'),
                        'price': last_close,
                        'change_percent': change_percent,
                        'market_cap': info.get('marketCap', None)
                    }
            except Exception as e:
                print(f"Errore nel recupero dell'azione {symbol}: {e}")
        
        gainers = {}
        losers = {}
        by_sector = {}
        # Ordinare per performance
        if stocks_data:
            gainers = dict(sorted(stocks_data.items(), key=lambda x: x[1]['change_percent'], reverse=True)[:10])
            losers = dict(sorted(stocks_data.items(), key=lambda x: x[1]['change_percent'])[:10])
            
            # Organizza per settore
            
            for symbol, data in stocks_data.items():
                sector = data.get('sector', 'Sconosciuto')
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
        print(f"Errore nel recupero della panoramica di mercato: {e}")
        return jsonify({"error": str(e)}), 500

@stock_bp.route('/api/stocks_by_sector', methods=['GET'])
def get_stocks_by_sector():
    """
    Ottieni azioni filtrate per settore.
    
    Query Parameters:
        sector: Settore di mercato per filtrare (default: 'Technology')
        limit: Numero massimo di azioni da restituire (default: 10)
        
    Returns:
        JSON con le azioni nel settore specificato
    """
    sector = request.args.get('sector', 'Technology')
    limit = request.args.get('limit', 10, type=int)
    
    try:
        if sector == 'Technology':
            stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'INTC', 'CSCO', 'ADBE', 'CRM']
        elif sector == 'Financial':
            stocks = ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'AXP', 'V', 'MA', 'BLK']
        elif sector == 'Healthcare':
            stocks = ['JNJ', 'PFE', 'UNH', 'MRK', 'ABT', 'ABBV', 'TMO', 'BMY', 'LLY', 'AMGN']
        # Aggiungere altri settori se necessario
        else:
            # Fallback generico o errore se il settore non è gestito
            stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'] 
        
        stocks = stocks[:limit]
        result = {}
        
        for symbol in stocks:
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                hist = ticker.history(period="1d") # Coerenza
                
                if not hist.empty and 'longName' in info:
                    last_close = float(hist['Close'].iloc[-1])
                    prev_close = info.get('previousClose', last_close) # Usa previousClose
                    change_percent = ((last_close - prev_close) / prev_close) * 100 if prev_close != 0 else 0
                    
                    result[symbol] = {
                        'name': info.get('longName', symbol),
                        'price': last_close,
                        'change_percent': change_percent,
                        'market_cap': info.get('marketCap', None)
                    }
            except Exception as e:
                print(f"Errore nel recupero dell'azione {symbol} per settore: {e}")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Errore nel recupero delle azioni per settore: {e}")
        return jsonify({"error": str(e)}), 500
# Endpoint per la ricerca di azioni
@stock_bp.route('/api/search_stock', methods=['GET'])
def search_stock():
    """
    Cerca azioni in base a una stringa di query.
    
    Query Parameters:
        query: Termine di ricerca per simbolo o nome dell'azione
        
    Returns:
        Array JSON di azioni corrispondenti con simboli e nomi
    """
    query = request.args.get('query', '')
    if not query or len(query) < 2: # Richiede almeno 2 caratteri per la ricerca
        return jsonify([])
    
    try:
        try:
            ticker_obj = yf.Ticker(query)
            info = ticker_obj.info
            if info and info.get('longName'): # Controlla se sono state recuperate informazioni valide
                 return jsonify([{
                    'symbol': query.upper(), # Assicurati che il simbolo sia maiuscolo
                    'name': info.get('longName', 'N/A'),
                    'exchange': info.get('exchange', 'N/A')
                }])
            else:
                # Se non trova info per la query come singolo ticker, restituisce lista vuota.
                return jsonify([])
        except Exception:
             # Se yf.Ticker fallisce (es. simbolo non valido), restituisce lista vuota.
            return jsonify([])

    except Exception as e:
        print(f"Errore nella ricerca delle azioni: {e}")
        return jsonify([]) # Restituisce lista vuota in caso di errore generico
    
# backend/routes/stock.py
@stock_bp.route('/api/stock_batch', methods=['GET'])
def get_stock_batch():
    """
    Ottieni dati di base per più azioni in una singola richiesta.
    
    Query Parameters:
        symbols: Lista di simboli azionari separati da virgola
        
    Returns:
        JSON con i dati per tutte le azioni richieste
    """
    symbols = request.args.get('symbols', '')
    if not symbols:
        return jsonify({'error': 'Nessun simbolo fornito'}), 400
    
    symbol_list = [s.strip().upper() for s in symbols.split(',') if s.strip()] # Pulisce e mette in maiuscolo i simboli
    if not symbol_list:
        return jsonify({'error': 'Lista di simboli non valida'}), 400
        
    result = {}
    
    # Utilizza yf.Tickers per un recupero batch più efficiente
    tickers_data = yf.Tickers(symbol_list)
    
    for symbol in symbol_list:
        try:
            # Accedi ai dati del singolo ticker dall'oggetto Tickers
            ticker_info = tickers_data.tickers[symbol].info
            
            if not ticker_info or not ticker_info.get('regularMarketPrice'): # Controlla se ci sono dati validi
                print(f"Dati non sufficienti per {symbol}")
                result[symbol] = {
                    'symbol': symbol,
                    'name': symbol, # Fallback al simbolo se il nome non è disponibile
                    'current_price': None,
                    'price_change_24h': None,
                    'price_change_percentage_24h': None,
                    'error': 'Dati non disponibili o incompleti'
                }
                continue

            current_price = ticker_info.get('regularMarketPrice', ticker_info.get('currentPrice'))
            previous_close = ticker_info.get('regularMarketPreviousClose', ticker_info.get('previousClose'))
            
            price_change = None
            price_change_percentage = None

            if current_price is not None and previous_close is not None:
                price_change = current_price - previous_close
                if previous_close != 0: # Evita divisione per zero
                    price_change_percentage = (price_change / previous_close) * 100
                else:
                    price_change_percentage = 0 # O None, a seconda di come si vuole gestire
            
            result[symbol] = {
                'symbol': symbol,
                'current_price': current_price,
                'price_change_24h': price_change,
                'price_change_percentage_24h': price_change_percentage,
                'name': ticker_info.get('shortName', ticker_info.get('longName', symbol))
            }
        except Exception as e:
            print(f"Errore nel recupero dei dati per {symbol}: {e}")
            result[symbol] = {
                'symbol': symbol,
                'name': symbol,
                'current_price': None,
                'price_change_24h': None,
                'price_change_percentage_24h': None,
                'error': str(e)
            }
            
    return jsonify(result)