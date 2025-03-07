# routes/indicators.py

from flask import Blueprint, jsonify, request
import pandas_ta as ta
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta

indicators_bp = Blueprint('indicators_bp', __name__)

@indicators_bp.route('/api/technical_indicators/<symbol>', methods=['GET'])
def technical_indicators(symbol):
    try:
        # Get historical price data using yfinance instead of alpha_vantage
        ticker = yf.Ticker(symbol)
        df = ticker.history(period="60d")  # Get 60 days of data for technical indicators
        
        if len(df) < 30:
            return jsonify({'error': 'Not enough data for calculation'}), 400

        # Rename columns to match expected format for pandas_ta
        df = df.rename(columns={
            'Open': 'open',
            'High': 'high',
            'Low': 'low',
            'Close': 'close',
            'Volume': 'volume'
        })
        
        # Calculate RSI (14-period)
        rsi = ta.rsi(df['close'], length=14)
        
        # Calculate SMA (50-period)
        sma = ta.sma(df['close'], length=50)
        
        # Calculate EMA (20-period)
        ema = ta.ema(df['close'], length=20)
        
        # Calculate VWAP if volume is available
        vwap = None
        if 'volume' in df.columns:
            # In a real-time trading context, VWAP is calculated for a single day
            # For this API, we'll calculate a rolling VWAP over the last 20 days
            df['vwap'] = (df['close'] * df['volume']).rolling(window=20).sum() / df['volume'].rolling(window=20).sum()
            vwap = df['vwap'].iloc[-1]
        
        # Get the most recent price
        current_price = df['close'].iloc[-1]
        
        # Format the result
        result = {
            'symbol': symbol.upper(),
            'current_price': current_price,
            'indicators': {
                'RSI': round(float(rsi.iloc[-1]), 2) if not pd.isna(rsi.iloc[-1]) else None,
                'SMA_50': round(float(sma.iloc[-1]), 2) if not pd.isna(sma.iloc[-1]) else None,
                'EMA_20': round(float(ema.iloc[-1]), 2) if not pd.isna(ema.iloc[-1]) else None,
                'VWAP': round(float(vwap), 2) if vwap is not None and not pd.isna(vwap) else None
            }
        }
        
        # Add simple signals based on indicators
        signals = []
        
        # RSI signals
        if result['indicators']['RSI'] is not None:
            rsi_value = result['indicators']['RSI'] 
            if rsi_value < 30:
                signals.append({"indicator": "RSI", "signal": "Oversold", "strength": "Strong"})
            elif rsi_value < 40:
                signals.append({"indicator": "RSI", "signal": "Oversold", "strength": "Moderate"})
            elif rsi_value > 70:
                signals.append({"indicator": "RSI", "signal": "Overbought", "strength": "Strong"})
            elif rsi_value > 60:
                signals.append({"indicator": "RSI", "signal": "Overbought", "strength": "Moderate"})
        
        # Price vs SMA signal
        if result['indicators']['SMA_50'] is not None:
            sma_value = result['indicators']['SMA_50']
            price_to_sma_ratio = current_price / sma_value
            if price_to_sma_ratio > 1.05:
                signals.append({"indicator": "SMA_50", "signal": "Above", "strength": "Strong"})
            elif price_to_sma_ratio > 1:
                signals.append({"indicator": "SMA_50", "signal": "Above", "strength": "Moderate"})
            elif price_to_sma_ratio < 0.95:
                signals.append({"indicator": "SMA_50", "signal": "Below", "strength": "Strong"})
            elif price_to_sma_ratio < 1:
                signals.append({"indicator": "SMA_50", "signal": "Below", "strength": "Moderate"})
        
        # Price vs EMA signal
        if result['indicators']['EMA_20'] is not None:
            ema_value = result['indicators']['EMA_20']
            price_to_ema_ratio = current_price / ema_value
            if price_to_ema_ratio > 1.03:
                signals.append({"indicator": "EMA_20", "signal": "Above", "strength": "Strong"})
            elif price_to_ema_ratio > 1:
                signals.append({"indicator": "EMA_20", "signal": "Above", "strength": "Moderate"})
            elif price_to_ema_ratio < 0.97:
                signals.append({"indicator": "EMA_20", "signal": "Below", "strength": "Strong"})
            elif price_to_ema_ratio < 1:
                signals.append({"indicator": "EMA_20", "signal": "Below", "strength": "Moderate"})
        
        # Add VWAP signal
        if result['indicators']['VWAP'] is not None:
            vwap_value = result['indicators']['VWAP']
            price_to_vwap_ratio = current_price / vwap_value
            if price_to_vwap_ratio > 1.02:
                signals.append({"indicator": "VWAP", "signal": "Above", "strength": "Strong"})
            elif price_to_vwap_ratio > 1:
                signals.append({"indicator": "VWAP", "signal": "Above", "strength": "Moderate"})
            elif price_to_vwap_ratio < 0.98:
                signals.append({"indicator": "VWAP", "signal": "Below", "strength": "Strong"})
            elif price_to_vwap_ratio < 1:
                signals.append({"indicator": "VWAP", "signal": "Below", "strength": "Moderate"})
        
        # Calculate simple trend based on recent price action
        if len(df) >= 10:
            short_trend = df['close'].iloc[-5:].mean()
            long_trend = df['close'].iloc[-10:].mean()
            
            if short_trend > long_trend * 1.02:
                signals.append({"indicator": "Trend", "signal": "Bullish", "strength": "Strong"})
            elif short_trend > long_trend:
                signals.append({"indicator": "Trend", "signal": "Bullish", "strength": "Moderate"})
            elif short_trend < long_trend * 0.98:
                signals.append({"indicator": "Trend", "signal": "Bearish", "strength": "Strong"})
            elif short_trend < long_trend:
                signals.append({"indicator": "Trend", "signal": "Bearish", "strength": "Moderate"})
        
        result['signals'] = signals
        
        # Add historical indicator data for charts (last 30 points)
        chart_length = min(30, len(df))
        historical = []
        
        for i in range(-chart_length, 0):
            point = {
                'date': df.index[i].strftime('%Y-%m-%d'),
                'close': float(df['close'].iloc[i]),
                'rsi': None if pd.isna(rsi.iloc[i]) else float(rsi.iloc[i]),
                'sma50': None if pd.isna(sma.iloc[i]) else float(sma.iloc[i]),
                'ema20': None if pd.isna(ema.iloc[i]) else float(ema.iloc[i]),
            }
            if 'vwap' in df.columns and not pd.isna(df['vwap'].iloc[i]):
                point['vwap'] = float(df['vwap'].iloc[i])
            
            historical.append(point)
        
        result['historical'] = historical
        
        return jsonify(result)
    except Exception as e:
        print(f"Error calculating technical indicators: {e}")
        return jsonify({'error': str(e)}), 500