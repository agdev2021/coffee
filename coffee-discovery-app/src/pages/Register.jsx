import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../services/supabase';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState('user');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { success, error } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password || !confirmPassword || !name) {
      error('Please fill out all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create the user account
      const { data, error: signUpError } = await signUp(email, password);
      
      if (signUpError) throw signUpError;
      
      const userId = data.user.id;
      
      // Add user metadata based on account type
      if (accountType === 'merchant') {
        // Create merchant profile
        const { error: merchantError } = await supabase
          .from('merchants')
          .insert({
            user_id: userId,
            name: name,
            email: email,
            status: 'active',
            created_at: new Date().toISOString()
          });
          
        if (merchantError) throw merchantError;
      }
      
      success('Account created successfully! Please check your email to verify your account.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      error('Failed to create account. ' + (err.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Account Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  className="form-radio text-primary-600"
                  name="accountType"
                  value="user"
                  checked={accountType === 'user'}
                  onChange={() => setAccountType('user')}
                  disabled={loading}
                />
                <span className="ml-2">Customer</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  className="form-radio text-primary-600"
                  name="accountType"
                  value="merchant"
                  checked={accountType === 'merchant'}
                  onChange={() => setAccountType('merchant')}
                  disabled={loading}
                />
                <span className="ml-2">Coffee Merchant</span>
              </label>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-primary-700 text-white py-2 px-4 rounded-md hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
