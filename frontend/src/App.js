import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StockDetails from './pages/StockDetails';
import CryptoDetails from './pages/CryptoDetails';
import News from './pages/News';
import StockPage from './pages/StocksPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stock/:symbol" element={<StockDetails />} />
        <Route path="/crypto/:symbol" element={<CryptoDetails />} />
        <Route path="/news" element={<News />} />
        <Route path="/stocks" element={<StockPage />} />
        <Route path="/crypto" element={<CryptoDetails />} />
      </Routes>
    </Router>
  );
}

export default App;