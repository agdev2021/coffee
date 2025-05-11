import React from 'react';

function SearchBar({ query, setQuery, handleSearch, loading, placeholder }) {
  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="flex items-center">
        <input
          type="text"
          className="w-full p-4 pr-12 text-gray-900 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder={placeholder || "Search for coffee..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="absolute right-2.5 bottom-2.5 px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 disabled:opacity-70"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Searching</span>
            </div>
          ) : (
            <span>Search</span>
          )}
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
