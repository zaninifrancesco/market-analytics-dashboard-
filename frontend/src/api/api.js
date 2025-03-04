const BASE_URL = "http://localhost:5000/api";

export async function getStockData(symbol) {
  const response = await fetch(`${BASE_URL}/stock_data/${symbol}`);
  return response.json();
}
