import Cookies from 'js-cookie';
import api, { clearAccessToken } from '../services/api';

export function getCsrfToken(): string | null {
  // Prefer persisted token (from login/register responses)
  try {
    const stored = localStorage.getItem('csrf_token');
    if (stored) return stored;
  } catch {}
  // Fallback to cookie if visible on current path
  const fromCookieLib = Cookies.get('csrf_token');
  if (fromCookieLib) return fromCookieLib;
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCsrfToken(token: string): void {
  // Persist in localStorage so SPA can read at any path
  try { localStorage.setItem('csrf_token', token); } catch {}
}

export async function secureLogout(): Promise<void> {
  const csrf = getCsrfToken();
  try {
    await api.post('/auth/logout', {}, { headers: { 'x-csrf-token': csrf || '' } });
  } finally {
    // Always clear client-side auth state regardless of server response
    try { Cookies.remove('csrf_token', { path: '/api/auth' }); } catch {}
    try { localStorage.removeItem('csrf_token'); } catch {}
    clearAccessToken();
  }
}
