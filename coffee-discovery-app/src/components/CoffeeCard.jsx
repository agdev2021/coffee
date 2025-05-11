import React from 'react';

function CoffeeCard({ coffee }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-transform hover:transform hover:scale-105">
      {/* Coffee Image */}
      <div className="h-48 bg-gray-100 relative">
        {coffee.image_url ? (
          <img 
            src={coffee.image_url} 
            alt={coffee.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm5 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" 
              />
            </svg>
          </div>
        )}
        
        {/* Merchant Badge if available */}
        {coffee.merchant_name && (
          <div className="absolute top-2 right-2 bg-primary-700 text-white text-xs px-2 py-1 rounded-full">
            {coffee.merchant_name}
          </div>
        )}
      </div>
      
      {/* Coffee Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{coffee.name}</h3>
          <span className="font-bold text-lg">${coffee.price?.toFixed(2) || '0.00'}</span>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {coffee.roast_level && (
            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
              {coffee.roast_level} Roast
            </span>
          )}
          {coffee.origin && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {coffee.origin}
            </span>
          )}
          {coffee.acidity && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {coffee.acidity} Acidity
            </span>
          )}
        </div>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {coffee.description || 'No description available.'}
        </p>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <a 
            href={coffee.purchase_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 bg-primary-700 hover:bg-primary-800 text-white py-2 px-4 rounded text-center"
          >
            Buy Now
          </a>
          <button 
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            title="View Details"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CoffeeCard;
