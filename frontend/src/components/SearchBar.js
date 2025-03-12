import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, TrendingUpIcon, BitcoinIcon, ArrowRightIcon } from 'lucide-react';
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
        // Usa la nuova API unified_search che include sia stock che crypto
        const response = await fetch(`https://market-analytics-dashboard.onrender.com/api/unified_search?query=${query}`);
        if (!response.ok) {
          throw new Error('Search failed');
        }
        const data = await response.json();
        
        // La risposta ora è in formato results: [...] invece che un array diretto
        if (data && data.results) {
          setSearchResults(data.results);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
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

  const handleItemClick = (item) => {
    // Gestisce sia azioni che crypto
    if (item.url) {
      navigate(item.url);
    } else if (item.type === 'stock') {
      navigate(`/stock/${item.symbol}`);
    } else if (item.type === 'crypto') {
      navigate(`/crypto/${item.symbol}`);
    }
    
    // Resetta lo stato di ricerca
    setQuery('');
    setSearchResults([]);
  };

  // Renderizza l'icona appropriata in base al tipo di risultato
  const renderIcon = (type) => {
    if (type === 'stock') {
      return <TrendingUpIcon className="text-blue-500" size={16} />;
    } else if (type === 'crypto') {
      return <BitcoinIcon className="text-amber-500" size={16} />;
    } else {
      return <SearchIcon className="text-gray-400" size={16} />;
    }
  };

  return (
    <div ref={searchRef} className="flex justify-center items-center w-full">
      <div className="relative w-full max-w-2xl mx-auto"> {/* Aumentato max-w-md a max-w-2xl e aggiunto mx-auto */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search stocks, crypto..."
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
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 group"
                onClick={() => handleItemClick(result)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="mr-2">
                      {renderIcon(result.type)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 flex items-center">
                        <span className={result.type === 'crypto' ? "text-amber-600" : "text-blue-600"}>
                          {result.symbol}
                        </span>
                        {result.type && (
                          <span className="ml-2 text-xs py-0.5 px-2 rounded-full text-gray-500 bg-gray-100">
                            {result.type === 'stock' ? 'Stock' : 'Crypto'}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.name}
                        {result.exchange && <span className="text-xs text-gray-400"> ({result.exchange})</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-gray-500">
                    View <ArrowRightIcon size={12} className="ml-1" />
                  </div>
                </div>
                {result.price && (
                  <div className="mt-1 text-sm">
                    <span className="font-medium">${parseFloat(result.price).toFixed(2)}</span>
                    {result.change_percent !== undefined && (
                      <span className={`ml-2 text-xs ${parseFloat(result.change_percent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {parseFloat(result.change_percent) >= 0 ? '+' : ''}
                        {parseFloat(result.change_percent).toFixed(2)}%
                      </span>
                    )}
                  </div>
                )}
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
    </div>
  );
};

export default SearchBar;