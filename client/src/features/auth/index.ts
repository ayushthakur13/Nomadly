// Auth components
export { default as Login } from './pages/Login';
export { default as Signup } from './pages/Signup';
export { default as AuthPage } from './pages/AuthPage';
export { default as GoogleLoginButton } from './components/GoogleLoginButton';

// Auth UI components
export { default as PasswordStrengthMeter } from './components/PasswordStrengthMeter';
export { default as PasswordInput } from './components/PasswordInput';
export { default as AuthFormField } from './components/AuthFormField';
export { default as AuthLoadingOverlay } from './components/AuthLoadingOverlay';
export { default as AuthErrorAlert } from './components/AuthErrorAlert';

// Auth routes
export { default as LandingRoute } from './routes/LandingRoute';
export { default as ProtectedRoute } from './routes/ProtectedRoute';
export { default as PublicRoute } from './routes/PublicRoute';

// Auth types
export type {
  User,
  LoginCredentials,
  SignupCredentials,
  GoogleLoginCredentials,
  AuthResponse,
  AuthState,
  AuthSuccessPayload,
} from './types/auth.types';

// Auth validators
export {
  validateEmail,
  validateUsername,
  validatePassword,
  validateLoginCredentials,
  validateSignupCredentials,
  calculatePasswordStrength,
  getPasswordStrengthInfo,
} from './validators/authValidators';
export type { ValidationResult } from './validators/authValidators';

// Auth constants
export {
  AUTH_STORAGE_KEYS,
  AUTH_ENDPOINTS,
  AUTH_ROUTES,
  PASSWORD_REQUIREMENTS,
  USERNAME_REQUIREMENTS,
} from './constants/authConstants';

// Auth thunks
export {
  loginAsync,
  signupAsync,
  googleLoginAsync,
} from './store/authThunks';

// Auth store (Redux)
export {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setInitialized,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
} from './store/authSlice';
export { default as authReducer } from './store/authSlice';

// Auth utils
export { secureLogout } from './utils/auth';

// Auth hooks
export {
  useAuth,
  useLogin,
  useSignup,
  useGoogleLogin,
  useLogout,
  useAuthRedirect,
} from './hooks';


