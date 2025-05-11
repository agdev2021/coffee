import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getProducts, deleteProduct, supabase } from '../services/supabase';
import MerchantProductForm from '../components/MerchantProductForm';

function MerchantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [merchantData, setMerchantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    loadMerchantData();
  }, [user]);

  const loadMerchantData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      setMerchantData(data);
    } catch (err) {
      console.error('Error loading merchant data:', err);
      error('Failed to load merchant profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  if (!merchantData) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Merchant Account Not Set Up</h1>
        <p className="text-gray-600 mb-6">
          Your merchant account hasn't been fully set up yet. Please complete your profile to start listing products.
        </p>
        <button
          onClick={() => navigate('/merchant/setup')}
          className="bg-primary-700 text-white py-2 px-6 rounded-md hover:bg-primary-800"
        >
          Set Up Merchant Account
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Merchant Dashboard</h1>
      
      <Routes>
        <Route path="/" element={<MerchantProducts merchantId={merchantData.id} />} />
        <Route path="products" element={<MerchantProducts merchantId={merchantData.id} />} />
        <Route path="products/add" element={<AddProduct merchantId={merchantData.id} />} />
        <Route path="products/edit/:id" element={<EditProduct merchantId={merchantData.id} />} />
        <Route path="profile" element={<MerchantProfile merchantData={merchantData} onUpdate={loadMerchantData} />} />
        <Route path="setup" element={<MerchantSetup onComplete={loadMerchantData} />} />
      </Routes>
    </div>
  );
}

// Merchant Products Component
function MerchantProducts({ merchantId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (merchantId) {
      loadProducts();
    }
  }, [merchantId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts({ merchantId });
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
      error('Failed to load your products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        success('Product deleted successfully');
        setProducts(products.filter(product => product.id !== id));
      } catch (err) {
        console.error('Error deleting product:', err);
        error('Failed to delete product');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Products</h2>
        <div className="flex space-x-4">
          <Link
            to="/merchant/profile"
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
          >
            Merchant Profile
          </Link>
          <Link
            to="/merchant/products/add"
            className="bg-primary-700 text-white py-2 px-4 rounded-md hover:bg-primary-800"
          >
            Add New Product
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">You haven't added any products yet.</p>
              <Link
                to="/merchant/products/add"
                className="bg-primary-700 text-white py-2 px-4 rounded-md hover:bg-primary-800"
              >
                Add Your First Product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                  {/* Product Image */}
                  <div className="h-48 bg-gray-100 relative">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
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
                  </div>
                  
                  {/* Product Details */}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <span className="font-bold text-lg">${product.price?.toFixed(2) || '0.00'}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 my-2">
                      {product.roast_level && (
                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                          {product.roast_level} Roast
                        </span>
                      )}
                      {product.origin && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {product.origin}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description || 'No description available.'}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => navigate(`/merchant/products/edit/${product.id}`)}
                        className="flex-1 bg-primary-700 hover:bg-primary-800 text-white py-2 px-4 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Add Product Component
function AddProduct({ merchantId }) {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const handleSubmit = async (productData) => {
    try {
      // Submission is handled in MerchantProductForm
      success('Product added successfully');
      navigate('/merchant/products');
    } catch (err) {
      console.error('Error adding product:', err);
      error('Failed to add product: ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/merchant/products')}
          className="text-primary-600 hover:text-primary-800 mr-3"
        >
          &larr; Back to Products
        </button>
        <h2 className="text-xl font-semibold">Add New Product</h2>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <MerchantProductForm merchantId={merchantId} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

// Edit Product Component
function EditProduct({ merchantId }) {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { id } = useParams();

  const handleSubmit = async (productData) => {
    try {
      // Update is handled in MerchantProductForm
      success('Product updated successfully');
      navigate('/merchant/products');
    } catch (err) {
      console.error('Error updating product:', err);
      error('Failed to update product: ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/merchant/products')}
          className="text-primary-600 hover:text-primary-800 mr-3"
        >
          &larr; Back to Products
        </button>
        <h2 className="text-xl font-semibold">Edit Product</h2>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <MerchantProductForm isEdit productId={id} merchantId={merchantId} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

// Merchant Profile Component
function MerchantProfile({ merchantData, onUpdate }) {
  const [formData, setFormData] = useState({
    name: merchantData?.name || '',
    description: merchantData?.description || '',
    website: merchantData?.website || '',
    logo_url: merchantData?.logo_url || '',
  });
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      error('Please provide a merchant name');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error: updateError } = await supabase
        .from('merchants')
        .update({
          name: formData.name,
          description: formData.description,
          website: formData.website,
          logo_url: formData.logo_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', merchantData.id);
      
      if (updateError) throw updateError;
      
      success('Profile updated successfully');
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error updating profile:', err);
      error('Failed to update profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/merchant/products')}
          className="text-primary-600 hover:text-primary-800 mr-3"
        >
          &larr; Back to Products
        </button>
        <h2 className="text-xl font-semibold">Merchant Profile</h2>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Business Name*
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
                <label htmlFor="website" className="block text-gray-700 font-medium mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <label htmlFor="logo_url" className="block text-gray-700 font-medium mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  id="logo_url"
                  name="logo_url"
                  value={formData.logo_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {formData.logo_url && (
                  <div className="mt-2 h-20 w-20 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={formData.logo_url}
                      alt="Logo preview"
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
                <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                  Business Description
                </label>
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
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Merchant Setup Component
function MerchantSetup({ onComplete }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    logo_url: '',
  });
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      error('Please provide a business name');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error: insertError } = await supabase
        .from('merchants')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          website: formData.website,
          logo_url: formData.logo_url,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select();
      
      if (insertError) throw insertError;
      
      success('Merchant account created successfully!');
      if (onComplete) onComplete();
      navigate('/merchant/products');
    } catch (err) {
      console.error('Error creating merchant account:', err);
      error('Failed to create merchant account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Set Up Your Merchant Account</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Business Name*
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
            <label htmlFor="website" className="block text-gray-700 font-medium mb-2">
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="logo_url" className="block text-gray-700 font-medium mb-2">
              Logo URL
            </label>
            <input
              type="url"
              id="logo_url"
              name="logo_url"
              value={formData.logo_url}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {formData.logo_url && (
              <div className="mt-2 h-20 w-20 overflow-hidden rounded-md border border-gray-200">
                <img
                  src={formData.logo_url}
                  alt="Logo preview"
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
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Business Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            ></textarea>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-700 text-white py-2 px-6 rounded-md hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Merchant Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MerchantDashboard;
