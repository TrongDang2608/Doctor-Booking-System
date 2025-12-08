import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Check authentication for the specific role from localStorage
  // This allows multiple roles to be logged in simultaneously
  const roleSpecificUser = requiredRole ? authService.getCurrentUser(requiredRole) : null;
  const roleSpecificToken = requiredRole ? authService.getToken(requiredRole) : null;
  const isRoleAuthenticated = roleSpecificUser && roleSpecificToken;

  if (!isRoleAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verify role matches (double check)
  if (requiredRole && roleSpecificUser?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

