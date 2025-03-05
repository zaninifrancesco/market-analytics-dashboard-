import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import axios from 'axios';
import { 
  DollarSignIcon, 
  TrendingUpIcon, 
  BarChart2Icon,
  NewspaperIcon,
  AlertTriangleIcon,
  BitcoinIcon
} from 'lucide-react';
import TimeframeSelector from '../components/TimeframeSelector';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function CryptoDetails() {
  const { symbol } = useParams();
  const [cryptoData, setCryptoData] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d'); // Default to 1 day for crypto
  const [errors, setErrors] = useState({
    cryptoData: null,
    news: null
  });

  // Map timeframe selections to API parameters for Binance API
  const timeframeToInterval = {
    '1d': '1h',     // Get hourly data for 1 day view
    '1w': '4h',     // Get 4-hour data for 1 week view
    '1m': '1d',     // Get daily data for 1 month view
    '1y': '1w'      // Get weekly data for 1 year view
  };

  // Calculate number of data points needed for each interval
  const timeframeToLimit = {
    '1d': 24,      // 24 hours of hourly data
    '1w': 42,      // 7 days of 4-hour data
    '1m': 30,      // 30 days of daily data
    '1y': 52       // 52 weeks of weekly data
  };

  // Map timeframes to appropriate date formats for X-axis
  const timeframeToDateFormat = {
    '1d': (timestamp) => new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    '1w': (timestamp) => new Date(timestamp).toLocaleDateString([], {weekday: 'short'}),
    '1m': (timestamp) => new Date(timestamp).toLocaleDateString([], {month: 'short', day: 'numeric'}),
    '1y': (timestamp) => new Date(timestamp).toLocaleDateString([], {month: 'short'})
  };

  useEffect(() => {
    const fetchCryptoData = async () => {
      setLoading(true);
      setErrors({
        cryptoData: null,
        news: null
      });

      try {
        // Fetch crypto data using the selected interval and appropriate data points
        const interval = timeframeToInterval[selectedTimeframe];
        const limit = timeframeToLimit[selectedTimeframe];
        
        const cryptoResponse = await axios.get(
          `http://localhost:5000/api/crypto_data/${symbol}?interval=${interval}&limit=${limit}`
        ).catch(err => {
          setErrors(prev => ({
            ...prev, 
            cryptoData: err.response?.data?.error || 'Unable to fetch crypto data'
          }));
          return { data: null };
        });
        
        // Fetch related crypto news (using general economic news since we don't have a crypto-specific endpoint)
        const newsResponse = await axios.get('http://localhost:5000/api/economic_news')
          .catch(err => {
            setErrors(prev => ({
              ...prev, 
              news: err.response?.data?.error || 'Unable to fetch news'
            }));
            return { data: [] };
          });

        setCryptoData(cryptoResponse.data);
        setRelatedNews(newsResponse.data?.slice(0, 3) || []); // First 3 news articles
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, [symbol, selectedTimeframe]); // Refetch when timeframe changes

  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
    </div>
  );

  // Format timestamp based on selected timeframe
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    // Convert timestamp to number if it's a string
    const numTimestamp = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    const dateFormatter = timeframeToDateFormat[selectedTimeframe];
    return dateFormatter(numTimestamp);
  };

  // Prepare chart data for Recharts
  const chartData = cryptoData?.map(entry => ({
    timestamp: entry.open_time,
    formattedTime: formatTimestamp(entry.open_time),
    open: parseFloat(entry.open),
    close: parseFloat(entry.close),
    high: parseFloat(entry.high),
    low: parseFloat(entry.low),
    volume: parseFloat(entry.volume)
  })) || [];

  // Choose colors based on price movement
  const getPriceColor = () => {
    if (!chartData || chartData.length < 2) return "#8884d8"; // Default color
    const firstPrice = chartData[0].close;
    const lastPrice = chartData[chartData.length - 1].close;
    return lastPrice >= firstPrice ? "#16a34a" : "#dc2626"; // Green for up, red for down
  };

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
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="container mx-auto p-6 overflow-auto">
          {/* Error Notifications */}
          <div className="space-y-4 mb-6">
            {errors.cryptoData && <ErrorAlert message={`Crypto Data: ${errors.cryptoData}`} />}
            {errors.news && <ErrorAlert message={`News: ${errors.news}`} />}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Crypto Overview */}
            <div className="col-span-2 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <BitcoinIcon className="mr-2 text-orange-500" />
                <h2 className="text-2xl font-bold">{symbol.replace('USDT', '')} Price Chart</h2>
              </div>

              {/* Timeframe Selector */}
              <TimeframeSelector 
                selectedTimeframe={selectedTimeframe}
                onTimeframeChange={handleTimeframeChange}
              />

              {/* Price Chart */}
              <div className="h-96 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="formattedTime" 
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => `$${value.toFixed(2)}`}
                      />
                      <Tooltip 
                        formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="close" 
                        stroke={getPriceColor()} 
                        fill={getPriceColor()}
                        fillOpacity={0.2}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    No chart data available
                  </div>
                )}
              </div>
            </div>

            {/* Crypto Details & Market Stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-4">
                  <DollarSignIcon className="mr-2 text-green-600" />
                  <h3 className="text-xl font-semibold">Market Details</h3>
                </div>
                <div className="space-y-3">
                  {cryptoData?.[0] ? (
                    <>
                      <div className="flex justify-between">
                        <span>Current Price:</span>
                        <span className="font-bold">${parseFloat(cryptoData[0].close).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>24h High:</span>
                        <span className="font-bold">${parseFloat(cryptoData[0].high).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>24h Low:</span>
                        <span className="font-bold">${parseFloat(cryptoData[0].low).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>24h Volume:</span>
                        <span className="font-bold">${parseFloat(cryptoData[0].volume).toLocaleString()}</span>
                      </div>
                      {chartData.length > 1 && (
                        <div className="flex justify-between">
                          <span>Price Change:</span>
                          <span className={`font-bold ${
                            chartData[chartData.length-1].close > chartData[0].close 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {((chartData[chartData.length-1].close - chartData[0].close) / chartData[0].close * 100).toFixed(2)}%
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-gray-500">No market details available</div>
                  )}
                </div>
              </div>

              {/* Market Sentiment */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-4">
                  <BarChart2Icon className="mr-2 text-purple-600" />
                  <h3 className="text-xl font-semibold">Market Sentiment</h3>
                </div>
                <div className="space-y-3">
                  {cryptoData && cryptoData.length > 0 ? (
                    <>
                      {/* Simple sentiment based on price movement */}
                      <div className="flex justify-between">
                        <span>Overall Trend:</span>
                        {chartData.length > 1 && (
                          <span className={`font-bold ${
                            chartData[chartData.length-1].close > chartData[0].close 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {chartData[chartData.length-1].close > chartData[0].close ? 'Bullish' : 'Bearish'}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Volume Trend:</span>
                        <span className="font-bold">
                          {chartData.length > 1 && parseFloat(cryptoData[0].volume) > 
                            chartData.reduce((sum, entry) => sum + parseFloat(entry.volume), 0) / chartData.length
                            ? 'High'
                            : 'Average'
                          }
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Volatility:</span>
                        <span className="font-bold">
                          {chartData.length > 1 && (
                            (Math.max(...chartData.map(d => parseFloat(d.high))) - 
                             Math.min(...chartData.map(d => parseFloat(d.low)))) / 
                            chartData[0].close > 0.03
                            ? 'High'
                            : 'Moderate'
                          )}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500">No sentiment data available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Related News */}
            <div className="col-span-3 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <NewspaperIcon className="mr-2 text-red-600" />
                <h3 className="text-xl font-semibold">Crypto News</h3>
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
      </div>
    </div>
  );
}

export default CryptoDetails