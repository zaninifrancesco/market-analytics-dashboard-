import React, { useEffect, useState } from "react";

const CryptosList = () => {
  const [cryptos, setCryptos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/crypto_data/BTCUSDT")
      .then((res) => res.json())
      .then((data) => setCryptos(data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Crypto</h2>
      <div className="grid grid-cols-1 gap-4">
        {cryptos.map((crypto, index) => (
          <div 
            key={index} 
            className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-xl font-semibold text-blue-600">{crypto.Symbol}</span>
                <span className="ml-2 text-gray-600 text-sm">Bitcoin</span>
              </div>
              <span className="text-lg font-bold text-green-600">${parseFloat(crypto.close).toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Open: </span>
                <span className="font-medium">${parseFloat(crypto.open).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">High: </span>
                <span className="font-medium text-green-500">${parseFloat(crypto.high).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Low: </span>
                <span className="font-medium text-red-500">${parseFloat(crypto.low).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Volume: </span>
                <span className="font-medium">{parseFloat(crypto.volume).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptosList;