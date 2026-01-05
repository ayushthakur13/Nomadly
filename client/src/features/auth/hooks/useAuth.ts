import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../store';

/**
 * Hook to access auth state and common auth selectors
 * Provides: isAuthenticated, user, token, loading, error, initialized
 */
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  
  return {
    ...auth,
    dispatch,
  };
};
