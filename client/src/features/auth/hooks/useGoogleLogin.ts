import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { googleLoginAsync } from '../store/authThunks';
import { AUTH_ROUTES } from '../constants/authConstants';
import type { AppDispatch } from '../../../store';
import type { GoogleLoginCredentials } from '../types/auth.types';

/**
 * Hook for Google OAuth login functionality
 * Handles Google login dispatch and redirect after success
 */
export const useGoogleLogin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const loginWithGoogle = async (credentials: GoogleLoginCredentials) => {
    try {
      await dispatch(googleLoginAsync(credentials)).unwrap();
      navigate(AUTH_ROUTES.DASHBOARD, { replace: true });
    } catch (error) {
      // Error is handled by the Redux thunk and stored in state
      throw error;
    }
  };

  return { loginWithGoogle };
};
