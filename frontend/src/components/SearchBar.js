import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, TrendingUpIcon, BitcoinIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleSearch = async () => {
      if (!query || query.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/search_stock?query=${query}`);
        if (!response.ok) {
          throw new Error('Search failed');
        }
        const data = await response.json();
        setSearchResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Add debounce for search
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleStockClick = (symbol) => {
    navigate(`/stock/${symbol}`);
    setQuery('');
    setSearchResults([]);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          placeholder="Search for stocks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-3 pl-10 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="text-gray-400" size={18} />
        </div>
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <span className="text-lg">×</span>
          </button>
        )}
      </div>
      
      {searchResults.length > 0 && (
        <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-lg max-h-80 overflow-auto w-full border border-gray-100">
          {searchResults.map((result, index) => (
            <div
              key={index}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleStockClick(result.symbol)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-blue-600">{result.symbol}</div>
                  <div className="text-sm text-gray-600">{result.name} <span className="text-xs text-gray-400">({result.exchange})</span></div>
                </div>
                <div className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  View
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isLoading && query && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;