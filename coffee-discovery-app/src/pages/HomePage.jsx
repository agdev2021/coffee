import { useState } from 'react';
import { extractCoffeePreferences, generateSearchQuery } from '../services/openai';
import { getProducts, saveUserQuery } from '../services/supabase';
import { useToast } from '../contexts/ToastContext';
import CoffeeCard from '../components/CoffeeCard';
import SearchBar from '../components/SearchBar';

function HomePage() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchMade, setSearchMade] = useState(false);
  const { error } = useToast();

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      error('Please enter a search query');
      return;
    }
    
    setLoading(true);
    setSearchMade(true);
    
    try {
      // Step 1: Extract preferences using OpenAI
      const preferences = await extractCoffeePreferences(query);
      
      // Step 2: Search our database for matching products
      const dbResults = await getProducts({
        roast: preferences.roastLevel || undefined,
        acidity: preferences.acidity || undefined,
        origin: preferences.origin || undefined
      });
      
      // Step 3: If we don't have enough results, we would typically search the web
      // For now, we'll just use what we have from the database
      const finalResults = dbResults;
      
      // Step 4: Save the query and results for analytics
      await saveUserQuery(query, { 
        preferences, 
        resultsCount: finalResults.length 
      });
      
      setSearchResults(finalResults);
    } catch (err) {
      console.error('Error performing search:', err);
      error('Something went wrong with your search. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white rounded-lg p-8 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Discover Your Perfect Coffee
        </h1>
        <p className="text-xl mb-6">
          Tell us what you're looking for, and our AI will find coffee that matches your taste.
        </p>
        
        {/* Search Bar */}
        <SearchBar 
          query={query}
          setQuery={setQuery}
          handleSearch={handleSearch}
          loading={loading}
          placeholder="I want low-acidity, medium roast coffee from South America..."
        />
        
        <p className="text-sm mt-3 opacity-80">
          Try: "Low acidity medium roast from Colombia" or "Dark roast with chocolate notes"
        </p>
      </div>

      {/* Results Section */}
      {searchMade && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            {loading
              ? 'Searching for your perfect coffee...'
              : searchResults.length > 0
              ? 'Coffee Recommendations'
              : 'No coffees found matching your criteria'}
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-700"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((coffee) => (
                <CoffeeCard key={coffee.id} coffee={coffee} />
              ))}
              
              {searchResults.length === 0 && !loading && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">
                    We couldn't find any coffees matching your criteria. Try broadening your search.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Featured Products Section (shown before search) */}
      {!searchMade && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Featured Coffees</h2>
          <p className="text-gray-600 mb-8">
            Explore some of our most popular coffees or use the search above to find your perfect match.
          </p>
          
          {/* This would typically be populated from the database */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
              <h3 className="font-semibold text-lg">Colombian Single Origin</h3>
              <p className="text-gray-600 text-sm mb-3">Medium roast with notes of caramel and citrus</p>
              <p className="font-semibold text-lg mb-3">$18.99</p>
              <button className="bg-primary-700 text-white py-2 px-4 rounded w-full">
                View Details
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
              <h3 className="font-semibold text-lg">Ethiopian Yirgacheffe</h3>
              <p className="text-gray-600 text-sm mb-3">Light roast with floral and berry notes</p>
              <p className="font-semibold text-lg mb-3">$22.99</p>
              <button className="bg-primary-700 text-white py-2 px-4 rounded w-full">
                View Details
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
              <h3 className="font-semibold text-lg">Sumatra Dark Roast</h3>
              <p className="text-gray-600 text-sm mb-3">Bold with earthy tones and low acidity</p>
              <p className="font-semibold text-lg mb-3">$19.99</p>
              <button className="bg-primary-700 text-white py-2 px-4 rounded w-full">
                View Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
