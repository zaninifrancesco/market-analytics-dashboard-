const BASE_URL = "https://market-analytics-dashboard.onrender.com/api";

export async function getStockData(symbol) {
  const response = await fetch(`${BASE_URL}/stock_data/${symbol}`);
  return response.json();
}
