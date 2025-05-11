import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CoffeeAI</h3>
            <p className="text-gray-300">
              Discover coffee that matches your taste preferences with our AI-powered search.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white">
                  Register
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">For Merchants</h3>
            <p className="text-gray-300 mb-2">
              Are you a coffee producer or seller? Join our platform to showcase your products.
            </p>
            <Link
              to="/register"
              className="bg-primary-700 hover:bg-primary-600 text-white px-4 py-2 rounded-md inline-block mt-2"
            >
              Register as Merchant
            </Link>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} CoffeeAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
