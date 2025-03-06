import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
      </div>

      {/* Content skeleton - 5 rows */}
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-3 flex-1">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      ))}

      {/* Footer skeleton */}
      <div className="flex justify-end mt-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;