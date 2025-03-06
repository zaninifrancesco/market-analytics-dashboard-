import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUpIcon, TrendingDownIcon, SearchIcon, BarChart3Icon,
  ChevronRightIcon, GlobeIcon, ArrowUpCircleIcon, ArrowDownCircleIcon,
  PieChartIcon, LayersIcon
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import LoadingSkeleton from '../components/LoadingSkeleton';

const StocksPage = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState('Technology');
  const [sectorStocks, setSectorStocks] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch market overview data
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/market_overview');
        if (!response.ok) {
          throw new Error('Failed to fetch market data');
        }
        const data = await response.json();
        setMarketData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Failed to load market data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  // Fetch sector stocks when selectedSector changes
  useEffect(() => {
    const fetchSectorStocks = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/stocks_by_sector?sector=${selectedSector}`);
        if (!response.ok) {
          throw new Error('Failed to fetch sector stocks');
        }
        const data = await response.json();
        setSectorStocks(data);
      } catch (err) {
        console.error(`Error fetching ${selectedSector} stocks:`, err);
      }
    };

    if (selectedSector) {
      fetchSectorStocks();
    }
  }, [selectedSector]);

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

  const handleStockClick = (symbol) => {
    navigate(`/stock/${symbol}`);
  };

  // Transform sectors data for chart display
  const getSectorPerformanceChart = () => {
    if (!marketData || !marketData.sectors || Object.keys(marketData.sectors).length === 0) {
      return [{ name: 'No data available', value: 0 }];
    }

    return Object.entries(marketData.sectors).map(([symbol, data]) => ({
      name: data.name || 'Unknown',
      value: data.change_percent || 0
    }));
  };

  // Transform market breadth for pie chart
  const getMarketBreadthData = () => {
    if (!marketData || !marketData.market_data) {
      return [
        { name: 'No Data', value: 1 }
      ];
    }

    return [
      { name: 'Advancing', value: marketData.market_data.advancing || 0 },
      { name: 'Declining', value: marketData.market_data.declining || 0 }
    ];
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#FF6B6B', '#6A0572'];
  const GAIN_COLOR = '#22c55e';
  const LOSS_COLOR = '#ef4444';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
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
              <p className="text-sm mt-2">Please try again later.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Market Overview */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Market Overview</h2>
                  <div className="text-sm text-gray-500">
                    Last updated: {marketData?.last_updated || 'N/A'}
                  </div>
                </div>

                {/* Major Indices */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {marketData && marketData.indices && Object.entries(marketData.indices).map(([symbol, data]) => (
                    <div key={symbol} className="bg-gray-50 rounded-lg p-4">
                      <div className="text-lg font-semibold">{data.name || symbol}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xl font-bold">
                          {formatNumber(data.price)}
                        </span>
                        <span 
                          className={`flex items-center ${(data.change_percent || 0) >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'}`}
                        >
                          {(data.change_percent || 0) >= 0 ? (
                            <TrendingUpIcon size={16} className="mr-1" />
                          ) : (
                            <TrendingDownIcon size={16} className="mr-1" />
                          )}
                          {(data.change_percent || 0).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Market Breadth Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Market Breadth</h3>
                    {marketData && marketData.market_data && (
                      <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-1"></span>
                          <span>Advancing: {marketData.market_data.advancing || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-red-500 rounded-full inline-block mr-1"></span>
                          <span>Declining: {marketData.market_data.declining || 0}</span>
                        </div>
                      </div>
                    )}
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={getMarketBreadthData()}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          dataKey="value"
                          label={({name, percent}) => {
                            const safePercent = percent || 0;
                            return `${name}: ${(safePercent * 100).toFixed(0)}%`;
                          }}
                        >
                          {getMarketBreadthData().map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={index === 0 ? GAIN_COLOR : LOSS_COLOR}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Sector Performance */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Sector Performance</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={getSectorPerformanceChart()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={false} />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => {
                            return [`${(value || 0).toFixed(2)}%`, 'Performance'];
                          }}
                          labelFormatter={(value, entry) => {
                            if (!entry || !entry[0] || !entry[0].payload) {
                              return 'N/A';
                            }
                            return entry[0].payload.name || 'N/A';
                          }}
                        />
                        <Bar dataKey="value">
                          {getSectorPerformanceChart().map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`}
                              fill={(entry.value || 0) >= 0 ? GAIN_COLOR : LOSS_COLOR} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Top Gainers & Losers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Gainers */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center mb-4">
                    <ArrowUpCircleIcon className="text-green-600 mr-2" size={20} />
                    <h2 className="text-xl font-bold text-gray-800">Top Gainers</h2>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {marketData && marketData.gainers && Object.keys(marketData.gainers).length > 0 ? (
                      Object.entries(marketData.gainers).map(([symbol, stock]) => (
                        <div 
                          key={symbol}
                          className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                          onClick={() => handleStockClick(symbol)}
                        >
                          <div>
                            <div className="font-medium">{symbol}</div>
                            <div className="text-sm text-gray-600">
                              {stock.name && stock.name.length > 30 
                                ? `${stock.name.substring(0, 30)}...` 
                                : (stock.name || symbol)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatNumber(stock.price)}</div>
                            <div className="text-green-600">+{(stock.change_percent || 0).toFixed(2)}%</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4">No gainers data available</div>
                    )}
                  </div>
                </div>

                {/* Top Losers */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center mb-4">
                    <ArrowDownCircleIcon className="text-red-600 mr-2" size={20} />
                    <h2 className="text-xl font-bold text-gray-800">Top Losers</h2>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {marketData && marketData.losers && Object.keys(marketData.losers).length > 0 ? (
                      Object.entries(marketData.losers).map(([symbol, stock]) => (
                        <div 
                          key={symbol}
                          className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                          onClick={() => handleStockClick(symbol)}
                        >
                          <div>
                            <div className="font-medium">{symbol}</div>
                            <div className="text-sm text-gray-600">
                              {stock.name && stock.name.length > 30 
                                ? `${stock.name.substring(0, 30)}...` 
                                : (stock.name || symbol)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatNumber(stock.price)}</div>
                            <div className="text-red-600">{(stock.change_percent || 0).toFixed(2)}%</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4">No losers data available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stocks by Sector */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Stocks by Sector</h2>
                
                <div className="flex overflow-x-auto space-x-2 pb-4 mb-4">
                  {marketData && marketData.by_sector && Object.keys(marketData.by_sector).length > 0 ? (
                    Object.keys(marketData.by_sector).map((sector) => (
                      <button
                        key={sector}
                        className={`px-4 py-2 rounded-full whitespace-nowrap ${
                          selectedSector === sector
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        onClick={() => setSelectedSector(sector)}
                      >
                        {sector}
                      </button>
                    ))
                  ) : (
                    <div className="text-gray-500 py-2">No sector data available</div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketData && marketData.by_sector && marketData.by_sector[selectedSector] ? (
                    Object.entries(marketData.by_sector[selectedSector]).length > 0 ? (
                      Object.entries(marketData.by_sector[selectedSector]).map(([symbol, stock]) => (
                        <div 
                          key={symbol}
                          className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleStockClick(symbol)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-semibold text-lg">{symbol}</div>
                              <div className="text-sm text-gray-600 truncate">{stock.name || symbol}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{formatNumber(stock.price)}</div>
                              <div className={(stock.change_percent || 0) >= 0 ? "text-green-600" : "text-red-600"}>
                                {(stock.change_percent || 0).toFixed(2)}%
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            Market Cap: {formatNumber(stock.market_cap)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center text-gray-500 py-4">
                        No stocks available for {selectedSector}
                      </div>
                    )
                  ) : (
                    <div className="col-span-3 text-center text-gray-500 py-4">
                      No data available for this sector
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

export default StocksPage;