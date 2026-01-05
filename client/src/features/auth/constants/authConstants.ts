/**
 * Auth-related constants and configuration
 */

/**
 * Local storage keys for auth data
 */
export const AUTH_STORAGE_KEYS = {
  CSRF_TOKEN: 'csrf_token',
} as const;

/**
 * Auth API endpoints
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  REGISTER: '/auth/register',
  GOOGLE: '/auth/google',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
} as const;

/**
 * Route paths for auth navigation
 */
export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  DASHBOARD: '/dashboard',
} as const;

/**
 * Password requirements
 */
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 6,
  MAX_LENGTH: 128,
} as const;

/**
 * Username requirements
 */
export const USERNAME_REQUIREMENTS = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 20,
  PATTERN: /^[a-zA-Z0-9_]+$/,
} as const;
