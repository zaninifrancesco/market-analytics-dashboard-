import React, { useEffect, useState } from "react";
import { BitcoinIcon } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const CryptosList = () => {
  const [cryptos, setCryptos] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopSymbols = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/top_symbols");
        const data = await response.json();
        setCryptos(data.top_cryptos);
      } catch (err) {
        console.error("Errore nel fetch delle crypto:", err);
      }
    };

    fetchTopSymbols();
  }, []);

  const handleCryptoClick = (symbol) => {
    navigate(`/crypto/${symbol}`);
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <BitcoinIcon className="mr-2 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-800">Top Cryptocurrencies</h3>
      </div>
      <div className="space-y-4">
        {Object.entries(cryptos).map(([symbol, crypto]) => (
          <div 
            key={symbol} 
            className="bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-colors duration-300 cursor-pointer"
            onClick={() => handleCryptoClick(symbol)}
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-lg font-bold text-blue-600">{crypto.name}</span>
                <span className="ml-2 text-sm text-gray-600">{symbol}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold">
                  {crypto.current_price ? `$${crypto.current_price.toFixed(2)}` : 'N/A'}
                </span>
                <span 
                  className={`block text-xs font-medium ${
                    crypto.change_percent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {crypto.change_percent ? `${crypto.change_percent.toFixed(2)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptosList;