import { useState, useCallback } from 'react';
import { showErrorToast, extractApiError } from '@/utils/errorHandling';

interface UseAsyncActionOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  errorMessage?: string;
  showToast?: boolean;
}

interface UseAsyncActionReturn<T> {
  execute: (...args: any[]) => Promise<T | null>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Reusable hook for managing async actions with loading/error states
 * 
 * @example
 * const { execute, isLoading } = useAsyncAction({
 *   onSuccess: () => toast.success('Done!'),
 *   errorMessage: 'Failed to save'
 * });
 * 
 * await execute(async () => {
 *   await api.saveData(data);
 * });
 */
export const useAsyncAction = <T = void>(
  options: UseAsyncActionOptions = {}
): UseAsyncActionReturn<T> => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { onSuccess, onError, errorMessage, showToast = true } = options;
  
  const execute = useCallback(async (action: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await action();
      onSuccess?.();
      return result;
    } catch (err) {
      const errorMsg = extractApiError(err, errorMessage || 'An error occurred');
      setError(errorMsg);
      
      if (showToast) {
        showErrorToast(err, errorMessage);
      }
      
      onError?.(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError, errorMessage, showToast]);
  
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);
  
  return { execute, isLoading, error, reset };
};
