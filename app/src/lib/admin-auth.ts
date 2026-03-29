const ADMIN_AUTH_KEY = 'ag_admin_authenticated';

export const DUMMY_ADMIN_CREDENTIALS = {
  email: 'admin@anarav.com',
  password: 'Admin@123',
};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function isAdminAuthenticated() {
  if (!canUseStorage()) {
    return false;
  }

  return window.localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
}

export function signInAdmin(email: string, password: string) {
  const isValid =
    email.trim().toLowerCase() === DUMMY_ADMIN_CREDENTIALS.email &&
    password === DUMMY_ADMIN_CREDENTIALS.password;

  if (!isValid || !canUseStorage()) {
    return false;
  }

  window.localStorage.setItem(ADMIN_AUTH_KEY, 'true');
  return true;
}

export function signOutAdmin() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ADMIN_AUTH_KEY);
}
