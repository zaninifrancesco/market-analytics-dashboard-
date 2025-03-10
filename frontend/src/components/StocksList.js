import React, { useEffect, useState } from "react";
import { TrendingUpIcon, ArrowUpIcon, ArrowDownIcon, ExternalLinkIcon, AlertCircleIcon } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import WatchlistButton from './WatchlistButton';

const StocksList = () => {
  const [stocks, setStocks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopSymbols = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/top_stocks");
        
        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Verifica se top_stocks esiste, altrimenti imposta un errore
        if (!data.top_stocks || Object.keys(data.top_stocks).length === 0) {
          throw new Error("No stock data available");
        }
        
        setStocks(data.top_stocks);
        setError(null);
      } catch (err) {
        console.error("Errore nel fetch degli stock:", err);
        setError(`Impossibile caricare i dati delle azioni: ${err.message}`);
        setStocks({});
      } finally {
        setLoading(false);
      }
    };

    fetchTopSymbols();
  }, []);

  const handleStockClick = (symbol) => {
    navigate(`/stock/${symbol}`);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center mb-6">
          <div className="w-5 h-5 rounded-full bg-gray-200 mr-2"></div>
          <div className="h-6 w-40 bg-gray-200 rounded-md"></div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="mb-4 p-4 bg-gray-100 rounded-lg">
            <div className="flex justify-between">
              <div>
                <div className="w-16 h-5 bg-gray-200 rounded mb-1"></div>
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="text-right">
                <div className="w-20 h-5 bg-gray-200 rounded mb-1 ml-auto"></div>
                <div className="w-12 h-4 bg-gray-200 rounded ml-auto"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <div className="flex items-center mb-2">
          <AlertCircleIcon className="text-red-500 mr-2" size={20} />
          <h3 className="font-semibold text-red-700">Errore</h3>
        </div>
        <p className="text-red-600 mb-3">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-medium"
        >
          Riprova
        </button>
      </div>
    );
  }


  const stockEntries = Object.entries(stocks || {});

  return (
    <div className="p-1">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-blue-50 p-2 rounded-lg mr-3">
            <TrendingUpIcon className="text-blue-600" size={18} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Top Stocks</h3>
        </div>
        <button 
          onClick={() => navigate('/stocks')}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
        >
          View All <ExternalLinkIcon size={14} className="ml-1" />
        </button>
      </div>
      <div className="space-y-3">
        {stockEntries.length > 0 ? (
          stockEntries.map(([symbol, stock]) => (
            <div 
              key={symbol} 
              className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer group relative"
              onClick={() => handleStockClick(symbol)}
            >
              <div 
                className="absolute left-2 top-1/2 transform -translate-y-1/2" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="scale-75 transform-origin-center">
                  <WatchlistButton symbol={symbol} type="stocks" />
                </div>
              </div>
              
              <div className="flex justify-between items-center pl-10">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-900">{symbol}</span>
                    <span className="ml-2 text-xs py-1 px-2 bg-gray-100 rounded-full text-gray-600">
                      {stock.name && stock.name.length > 15 ? `${stock.name.substring(0, 15)}...` : stock.name || symbol}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 mt-1 group-hover:text-blue-600 transition-colors">
                    View details
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-lg font-bold text-gray-900">
                    ${stock.current_price != null ? stock.current_price.toFixed(2) : 'N/A'}
                  </span>
                  <div 
                    className={`flex items-center mt-1 ${
                      (stock.change_percent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {(stock.change_percent || 0) >= 0 ? (
                      <ArrowUpIcon size={14} className="mr-1" />
                    ) : (
                      <ArrowDownIcon size={14} className="mr-1" />
                    )}
                    <span className="text-sm font-medium">
                      {stock.change_percent != null ? `${Math.abs(stock.change_percent).toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            {error ? error : "No stocks available at the moment"}
          </div>
        )}
      </div>
    </div>
  );
};

export default StocksList;