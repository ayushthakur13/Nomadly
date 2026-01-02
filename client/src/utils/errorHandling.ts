import toast from 'react-hot-toast';

export interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
  message?: string;
}

/**
 * Extracts user-friendly error message from various error formats
 */
export const getErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
  const err = error as ApiError;
  
  // API response error
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }
  
  // Standard error message
  if (err?.message) {
    return err.message;
  }
  
  // Validation errors
  if (err?.response?.data?.errors) {
    const errors = Object.values(err.response.data.errors).flat();
    return errors[0] || fallback;
  }
  
  return fallback;
};

/**
 * Shows error toast with extracted message
 */
export const showErrorToast = (error: unknown, fallback = 'Something went wrong'): void => {
  const message = getErrorMessage(error, fallback);
  toast.error(message);
};

/**
 * Generic async handler with error toast
 */
export const handleAsyncError = async <T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    showErrorToast(error, errorMessage);
    return null;
  }
};
