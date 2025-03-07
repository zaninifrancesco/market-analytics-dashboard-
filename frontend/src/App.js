import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StockDetails from './pages/StockDetails';
import CryptoDetails from './pages/CryptoDetails';
import News from './pages/News';
import StockPage from './pages/StocksPage';
import CryptosPage from './pages/CryptosPage';
import Sidebar from './components/Sidebar';
import Alerts from './pages/Alerts';
import WatchList from './pages/WatchList';
import { WatchlistProvider } from './context/WatchlistContext';

function App() {
  return (
    <WatchlistProvider>
      <Router>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/stock/:symbol" element={<StockDetails />} />
              <Route path="/crypto/:symbol" element={<CryptoDetails />} />
              <Route path="/news" element={<News />} />
              <Route path="/stocks" element={<StockPage />} />
              <Route path="/crypto" element={<CryptosPage />} />
              <Route path="/watchlist" element={<WatchList />} />
            </Routes>
          </main>
        </div>
      </Router>
    </WatchlistProvider>
  );
}

export default App;