import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import { 
  DollarSignIcon, 
  TrendingUpIcon, 
  BarChartIcon,
  NewspaperIcon,
  AlertTriangleIcon
} from 'lucide-react';

function StockDetails() {
  const { symbol } = useParams();
  const [stockData, setStockData] = useState(null);
  const [technicalIndicators, setTechnicalIndicators] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({
    stockData: null,
    technicalIndicators: null,
    news: null
  });

  useEffect(() => {
    const fetchStockDetails = async () => {
      try {
        // Fetch stock price history
        const stockResponse = await axios.get(`http://localhost:5000/api/stock_data/${symbol}?period=1mo`)
          .catch(err => {
            setErrors(prev => ({
              ...prev, 
              stockData: err.response?.data?.error || 'Unable to fetch stock data'
            }));
            return { data: null };
          });
        
        // Fetch technical indicators
        const indicatorsResponse = await axios.get(`http://localhost:5000/api/technical_indicators/${symbol}`)
          .catch(err => {
            setErrors(prev => ({
              ...prev, 
              technicalIndicators: err.response?.data?.error || 'Unable to fetch technical indicators'
            }));
            return { data: null };
          });
        
        // Fetch related news (simulated - we'll use general economic news)
        const newsResponse = await axios.get('http://localhost:5000/api/economic_news')
          .catch(err => {
            setErrors(prev => ({
              ...prev, 
              news: err.response?.data?.error || 'Unable to fetch news'
            }));
            return { data: { slice: () => [] } };
          });

        setStockData(stockResponse.data);
        setTechnicalIndicators(indicatorsResponse.data);
        setRelatedNews(newsResponse.data.slice(0, 3)); // First 3 news articles
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        setLoading(false);
      }
    };

    fetchStockDetails();
  }, [symbol]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );

  // Prepare chart data for Recharts
  const chartData = stockData?.map(entry => ({
    date: new Date(entry.Date).toLocaleDateString(),
    close: entry.Close
  })) || [];

  // Error Alert Component
  const ErrorAlert = ({ message }) => (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
      <div className="flex items-center">
        <AlertTriangleIcon className="mr-2 text-yellow-500" />
        <span className="block sm:inline">{message}</span>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      {/* Error Notifications */}
      <div className="space-y-4 mb-6">
        {errors.stockData && <ErrorAlert message={`Stock Data: ${errors.stockData}`} />}
        {errors.technicalIndicators && <ErrorAlert message={`Technical Indicators: ${errors.technicalIndicators}`} />}
        {errors.news && <ErrorAlert message={`News: ${errors.news}`} />}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Stock Overview */}
        <div className="col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <TrendingUpIcon className="mr-2 text-blue-600" />
            <h2 className="text-2xl font-bold">{symbol} Stock Overview</h2>
          </div>

          {/* Price Chart */}
          <div className="h-96 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="close" 
                    stroke="#8884d8" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-gray-500">
                No chart data available
              </div>
            )}
          </div>
        </div>

        {/* Stock Details & Technical Indicators */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-4">
              <DollarSignIcon className="mr-2 text-green-600" />
              <h3 className="text-xl font-semibold">Stock Details</h3>
            </div>
            <div className="space-y-3">
              {stockData?.[0] ? (
                <>
                  <div className="flex justify-between">
                    <span>Open Price:</span>
                    <span className="font-bold">${stockData[0].Open.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Close Price:</span>
                    <span className="font-bold">${stockData[0].Close.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volume:</span>
                    <span className="font-bold">{stockData[0].Volume.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500">No stock details available</div>
              )}
            </div>
          </div>

          {/* Technical Indicators */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-4">
              <BarChartIcon className="mr-2 text-purple-600" />
              <h3 className="text-xl font-semibold">Technical Indicators</h3>
            </div>
            <div className="space-y-3">
              {technicalIndicators ? (
                <>
                  <div className="flex justify-between">
                    <span>RSI (14 days):</span>
                    <span className="font-bold">{technicalIndicators.RSI.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SMA (50 days):</span>
                    <span className="font-bold">{technicalIndicators.SMA.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500">No technical indicators available</div>
              )}
            </div>
          </div>
        </div>

        {/* Related News */}
        <div className="col-span-3 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <NewspaperIcon className="mr-2 text-red-600" />
            <h3 className="text-xl font-semibold">Related News</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {relatedNews.length > 0 ? (
              relatedNews.map((article, index) => (
                <div key={index} className="border p-4 rounded-lg hover:shadow-sm transition-shadow">
                  <h4 className="font-bold mb-2">{article.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{article.description}</p>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline"
                  >
                    Read more
                  </a>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500">No news articles available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockDetails;