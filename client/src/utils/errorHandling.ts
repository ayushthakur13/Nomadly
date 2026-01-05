import toast from 'react-hot-toast';

export interface ApiError {
  response?: {
    data?: {
      error?: string;
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
  message?: string;
}

/**
 * Core error extraction from API responses.
 * Normalizes inconsistent error formats into a single, user-friendly message.
 */

export const extractApiError = (error: ApiError, fallback = 'An error occurred'): string => {
  const err = error;

  // Check response error field first (backend custom error field)
  if (err?.response?.data?.error) return err.response.data.error;

  // Check response message field (backend standard message field)
  if (err?.response?.data?.message) return err.response.data.message;

  // Check validation errors array (Axios error message)
  if (err?.response?.data?.errors) {
    const errors = Object.values(err.response.data.errors).flat();
    if (errors.length > 0) return errors[0];
  }

  // Fall back to error.message (generic message)
  if (err?.message) return err.message;

  // Final fallback
  return fallback;
};

// Shows error toast with extracted message
export const showErrorToast = (error: ApiError, fallback = 'Something went wrong'): void => {
  const message = extractApiError(error, fallback);
  toast.error(message);
};

// Generic async handler with error toast
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
