import React from 'react';
import { useParams } from 'react-router-dom';

function CryptoDetails() {
  const { symbol } = useParams();

  return (
    <div>
      <h2>Dettagli Criptovaluta: {symbol}</h2>
      <p>Grafici e dati storici...</p>
    </div>
  );
}

export default CryptoDetails;
