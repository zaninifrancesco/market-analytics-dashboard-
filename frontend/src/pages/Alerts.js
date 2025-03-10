import React, { useEffect, useState } from "react";
import { BellIcon, ArrowUpIcon, ArrowDownIcon, Trash2Icon, AlertTriangleIcon, CheckCircleIcon } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' o 'history'
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    assetType: 'stock',
    price_target: '',
    condition: 'above',
  });
  
  const navigate = useNavigate();
  
  // Carica gli alert dal localStorage all'avvio
  useEffect(() => {
    const loadAlerts = () => {
      // Carica gli alert attivi
      const savedAlerts = localStorage.getItem('priceAlerts');
      if (savedAlerts) {
        setAlerts(JSON.parse(savedAlerts));
      }
      
      // Carica la cronologia degli alert
      const savedHistory = localStorage.getItem('alertHistory');
      if (savedHistory) {
        setAlertHistory(JSON.parse(savedHistory));
      }
    };
    
    loadAlerts();
    
    // Aggiungi event listener per rilevare modifiche al localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'priceAlerts' || e.key === 'alertHistory') {
        loadAlerts();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('priceAlertsChanged', loadAlerts);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('priceAlertsChanged', loadAlerts);
    };
  }, []);
  
  // Funzione per aggiungere un nuovo alert
  const handleAddAlert = () => {
    if (!newAlert.symbol || !newAlert.price_target) {
      alert("Per favore, compila tutti i campi");
      return;
    }
    
    const alert = {
      ...newAlert,
      id: Date.now().toString(),
      price_target: parseFloat(newAlert.price_target),
      active: true,
      created_at: new Date().toISOString()
    };
    
    const updatedAlerts = [...alerts, alert];
    setAlerts(updatedAlerts);
    localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));
    
    // Reset form
    setNewAlert({
      symbol: '',
      assetType: 'stock',
      price_target: '',
      condition: 'above'
    });
  };
  
  // Funzione per eliminare un alert
  const handleDeleteAlert = (id) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    setAlerts(updatedAlerts);
    localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));
  };
  
  // Funzione per eliminare un alert dalla cronologia
  const handleDeleteHistoryItem = (id) => {
    const updatedHistory = alertHistory.filter(alert => alert.id !== id);
    setAlertHistory(updatedHistory);
    localStorage.setItem('alertHistory', JSON.stringify(updatedHistory));
  };
  
  // Funzione per eliminare tutta la cronologia
  const handleClearHistory = () => {
    setAlertHistory([]);
    localStorage.setItem('alertHistory', JSON.stringify([]));
  };
  
  // Naviga alla pagina dei dettagli quando si clicca su un alert
  const navigateToDetails = (alert) => {
    const route = alert.assetType === 'crypto' ? 'crypto' : 'stock';
    navigate(`/${route}/${alert.symbol}`);
  };

  // Formatta la data per la visualizzazione
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Price Alerts</h1>
            
            {/* Form per creare nuovi alert */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Create New Alert</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Simbolo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                  <input
                    type="text"
                    value={newAlert.symbol}
                    onChange={(e) => setNewAlert({...newAlert, symbol: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="AAPL, BTC, etc."
                  />
                </div>
                
                {/* Tipo di Asset */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
                  <select
                    value={newAlert.assetType}
                    onChange={(e) => setNewAlert({...newAlert, assetType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="stock">Stock</option>
                    <option value="crypto">Crypto</option>
                  </select>
                </div>
                
                {/* Condizione */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    value={newAlert.condition}
                    onChange={(e) => setNewAlert({...newAlert, condition: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="above">Price Goes Above</option>
                    <option value="below">Price Goes Below</option>
                  </select>
                </div>
                
                {/* Prezzo Target */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Price</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={newAlert.price_target}
                      onChange={(e) => setNewAlert({...newAlert, price_target: e.target.value})}
                      className="w-full pl-6 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                {/* Pulsante Aggiungi */}
                <div className="flex items-end">
                  <button
                    onClick={handleAddAlert}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Alert
                  </button>
                </div>
              </div>
            </div>
            
            {/* Tabs per navigare tra alert attivi e cronologia */}
            <div className="mb-4 border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'active'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Active Alerts
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'history'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Alert History
                </button>
              </nav>
            </div>
            
            {/* Contenuto dei tab */}
            {activeTab === 'active' ? (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-800">Active Price Alerts</h2>
                </div>
                
                {alerts.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                      <BellIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No active alerts</h3>
                    <p className="mt-1 text-sm text-gray-500">Create a new alert using the form above.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Symbol
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Condition
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Target Price
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {alerts.map(alert => (
                          <tr 
                            key={alert.id} 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigateToDetails(alert)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{alert.symbol}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                alert.assetType === 'crypto' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {alert.assetType === 'crypto' ? 'Crypto' : 'Stock'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-800">
                                {alert.condition === 'above' ? (
                                  <>
                                    <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                                    Above
                                  </>
                                ) : (
                                  <>
                                    <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
                                    Below
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">${alert.price_target.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(alert.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAlert(alert.id);
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2Icon className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-800">Alert History</h2>
                  {alertHistory.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear History
                    </button>
                  )}
                </div>
                
                {alertHistory.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                      <CheckCircleIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No alert history</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Alerts that have been triggered will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Symbol
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Condition
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Target Price
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Triggered Price
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Triggered At
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {alertHistory.map(alert => (
                          <tr 
                            key={alert.id} 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigateToDetails(alert)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{alert.symbol}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                alert.assetType === 'crypto' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {alert.assetType === 'crypto' ? 'Crypto' : 'Stock'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-800">
                                {alert.condition === 'above' ? (
                                  <>
                                    <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                                    Above
                                  </>
                                ) : (
                                  <>
                                    <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
                                    Below
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">${alert.price_target.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">${alert.price_at_trigger.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(alert.triggered_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteHistoryItem(alert.id);
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2Icon className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {/* Informazioni */}
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">How alerts work</h3>
              <p className="mt-1 text-sm text-blue-700">
                Alerts will only be triggered when this website is open in your browser. 
                You will receive a browser notification when the price condition is met.
                Triggered alerts are automatically moved to the Alert History.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Alerts;