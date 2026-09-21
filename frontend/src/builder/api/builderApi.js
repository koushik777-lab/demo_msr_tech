import axios from 'axios';

const getBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (process.env.REACT_APP_BACKEND_URL) return process.env.REACT_APP_BACKEND_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return ''; // In production (e.g. msrtechhub.com), use relative path so Nginx reverse-proxies /api to backend
  }
  return 'http://localhost:8000';
};

const BASE_URL = getBaseUrl();

export function resolveAssetUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/api/')) return BASE_URL ? `${BASE_URL}${url}` : url;
  return url;
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sitecraft_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem('sitecraft_refresh');
      if (refresh) {
        try {
          const res = await axios.post(`${BASE_URL}/api/auth/refresh`, { refresh_token: refresh });
          localStorage.setItem('sitecraft_token', res.data.access_token);
          localStorage.setItem('sitecraft_refresh', res.data.refresh_token);
          error.config.headers.Authorization = `Bearer ${res.data.access_token}`;
          return api.request(error.config);
        } catch {
          localStorage.removeItem('sitecraft_token');
          localStorage.removeItem('sitecraft_refresh');
          localStorage.removeItem('sitecraft_user');
          window.location.href = '/builder/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (email, password, name) => api.post('/api/auth/register', { email, password, name }),
  verifyOtp: (email, otp_code) => api.post('/api/auth/verify-otp', { email, otp_code }),
  resendOtp: (email) => api.post('/api/auth/resend-otp', { email }),
  demo: () => api.post('/api/auth/demo'),
  me: () => api.get('/api/auth/me'),
  refresh: (token) => api.post('/api/auth/refresh', { refresh_token: token }),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (email, otp_code, new_password) => api.post('/api/auth/reset-password', { email, otp_code, new_password }),
};

// ─── Billing ───────────────────────────────────────────────────────────────
export const billingApi = {
  getPlans: () => api.get('/api/billing/plans'),
  getSubscription: () => api.get('/api/billing/subscription'),
  createOrder: (plan) => api.post('/api/billing/create-order', { plan }),
  verifyPayment: (data) => api.post('/api/billing/verify-payment', data),
};

// ─── Sites ─────────────────────────────────────────────────────────────────
export const sitesApi = {
  list: () => api.get('/api/sites'),
  create: (name, sector, variant) => api.post('/api/sites', { name, sector, variant }),
  get: (id) => api.get(`/api/sites/${id}`),
  update: (id, data) => api.put(`/api/sites/${id}`, data),
  delete: (id) => api.delete(`/api/sites/${id}`),
  saveVersion: (id) => api.post(`/api/sites/${id}/versions`),
  listVersions: (id) => api.get(`/api/sites/${id}/versions`),
  unlockSocial: (id, feature) => api.post(`/api/sites/${id}/unlock-social`, { feature }),
};

// ─── Pages ─────────────────────────────────────────────────────────────────
export const pagesApi = {
  list: (siteId) => api.get(`/api/sites/${siteId}/pages`),
  get: (siteId, pageId) => api.get(`/api/sites/${siteId}/pages/${pageId}`),
  update: (siteId, pageId, data) => api.put(`/api/sites/${siteId}/pages/${pageId}`, data),
  reorder: (siteId, pageId, sectionIds) =>
    api.post(`/api/sites/${siteId}/pages/${pageId}/sections/reorder`, { section_ids: sectionIds }),
};

// ─── Templates ─────────────────────────────────────────────────────────────
export const templatesApi = {
  list: () => api.get('/api/templates'),
  get: (sector) => api.get(`/api/templates/${sector}`),
};

// ─── Publish ───────────────────────────────────────────────────────────────
export const publishApi = {
  publish: (siteId) => api.post(`/api/sites/${siteId}/publish`, {}, { responseType: 'blob' }),
  previewHtml: (siteId) => api.get(`/api/sites/${siteId}/preview-html`),
};

// ─── Assets ────────────────────────────────────────────────────────────────
export const assetsApi = {
  upload: (file, onProgress) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/api/assets/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded / e.total) * 100)),
    });
  },
  list: () => api.get('/api/assets'),
  delete: (id) => api.delete(`/api/assets/${id}`),
};

export default api;
