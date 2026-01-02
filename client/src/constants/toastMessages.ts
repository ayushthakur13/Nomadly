/**
 * Centralized toast messages for consistent UX
 */
export const TOAST_MESSAGES = {
  // Auth
  AUTH: {
    LOGIN_SUCCESS: 'Login successful!',
    SIGNUP_SUCCESS: 'Account created successfully!',
    LOGOUT_SUCCESS: 'Logged out successfully',
    GOOGLE_LOGIN_SUCCESS: 'Logged in with Google',
  },

  // Profile
  PROFILE: {
    UPDATE_SUCCESS: 'Profile updated',
    USERNAME_UPDATE_SUCCESS: 'Username updated',
    AVATAR_UPDATE_SUCCESS: 'Avatar updated successfully',
    AVATAR_REMOVE_SUCCESS: 'Avatar removed successfully',
    PASSWORD_UPDATE_SUCCESS: 'Password updated',
  },

  // Trips
  TRIP: {
    CREATE_SUCCESS: 'Trip created successfully! 🎉',
    UPDATE_SUCCESS: 'Trip updated',
    DELETE_SUCCESS: 'Trip deleted',
    PUBLISH_SUCCESS: 'Trip published successfully',
    UNPUBLISH_SUCCESS: 'Trip unpublished successfully',
    COVER_UPDATE_SUCCESS: 'Cover updated',
    COVER_REMOVE_SUCCESS: 'Cover removed',
  },

  // Images
  IMAGE: {
    UPLOAD_SUCCESS: 'Image uploaded successfully',
    REMOVE_SUCCESS: 'Image removed',
    SELECT_SUCCESS: 'Image selected successfully',
    INVALID_TYPE: 'Please upload a JPEG, PNG, or WebP image',
    TOO_LARGE: (sizeMB: number) => `Image must be less than ${sizeMB}MB`,
    READ_ERROR: 'Failed to read file',
    UPLOAD_ERROR: 'Upload failed',
  },

  // Generic
  GENERIC: {
    ERROR: 'Something went wrong',
    NETWORK_ERROR: 'Network error. Please try again.',
    SUCCESS: 'Success!',
  },
} as const;
