/**
 * Validation result structure
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Email validation regex - matches RFC 5322 simplified
 */
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

/**
 * Username validation regex - alphanumeric and underscore only
 */
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true };
}

/**
 * Validates username format and length
 */
export function validateUsername(username: string): ValidationResult {
  const trimmed = username.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Username is required' };
  }
  
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (trimmed.length > 20) {
    return { isValid: false, error: 'Username must be at most 20 characters' };
  }
  
  if (!USERNAME_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  
  return { isValid: true };
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): ValidationResult {
  const trimmed = password.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (trimmed.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  
  return { isValid: true };
}

/**
 * Calculates password strength score (0-100)
 */
export function calculatePasswordStrength(password: string): number {
  const len = password.length;
  
  // Length score: normalized between 4-16 characters
  const lengthNormalized = Math.max(0, Math.min(1, (len - 4) / 12));
  
  // Variety score: check for different character sets
  let sets = 0;
  if (/[a-z]/.test(password)) sets++; // lowercase
  if (/[A-Z]/.test(password)) sets++; // uppercase
  if (/\d/.test(password)) sets++;     // digits
  if (/[^A-Za-z0-9]/.test(password)) sets++; // special chars
  
  const varietyScore = sets > 0 ? (sets - 1) / 3 : 0;
  
  // Combined score (70% length, 30% variety)
  const score = Math.round((0.7 * lengthNormalized + 0.3 * varietyScore) * 100);
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Gets password strength label and styling based on score
 */
export function getPasswordStrengthInfo(score: number): {
  label: string;
  barColor: string;
  textColor: string;
} {
  if (score < 25) {
    return {
      label: 'Weak',
      barColor: 'bg-red-500',
      textColor: 'text-red-600',
    };
  }
  
  if (score < 50) {
    return {
      label: 'Fair',
      barColor: 'bg-amber-500',
      textColor: 'text-amber-600',
    };
  }
  
  if (score < 75) {
    return {
      label: 'Good',
      barColor: 'bg-emerald-500',
      textColor: 'text-emerald-600',
    };
  }
  
  return {
    label: 'Strong',
    barColor: 'bg-emerald-600',
    textColor: 'text-emerald-600',
  };
}

/**
 * Validates login credentials
 */
export function validateLoginCredentials(
  usernameOrEmail: string,
  password: string
): ValidationResult {
  const trimmedUsername = usernameOrEmail.trim();
  const trimmedPassword = password.trim();
  
  if (!trimmedUsername) {
    return { isValid: false, error: 'Username or email is required' };
  }
  
  if (!trimmedPassword) {
    return { isValid: false, error: 'Password is required' };
  }
  
  return { isValid: true };
}

/**
 * Validates signup credentials
 */
export function validateSignupCredentials(
  username: string,
  email: string,
  password: string
): ValidationResult {
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    return usernameValidation;
  }
  
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }
  
  return { isValid: true };
}
