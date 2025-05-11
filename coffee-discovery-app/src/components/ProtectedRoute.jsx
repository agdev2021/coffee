import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, role }) {
  const { user, userRole, loading } = useAuth();

  // Show loading state if authentication is still being checked
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If role is specified and user doesn't have that role, redirect to home
  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  // If authenticated and has appropriate role, render the children
  return children;
}

export default ProtectedRoute;
