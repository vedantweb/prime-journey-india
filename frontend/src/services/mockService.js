// Service layer. Public booking/feedback enquiries post to the real backend
// (/api/enquiries) with a localStorage fallback so the site still works fully
// offline/exported. authService remains for the future customer accounts.
// adminService talks to the real FastAPI + MongoDB admin auth.

const USERS_KEY = 'pji_users';
const SESSION_KEY = 'pji_session';
const ENQUIRY_KEY = 'pji_enquiries';
const ADMIN_KEY = 'pji_admin';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export const authService = {
  async signup({ name, email, phone, password }) {
    await delay();
    const users = read(USERS_KEY, []);
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const user = { id: `u_${Date.now()}`, name, email, phone, password, createdAt: new Date().toISOString() };
    users.push(user);
    write(USERS_KEY, users);
    const { password: _p, ...safe } = user;
    write(SESSION_KEY, safe);
    return safe;
  },
  async login({ email, password }) {
    await delay();
    const user = read(USERS_KEY, []).find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) throw new Error('Invalid email or password.');
    const { password: _p, ...safe } = user;
    write(SESSION_KEY, safe);
    return safe;
  },
  async requestReset(email) {
    await delay();
    if (!read(USERS_KEY, []).some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('No account found with this email.');
    }
    return true;
  },
  current() {
    return read(SESSION_KEY, null);
  },
  logout() {
    localStorage.removeItem(SESSION_KEY);
  },
};

export const enquiryService = {
  async send(data) {
    const local = () => {
      const list = read(ENQUIRY_KEY, []);
      const enquiry = { ...data, id: `PJI-${String(list.length + 101).padStart(4, '0')}`, createdAt: new Date().toISOString(), status: 'New' };
      list.push(enquiry);
      write(ENQUIRY_KEY, list);
      return enquiry;
    };
    try {
      const res = await fetch(`${API}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error('backend unavailable');
      const saved = await res.json();
      const list = read(ENQUIRY_KEY, []);
      list.push({ ...data, id: saved.id, createdAt: new Date().toISOString(), status: 'New' });
      write(ENQUIRY_KEY, list);
      return saved;
    } catch {
      return local();
    }
  },
  list() {
    return read(ENQUIRY_KEY, []);
  },
};

// ---- real backend-connected admin service ----

const headers = (token) => ({ 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) });

const apiCall = async (path, { method = 'GET', body, token } = {}) => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: headers(token),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    throw new Error(typeof detail === 'string' ? detail : 'Something went wrong.');
  }
  return data;
};

export const adminService = {
  session() {
    return read(ADMIN_KEY, null);
  },
  async login(alias, password) {
    const data = await apiCall('/admin/auth/login', { method: 'POST', body: { alias, password } });
    write(ADMIN_KEY, { token: data.token, profile: data.profile });
    return data.profile;
  },
  async me() {
    const s = adminService.session();
    if (!s) return null;
    try {
      const data = await apiCall('/admin/auth/me', { token: s.token });
      write(ADMIN_KEY, { token: s.token, profile: data.profile });
      return data.profile;
    } catch {
      localStorage.removeItem(ADMIN_KEY);
      return null;
    }
  },
  overview() {
    return apiCall('/admin/overview', { token: adminService.session()?.token });
  },
  enquiries() {
    return apiCall('/admin/enquiries', { token: adminService.session()?.token });
  },
  settings() {
    return apiCall('/admin/settings', { token: adminService.session()?.token });
  },
  logout() {
    localStorage.removeItem(ADMIN_KEY);
  },
};
