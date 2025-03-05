import React, { useEffect, useState } from "react";

const CryptosList = () => {
  const [cryptos, setCryptos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/crypto_data/BTCUSDT") // Modifica per più crypto
      .then((res) => res.json())
      .then((data) => setCryptos(data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Crypto</h2>
      <ul>
        {cryptos.map((crypto, index) => (
          <li key={index} className="py-2">
            {crypto.close}$
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CryptosList;
