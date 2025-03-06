import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StockDetails from './pages/StockDetails';
import CryptoDetails from './pages/CryptoDetails';
import News from './pages/News';
import StockPage from './pages/StocksPage';
import CryptosPage from './pages/CryptosPage';
import Sidebar from './components/Sidebar';


function App() {
  return (
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
      </Routes>
      </main>
      </div>
    </Router>
  );
}

export default App;