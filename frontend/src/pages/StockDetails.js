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
import TimeframeSelector from '../components/TimeframeSelector';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function StockDetails() {
  const { symbol } = useParams();
  const [stockData, setStockData] = useState(null);
  const [technicalIndicators, setTechnicalIndicators] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m'); // Default to 1 month
  const [errors, setErrors] = useState({
    stockData: null,
    technicalIndicators: null,
    news: null
  });

  // Map timeframe selections to API period parameter
  const timeframeToPeriod = {
    '1d': '1d',
    '1w': '1wk',
    '1m': '1mo',
    '1y': '1y'
  };

  // Map timeframes to appropriate interval formats for X-axis
  const timeframeToDateFormat = {
    '1d': (date) => new Date(date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    '1w': (date) => new Date(date).toLocaleDateString([], {weekday: 'short'}),
    '1m': (date) => new Date(date).toLocaleDateString([], {month: 'short', day: 'numeric'}),
    '1y': (date) => new Date(date).toLocaleDateString([], {month: 'short'})
  };

  useEffect(() => {
    const fetchStockDetails = async () => {
      setLoading(true);
      setErrors({
        stockData: null,
        technicalIndicators: null,
        news: null
      });

      try {
        // Fetch stock price history with the selected period
        const period = timeframeToPeriod[selectedTimeframe];
        const stockResponse = await axios.get(`http://localhost:5000/api/stock_data/${symbol}?period=${period}`)
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
        
        // Fetch related news
        const newsResponse = await axios.get('http://localhost:5000/api/economic_news')
          .catch(err => {
            setErrors(prev => ({
              ...prev, 
              news: err.response?.data?.error || 'Unable to fetch news'
            }));
            return { data: [] };
          });

        setStockData(stockResponse.data);
        setTechnicalIndicators(indicatorsResponse.data);
        setRelatedNews(newsResponse.data?.slice(0, 3) || []); // First 3 news articles
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        setLoading(false);
      }
    };

    fetchStockDetails();
  }, [symbol, selectedTimeframe]); // Refetch when timeframe changes

  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );

  // Format date based on selected timeframe
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const dateFormatter = timeframeToDateFormat[selectedTimeframe];
    return dateFormatter(dateStr);
  };

  // Prepare chart data for Recharts
  const chartData = stockData?.map(entry => {
    // Handle different date formats from API
    const dateVal = entry.Date || entry.open_time || new Date().toISOString();
    
    return {
      date: dateVal,
      formattedDate: formatDate(dateVal),
      close: entry.Close || entry.close || 0
    };
  }) || [];

  // Use fewer data points for better visualization in day view
  const dataPointsToShow = {
    '1d': 24,   // Hourly for day view
    '1w': 7,    // Daily for week view
    '1m': 30,   // Daily for month view
    '1y': 12    // Monthly for year view
  };

  // Sample data at appropriate intervals
  const sampledChartData = () => {
    if (chartData.length === 0) return [];
    
    // If we have fewer points than requested, return all data
    if (chartData.length <= dataPointsToShow[selectedTimeframe]) {
      return chartData;
    }
    
    // Otherwise sample evenly
    const interval = Math.floor(chartData.length / dataPointsToShow[selectedTimeframe]);
    return chartData.filter((_, index) => index % interval === 0);
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

              {/* Timeframe Selector */}
              <TimeframeSelector 
                selectedTimeframe={selectedTimeframe}
                onTimeframeChange={handleTimeframeChange}
              />

              {/* Price Chart */}
              <div className="h-96 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer>
                    <LineChart data={sampledChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="formattedDate" 
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => `$${value.toFixed(2)}`}
                      />
                      <Tooltip 
                        formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="close" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
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
                        <span className="font-bold">${(stockData[0].Open || stockData[0].open || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Close Price:</span>
                        <span className="font-bold">${(stockData[0].Close || stockData[0].close || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>High:</span>
                        <span className="font-bold">${(stockData[0].High || stockData[0].high || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Low:</span>
                        <span className="font-bold">${(stockData[0].Low || stockData[0].low || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Volume:</span>
                        <span className="font-bold">
                          {(stockData[0].Volume || stockData[0].volume || 0).toLocaleString()}
                        </span>
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
                        <span className={`font-bold ${
                          technicalIndicators.RSI > 70 ? 'text-red-600' : 
                          technicalIndicators.RSI < 30 ? 'text-green-600' : 'text-gray-800'
                        }`}>
                          {technicalIndicators.RSI.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>SMA (50 days):</span>
                        <span className="font-bold">{technicalIndicators.SMA.toFixed(2)}</span>
                      </div>
                      {/* Indicator interpretation */}
                      <div className="mt-4 text-sm">
                        <p className="text-gray-600">
                          {technicalIndicators.RSI > 70 ? 
                            'RSI indicates the stock may be overbought.' : 
                            technicalIndicators.RSI < 30 ? 
                            'RSI indicates the stock may be oversold.' : 
                            'RSI is in the neutral range.'}
                        </p>
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
      </div>
    </div>
  );
}

export default StockDetails;