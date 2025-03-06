import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUpIcon, TrendingDownIcon, SearchIcon, BarChart3Icon,
  ChevronRightIcon, GlobeIcon, ArrowUpCircleIcon, ArrowDownCircleIcon,
  PieChartIcon, LayersIcon, CoinIcon, DollarSignIcon, BitcoinIcon
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import LoadingSkeleton from '../components/LoadingSkeleton';

const CryptosPage = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categoryCryptos, setCategoryCryptos] = useState({});
  const navigate = useNavigate();

  // Fetch crypto market overview data
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      try {
        // Using CoinGecko API via our backend
        const response = await fetch('http://localhost:5000/api/crypto_market_overview');
        const data = await response.json();
        setMarketData(data);
      } catch (err) {
        console.error('Error fetching crypto market data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  // Fetch cryptos by category when selectedCategory changes
  useEffect(() => {
    const fetchCryptosByCategory = async () => {
      try {
        // If "All" is selected, we don't need to filter by category
        const categoryParam = selectedCategory === 'All' ? '' : `?category=${selectedCategory.toLowerCase()}`;
        const response = await fetch(`http://localhost:5000/api/cryptos_by_category${categoryParam}`);
        const data = await response.json();
        setCategoryCryptos(data);
      } catch (err) {
        console.error(`Error fetching ${selectedCategory} cryptos:`, err);
      }
    };

    fetchCryptosByCategory();
  }, [selectedCategory]);

  const formatTooltipValue = (value) => {
    return value ? `$${value.toFixed(2)}` : 'N/A';
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    
    // For market cap, format in billions/millions
    if (num > 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num > 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  const handleCryptoClick = (symbol) => {
    // Format symbol for routing (remove USDT suffix if present)
    const routeSymbol = symbol.replace('USDT', '');
    navigate(`/crypto/${routeSymbol}`);
  };

  // Transform categories data for chart display
  const getCategoryPerformanceChart = () => {
    if (!marketData || !marketData.categories) {
      return [];
    }

    return Object.entries(marketData.categories).map(([category, data]) => ({
      name: data.name || category,
      value: data.change_percent || 0
    }));
  };

  // Transform market trend for pie chart
  const getMarketTrendData = () => {
    if (!marketData || !marketData.market_data) {
      return [];
    }

    return [
      { name: 'Up Trending', value: marketData.market_data.up_trending || 0 },
      { name: 'Down Trending', value: marketData.market_data.down_trending || 0 }
    ];
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#FF6B6B', '#6A0572'];
  const GAIN_COLOR = '#22c55e';
  const LOSS_COLOR = '#ef4444';

  // Category options
  const categories = [
    'All', 'DeFi', 'Layer-1', 'Gaming', 'NFT', 'Stablecoins', 'DEX'
  ];

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
          ) : (
            <div className="space-y-6">
              {/* Crypto Market Overview */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <BitcoinIcon className="text-amber-500 mr-2" size={24} />
                    <h2 className="text-2xl font-bold text-gray-800">Crypto Market Overview</h2>
                  </div>
                  <div className="text-sm text-gray-500">
                    Last updated: {marketData?.last_updated || 'N/A'}
                  </div>
                </div>

                {/* Market Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-500">Total Market Cap</div>
                    <div className="text-lg font-semibold">
                      {formatNumber(marketData?.market_summary?.total_market_cap_usd)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-500">24h Volume</div>
                    <div className="text-lg font-semibold">
                      {formatNumber(marketData?.market_summary?.total_volume_24h)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-500">BTC Dominance</div>
                    <div className="text-lg font-semibold">
                      {marketData?.market_summary?.btc_dominance?.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-500">ETH Dominance</div>
                    <div className="text-lg font-semibold">
                      {marketData?.market_summary?.eth_dominance?.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-500">Market Cap 24h</div>
                    <div className={`text-lg font-semibold ${(marketData?.market_summary?.market_cap_change_24h || 0) >= 0 
                      ? 'text-green-600' : 'text-red-600'}`}>
                      {(marketData?.market_summary?.market_cap_change_24h || 0) >= 0 ? '+' : ''}
                      {marketData?.market_summary?.market_cap_change_24h?.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Major Crypto Indices */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">Major Crypto Indices</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">24h Change</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {marketData?.indices && Object.entries(marketData.indices).map(([symbol, data]) => (
                          <tr 
                            key={symbol}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleCryptoClick(symbol)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{symbol}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-900">{data.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-900">${data.price?.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`flex items-center ${data.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {data.change_percent >= 0 ? (
                                  <ArrowUpCircleIcon className="mr-1" size={16} />
                                ) : (
                                  <ArrowDownCircleIcon className="mr-1" size={16} />
                                )}
                                {Math.abs(data.change_percent).toFixed(2)}%
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Market Sentiment Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Market Trend Distribution */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">Market Trend Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getMarketTrendData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {getMarketTrendData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? GAIN_COLOR : LOSS_COLOR} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Category Performance */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">Category Performance (24h)</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getCategoryPerformanceChart()}
                          margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                          <YAxis tickFormatter={(value) => `${value}%`} />
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Bar dataKey="value">
                            {getCategoryPerformanceChart().map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.value >= 0 ? GAIN_COLOR : LOSS_COLOR} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories Section */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-6">
                  <LayersIcon className="text-indigo-500 mr-2" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">Cryptocurrencies by Category</h2>
                </div>
                
                {/* Category Selector */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          selectedCategory === category 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Cryptos in Selected Category */}
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">24h Change</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Cap</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categoryCryptos?.coins && Object.entries(categoryCryptos.coins).map(([symbol, data]) => (
                        <tr key={symbol} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{symbol}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900">{data.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900">${data.price?.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center ${data.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {data.change_percent >= 0 ? (
                                <ArrowUpCircleIcon className="mr-1" size={16} />
                              ) : (
                                <ArrowDownCircleIcon className="mr-1" size={16} />
                              )}
                              {Math.abs(data.change_percent).toFixed(2)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900">{formatNumber(data.market_cap)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleCryptoClick(symbol)}
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Performers Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Gainers */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center mb-6">
                    <TrendingUpIcon className="text-green-500 mr-2" size={24} />
                    <h2 className="text-2xl font-bold text-gray-800">Top Gainers</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {marketData?.gainers && Object.entries(marketData.gainers).map(([symbol, data]) => (
                      <div 
                        key={symbol}
                        className="p-4 border border-gray-100 rounded-lg hover:shadow-md cursor-pointer"
                        onClick={() => handleCryptoClick(symbol)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-lg">{symbol}</div>
                            <div className="text-sm text-gray-600">{data.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${data.price?.toFixed(2)}</div>
                            <div className="text-green-600 font-medium">
                              +{data.change_percent?.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Top Losers */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center mb-6">
                    <TrendingDownIcon className="text-red-500 mr-2" size={24} />
                    <h2 className="text-2xl font-bold text-gray-800">Top Losers</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {marketData?.losers && Object.entries(marketData.losers).map(([symbol, data]) => (
                      <div 
                        key={symbol}
                        className="p-4 border border-gray-100 rounded-lg hover:shadow-md cursor-pointer"
                        onClick={() => handleCryptoClick(symbol)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-lg">{symbol}</div>
                            <div className="text-sm text-gray-600">{data.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${data.price?.toFixed(2)}</div>
                            <div className="text-red-600 font-medium">
                              {data.change_percent?.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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

export default CryptosPage;