# routes/stock.py

import yfinance as yf
from flask import Blueprint, jsonify, request

stock_bp = Blueprint('stock_bp', __name__)

# Endpoint per i dati azionari
@stock_bp.route('/api/stock_data/<string:symbol>', methods=['GET'])
def get_stock_data(symbol):
    period = request.args.get('period', default='1d', type=str)
    try:
        stock = yf.Ticker(symbol)
        data = stock.history(period=period)
        if data.empty:
            return jsonify({'error': 'No data found for the provided symbol or period.'}), 404

        result = data[['Open', 'Close', 'High', 'Low', 'Volume']].to_dict('records')
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
