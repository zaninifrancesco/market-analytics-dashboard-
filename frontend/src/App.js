import { useEffect, useState } from "react";
import { getStockData } from "./api/api";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getStockData("AAPL").then(setData);
  }, []);

  return (
    <div>
      <h1>Stock Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default App;
