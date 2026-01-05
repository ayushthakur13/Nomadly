/**
 * CSRF Token Management Service
 * Feature-agnostic module for handling CSRF tokens
 * 
 * This is imported by both the auth feature and the api service,
 * providing a clean separation between infrastructure and features.
 */

let csrfToken: string | null = null;

/**
 * Get the current CSRF token
 * First tries localStorage (persisted from auth), then in-memory cache
 */
export function getCsrfToken(): string | null {
  // Prefer persisted token (from login/register responses)
  try {
    const stored = localStorage.getItem('csrf_token');
    if (stored) {
      csrfToken = stored;
      return stored;
    }
  } catch {}
  
  // Return in-memory cache
  return csrfToken;
}

/**
 * Set the CSRF token
 * Saves to both localStorage and in-memory cache
 */
export function setCsrfToken(token: string): void {
  csrfToken = token;
  try { 
    localStorage.setItem('csrf_token', token); 
  } catch {}
}

/**
 * Clear the CSRF token
 * Removes from both localStorage and in-memory cache
 */
export function clearCsrfToken(): void {
  csrfToken = null;
  try { 
    localStorage.removeItem('csrf_token'); 
  } catch {}
}
