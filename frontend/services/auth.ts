const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const COOKIE_TOKEN_KEY = 'token';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function isBrowser() {
  return typeof window !== 'undefined';
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (!isBrowser()) return;

  const secure = window.location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function removeCookie(name: string) {
  if (!isBrowser()) return;

  const secure = window.location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${secure}`;
}

export function getToken() {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  if (!isBrowser()) {
    return null;
  }

  const user = localStorage.getItem(USER_KEY);

  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setAuthSession(token: string, user: any) {
  if (!isBrowser()) return;

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setCookie(COOKIE_TOKEN_KEY, token, COOKIE_MAX_AGE_SECONDS);
}

export function clearAuthSession() {
  if (!isBrowser()) return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  removeCookie(COOKIE_TOKEN_KEY);
}

export function logout() {
  clearAuthSession();
  window.location.href = '/';
}
