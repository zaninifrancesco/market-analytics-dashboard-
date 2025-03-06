# routes/news.py

import requests
from flask import Blueprint, jsonify
from config import NEWS_API_KEY
from datetime import datetime, timedelta

news_bp = Blueprint('news_bp', __name__)

@news_bp.route('/api/economic_news', methods=['GET'])
def get_economic_news():
    url = f'https://newsapi.org/v2/everything?q=economy&apiKey={NEWS_API_KEY}'

    try:
        response = requests.get(url)
        data = response.json()

        if data['status'] != 'ok':
            return jsonify({'error': 'Unable to fetch news'}), 500

        articles = data['articles']
        result = []
        for article in articles:
            result.append({
                'title': article['title'],
                'description': article['description'],
                'url': article['url'],
                'publishedAt': article['publishedAt']
            })

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@news_bp.route('/api/financial_news', methods=['GET'])
def get_financial_news():
    """
    Endpoint per ottenere notizie finanziarie generali
    Questa API recupera notizie su finanza, mercati finanziari e tendenze economiche
    """
    # Calcola la data di 7 giorni fa per limitare i risultati recenti
    week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    
    # Parametri per l'API: notizie finanziarie generali in inglese
    url = f'https://newsapi.org/v2/everything?q=(finance OR economy OR "financial markets") AND (stocks OR investing)&language=en&from={week_ago}&sortBy=publishedAt&apiKey={NEWS_API_KEY}'

    try:
        response = requests.get(url)
        data = response.json()

        if data['status'] != 'ok':
            return jsonify({'error': 'Unable to fetch financial news'}), 500

        articles = data['articles'][:15]  # Limitiamo a 15 articoli
        
        # Formattare gli articoli per la risposta
        result = []
        for article in articles:
            result.append({
                'title': article.get('title', ''),
                'description': article.get('description', ''),
                'url': article.get('url', ''),
                'urlToImage': article.get('urlToImage', ''),
                'publishedAt': article.get('publishedAt', ''),
                'source': article.get('source', {'name': 'Unknown'})
            })

        return jsonify({'articles': result})
    except Exception as e:
        print(f"Error fetching financial news: {e}")
        return jsonify({'error': str(e), 'articles': []}), 500


@news_bp.route('/api/market_news', methods=['GET'])
def get_market_news():
    """
    Endpoint per ottenere notizie specifiche sui mercati azionari
    Questa API recupera notizie su indici, azioni specifiche e analisi di mercato
    """
    # Calcola la data di 4 giorni fa per avere notizie più recenti
    days_ago = (datetime.now() - timedelta(days=4)).strftime('%Y-%m-%d')
    
    # Parametri per l'API: notizie specifiche sui mercati azionari
    url = f'https://newsapi.org/v2/everything?q=(stock market OR "wall street" OR "stock exchange" OR "stock trading" OR nasdaq OR dow OR "S&P 500")&language=en&from={days_ago}&sortBy=relevancy&apiKey={NEWS_API_KEY}'

    try:
        response = requests.get(url)
        data = response.json()

        if data['status'] != 'ok':
            return jsonify({'error': 'Unable to fetch market news'}), 500

        articles = data['articles'][:15]  # Limitiamo a 15 articoli
        
        # Formattare gli articoli per la risposta
        result = []
        for article in articles:
            result.append({
                'title': article.get('title', ''),
                'description': article.get('description', ''),
                'url': article.get('url', ''),
                'urlToImage': article.get('urlToImage', ''),
                'publishedAt': article.get('publishedAt', ''),
                'source': article.get('source', {'name': 'Unknown'})
            })

        return jsonify({'news': result})
    except Exception as e:
        print(f"Error fetching market news: {e}")
        return jsonify({'error': str(e), 'news': []}), 500


@news_bp.route('/api/crypto_news', methods=['GET'])
def get_crypto_news():
    """
    Endpoint per ottenere notizie sul mondo crypto
    Questa API recupera notizie su Bitcoin, Ethereum e altre criptovalute
    """
    # Calcola la data di 5 giorni fa
    days_ago = (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d')
    
    # Parametri per l'API: notizie sulle criptovalute
    url = f'https://newsapi.org/v2/everything?q=(cryptocurrency OR bitcoin OR ethereum OR "crypto market" OR blockchain)&language=en&from={days_ago}&sortBy=publishedAt&apiKey={NEWS_API_KEY}'

    try:
        response = requests.get(url)
        data = response.json()

        if data['status'] != 'ok':
            return jsonify({'error': 'Unable to fetch crypto news'}), 500

        articles = data['articles'][:15]  # Limitiamo a 15 articoli
        
        # Formattare gli articoli per la risposta
        result = []
        for article in articles:
            result.append({
                'title': article.get('title', ''),
                'description': article.get('description', ''),
                'url': article.get('url', ''),
                'urlToImage': article.get('urlToImage', ''),
                'publishedAt': article.get('publishedAt', ''),
                'source': article.get('source', {'name': 'Unknown'})
            })

        return jsonify({'news': result})
    except Exception as e:
        print(f"Error fetching crypto news: {e}")
        return jsonify({'error': str(e), 'news': []}), 500