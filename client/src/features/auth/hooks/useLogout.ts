import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { logoutAPI } from '../../../services/auth.service';
import { AUTH_ROUTES } from '../constants/authConstants';
import type { AppDispatch } from '../../../store';

/**
 * Hook for logout functionality
 * Handles secure server logout and client-side state cleanup
 */
export const useLogout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const performLogout = async () => {
    try {
      // Attempt secure logout on server via auth.service
      await logoutAPI();
    } catch (error) {
      // Log error but continue with client-side logout
      console.error('Secure logout failed:', error);
    } finally {
      // Always clear local auth state
      dispatch(logout());
      navigate(AUTH_ROUTES.LOGIN, { replace: true });
    }
  };

  return { performLogout, logout: performLogout };
};
