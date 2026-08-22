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
  updateContent(body) {
    return apiCall('/admin/content', {
      method: 'PUT',
      body,
      token: adminService.session()?.token,
    });
  },
  replyToFeedback(id, text) {
    return apiCall(`/admin/feedback/${id}/reply`, {
      method: 'POST',
      body: { text },
      token: adminService.session()?.token,
    });
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

const getAdminErrorMessage = (status, detail) => {
  if (status === 401 || status === 403) {
    return 'Your admin session has expired. Please log in again.';
  }

  if (status === 404) {
    return 'This information is not available right now.';
  }

  if (status === 409) {
    return 'This information could not be updated because it has changed. Please refresh and try again.';
  }

  if (status >= 500) {
    return 'Something went wrong on the server. Please try again in a moment.';
  }

  if (!navigator.onLine) {
    return 'No internet connection. Please check your connection and try again.';
  }

  if (typeof detail === 'string' && detail.trim()) {
    const safeMessages = [
      'Invalid credentials.',
      'Current password is incorrect.',
      'New password must be different from the current password.',
      'New password must be at least 8 characters.',
    ];

    if (safeMessages.includes(detail.trim())) {
      return detail.trim();
    }
  }

  return 'We could not complete this request. Please check the information and try again.';
};

const apiCall = async (path, { method = 'GET', body, token } = {}) => {
  try {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: headers(token),
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const detail = data.detail;
      throw new Error(getAdminErrorMessage(res.status, detail));
    }

    return data;
  } catch (err) {
    if (err instanceof TypeError || err.name === 'AbortError') {
      throw new Error('Unable to connect right now. Please check your connection and try again.');
    }

    throw err;
  }
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
  async changePassword(currentPassword, newPassword) {
    const data = await apiCall('/admin/auth/change-password', {
      method: 'POST',
      body: {
        current_password: currentPassword,
        new_password: newPassword,
      },
      token: adminService.session()?.token,
    });

    const s = adminService.session();
    if (s) {
      const profile = {
        ...(s.profile || {}),
        mustChangePassword: false,
      };
      write(ADMIN_KEY, { token: s.token, profile });
    }

    return data;
  },

  overview() {
    return apiCall('/admin/overview', { token: adminService.session()?.token });
  },
  enquiries() {
    return apiCall('/admin/enquiries', { token: adminService.session()?.token });
  },
  packages() {
    return apiCall('/admin/packages', {
      token: adminService.session()?.token,
    });
  },
  updateEnquiryStatus(id, status) {
    return apiCall(`/admin/enquiries/${id}/status`, {
      method: 'PUT',
      token: adminService.session()?.token,
      body: { status },
    });
  },

  updatePackagePrice(id, priceFrom, priceTo, saved) {
    return apiCall(`/admin/packages/${id}/price`, {
      method: 'PUT',
      token: adminService.session()?.token,
      body: {
        price_from: Number(priceFrom),
        price_to: Number(priceTo),
        saved: Number(saved),
      },
    });
  },
  seasonalOffer() {
    return apiCall('/admin/seasonal-offer', {
      token: adminService.session()?.token,
    });
  },

  updateSeasonalOffer(priceFrom, priceTo) {
    return apiCall('/admin/seasonal-offer', {
      method: 'PUT',
      token: adminService.session()?.token,
      body: {
        price_from: Number(priceFrom),
        price_to: Number(priceTo),
      },
    });
  },
  images() {
    return apiCall('/admin/images', {
      token: adminService.session()?.token,
    });
  },

  uploadImage(imageKey, file) {
    const form = new FormData();
    form.append('imageKey', imageKey);
    form.append('file', file);

    return fetch(`${API}/admin/images`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminService.session()?.token}`,
      },
      body: form,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || 'Image upload failed.');
      }
      return data;
    });
  },

  trips() {
    return apiCall('/admin/trips', {
      token: adminService.session()?.token,
    });
  },

  createTrip(data) {
    return apiCall('/admin/trips', {
      method: 'POST',
      token: adminService.session()?.token,
      body: data,
    });
  },

  tripPhotos(tripId) {
    return apiCall(`/admin/trips/${tripId}/photos`, {
      token: adminService.session()?.token,
    });
  },

  uploadTripPhoto(tripId, file, title = '') {
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);

    return fetch(`${API}/admin/trips/${tripId}/photos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminService.session()?.token}`,
      },
      body: form,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || 'Trip photo upload failed.');
      }
      return data;
    });
  },

  deleteTrip(tripId) {
    return apiCall(`/admin/trips/${tripId}`, {
      method: 'DELETE',
      token: adminService.session()?.token,
    });
  },

  deleteTripPhoto(tripId, imageId) {
    return apiCall(`/admin/trips/${tripId}/photos/${imageId}`, {
      method: 'DELETE',
      token: adminService.session()?.token,
    });
  },

  tripImages() {
    return apiCall('/admin/trip-images', {
      token: adminService.session()?.token,
    });
  },

  adminTrips() {
    return apiCall('/admin/trips', {
      token: adminService.session()?.token,
    });
  },

  createTrip(data) {
    return apiCall('/admin/trips', {
      method: 'POST',
      token: adminService.session()?.token,
      body: data,
    });
  },

  deleteTrip(id) {
    return apiCall(`/admin/trips/${id}`, {
      method: 'DELETE',
      token: adminService.session()?.token,
    });
  },

  tripPhotos(tripId) {
    return apiCall(`/admin/trips/${tripId}/photos`, {
      token: adminService.session()?.token,
    });
  },

  uploadTripPhoto(tripId, file, title = '') {
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);

    return fetch(`${API}/admin/trips/${tripId}/photos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminService.session()?.token}`,
      },
      body: form,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.detail || 'Trip photo upload failed.');
      }

      return data;
    });
  },

  deleteTripPhoto(tripId, imageId) {
    return apiCall(`/admin/trips/${tripId}/photos/${imageId}`, {
      method: 'DELETE',
      token: adminService.session()?.token,
    });
  },

  uploadTripImage(file, title = '') {
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);

    return fetch(`${API}/admin/trip-images`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminService.session()?.token}`,
      },
      body: form,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || 'Trip image upload failed.');
      }
      return data;
    });
  },

  content() {
    return apiCall('/admin/content', {
      token: adminService.session()?.token,
    });
  },
  feedback() {
    return apiCall('/admin/feedback', {
      token: adminService.session()?.token,
    });
  },
  settings() {
    return apiCall('/admin/settings', { token: adminService.session()?.token });
  },
  logout() {
    localStorage.removeItem(ADMIN_KEY);
  },
};
