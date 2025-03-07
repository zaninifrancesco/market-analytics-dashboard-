import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import WatchlistButton from '../components/WatchlistButton';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar
} from 'recharts';
import { 
  TrendingUpIcon, TrendingDownIcon, DollarSignIcon, BarChart3Icon,
  CalendarIcon, BriefcaseIcon, GlobeIcon, NewspaperIcon, InfoIcon,
  ActivityIcon, TrendingUpIcon as UpIcon, TrendingDownIcon as DownIcon
} from 'lucide-react';
import Header from '../components/Header';
import LoadingSkeleton from '../components/LoadingSkeleton';

const StockDetails = () => {
  const { symbol } = useParams();
  const [stockData, setStockData] = useState(null);
  const [indicators, setIndicators] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingIndicators, setLoadingIndicators] = useState(true);
  const [timeframe, setTimeframe] = useState('1d');
  const [chartType, setChartType] = useState('line');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/stock_data/${symbol}?period=${timeframe}`);
        if (!response.ok) {
          throw new Error('Failed to fetch stock data');
        }
        const data = await response.json();
        setStockData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to load stock data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [symbol, timeframe]);

  useEffect(() => {
    const fetchTechnicalIndicators = async () => {
      if (!symbol) return;
      
      setLoadingIndicators(true);
      try {
        const response = await fetch(`http://localhost:5000/api/technical_indicators/${symbol}`);
        if (!response.ok) {
          throw new Error('Failed to fetch technical indicators');
        }
        const data = await response.json();
        setIndicators(data);
      } catch (err) {
        console.error('Error fetching technical indicators:', err);
        // We don't set the main error state here to avoid blocking the main content
      } finally {
        setLoadingIndicators(false);
      }
    };

    fetchTechnicalIndicators();
  }, [symbol]);

  const formatTooltipValue = (value) => {
    return value ? `$${value.toFixed(2)}` : 'N/A';
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined || num === 'N/A') return 'N/A';
    
    // For market cap, format in billions/millions
    if (num > 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num > 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  // Calculate performance metrics
  const calculatePerformance = (data) => {
    if (!data || data.length < 2) return { change: 0, percentChange: 0 };
    
    const firstPrice = data[0].close;
    const lastPrice = data[data.length - 1].close;
    
    const change = lastPrice - firstPrice;
    const percentChange = (change / firstPrice) * 100;
    
    return {
      change: change.toFixed(2),
      percentChange: percentChange.toFixed(2)
    };
  };

  // Get indicator status class
  const getIndicatorStatusClass = (indicator, value) => {
    if (indicator === 'RSI') {
      if (value < 30) return 'text-green-600';
      if (value > 70) return 'text-red-600';
      return 'text-yellow-600';
    }
    
    if (indicator === 'SMA_50' || indicator === 'EMA_20') {
      if (stockData?.company?.current_price > value) return 'text-green-600';
      return 'text-red-600';
    }
    
    return 'text-blue-600';
  };
  
  // Get indicator description
  const getIndicatorDescription = (indicator, value) => {
    if (indicator === 'RSI') {
      if (value < 30) return 'Oversold - Potential buy signal';
      if (value > 70) return 'Overbought - Potential sell signal';
      return 'Neutral';
    }
    
    if (indicator === 'SMA_50') {
      const price = stockData?.company?.current_price;
      if (price > value) return `Price above 50-day SMA by ${((price/value - 1) * 100).toFixed(2)}%`;
      return `Price below 50-day SMA by ${((1 - price/value) * 100).toFixed(2)}%`;
    }
    
    if (indicator === 'EMA_20') {
      const price = stockData?.company?.current_price;
      if (price > value) return `Price above 20-day EMA by ${((price/value - 1) * 100).toFixed(2)}%`;
      return `Price below 20-day EMA by ${((1 - price/value) * 100).toFixed(2)}%`;
    }
    
    if (indicator === 'VWAP') {
      const price = stockData?.company?.current_price;
      if (price > value) return `Price above VWAP - Bullish signal`;
      return `Price below VWAP - Bearish signal`;
    }
    
    return '';
  };

  // Get indicator icon
  const getIndicatorIcon = (indicator, value) => {
    if (indicator === 'RSI') {
      if (value < 30) return <UpIcon size={16} className="text-green-600" />;
      if (value > 70) return <DownIcon size={16} className="text-red-600" />;
      return <ActivityIcon size={16} className="text-yellow-600" />;
    }
    
    if (indicator === 'SMA_50' || indicator === 'EMA_20' || indicator === 'VWAP') {
      const price = stockData?.company?.current_price;
      if (price > value) return <UpIcon size={16} className="text-green-600" />;
      return <DownIcon size={16} className="text-red-600" />;
    }
    
    return <InfoIcon size={16} className="text-blue-600" />;
  };

  const renderChart = () => {
    if (!stockData || !stockData.historical_data || stockData.historical_data.length === 0) {
      return <div className="text-center p-6">No chart data available</div>;
    }

    const data = stockData.historical_data.map(item => ({
      time: item.timestamp.split(' ')[1] || item.timestamp.split(' ')[0],
      price: item.close,
      open: item.open,
      high: item.high,
      low: item.low,
      volume: item.volume,
      vwap: item.vwap
    }));

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" />
              <YAxis domain={['auto', 'auto']} />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip formatter={formatTooltipValue} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#82ca9d" 
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                name="Price"
              />
              {data[0].vwap && (
                <Line 
                  type="monotone" 
                  dataKey="vwap" 
                  stroke="#ff7300" 
                  name="VWAP" 
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip formatter={formatTooltipValue} />
              <Legend />
              <Bar dataKey="volume" fill="#8884d8" name="Volume" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip formatter={formatTooltipValue} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                name="Price" 
              />
              {data[0].vwap && (
                <Line 
                  type="monotone" 
                  dataKey="vwap" 
                  stroke="#ff7300" 
                  name="VWAP" 
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  const performance = stockData && stockData.historical_data 
    ? calculatePerformance(stockData.historical_data)
    : { change: 0, percentChange: 0 };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {loading ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <LoadingSkeleton />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <LoadingSkeleton />
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
              <p className="font-medium">{error}</p>
              <p className="text-sm mt-2">Please check if the symbol is correct or try again later.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stock Header */}
              <div className="bg-white p-6 rounded-xl shadow-md">
  <div className="flex justify-between items-start">
    <div>
      <div className="flex items-center">
        <h1 className="text-3xl font-bold text-gray-900 mr-2">
          {stockData.company.name} ({stockData.company.symbol})
        </h1>
        <WatchlistButton symbol={stockData.company.symbol} type="stocks" />
      </div>
      <div className="mt-2 text-sm text-gray-600">
        <span className="mr-4">{stockData.company.sector}</span>
        <span>{stockData.company.industry}</span>
      </div>
    </div>
    <div className="text-right">
      <div className="text-3xl font-bold text-gray-900">
        {formatNumber(stockData.company.current_price)}
      </div>
      <div className={`text-sm font-medium ${parseFloat(performance.percentChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {parseFloat(performance.percentChange) >= 0 ? (
          <span className="flex items-center justify-end">
            <TrendingUpIcon size={16} className="mr-1" />
            +{performance.change} (+{performance.percentChange}%)
          </span>
        ) : (
          <span className="flex items-center justify-end">
            <TrendingDownIcon size={16} className="mr-1" />
            {performance.change} ({performance.percentChange}%)
          </span>
        )}
      </div>
    </div>
  </div>

                {/* Chart controls */}
                <div className="flex justify-between items-center mt-6 mb-4">
                  <div className="flex space-x-2">
                    {['1d', '5d', '1mo', '3mo', '6mo', '1y', '5y'].map(period => (
                      <button
                        key={period}
                        className={`px-3 py-1 text-sm rounded-md ${
                          timeframe === period 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => setTimeframe(period)}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    {[
                      { type: 'line', icon: <TrendingUpIcon size={18} /> },
                      { type: 'area', icon: <AreaChart width={18} height={18} /> },
                      { type: 'bar', icon: <BarChart3Icon size={18} /> }
                    ].map(({ type, icon }) => (
                      <button
                        key={type}
                        className={`p-2 rounded-md ${
                          chartType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => setChartType(type)}
                        title={`Switch to ${type} chart`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Chart */}
                <div className="mt-4">
                  {renderChart()}
                </div>
              </div>

              {/* Company Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Key Statistics */}
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Key Statistics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Market Cap</div>
                        <div className="text-lg font-semibold">{formatNumber(stockData.company.market_cap)}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">P/E Ratio</div>
                        <div className="text-lg font-semibold">
                          {stockData.company.pe_ratio !== 'N/A' ? stockData.company.pe_ratio.toFixed(2) : 'N/A'}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Dividend Yield</div>
                        <div className="text-lg font-semibold">
                          {stockData.company.dividend_yield !== 'N/A' ? 
                            `${(stockData.company.dividend_yield * 100).toFixed(2)}%` : 'N/A'}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Beta</div>
                        <div className="text-lg font-semibold">
                          {stockData.company.beta !== 'N/A' ? stockData.company.beta.toFixed(2) : 'N/A'}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">52 Week High</div>
                        <div className="text-lg font-semibold">
                          {formatNumber(stockData.company.target_high_price)}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">52 Week Low</div>
                        <div className="text-lg font-semibold">
                          {formatNumber(stockData.company.target_low_price)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* About */}
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">About {stockData.company.symbol}</h2>
                    <p className="text-gray-700">
                      {stockData.company.business_summary}
                    </p>
                    {stockData.company.website && (
                      <div className="mt-4">
                        <a 
                          href={stockData.company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <GlobeIcon size={16} className="mr-1" />
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Financials */}
                  {stockData.company.financials && (
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <h2 className="text-xl font-bold text-gray-800 mb-4">Financials</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500">Revenue</div>
                          <div className="text-lg font-semibold">
                            {formatNumber(stockData.company.financials.revenue)}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500">Net Income</div>
                          <div className="text-lg font-semibold">
                            {formatNumber(stockData.company.financials.net_income)}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500">Cash</div>
                          <div className="text-lg font-semibold">
                            {formatNumber(stockData.company.cash)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar content */}
                <div className="space-y-6">
                  {/* Analyst Recommendations */}
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Analyst Recommendations</h2>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="text-gray-700">Consensus</div>
                      <div className={`font-semibold px-3 py-1 rounded-full text-sm ${
                        stockData.company.recommendation === 'buy' || stockData.company.recommendation === 'strongBuy' 
                          ? 'bg-green-100 text-green-800'
                          : stockData.company.recommendation === 'sell' || stockData.company.recommendation === 'strongSell'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {stockData.company.recommendation === 'strongBuy' ? 'Strong Buy' : 
                         stockData.company.recommendation === 'strongSell' ? 'Strong Sell' :
                         stockData.company.recommendation.charAt(0).toUpperCase() + stockData.company.recommendation.slice(1)}
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Target Low</span>
                        <span className="text-sm font-medium">{formatNumber(stockData.company.target_low_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Target Mean</span>
                        <span className="text-sm font-medium">{formatNumber(stockData.company.target_mean_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Target High</span>
                        <span className="text-sm font-medium">{formatNumber(stockData.company.target_high_price)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Technical Indicators - Replacing Recent News section */}
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Technical Indicators</h2>
                    
                    {loadingIndicators ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-500">Loading indicators...</span>
                      </div>
                    ) : !indicators ? (
                      <div className="text-center py-6 text-gray-500">
                        No technical data available
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {indicators.indicators && Object.entries(indicators.indicators).map(([key, value]) => (
                          <div key={key} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                {getIndicatorIcon(key, value)}
                                <span className="ml-2 font-medium text-gray-800">
                                  {key === 'RSI' ? 'RSI (14)' : 
                                   key === 'SMA_50' ? 'SMA (50)' : 
                                   key === 'EMA_20' ? 'EMA (20)' : 'VWAP (20)'}
                                </span>
                              </div>
                              <span className={`font-semibold ${getIndicatorStatusClass(key, value)}`}>
                                {value ? value.toFixed(2) : 'N/A'}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-600">
                              {getIndicatorDescription(key, value)}
                            </div>
                          </div>
                        ))}
                        
                        {indicators.signals && indicators.signals.length > 0 && (
                          <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Signals</h3>
                            <div className="space-y-2">
                              {indicators.signals.map((signal, idx) => (
                                <div 
                                  key={idx} 
                                  className={`text-xs p-2 rounded-md ${
                                    signal.signal === 'Oversold' || signal.signal === 'Above' 
                                      ? 'bg-green-50 text-green-800'
                                      : 'bg-red-50 text-red-800'
                                  }`}
                                >
                                  <span className="font-medium">{signal.indicator}:</span> {signal.signal} 
                                  {signal.strength && <span className="ml-1">({signal.strength})</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StockDetails;