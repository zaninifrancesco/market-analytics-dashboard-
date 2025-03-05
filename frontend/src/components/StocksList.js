import React, { useEffect, useState } from "react";

const StocksList = () => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/stock_data/AAPL")
        .then((res) => res.json())
        .then((data) => {
            console.log(data); // Controlla i dati ricevuti
            setStocks(data);
        })
        .catch((err) => console.error("Errore nel fetch degli stock:", err));
  }, []);


  

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Stocks</h2>
      <ul>
        {stocks.map((stock, index) => (
          <li key={index} className="py-2">
            {stock.Close}$
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StocksList;
