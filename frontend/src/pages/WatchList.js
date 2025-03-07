// frontend/src/pages/WatchList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import Header from '../components/Header';
import { TrendingUpIcon, TrendingDownIcon, Trash2Icon, XCircleIcon, RefreshCwIcon, ArrowUpDownIcon } from 'lucide-react';

const WatchList = () => {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const [stocksData, setStocksData] = useState({});
  const [cryptoData, setCryptoData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('symbol');
  const [sortDirection, setSortDirection] = useState('asc');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchData();
  }, [watchlist]);
  
  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch stock data
      if (watchlist.stocks.length > 0) {
        const stockSymbols = watchlist.stocks.join(',');
        const stockResponse = await fetch(`http://localhost:5000/api/stock_batch?symbols=${stockSymbols}`);
        if (stockResponse.ok) {
          const stockData = await stockResponse.json();
          setStocksData(stockData);
        }
      }
      
      // Fetch crypto data
      if (watchlist.crypto.length > 0) {
        const cryptoSymbols = watchlist.crypto.join(',');
        const cryptoResponse = await fetch(`http://localhost:5000/api/crypto_batch?symbols=${cryptoSymbols}`);
        if (cryptoResponse.ok) {
          const cryptoData = await cryptoResponse.json();
          setCryptoData(cryptoData);
        }
      }
    } catch (error) {
      console.error('Error fetching watchlist data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemove = (symbol, type) => {
    removeFromWatchlist(symbol, type);
  };
  
  const handleRefresh = () => {
    fetchData();
  };
  
  const handleNavigate = (symbol, type) => {
    navigate(`/${type === 'stocks' ? 'stock' : 'crypto'}/${symbol}`);
  };
  
  const handleSort = (criteria) => {
    if (sortBy === criteria) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criteria);
      setSortDirection('asc');
    }
  };
  
  const sortItems = (items, type) => {
    return [...items].sort((a, b) => {
      let valueA, valueB;
      
      if (sortBy === 'symbol') {
        valueA = a;
        valueB = b;
      } else {
        valueA = type === 'stocks' ? stocksData[a]?.[sortBy] : cryptoData[a]?.[sortBy];
        valueB = type === 'stocks' ? stocksData[b]?.[sortBy] : cryptoData[b]?.[sortBy];
        
        // Handle undefined values
        if (valueA === undefined) return 1;
        if (valueB === undefined) return -1;
      }
      
      const result = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      return sortDirection === 'asc' ? result : -result;
    });
  };
  
  const renderItems = (type) => {
    const items = type === 'stocks' ? watchlist.stocks : watchlist.crypto;
    if (items.length === 0) return null;
    
    const sortedItems = sortItems(items, type);
    
    return sortedItems.map((symbol) => {
      const data = type === 'stocks' ? stocksData[symbol] : cryptoData[symbol];
      if (!data) return null;
      
      const price = data.current_price;
      const change = data.price_change_24h || 0;
      const changePercent = data.price_change_percentage_24h || 0;
      const isPositive = changePercent >= 0;
      
      return (
        <div 
          key={symbol} 
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center cursor-pointer" onClick={() => handleNavigate(symbol, type)}>
            <div className={`w-10 h-10 rounded-full ${type === 'crypto' ? 'bg-amber-100' : 'bg-blue-100'} flex items-center justify-center mr-3`}>
              <span className={`font-bold ${type === 'crypto' ? 'text-amber-700' : 'text-blue-700'}`}>
                {symbol.substring(0, 1)}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-800">{symbol}</div>
              <div className="text-sm text-gray-500">{type === 'stocks' ? 'Stock' : 'Crypto'}</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-semibold">${price?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <div className={`text-sm flex items-center justify-end ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUpIcon size={14} className="mr-1" /> : <TrendingDownIcon size={14} className="mr-1" />}
              {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
            </div>
          </div>
          
          <button 
            onClick={() => handleRemove(symbol, type)} 
            className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Remove from watchlist"
          >
            <Trash2Icon size={18} />
          </button>
        </div>
      );
    });
  };
  
  const stockItems = renderItems('stocks');
  const cryptoItems = renderItems('crypto');
  
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Watchlist</h1>
              <button 
                onClick={handleRefresh}
                className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <RefreshCwIcon size={16} className="mr-2" />
                Refresh
              </button>
            </div>
            
            <div className="flex space-x-2 mb-6">
              <button 
                className={`px-4 py-2 rounded-md ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setActiveTab('all')}
              >
                All ({watchlist.stocks.length + watchlist.crypto.length})
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${activeTab === 'stocks' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setActiveTab('stocks')}
              >
                Stocks ({watchlist.stocks.length})
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${activeTab === 'crypto' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setActiveTab('crypto')}
              >
                Crypto ({watchlist.crypto.length})
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading watchlist...</span>
              </div>
            ) : (
              <>
                <div className="grid gap-4">
                  {watchlist.stocks.length === 0 && watchlist.crypto.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                      <XCircleIcon size={36} className="mx-auto text-gray-400 mb-2" />
                      <h3 className="text-lg font-medium text-gray-700 mb-1">Your watchlist is empty</h3>
                      <p className="text-gray-500 mb-4">Add stocks or cryptocurrencies to track them here</p>
                      <div className="flex justify-center space-x-4">
                        <button 
                          onClick={() => navigate('/stocks')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Browse Stocks
                        </button>
                        <button 
                          onClick={() => navigate('/crypto')}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Browse Crypto
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Sorting Controls */}
                      <div className="flex justify-end mb-2">
                        <button 
                          onClick={() => handleSort('symbol')}
                          className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors mr-2"
                        >
                          Symbol
                          {sortBy === 'symbol' && (
                            <ArrowUpDownIcon size={14} className="ml-1" />
                          )}
                        </button>
                        <button 
                          onClick={() => handleSort('current_price')}
                          className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors mr-2"
                        >
                          Price
                          {sortBy === 'current_price' && (
                            <ArrowUpDownIcon size={14} className="ml-1" />
                          )}
                        </button>
                        <button 
                          onClick={() => handleSort('price_change_percentage_24h')}
                          className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          Change %
                          {sortBy === 'price_change_percentage_24h' && (
                            <ArrowUpDownIcon size={14} className="ml-1" />
                          )}
                        </button>
                      </div>
                      
                      {/* Stock Items */}
                      {(activeTab === 'all' || activeTab === 'stocks') && stockItems && (
                        <div>
                          {activeTab === 'all' && <h2 className="text-lg font-semibold text-gray-700 mb-3">Stocks</h2>}
                          <div className="space-y-3">
                            {stockItems}
                          </div>
                        </div>
                      )}
                      
                      {/* Crypto Items */}
                      {(activeTab === 'all' || activeTab === 'crypto') && cryptoItems && (
                        <div>
                          {activeTab === 'all' && <h2 className="text-lg font-semibold text-gray-700 mt-6 mb-3">Cryptocurrencies</h2>}
                          <div className="space-y-3">
                            {cryptoItems}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default WatchList;