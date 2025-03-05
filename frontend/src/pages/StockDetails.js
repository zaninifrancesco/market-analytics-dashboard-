import React from 'react';
import { useParams } from 'react-router-dom';

function StockDetails() {
  const { symbol } = useParams();

  return (
    <div>
      <h2>Dettagli Stock: {symbol}</h2>
      <p>Grafici e dati storici...</p>
    </div>
  );
}

export default StockDetails;
