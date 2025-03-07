import React from 'react';
import { StarIcon } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

const WatchlistButton = ({ symbol, type }) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  
  const assetType = type === 'crypto' ? 'crypto' : 'stocks';
  const isWatched = isInWatchlist(symbol, assetType);
  
  const handleWatchlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWatched) {
      removeFromWatchlist(symbol, assetType);
    } else {
      addToWatchlist(symbol, assetType);
    }
  };
  
  return (
    <button
      onClick={handleWatchlistToggle}
      className={`flex items-center justify-center p-2 rounded-full transition-colors ${
        isWatched 
          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
      title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
    >
      <StarIcon size={20} className={isWatched ? 'fill-amber-500 text-amber-500' : ''} />
    </button>
  );
};

export default WatchlistButton;