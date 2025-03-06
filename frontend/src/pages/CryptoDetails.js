import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar
} from 'recharts';
import { 
  TrendingUpIcon, TrendingDownIcon, BarChart3Icon,
  GlobeIcon, BitcoinIcon, DollarSignIcon, InfoIcon
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import LoadingSkeleton from '../components/LoadingSkeleton';

const CryptoDetails = () => {
  const { symbol } = useParams();
  const [cryptoData, setCryptoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1d');
  const [chartType, setChartType] = useState('line');
  const [error, setError] = useState(null);

  // Map timeframe selections to API parameters for Binance API
  const timeframeToInterval = {
    '1d': '5m',
    '5d': '1h',
    '1mo': '4h',
    '3mo': '1d',
    '6mo': '1d',
    '1y': '1w',
    '5y': '1M'
  };

  useEffect(() => {
    const fetchCryptoData = async () => {
      setLoading(true);
      try {
        // Fetch crypto data - nota che il simbolo deve essere formattato correttamente (in maiuscolo)
        const response = await fetch(`http://localhost:5000/api/crypto_data/${symbol.toUpperCase()}?period=${timeframe}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch crypto data: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setCryptoData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching crypto data:', err);
        setError(`${err.message || 'Failed to load crypto data. Please try again later.'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, [symbol, timeframe]);

  const formatTooltipValue = (value) => {
    return value ? `$${parseFloat(value).toFixed(2)}` : 'N/A';
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined || num === 'N/A') return 'N/A';
    
    // For market cap, format in billions/millions
    if (num > 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num > 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else {
      return `$${parseFloat(num).toFixed(2)}`;
    }
  };

  const calculatePerformance = (data) => {
    if (!data || data.length < 2) return { change: 0, percentChange: 0 };
    
    const firstPrice = parseFloat(data[0].close);
    const lastPrice = parseFloat(data[data.length - 1].close);
    
    const change = lastPrice - firstPrice;
    const percentChange = (change / firstPrice) * 100;
    
    return {
      change: change.toFixed(2),
      percentChange: percentChange.toFixed(2)
    };
  };

  const renderChart = () => {
    if (!cryptoData || !cryptoData.historical_data || cryptoData.historical_data.length === 0) {
      return <div className="text-center p-6">No chart data available</div>;
    }

    const data = cryptoData.historical_data.map(item => ({
      time: item.timestamp,
      price: parseFloat(item.close),
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      volume: parseFloat(item.volume)
    }));

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
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
                stroke="#f59e0b" 
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                name="Price"
              />
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
              <Bar dataKey="volume" fill="#f59e0b" name="Volume" />
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
                stroke="#f59e0b" 
                activeDot={{ r: 8 }} 
                name="Price" 
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  // Calcoliamo la performance solo se abbiamo dati disponibili
  const performance = cryptoData && cryptoData.historical_data && cryptoData.historical_data.length > 0
    ? calculatePerformance(cryptoData.historical_data)
    : { change: 0, percentChange: 0 };

  // Ottieni i dati della crypto
  const cryptoInfo = cryptoData?.crypto || {};
  const lastPrice = cryptoData?.historical_data?.length > 0 
    ? cryptoData.historical_data[cryptoData.historical_data.length - 1].close 
    : cryptoInfo.current_price;

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
              {/* Crypto Header */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      <span className="flex items-center">
                        {cryptoInfo.image && (
                          <img 
                            src={cryptoInfo.image} 
                            alt={cryptoInfo.name || symbol} 
                            className="w-8 h-8 mr-2"
                          />
                        )}
                        {!cryptoInfo.image && <BitcoinIcon className="mr-2 text-amber-500" size={28} />}
                        {symbol.toUpperCase().replace('USDT', '')} 
                      </span>
                    </h1>
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="mr-4">Cryptocurrency</span>
                      <span>{cryptoInfo.name || 'Digital Asset'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      ${parseFloat(lastPrice || cryptoInfo.current_price || 0).toFixed(2)}
                    </div>
                    <div className={`text-sm font-medium ${parseFloat(cryptoInfo.price_change_percentage_24h || performance.percentChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {parseFloat(cryptoInfo.price_change_percentage_24h || performance.percentChange) >= 0 ? (
                        <span className="flex items-center justify-end">
                          <TrendingUpIcon size={16} className="mr-1" />
                          +{parseFloat(cryptoInfo.price_change_percentage_24h || performance.percentChange).toFixed(2)}%
                        </span>
                      ) : (
                        <span className="flex items-center justify-end">
                          <TrendingDownIcon size={16} className="mr-1" />
                          {parseFloat(cryptoInfo.price_change_percentage_24h || performance.percentChange).toFixed(2)}%
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
                            ? 'bg-amber-600 text-white' 
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
                            ? 'bg-amber-600 text-white'
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

                {/* Crypto Chart */}
                <div className="mt-4">
                  {renderChart()}
                </div>
              </div>

              {/* Crypto Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Price Statistics */}
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Price Statistics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Current Price</div>
                        <div className="text-lg font-semibold">
                          ${parseFloat(lastPrice || cryptoInfo.current_price || 0).toFixed(2)}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">24h High</div>
                        <div className="text-lg font-semibold">
                          ${parseFloat(cryptoInfo.high_24h || 0).toFixed(2)}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">24h Low</div>
                        <div className="text-lg font-semibold">
                          ${parseFloat(cryptoInfo.low_24h || 0).toFixed(2)}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">24h Volume</div>
                        <div className="text-lg font-semibold">
                          {formatNumber(cryptoInfo.total_volume || 0)}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Price Change (24h)</div>
                        <div className={`text-lg font-semibold ${parseFloat(cryptoInfo.price_change_percentage_24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {parseFloat(cryptoInfo.price_change_percentage_24h || 0).toFixed(2)}%
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Market Rank</div>
                        <div className="text-lg font-semibold">
                          {cryptoInfo.market_cap_rank || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* About */}
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">About {symbol.toUpperCase().replace('USDT', '')}</h2>
                    <p className="text-gray-700">
                      {cryptoInfo.description || `${symbol.toUpperCase().replace('USDT', '')} is a digital cryptocurrency traded on various exchanges worldwide. It uses blockchain technology to secure transactions and control the creation of new units.`}
                    </p>
                    {cryptoInfo.links && cryptoInfo.links.homepage && (
                      <div className="mt-4">
                        <a 
                          href={cryptoInfo.links.homepage} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-amber-600 hover:text-amber-800 flex items-center"
                        >
                          <GlobeIcon size={16} className="mr-1" />
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Market Data */}
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Market Data</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Market Cap</div>
                        <div className="text-lg font-semibold">
                          {formatNumber(cryptoInfo.market_cap || 'N/A')}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Total Volume (24h)</div>
                        <div className="text-lg font-semibold">
                          {formatNumber(cryptoInfo.total_volume || 'N/A')}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Circulating Supply</div>
                        <div className="text-lg font-semibold">
                          {cryptoInfo.circulating_supply 
                            ? `${(cryptoInfo.circulating_supply / 1000000).toFixed(2)}M` 
                            : 'N/A'}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Max Supply</div>
                        <div className="text-lg font-semibold">
                          {cryptoInfo.max_supply 
                            ? `${(cryptoInfo.max_supply / 1000000).toFixed(2)}M` 
                            : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar content */}
                <div className="space-y-6">
                  {/* Market Sentiment */}
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Market Sentiment</h2>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="text-gray-700">Trend</div>
                      <div className={`font-semibold px-3 py-1 rounded-full text-sm ${
                        parseFloat(cryptoInfo.price_change_percentage_24h || 0) > 5
                          ? 'bg-green-100 text-green-800'
                          : parseFloat(cryptoInfo.price_change_percentage_24h || 0) < -5
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {parseFloat(cryptoInfo.price_change_percentage_24h || 0) > 5
                          ? 'Bullish'
                          : parseFloat(cryptoInfo.price_change_percentage_24h || 0) < -5
                          ? 'Bearish'
                          : 'Neutral'}
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Up Votes</span>
                        <span className="text-sm font-medium">
                          {cryptoInfo.sentiment_votes_up_percentage 
                            ? `${cryptoInfo.sentiment_votes_up_percentage}%` 
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Down Votes</span>
                        <span className="text-sm font-medium">
                          {cryptoInfo.sentiment_votes_down_percentage 
                            ? `${cryptoInfo.sentiment_votes_down_percentage}%` 
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Price Change (7d)</span>
                        <span className={`text-sm font-medium ${parseFloat(cryptoInfo.price_change_percentage_7d || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {parseFloat(cryptoInfo.price_change_percentage_7d || 0).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>


                  {/* Social Links */}
                  {cryptoInfo.links && (
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <h2 className="text-xl font-bold text-gray-800 mb-4">Social Links</h2>
                      <div className="space-y-2">
                        {cryptoInfo.links.twitter_screen_name && (
                          <a 
                            href={`https://twitter.com/${cryptoInfo.links.twitter_screen_name}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center p-2 hover:bg-gray-50 rounded-lg"
                          >
                            <span className="text-blue-500 mr-2">Twitter</span>
                            <span className="text-gray-600">@{cryptoInfo.links.twitter_screen_name}</span>
                          </a>
                        )}
                        {cryptoInfo.links.facebook_username && (
                          <a 
                            href={`https://facebook.com/${cryptoInfo.links.facebook_username}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center p-2 hover:bg-gray-50 rounded-lg"
                          >
                            <span className="text-blue-800 mr-2">Facebook</span>
                            <span className="text-gray-600">{cryptoInfo.links.facebook_username}</span>
                          </a>
                        )}
                        {cryptoInfo.links.telegram_channel_identifier && (
                          <a 
                            href={`https://t.me/${cryptoInfo.links.telegram_channel_identifier}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center p-2 hover:bg-gray-50 rounded-lg"
                          >
                            <span className="text-blue-400 mr-2">Telegram</span>
                            <span className="text-gray-600">{cryptoInfo.links.telegram_channel_identifier}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CryptoDetails;