import React, { useEffect, useState } from "react";
import { TrendingUpIcon, ArrowUpIcon, ArrowDownIcon, ExternalLinkIcon } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const StocksList = () => {
  const [stocks, setStocks] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopSymbols = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/top_symbols");
        const data = await response.json();
        setStocks(data.top_stocks);
      } catch (err) {
        console.error("Errore nel fetch degli stock:", err);
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
        {Object.entries(stocks).length > 0 ? (
          Object.entries(stocks).map(([symbol, stock]) => (
            <div 
              key={symbol} 
              className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => handleStockClick(symbol)}
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-900">{symbol}</span>
                    <span className="ml-2 text-xs py-1 px-2 bg-gray-100 rounded-full text-gray-600">
                      {stock.name.length > 15 ? `${stock.name.substring(0, 15)}...` : stock.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 mt-1 group-hover:text-blue-600 transition-colors">
                    View details
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-lg font-bold text-gray-900">
                    ${stock.current_price ? stock.current_price.toFixed(2) : 'N/A'}
                  </span>
                  <div 
                    className={`flex items-center mt-1 ${
                      stock.change_percent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stock.change_percent >= 0 ? (
                      <ArrowUpIcon size={14} className="mr-1" />
                    ) : (
                      <ArrowDownIcon size={14} className="mr-1" />
                    )}
                    <span className="text-sm font-medium">
                      {stock.change_percent ? `${Math.abs(stock.change_percent).toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            No stocks available at the moment
          </div>
        )}
      </div>
    </div>
  );
};

export default StocksList;