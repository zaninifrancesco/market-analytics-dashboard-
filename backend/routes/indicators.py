# routes/indicators.py

from flask import Blueprint, jsonify
import pandas_ta as ta
from utils.alpha_vantage import get_historical_data

indicators_bp = Blueprint('indicators_bp', __name__)

@indicators_bp.route('/api/technical_indicators/<symbol>', methods=['GET'])
def technical_indicators(symbol):
    try:
        prices = get_historical_data(symbol)

        if len(prices) < 30:
            return jsonify({'error': 'Not enough data for calculation'}), 400

        rsi = ta.rsi(prices, length=14)
        sma = ta.sma(prices, length=50)

        result = {
            'RSI': rsi.iloc[-1],
            'SMA': sma.iloc[-1]
        }

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
