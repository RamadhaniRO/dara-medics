import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const useAuthErrorHandler = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleAuthError = (error: string) => {
    // Check if it's an authentication error
    if (error.includes('Access token required') || 
        error.includes('Invalid access token') || 
        error.includes('Access token expired') ||
        error.includes('Authentication required')) {
      
      console.log('Authentication error detected, redirecting to login');
      
      // Clear any existing token
      logout();
      
      // Redirect to login page
      navigate('/login', { replace: true });
      
      return true; // Indicates that the error was handled
    }
    
    return false; // Error was not an auth error
  };

  return { handleAuthError };
};
