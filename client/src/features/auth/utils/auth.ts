import Cookies from 'js-cookie';
import api, { clearAccessToken } from '../../../services/api';
import { getCsrfToken, clearCsrfToken } from '../../../services/csrf';

/**
 * Secure logout: clears CSRF and access tokens
 * Attempts server-side logout but ensures local cleanup regardless
 */
export async function secureLogout(): Promise<void> {
  const csrf = getCsrfToken();
  try {
    await api.post('/auth/logout', {}, { headers: { 'x-csrf-token': csrf || '' } });
  } finally {
    // Always clear client-side auth state regardless of server response
    try { Cookies.remove('csrf_token', { path: '/api/auth' }); } catch {}
    clearCsrfToken();
    clearAccessToken();
  }
}
