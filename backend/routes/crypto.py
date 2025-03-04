# routes/crypto.py

import requests
from flask import Blueprint, jsonify, request

crypto_bp = Blueprint('crypto_bp', __name__)

# Nuovo endpoint per i dati delle criptovalute usando Binance API
@crypto_bp.route('/api/crypto_data/<string:symbol>', methods=['GET'])
def get_crypto_data(symbol):
    interval = request.args.get('interval', default='1d', type=str)
    limit = request.args.get('limit', default=30, type=int)
    try:
        url = f"https://api.binance.com/api/v3/klines?symbol={symbol}&interval={interval}&limit={limit}"
        response = requests.get(url)
        data = response.json()

        if isinstance(data, dict) and data.get("msg"):
            return jsonify({'error': data.get("msg")}), 400

        result = []
        for entry in data:
            result.append({
                "open_time": entry[0],
                "open": entry[1],
                "high": entry[2],
                "low": entry[3],
                "close": entry[4],
                "volume": entry[5],
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
