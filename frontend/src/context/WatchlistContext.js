// frontend/src/context/WatchlistContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const WatchlistContext = createContext();

export function useWatchlist() {
  return useContext(WatchlistContext);
}

export const WatchlistProvider = ({ children }) => {
  // Inizializza lo stato leggendo direttamente dal localStorage
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const savedWatchlist = localStorage.getItem('watchlist');
      return savedWatchlist ? JSON.parse(savedWatchlist) : { stocks: [], crypto: [] };
    } catch (error) {
      console.error('Error parsing watchlist from localStorage:', error);
      return { stocks: [], crypto: [] };
    }
  });
  
  // Aggiorna localStorage quando la watchlist cambia
  useEffect(() => {
    try {
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
      console.log('Saved to localStorage:', watchlist); // Per debugging
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [watchlist]);
  
  // Aggiungi un asset alla watchlist
  const addToWatchlist = (symbol, type) => {
    if (type !== 'stocks' && type !== 'crypto') {
      console.error('Invalid asset type');
      return;
    }
    
    setWatchlist(prev => {
      // Se il simbolo è già presente, non fare nulla
      if (prev[type].includes(symbol)) {
        return prev;
      }
      
      // Altrimenti aggiungi il simbolo
      const updated = {
        ...prev,
        [type]: [...prev[type], symbol]
      };
      
      console.log('Adding to watchlist, new state:', updated); // Per debugging
      return updated;
    });
  };
  
  // Rimuovi un asset dalla watchlist
  const removeFromWatchlist = (symbol, type) => {
    setWatchlist(prev => {
      const updated = {
        ...prev,
        [type]: prev[type].filter(item => item !== symbol)
      };
      
      console.log('Removing from watchlist, new state:', updated); // Per debugging
      return updated;
    });
  };
  
  // Verifica se un asset è nella watchlist
  const isInWatchlist = (symbol, type) => {
    if (!watchlist || !watchlist[type]) {
      return false;
    }
    return watchlist[type].includes(symbol);
  };
  
  const value = {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist
  };
  
  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};

export default WatchlistProvider;