import React, { useEffect, useState } from "react";
import { TrendingUpIcon } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const StocksList = () => {
  const [stocks, setStocks] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopSymbols = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/top_symbols");
        const data = await response.json();
        setStocks(data.top_stocks);
      } catch (err) {
        console.error("Errore nel fetch degli stock:", err);
      }
    };

    fetchTopSymbols();
  }, []);

  const handleStockClick = (symbol) => {
    navigate(`/stock/${symbol}`);
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <TrendingUpIcon className="mr-2 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Top Stocks</h3>
      </div>
      <div className="space-y-4">
        {Object.entries(stocks).map(([symbol, stock]) => (
          <div 
            key={symbol} 
            className="bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-colors duration-300 cursor-pointer"
            onClick={() => handleStockClick(symbol)}
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-lg font-bold text-blue-600">{symbol}</span>
                <span className="ml-2 text-sm text-gray-600 truncate max-w-[150px]">
                  {stock.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold">
                  {stock.current_price ? `$${stock.current_price.toFixed(2)}` : 'N/A'}
                </span>
                <span 
                  className={`block text-xs font-medium ${
                    stock.change_percent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stock.change_percent ? `${stock.change_percent.toFixed(2)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StocksList;