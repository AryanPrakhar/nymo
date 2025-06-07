import React from 'react';

function LoadingSpinner({ size = 'medium', color = 'primary' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    gray: 'text-gray-400',
    white: 'text-white'
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-2 border-gray-200 border-t-current ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

export default LoadingSpinner;
