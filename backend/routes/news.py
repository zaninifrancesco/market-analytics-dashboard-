# routes/news.py

import requests
from flask import Blueprint, jsonify
from config import NEWS_API_KEY

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
