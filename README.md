# Market Analytics Dashboard

<div align="center">
  
![Dashboard Preview](https://via.placeholder.com/800x450?text=Market+Analytics+Dashboard)

📈 **Real-time stock & crypto tracking with interactive charts, financial news, and deep market insights**

</div>

## 🚀 Features

- ✅ **Real-time market data** with automatic granularity adjustment
- ✅ **Interactive charts** with multiple timeframes (1d, 5d, 1mo, 3mo, 6mo, 1y, 5y)
- ✅ **Chart types**: Line, Area, and Bar visualizations
- ✅ **Advanced search** with real-time results across stocks and crypto
- ✅ **Sector-based analysis** to track industry performance
- ✅ **Company fundamentals** including financials, analyst recommendations, and key statistics
- ✅ **Market breadth visualization** showing advancing vs declining stocks
- ✅ **Live financial news feed** for each company
- ✅ **Responsive design** for desktop and mobile viewing
- ✅ **Modern UI** with dark/light theme support

## 📊 Dashboard Views

- **Market Overview**: Index performance, sector analysis, and market breadth
- **Stock Details**: Company info, interactive price charts with technical indicators
- **Crypto Tracker**: Real-time cryptocurrency data and performance metrics
- **Watchlists**: Customizable lists to track favorite assets
- **News Aggregator**: Financial news from various sources

## 📌 Tech Stack

| Component | Technology Used |
|------------|----------------|
| **Frontend** | React.js, TailwindCSS, Recharts, Lucide React icons |
| **Backend** | Flask, REST API architecture |
| **Data Sources** | Yahoo Finance API, Binance API |
| **Data Processing** | Pandas, NumPy |
| **State Management** | React Hooks |
| **Routing** | React Router |

## 🛠️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stock_data/{ticker}?period={timeframe}` | Get stock data with adjustable timeframes |
| `GET` | `/api/market_overview` | Get overall market statistics and trends |
| `GET` | `/api/stocks_by_sector?sector={sector}` | Get stocks filtered by sector |
| `GET` | `/api/search_stock?query={search}` | Search for stocks and companies |
| `GET` | `/api/top_stocks` | Get top performing stocks |
| `GET` | `/api/top_cryptos` | Get top cryptocurrencies |

## 🔧 Implementation Details

- **Adaptive Chart Granularity**: Automatically selects appropriate data intervals based on requested timeframe
  - 1d: 5-minute intervals
  - 5d: 1-hour intervals
  - 1mo: Daily intervals
  - 3mo, 6mo: Daily intervals
  - 1y: Monthly intervals
  - 5y: Monthly intervals

- **Component Architecture**:
  - Reusable UI components (cards, charts, loading states)
  - Modular page structure for easy extension
  - Consistent styling with TailwindCSS utility classes

- **Real-time Data Processing**:
  - Efficient data formatting for chart visualization
  - On-demand data fetching to minimize load times
  - Error handling and fallbacks for API failures

## 🚀 Getting Started

### Prerequisites
- Node.js (v14.0+)
- Python (v3.8+)
- pip

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/market-analytics-dashboard.git
   cd market-analytics-dashboard
   ```

2. **Set up the backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the dashboard**
   Open your browser and navigate to `http://localhost:3000`
