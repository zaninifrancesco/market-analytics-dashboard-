import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import StocksList from "../components/StocksList";
import CryptosList from "../components/CryptosList";
import NewsWidget from "../components/NewsWidget";
import Header from "../components/Header";

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4">
          <div className="h-6 bg-gray-200 rounded col-span-1"></div>
          <div className="h-6 bg-gray-200 rounded col-span-1"></div>
          <div className="h-6 bg-gray-200 rounded col-span-1"></div>
          <div className="h-6 bg-gray-200 rounded col-span-1"></div>
        </div>
      ))}
    </div>
  </div>
);

const HomePage = () => {
  const [stocksData, setStocksData] = useState(null);
  const [cryptosData, setCryptosData] = useState(null);
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState({
    stocks: true,
    cryptos: true,
    news: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stocks data
        const stocksResponse = await fetch('http://localhost:5000/api/stocks')
          .then(res => res.json())
          .catch(error => {
            console.error('Error fetching stocks:', error);
            setLoading(prev => ({ ...prev, stocks: false }));
            return null;
          });

        if (stocksResponse) {
          setStocksData(stocksResponse);
          setLoading(prev => ({ ...prev, stocks: false }));
        }

        // Fetch cryptos data
        const cryptosResponse = await fetch('http://localhost:5000/api/cryptos')
          .then(res => res.json())
          .catch(error => {
            console.error('Error fetching cryptos:', error);
            setLoading(prev => ({ ...prev, cryptos: false }));
            return null;
          });

        if (cryptosResponse) {
          setCryptosData(cryptosResponse);
          setLoading(prev => ({ ...prev, cryptos: false }));
        }

        // Fetch news data
        const newsResponse = await fetch('http://localhost:5000/api/news')
          .then(res => res.json())
          .catch(error => {
            console.error('Error fetching news:', error);
            setLoading(prev => ({ ...prev, news: false }));
            return null;
          });

        if (newsResponse) {
          setNewsData(newsResponse);
          setLoading(prev => ({ ...prev, news: false }));
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading({
          stocks: false,
          cryptos: false,
          news: false
        });
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 grid grid-cols-3 gap-6 p-6 overflow-auto">
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Stocks Market</h2>
              {loading.stocks ? (
                <LoadingSkeleton />
              ) : (
                <StocksList data={stocksData} />
              )}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Cryptocurrency Market</h2>
              {loading.cryptos ? (
                <LoadingSkeleton />
              ) : (
                <CryptosList data={cryptosData} />
              )}
            </div>
          </div>

          <aside className="col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-md">
              {loading.news ? (
                <div className="p-6">
                  <LoadingSkeleton />
                </div>
              ) : (
                <NewsWidget data={newsData} />
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Market Insights</h3>
              {(loading.stocks || loading.cryptos) ? (
                <div className="space-y-4 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
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
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default HomePage;