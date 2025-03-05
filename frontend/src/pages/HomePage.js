import React from "react";
import Sidebar from "../components/Sidebar";
import StocksList from "../components/StocksList";
import CryptosList from "../components/CryptosList";
import NewsWidget from "../components/NewsWidget";
import Header from "../components/Header";

const HomePage = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 grid grid-cols-3 gap-6 p-6 overflow-auto">
          {/* Main Content Column */}
          <div className="col-span-2 space-y-6">
            {/* Stocks Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Stocks Market</h2>
              <StocksList />
            </div>

            {/* Cryptocurrencies Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Cryptocurrency Market</h2>
              <CryptosList />
            </div>
          </div>

          {/* Sidebar Column */}
          <aside className="col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-md">
              <NewsWidget />
            </div>
            
            {/* Market Insights Widget */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Market Insights</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Market Sentiment</span>
                  <span className="text-green-600 font-bold">Bullish</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Volatility Index</span>
                  <span className="text-yellow-600 font-bold">Moderate</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Top Performing Sector</span>
                  <span className="text-blue-600 font-bold">Technology</span>
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default HomePage;