import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { addProduct, updateProduct, getProductById } from '../services/supabase';
import { generateCoffeeDescription } from '../services/openai';

function AdminProductForm({ isEdit = false, onSubmit }) {
  const { id } = useParams();
  const { error } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
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
    is_featured: false,
    flavor_notes: '',
  });

  // Load product data if editing
  useEffect(() => {
    if (isEdit && id) {
      loadProductData();
    }
  }, [isEdit, id]);

  const loadProductData = async () => {
    try {
      setLoadingProduct(true);
      const product = await getProductById(id);
      
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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
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
        // Set admin flag
        added_by: 'admin',
      };
      
      // Call the appropriate Supabase function
      if (isEdit) {
        await updateProduct(id, productData);
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
        </div>
        
        {/* Right Column */}
        <div>
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
            <label htmlFor="purchase_url" className="block text-gray-700 font-medium mb-2">
              Purchase URL
            </label>
            <input
              type="url"
              id="purchase_url"
              name="purchase_url"
              value={formData.purchase_url}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
          
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">Feature this product</span>
            </label>
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

export default AdminProductForm;
