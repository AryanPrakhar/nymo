import React from 'react';
import { MapPin, RefreshCw } from 'lucide-react';

function LocationPermission({ onRetry, error }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-primary-600" />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Location Access Required
        </h2>
          <p className="text-gray-600 mb-6">
          Nymo needs your location to show you relevant posts from your area. 
          Your location is only used to find nearby content and is never stored or shared.
        </p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Allow Location Access
          </button>
          
          <p className="text-xs text-gray-500">
            You can change this setting in your browser preferences at any time.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LocationPermission;
