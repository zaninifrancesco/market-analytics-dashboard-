import React, { useEffect, useState } from "react";

const StocksList = () => {
  const [stocks, setStocks] = useState([]);
  const [indicators, setIndicators] = useState({});

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const stockResponse = await fetch("http://localhost:5000/api/stock_data/GOOGL");
        const indicatorsResponse = await fetch("http://localhost:5000/api/technical_indicators/GOOGL");
        
        const stockData = await stockResponse.json();
        const indicatorsData = await indicatorsResponse.json();
        
        setStocks(stockData);
        setIndicators(indicatorsData);
      } catch (err) {
        console.error("Errore nel fetch degli stock:", err);
      }
    };

    fetchStockData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Stocks</h2>
      <div className="grid grid-cols-1 gap-4">
        {stocks.map((stock, index) => (
          <div 
            key={index} 
            className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-xl font-semibold text-blue-600">{stock.Symbol}</span>
                <span className="ml-2 text-gray-600 text-sm">{stock.Company_Name}</span>
              </div>
              <span className="text-lg font-bold text-green-600">${stock.Close.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Open: </span>
                <span className="font-medium">${stock.Open.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">High: </span>
                <span className="font-medium text-green-500">${stock.High.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Low: </span>
                <span className="font-medium text-red-500">${stock.Low.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Volume: </span>
                <span className="font-medium">{stock.Volume.toLocaleString()}</span>
              </div>
            </div>
            {indicators && (
              <div className="mt-2 pt-2 border-t border-gray-100 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">RSI:</span>
                  <span 
                    className={`font-bold ${
                      indicators.RSI > 70 ? 'text-red-500' : 
                      indicators.RSI < 30 ? 'text-green-500' : 
                      'text-gray-700'
                    }`}
                  >
                    {indicators.RSI ? indicators.RSI.toFixed(2) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SMA:</span>
                  <span className="font-bold text-blue-600">
                    {indicators.SMA ? indicators.SMA.toFixed(2) : 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StocksList;