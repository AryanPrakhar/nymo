import React from 'react';
import { MapPin, RefreshCw, BarChart3 } from 'lucide-react';

function Header({ location, sortBy, setSortBy, radius, setRadius, onRefresh }) {
  const sortOptions = [
    { value: 'rank', label: 'Hot' },
    { value: 'new', label: 'New' },
    { value: 'top', label: 'Top' }
  ];

  const radiusOptions = [
    { value: 0.5, label: '0.5 mi' },
    { value: 1, label: '1 mi' },
    { value: 2, label: '2 mi' },
    { value: 5, label: '5 mi' }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-feed mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>            <div>
              <h1 className="text-xl font-semibold text-gray-900">Nymo</h1>
              <p className="text-sm text-gray-500">Community updates near you</p>
            </div>
          </div>
          
          <button
            onClick={onRefresh}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh posts"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          {/* Location indicator */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>
              {location ? 'Location detected' : 'Locating...'}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Radius selector */}
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {radiusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Sort selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    sortBy === option.value
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
