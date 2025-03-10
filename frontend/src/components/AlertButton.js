import React, { useState, useEffect } from 'react';
import { Bell, X, Check, ArrowUp, ArrowDown, DollarSign } from 'lucide-react';

const AlertButton = ({ symbol, currentPrice, assetType }) => {
  const [showModal, setShowModal] = useState(false);
  const [priceTarget, setPriceTarget] = useState(currentPrice?.toFixed(2) || 0);
  const [condition, setCondition] = useState("above");
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [animation, setAnimation] = useState(false);

  // Reset form when symbol changes
  useEffect(() => {
    setPriceTarget(currentPrice?.toFixed(2) || 0);
  }, [currentPrice, symbol]);

  const handleSaveAlert = () => {
    try {
      const existingAlerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
      
      // Create new alert
      const newAlert = {
        id: Date.now().toString(),
        symbol,
        assetType,
        price_target: parseFloat(priceTarget),
        condition,
        active: true,
        created_at: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem('priceAlerts', JSON.stringify([...existingAlerts, newAlert]));
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('priceAlertsChanged'));
      
      // Show success notification
      setNotification({ 
        show: true, 
        message: 'Price alert has been set!', 
        type: 'success' 
      });
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        setShowModal(false);
        setTimeout(() => {
          setNotification({ show: false, message: '', type: '' });
        }, 300);
      }, 1500);
    } catch (error) {
      setNotification({ 
        show: true, 
        message: 'Failed to save alert. Please try again.', 
        type: 'error' 
      });
    }
  };

  // Handle button animation
  const handleButtonClick = () => {
    setAnimation(true);
    setShowModal(true);
    setTimeout(() => setAnimation(false), 300);
  };

  // Get suggested price targets based on current price
  const getPriceSuggestions = () => {
    if (!currentPrice) return [];
    
    const percentage = condition === 'above' ? 1.05 : 0.95;
    const suggestedPrice = (currentPrice * percentage).toFixed(2);
    
    return [
      { label: `${condition === 'above' ? '+5%' : '-5%'}`, value: suggestedPrice }
    ];
  };

  const suggestions = getPriceSuggestions();

  return (
    <>
      <button 
        onClick={handleButtonClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-md 
          hover:bg-gray-100 transition-all duration-200 ${animation ? 'scale-95' : ''}`}
        title="Set price alert"
      >
        <Bell size={15} className={`${animation ? 'animate-ping' : ''}`} />
        <span className="text-sm">Alert</span>
      </button>
      
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div 
            className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md transform transition-all duration-300 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {notification.show ? (
              <div className={`text-center py-6 animate-fade-in ${notification.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                <div className={`mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-3 ${
                  notification.type === 'error' ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  {notification.type === 'error' ? (
                    <X size={22} className="text-red-600" />
                  ) : (
                    <Check size={22} className="text-green-600" />
                  )}
                </div>
                <h3 className="text-lg">{notification.message}</h3>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg text-gray-900 flex items-center">
                    <Bell size={16} className="mr-2 text-blue-600" />
                    Set Alert for {symbol}
                  </h3>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">Current Price</span>
                    <span className="text-blue-900">${currentPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-700 mb-2">
                    Alert Condition
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCondition('above')}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border ${
                        condition === 'above' 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <ArrowUp size={15} className={condition === 'above' ? 'text-blue-600' : 'text-gray-500'} />
                      <span className="text-sm">Above</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCondition('below')}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border ${
                        condition === 'below' 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <ArrowDown size={15} className={condition === 'below' ? 'text-blue-600' : 'text-gray-500'} />
                      <span className="text-sm">Below</span>
                    </button>
                  </div>
                </div>
                
                <div className="mb-5">
                  <label className="block text-sm text-gray-700 mb-2">
                    Target Price
                  </label>
                  <div className="relative mb-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign size={15} className="text-gray-500" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={priceTarget}
                      onChange={(e) => setPriceTarget(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => setPriceTarget(suggestion.value)}
                          className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          {suggestion.label}: ${suggestion.value}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAlert}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
                  >
                    <Bell size={14} className="mr-2" />
                    Set Alert
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Add CSS for animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.2s ease-out forwards;
  }
  
  .animate-scale-in {
    animation: scaleIn 0.25s ease-out forwards;
  }
`;
document.head.appendChild(styleSheet);

export default AlertButton;