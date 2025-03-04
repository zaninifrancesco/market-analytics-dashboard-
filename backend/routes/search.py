from flask import Blueprint, request, jsonify

# Crea il blueprint per le route di ricerca
search_bp = Blueprint('search', __name__)

@search_bp.route('/api/search_symbol', methods=['GET'])
def search_symbol():
    query = request.args.get('query', default='', type=str)
    if not query:
        return jsonify({'error': 'No query provided'}), 400
    
    # Simboli predefiniti per esempio (questo potrebbe essere esteso o integrato con un database o una fonte esterna)
    stock_symbols = ['AAPL', 'GOOG', 'MSFT', 'TSLA', 'AMZN']
    crypto_symbols = ['BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'LTCUSDT']

    # Cerca tra i simboli di azioni e criptovalute
    matched_stocks = [s for s in stock_symbols if query.lower() in s.lower()]
    matched_cryptos = [s for s in crypto_symbols if query.lower() in s.lower()]

    # Restituisce i risultati
    return jsonify({
        'stocks': matched_stocks,
        'cryptos': matched_cryptos
    })
