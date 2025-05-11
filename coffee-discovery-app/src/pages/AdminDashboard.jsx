import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { getProducts, getUserQueries, deleteProduct } from '../services/supabase';
import { useToast } from '../contexts/ToastContext';
import AdminProductForm from '../components/AdminProductForm';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const navigate = useNavigate();
  const { success, error } = useToast();

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-6">
          <button
            className={`py-3 px-1 ${
              activeTab === 'products'
                ? 'border-b-2 border-primary-700 text-primary-700 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              setActiveTab('products');
              navigate('/admin/products');
            }}
          >
            Products
          </button>
          <button
            className={`py-3 px-1 ${
              activeTab === 'queries'
                ? 'border-b-2 border-primary-700 text-primary-700 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              setActiveTab('queries');
              navigate('/admin/queries');
            }}
          >
            User Queries
          </button>
        </nav>
      </div>
      
      {/* Routes for different sections */}
      <Routes>
        <Route path="/" element={<AdminProducts />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />
        <Route path="queries" element={<UserQueries />} />
      </Routes>
    </div>
  );
}

// Admin Products Component
function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
      error('Failed to load products');
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
        <h2 className="text-xl font-semibold">Manage Products</h2>
        <Link
          to="/admin/products/add"
          className="bg-primary-700 text-white py-2 px-4 rounded-md hover:bg-primary-800"
        >
          Add New Product
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No products found. Add some products to get started.</p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roast</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 mr-3">
                            {product.image_url ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={product.image_url}
                                alt={product.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 text-xs">No img</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.origin || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.roast_level || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.price?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.is_featured ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// User Queries Component
function UserQueries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    loadQueries();
  }, []);

  const loadQueries = async () => {
    try {
      setLoading(true);
      const data = await getUserQueries();
      setQueries(data);
    } catch (err) {
      console.error('Error loading user queries:', err);
      error('Failed to load user queries');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">User Search Queries</h2>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
        </div>
      ) : (
        <>
          {queries.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No user queries found yet.</p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Query</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Results</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {queries.map((query) => (
                    <tr key={query.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{query.query_text}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{query.response_data?.resultsCount || 0} products</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(query.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Add Product Component
function AddProduct() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const handleSubmit = async (productData) => {
    try {
      // Add product implementation will be in AdminProductForm component
      success('Product added successfully');
      navigate('/admin/products');
    } catch (err) {
      console.error('Error adding product:', err);
      error('Failed to add product: ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="text-primary-600 hover:text-primary-800 mr-3"
        >
          &larr; Back to Products
        </button>
        <h2 className="text-xl font-semibold">Add New Product</h2>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <AdminProductForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

// Edit Product Component
function EditProduct() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const handleSubmit = async (productData) => {
    try {
      // Update product implementation will be in AdminProductForm component
      success('Product updated successfully');
      navigate('/admin/products');
    } catch (err) {
      console.error('Error updating product:', err);
      error('Failed to update product: ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="text-primary-600 hover:text-primary-800 mr-3"
        >
          &larr; Back to Products
        </button>
        <h2 className="text-xl font-semibold">Edit Product</h2>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <AdminProductForm isEdit onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

export default AdminDashboard;
