import React, { useEffect, useState } from "react";
import { BitcoinIcon, ArrowUpIcon, ArrowDownIcon, ExternalLinkIcon } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import WatchlistButton from './WatchlistButton';

const CryptosList = () => {
  const [cryptos, setCryptos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopSymbols = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://market-analytics-dashboard.onrender.com/api/top_cryptos");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        // Check if top_cryptos exists in the response
        if (data && data.top_cryptos) {
          setCryptos(data.top_cryptos);
        } else {
          console.warn("API response doesn't contain top_cryptos:", data);
          setCryptos({}); // Ensure cryptos is an empty object, not null/undefined
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching cryptocurrencies:", err);
        setError("Failed to load cryptocurrencies. Please try again later.");
        setCryptos({}); // Set to empty object on error
      } finally {
        setLoading(false);
      }
    };

    fetchTopSymbols();
  }, []);

  const handleCryptoClick = (symbol) => {
    navigate(`/crypto/${symbol}`);
  };
  
  if (loading) {
    return (
      <div className="animate-pulse p-1">
        {/* Loading UI - no changes needed here */}
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
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-600">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-1">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-amber-50 p-2 rounded-lg mr-3">
            <BitcoinIcon className="text-amber-600" size={18} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Top Cryptocurrencies</h3>
        </div>
        <button 
          onClick={() => navigate('/crypto')}
          className="text-amber-600 hover:text-amber-800 text-sm flex items-center"
        >
          View All <ExternalLinkIcon size={14} className="ml-1" />
        </button>
      </div>
      <div className="space-y-3">
        {cryptos && Object.keys(cryptos).length > 0 ? (
          Object.entries(cryptos).map(([symbol, crypto]) => (
            <div 
              key={symbol} 
              className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer group relative"
              onClick={() => handleCryptoClick(symbol)}
            >
              {/* Watchlist Button - posizionato a sinistra */}
              <div 
                className="absolute left-2 top-1/2 transform -translate-y-1/2" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="scale-75 transform-origin-center">
                  <WatchlistButton symbol={symbol} type="crypto" />
                </div>
              </div>
              
              <div className="flex justify-between items-center pl-9">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-900">{symbol}</span>
                    <span className="ml-2 text-xs py-1 px-2 bg-amber-50 rounded-full text-amber-700">
                      {crypto.name && crypto.name.length > 15 ? `${crypto.name.substring(0, 15)}...` : crypto.name || symbol}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 mt-1 group-hover:text-amber-600 transition-colors">
                    View details
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-lg font-bold text-gray-900">
                    ${crypto.current_price ? crypto.current_price.toFixed(2) : 'N/A'}
                  </span>
                  <div 
                    className={`flex items-center mt-1 ${
                      (crypto.change_percent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {(crypto.change_percent || 0) >= 0 ? (
                      <ArrowUpIcon size={14} className="mr-1" />
                    ) : (
                      <ArrowDownIcon size={14} className="mr-1" />
                    )}
                    <span className="text-sm font-medium">
                      {crypto.change_percent !== null && crypto.change_percent !== undefined ? 
                        `${Math.abs(crypto.change_percent).toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            No cryptocurrencies available at the moment
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptosList;