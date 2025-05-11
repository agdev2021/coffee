import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { addProduct, updateProduct, getProductById } from '../services/supabase';
import { generateCoffeeDescription } from '../services/openai';
import axios from 'axios';

function MerchantProductForm({ isEdit = false, productId, merchantId, onSubmit }) {
  const { error, success } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    roast_level: 'medium',
    acidity: 'medium',
    price: '',
    description: '',
    image_url: '',
    purchase_url: '',
    flavor_notes: '',
  });

  // Load product data if editing
  useEffect(() => {
    if (isEdit && productId) {
      loadProductData();
    }
  }, [isEdit, productId]);

  const loadProductData = async () => {
    try {
      setLoadingProduct(true);
      const product = await getProductById(productId);
      
      // Verify this product belongs to the merchant
      if (product.merchant_id !== merchantId) {
        error('You do not have permission to edit this product');
        return;
      }
      
      setFormData({
        ...product,
        flavor_notes: product.flavor_notes?.join(', ') || '',
      });
    } catch (err) {
      console.error('Error loading product data:', err);
      error('Failed to load product data');
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) {
      error('Please provide a product name first');
      return;
    }
    
    try {
      setGeneratingDescription(true);
      
      const coffeeDetails = {
        name: formData.name,
        origin: formData.origin,
        roastLevel: formData.roast_level,
        flavorNotes: formData.flavor_notes.split(',').map(note => note.trim()).filter(Boolean),
      };
      
      const description = await generateCoffeeDescription(coffeeDetails);
      
      setFormData({
        ...formData,
        description,
      });
    } catch (err) {
      console.error('Error generating description:', err);
      error('Failed to generate description');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const fetchMetadataFromUrl = async () => {
    if (!formData.purchase_url) {
      error('Please enter a product URL first');
      return;
    }

    try {
      setFetchingMetadata(true);
      success('Attempting to fetch product metadata...');
      
      // In a real implementation, this would call a server endpoint
      // that would scrape the provided URL and return metadata
      // For now, we'll simulate this behavior
      
      // Simulated delay to mimic scraping
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demonstration, we're just generating mock data
      // In a real app, this would come from the scraping service
      const mockMetadata = {
        name: formData.name || `${formData.roast_level.charAt(0).toUpperCase() + formData.roast_level.slice(1)} Roast Coffee`,
        image_url: formData.image_url || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
        price: formData.price || (Math.floor(Math.random() * 20) + 10).toFixed(2),
        description: formData.description || 'A delicious coffee with rich flavor notes and smooth finish.'
      };
      
      // Update form with fetched metadata
      setFormData(prev => ({
        ...prev,
        name: mockMetadata.name,
        image_url: mockMetadata.image_url,
        price: mockMetadata.price,
        description: mockMetadata.description
      }));
      
      success('Product metadata fetched successfully');
    } catch (err) {
      console.error('Error fetching metadata:', err);
      error('Unable to fetch product metadata. Please enter details manually.');
    } finally {
      setFetchingMetadata(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.price) {
      error('Please fill in required fields: Name and Price');
      return;
    }
    
    setLoading(true);
    
    try {
      // Format data for submission
      const productData = {
        ...formData,
        // Convert string price to number
        price: parseFloat(formData.price),
        // Convert comma-separated flavor notes to array
        flavor_notes: formData.flavor_notes.split(',').map(note => note.trim()).filter(Boolean),
        // Set merchant ID
        merchant_id: merchantId,
        // Set priority flag for merchant products
        is_merchant_product: true,
      };
      
      // Call the appropriate Supabase function
      if (isEdit) {
        await updateProduct(productId, productData);
      } else {
        await addProduct(productData);
      }
      
      // Call the onSubmit callback from parent component
      if (onSubmit) {
        onSubmit(productData);
      }
    } catch (err) {
      console.error('Error saving product:', err);
      error(`Failed to ${isEdit ? 'update' : 'add'} product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
          <div className="mb-4">
            <label htmlFor="purchase_url" className="block text-gray-700 font-medium mb-2">
              Product URL
            </label>
            <div className="flex">
              <input
                type="url"
                id="purchase_url"
                name="purchase_url"
                value={formData.purchase_url}
                onChange={handleChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://your-shop.com/product"
              />
              <button
                type="button"
                onClick={fetchMetadataFromUrl}
                disabled={fetchingMetadata}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-r-md"
              >
                {fetchingMetadata ? 'Fetching...' : 'Fetch Info'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Enter your product URL to auto-fill fields
            </p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Product Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="origin" className="block text-gray-700 font-medium mb-2">
              Origin
            </label>
            <input
              type="text"
              id="origin"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="roast_level" className="block text-gray-700 font-medium mb-2">
              Roast Level
            </label>
            <select
              id="roast_level"
              name="roast_level"
              value={formData.roast_level}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="acidity" className="block text-gray-700 font-medium mb-2">
              Acidity
            </label>
            <select
              id="acidity"
              name="acidity"
              value={formData.acidity}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        {/* Right Column */}
        <div>
          <div className="mb-4">
            <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
              Price ($)*
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="image_url" className="block text-gray-700 font-medium mb-2">
              Image URL
            </label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {formData.image_url && (
              <div className="mt-2 h-32 w-32 overflow-hidden rounded-md border border-gray-200">
                <img
                  src={formData.image_url}
                  alt="Product preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/150?text=Invalid+Image';
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="flavor_notes" className="block text-gray-700 font-medium mb-2">
              Flavor Notes (comma separated)
            </label>
            <input
              type="text"
              id="flavor_notes"
              name="flavor_notes"
              value={formData.flavor_notes}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. chocolate, caramel, citrus"
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="description" className="block text-gray-700 font-medium">
                Description
              </label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={generatingDescription}
                className="text-primary-600 text-sm hover:text-primary-800"
              >
                {generatingDescription ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            ></textarea>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary-700 text-white py-2 px-6 rounded-md hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400"
        >
          {loading ? `${isEdit ? 'Updating' : 'Adding'}...` : (isEdit ? 'Update Product' : 'Add Product')}
        </button>
      </div>
    </form>
  );
}

export default MerchantProductForm;
