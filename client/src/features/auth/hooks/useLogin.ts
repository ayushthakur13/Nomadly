import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginAsync } from '../store/authThunks';
import { AUTH_ROUTES } from '../constants/authConstants';
import type { AppDispatch } from '../../../store';
import type { LoginCredentials } from '../types/auth.types';

/**
 * Hook for login functionality
 * Handles login dispatch and redirect after success
 */
export const useLogin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const login = async (credentials: LoginCredentials) => {
    try {
      await dispatch(loginAsync(credentials)).unwrap();
      navigate(AUTH_ROUTES.DASHBOARD, { replace: true });
    } catch (error) {
      // Error is handled by the Redux thunk and stored in state
      throw error;
    }
  };

  return { login };
};
