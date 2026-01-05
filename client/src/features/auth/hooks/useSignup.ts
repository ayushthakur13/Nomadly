import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signupAsync } from '../store/authThunks';
import { AUTH_ROUTES } from '../constants/authConstants';
import type { AppDispatch } from '../../../store';
import type { SignupCredentials } from '../types/auth.types';

/**
 * Hook for signup functionality
 * Handles signup dispatch and redirect after success
 */
export const useSignup = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const signup = async (credentials: SignupCredentials) => {
    try {
      await dispatch(signupAsync(credentials)).unwrap();
      navigate(AUTH_ROUTES.DASHBOARD, { replace: true });
    } catch (error) {
      // Error is handled by the Redux thunk and stored in state
      throw error;
    }
  };

  return { signup };
};
