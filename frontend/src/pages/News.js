import React, { useState, useEffect } from 'react';
import { ArrowUpIcon, ArrowDownIcon, ExternalLinkIcon, SearchIcon, RefreshCwIcon } from 'lucide-react';

function News() {
  const [news, setNews] = useState([]);
  const [cryptoNews, setCryptoNews] = useState([]);
  const [marketData, setMarketData] = useState({
    indices: {},
    crypto: {}
  });
  const [loading, setLoading] = useState(true);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        // Fetch general financial news
        const newsResponse = await fetch('https://market-analytics-dashboard.onrender.com/api/financial_news');
        
        // Fetch crypto news
        const cryptoResponse = await fetch('https://market-analytics-dashboard.onrender.com/api/crypto_news');
        
        if (!newsResponse.ok || !cryptoResponse.ok) {
          throw new Error('Failed to fetch news data');
        }
        
        const newsData = await newsResponse.json();
        const cryptoData = await cryptoResponse.json();
        
        setNews(newsData.articles || []);
        setCryptoNews(cryptoData.news || []);
        
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchMarketData = async () => {
      setLoadingMarket(true);
      try {
        // Fetch stock market data from our stock.py endpoint
        const stockResponse = await fetch('https://market-analytics-dashboard.onrender.com/api/market_overview');
        
        // Fetch crypto market data from our crypto.py endpoint
        const cryptoResponse = await fetch('https://market-analytics-dashboard.onrender.com/api/crypto_market_overview');
        
        if (!stockResponse.ok || !cryptoResponse.ok) {
          throw new Error('Failed to fetch market data');
        }
        
        const stockData = await stockResponse.json();
        const cryptoData = await cryptoResponse.json();
        
        setMarketData({
          indices: stockData.indices || {},
          crypto: cryptoData.indices || {}
        });
        
      } catch (err) {
        console.error('Error fetching market data:', err);
        // We won't set the main error state here to avoid blocking news display
      } finally {
        setLoadingMarket(false);
      }
    };
    
    fetchNews();
    fetchMarketData();
  }, []);
  
  // Filter news based on search query and active category
  const getFilteredNews = () => {
    let filteredNews = [];
    
    switch(activeCategory) {
      case 'financial':
        filteredNews = news;
        break;
      case 'crypto':
        filteredNews = cryptoNews;
        break;
      case 'all':
      default:
        filteredNews = [...news, ...cryptoNews];
        break;
    }
    
    if (searchQuery.trim() === '') return filteredNews;
    
    return filteredNews.filter(item => 
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };
  
  const filteredNews = getFilteredNews();
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Handle news category clicks
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };
  
  // Format price values
  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'N/A';
    return price >= 1000 ? price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) :
           price >= 1 ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) :
           price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  };
  
  // Render news card
  const NewsCard = ({ article }) => (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
      {article.urlToImage && (
        <div className="h-40 overflow-hidden">
          <img 
            src={article.urlToImage} 
            alt={article.title} 
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      )}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{article.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">{formatDate(article.publishedAt)} • {article.source?.name || 'Unknown Source'}</span>
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-amber-600 hover:text-amber-800 flex items-center text-sm font-medium"
          >
            Read More <ExternalLinkIcon size={14} className="ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
  
  // Loading state UI
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading latest financial news...</p>
        </div>
      </div>
    );
  }
  
  // Error state UI
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 inline-flex items-center text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded"
          >
            <RefreshCwIcon size={14} className="mr-1" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Financial News</h1>
        <p className="text-gray-600 mt-2">Stay updated with the latest market trends and financial insights</p>
      </div>
      
      {/* Search and filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SearchIcon className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search news..."
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full pl-10 p-2.5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            {['all', 'financial', 'crypto'].map(category => (
              <button
                key={category}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  activeCategory === category
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Market Summary Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Market Summary</h2>
        {loadingMarket ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mr-3"></div>
            <span className="text-sm text-gray-500">Loading market data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Stock market indices */}
            {Object.entries(marketData.indices).slice(0, 3).map(([symbol, data]) => (
              <div key={symbol} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{data.name}</span>
                  {data.change_percent >= 0 ? (
                    <span className="flex items-center text-green-600">
                      <ArrowUpIcon size={14} className="mr-1" />
                      <span className="text-xs font-semibold">{data.change_percent?.toFixed(2)}%</span>
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <ArrowDownIcon size={14} className="mr-1" />
                      <span className="text-xs font-semibold">{Math.abs(data.change_percent)?.toFixed(2)}%</span>
                    </span>
                  )}
                </div>
                <span className="block mt-1 text-lg font-bold">
                  ${formatPrice(data.price)}
                </span>
              </div>
            ))}
            
            {/* Crypto indices */}
            {Object.entries(marketData.crypto).slice(0, 2).map(([symbol, data]) => (
              <div key={symbol} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{data.name}</span>
                  {data.change_percent >= 0 ? (
                    <span className="flex items-center text-green-600">
                      <ArrowUpIcon size={14} className="mr-1" />
                      <span className="text-xs font-semibold">{data.change_percent?.toFixed(2)}%</span>
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <ArrowDownIcon size={14} className="mr-1" />
                      <span className="text-xs font-semibold">{Math.abs(data.change_percent)?.toFixed(2)}%</span>
                    </span>
                  )}
                </div>
                <span className="block mt-1 text-lg font-bold">
                  ${formatPrice(data.price)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Top Stories Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Stories</h2>
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.slice(0, 6).map((article, index) => (
              <NewsCard key={index} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No news articles found matching your criteria.</p>
          </div>
        )}
      </div>
      
      {/* Latest News Section */}
      {filteredNews.length > 6 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Latest News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.slice(6).map((article, index) => (
              <NewsCard key={index} article={article} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default News;