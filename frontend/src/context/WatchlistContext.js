// frontend/src/context/WatchlistContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const WatchlistContext = createContext();

export function useWatchlist() {
  return useContext(WatchlistContext);
}

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState({
    stocks: [],
    crypto: []
  });
  
  // Carica la watchlist dal localStorage all'avvio
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist));
      } catch (error) {
        console.error('Error parsing watchlist from localStorage:', error);
      }
    }
  }, []);
  
  // Aggiorna localStorage quando la watchlist cambia
  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
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
      return {
        ...prev,
        [type]: [...prev[type], symbol]
      };
    });
  };
  
  // Rimuovi un asset dalla watchlist
  const removeFromWatchlist = (symbol, type) => {
    setWatchlist(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== symbol)
    }));
  };
  
  // Verifica se un asset è nella watchlist
  const isInWatchlist = (symbol, type) => {
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