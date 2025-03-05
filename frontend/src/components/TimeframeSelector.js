import React from 'react';

const TimeframeSelector = ({ selectedTimeframe, onTimeframeChange }) => {
  const timeframes = [
    { id: '1d', label: '1D' },
    { id: '1w', label: '1W' },
    { id: '1m', label: '1M' },
    { id: '1y', label: '1Y' },
  ];

  return (
    <div className="flex space-x-2 mb-4">
      {timeframes.map((timeframe) => (
        <button
          key={timeframe.id}
          onClick={() => onTimeframeChange(timeframe.id)}
          className={`px-4 py-2 rounded-lg font-medium ${
            selectedTimeframe === timeframe.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } transition-colors duration-200`}
        >
          {timeframe.label}
        </button>
      ))}
    </div>
  );
};

export default TimeframeSelector;