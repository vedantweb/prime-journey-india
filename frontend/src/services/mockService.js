// Local mock service layer — intentionally isolated so a real backend
// (MongoDB Atlas / REST API) can replace these functions after export
// without touching any component.

const USERS_KEY = 'pji_users';
const SESSION_KEY = 'pji_session';
const ENQUIRY_KEY = 'pji_enquiries';

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const delay = (ms = 650) => new Promise((r) => setTimeout(r, ms));

export const authService = {
  async signup({ name, email, phone, password }) {
    await delay();
    const users = read(USERS_KEY, []);
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const user = {
      id: `u_${Date.now()}`,
      name,
      email,
      phone,
      password, // mock only — never store plaintext with a real backend
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    write(USERS_KEY, users);
    const { password: _p, ...safe } = user;
    write(SESSION_KEY, safe);
    return safe;
  },

  async login({ email, password }) {
    await delay();
    const users = read(USERS_KEY, []);
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) throw new Error('Invalid email or password.');
    const { password: _p, ...safe } = user;
    write(SESSION_KEY, safe);
    return safe;
  },

  async requestReset(email) {
    await delay();
    const users = read(USERS_KEY, []);
    if (!users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('No account found with this email.');
    }
    return true; // mock: pretend a reset link was sent
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
    await delay();
    const list = read(ENQUIRY_KEY, []);
    const enquiry = {
      ...data,
      id: `PJI-${String(list.length + 101).padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
      status: 'New',
    };
    list.push(enquiry);
    write(ENQUIRY_KEY, list);
    return enquiry;
  },

  list() {
    return read(ENQUIRY_KEY, []);
  },
};
