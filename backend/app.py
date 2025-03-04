# app.py

from flask import Flask
from routes.stock import stock_bp
from routes.crypto import crypto_bp
from routes.news import news_bp
from routes.indicators import indicators_bp
from routes.search import search_bp

app = Flask(__name__)

# Registrazione delle route
app.register_blueprint(stock_bp)
app.register_blueprint(crypto_bp)
app.register_blueprint(news_bp)
app.register_blueprint(indicators_bp)
app.register_blueprint(search_bp)

@app.route('/')
def home():
    return "Welcome to the Stock and Crypto Data API!"

if __name__ == '__main__':
    app.run(debug=True)
