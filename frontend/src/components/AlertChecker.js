import { useEffect } from 'react';

const AlertChecker = () => {
  useEffect(() => {
    // Richiedi il permesso per le notifiche al caricamento
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    // Funzione per controllare tutti gli alert attivi
    const checkAlerts = async () => {
      const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
      
      // Filtra solo gli alert attivi
      const activeAlerts = alerts.filter(alert => alert.active);
      
      if (activeAlerts.length === 0) return;
      
      // Raggruppa gli alert per tipo
      const cryptoAlerts = activeAlerts.filter(a => a.assetType === 'crypto');
      const stockAlerts = activeAlerts.filter(a => a.assetType === 'stock');
      
      // Controlla gli alert crypto
      if (cryptoAlerts.length > 0) {
        const cryptoSymbols = [...new Set(cryptoAlerts.map(a => a.symbol))];
        try {
          const response = await fetch(`http://localhost:5000/api/crypto_batch?symbols=${cryptoSymbols.join(',')}`);
          console.log('response', response.url);
          if (!response.ok) {
            console.error('Errore nel recupero dei prezzi crypto:', response.status);
            return;
          }
          
          const data = await response.json();
          
          cryptoAlerts.forEach(alert => {
            const currentPrice = data[alert.symbol]?.current_price;
            
            if (currentPrice !== undefined) {
              checkAlertCondition(alert, currentPrice);
            }
          });
        } catch (err) {
          console.error('Errore nel controllo degli alert crypto:', err);
        }
      }
      
      // Controlla gli alert stock
      if (stockAlerts.length > 0) {
        const stockSymbols = [...new Set(stockAlerts.map(a => a.symbol))];
        try {
          const response = await fetch(`http://localhost:5000/api/stock_batch?symbols=${stockSymbols.join(',')}`);
          
          if (!response.ok) {
            console.error('Errore nel recupero dei prezzi stock:', response.status);
            return;
          }
          
          const data = await response.json();
          
          stockAlerts.forEach(alert => {
            const stockData = data[alert.symbol];
            const currentPrice = stockData?.price;
            
            if (currentPrice !== undefined) {
              checkAlertCondition(alert, currentPrice);
            }
          });
        } catch (err) {
          console.error('Errore nel controllo degli alert stock:', err);
        }
      }
    };
    
    // Funzione per verificare se un alert deve essere attivato
    const checkAlertCondition = (alert, currentPrice) => {
      let isTriggered = false;
      
      if (alert.condition === "above" && currentPrice >= alert.price_target) {
        isTriggered = true;
      } else if (alert.condition === "below" && currentPrice <= alert.price_target) {
        isTriggered = true;
      }
      
      if (isTriggered) {
        // Mostra notifica
        showNotification(alert, currentPrice);
        console.log(`Alert ${alert.symbol} attivato!`);
        
        // Disattiva l'alert
        const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
        const updatedAlerts = alerts.map(a => 
          a.id === alert.id ? {...a, active: false} : a
        );
        localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));
        
        // Salva nella cronologia degli alert attivati
        const history = JSON.parse(localStorage.getItem('alertHistory') || '[]');
        history.push({
          ...alert,
          triggered_at: new Date().toISOString(),
          price_at_trigger: currentPrice
        });
        localStorage.setItem('alertHistory', JSON.stringify(history));
      }
    };
    
    // Funzione per mostrare la notifica
    const showNotification = (alert, currentPrice) => {
      if (Notification.permission === "granted") {
        const direction = alert.condition === 'above' ? 'salito sopra' : 'sceso sotto';
        
        new Notification(`Alert ${alert.symbol}!`, {
            body: `Il prezzo di ${alert.symbol} è ${direction} $${alert.price_target.toFixed(2)} (attuale: $${currentPrice.toFixed(2)})`,          icon: '/favicon.ico' // Usa l'icona del tuo sito
        });
      }
    };
    
    // Esegui il controllo ogni 60 secondi
    const intervalId = setInterval(checkAlerts, 30000);
    
    // Esegui il controllo anche all'avvio
    checkAlerts();
    
    // Pulisci l'intervallo quando il componente viene smontato
    return () => clearInterval(intervalId);
  }, []);
  
  return null; // Questo componente non renderizza nulla
};

export default AlertChecker;