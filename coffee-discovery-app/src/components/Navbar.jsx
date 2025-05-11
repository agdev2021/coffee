import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-primary-900 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">CoffeeAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="text-white hover:text-accent-300">
              Home
            </Link>
            
            {!user ? (
              <>
                <Link to="/login" className="text-white hover:text-accent-300">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-md"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                {userRole === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-white hover:text-accent-300"
                  >
                    Admin Dashboard
                  </Link>
                )}
                
                {userRole === 'merchant' && (
                  <Link
                    to="/merchant"
                    className="text-white hover:text-accent-300"
                  >
                    Merchant Dashboard
                  </Link>
                )}
                
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-white"
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3">
            <Link
              to="/"
              className="block text-white hover:text-accent-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="block text-white hover:text-accent-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-md inline-block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                {userRole === 'admin' && (
                  <Link
                    to="/admin"
                    className="block text-white hover:text-accent-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                
                {userRole === 'merchant' && (
                  <Link
                    to="/merchant"
                    className="block text-white hover:text-accent-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Merchant Dashboard
                  </Link>
                )}
                
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
