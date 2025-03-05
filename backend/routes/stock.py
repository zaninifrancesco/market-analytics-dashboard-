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
        company_name = stock.info['longName']
        data = stock.history(period=period)
        if data.empty:
            return jsonify({'error': 'No data found for the provided symbol or period.'}), 404

        # Converte i dati in un formato che include il simbolo
        result = []
        for index, row in data[['Open', 'Close', 'High', 'Low', 'Volume']].iterrows():
            result.append({
                'Date': index.strftime('%Y-%m-%d'),
                'Symbol': symbol,
                'Company_Name': company_name,
                'Open': row['Open'],
                'Close': row['Close'],
                'High': row['High'],
                'Low': row['Low'],
                'Volume': row['Volume']
            })
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500