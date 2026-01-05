import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { AUTH_ROUTES } from '../constants/authConstants';

/**
 * Hook to handle auth-based redirects
 * Redirects authenticated users away from public auth pages
 * Can be used in AuthPage to prevent showing login/signup when already authenticated
 */
export const useAuthRedirect = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(AUTH_ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return { isAuthenticated };
};
