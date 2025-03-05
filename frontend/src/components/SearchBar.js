import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ 
    stocks: [], 
    cryptos: [], 
    stock_details: {} 
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async (value) => {
    setQuery(value);
    
    if (value.length > 0) {
      try {
        const response = await fetch(`http://localhost:5000/api/search_symbol?query=${value}`);
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Errore durante la ricerca:', error);
      }
    } else {
      setSuggestions({ stocks: [], cryptos: [], stock_details: {} });
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (symbol, type) => {
    navigate(`/${type}/${symbol}`);
    setQuery('');
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="flex items-center bg-white rounded-lg shadow-md">
        <SearchIcon className="ml-3 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Search stocks, crypto..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
          className="w-full p-2 pl-2 rounded-lg focus:outline-none"
        />
      </div>

      {showSuggestions && (suggestions.stocks.length > 0 || suggestions.cryptos.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {suggestions.stocks.length > 0 && (
            <div className="p-2 border-b">
              <p className="text-xs font-semibold text-gray-600 mb-2">Stocks</p>
              {suggestions.stocks.map((symbol) => (
                <div
                  key={symbol}
                  onClick={() => handleSuggestionClick(symbol, 'stock')}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer rounded flex justify-between items-center"
                >
                  <span className="font-medium">{symbol}</span>
                  <span className="text-xs text-gray-500">
                    {suggestions.stock_details[symbol] || symbol}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {suggestions.cryptos.length > 0 && (
            <div className="p-2">
              <p className="text-xs font-semibold text-gray-600 mb-2">Cryptocurrencies</p>
              {suggestions.cryptos.map((symbol) => (
                <div
                  key={symbol}
                  onClick={() => handleSuggestionClick(symbol, 'crypto')}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer rounded"
                >
                  {symbol}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;