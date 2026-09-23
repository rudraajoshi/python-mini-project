import axios from 'axios';
import { API_BASE_URL } from './config.js';
import { STORAGE_KEYS } from '../utils/constants.js';

export const tokenStore = {
  get access() {
    return localStorage.getItem(STORAGE_KEYS.access);
  },
  get refresh() {
    return localStorage.getItem(STORAGE_KEYS.refresh);
  },
  set({ access, refresh }) {
    if (access) localStorage.setItem(STORAGE_KEYS.access, access);
    if (refresh) localStorage.setItem(STORAGE_KEYS.refresh, refresh);
  },
  clear() {
    localStorage.removeItem(STORAGE_KEYS.access);
    localStorage.removeItem(STORAGE_KEYS.refresh);
    localStorage.removeItem(STORAGE_KEYS.user);
  },
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = null;

/** SimpleJWT refresh: retry a 401 once, then hand control back to AuthContext. */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && original && !original._retried && tokenStore.refresh) {
      original._retried = true;
      try {
        refreshing =
          refreshing ??
          axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh: tokenStore.refresh });
        const { data } = await refreshing;
        refreshing = null;
        tokenStore.set({ access: data.access, refresh: data.refresh });
        original.headers.Authorization = `Bearer ${data.access}`;
        return apiClient(original);
      } catch (refreshError) {
        refreshing = null;
        tokenStore.clear();
        window.dispatchEvent(new CustomEvent('pdm:session-expired'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

/** Turn axios/DRF failures into one predictable shape the UI can render. */
export function normalizeError(error) {
  if (error.isNormalized) return error;
  const data = error.response?.data;
  const message =
    data?.detail ||
    (Array.isArray(data?.non_field_errors) ? data.non_field_errors[0] : null) ||
    (error.code === 'ERR_NETWORK' ? 'Network unavailable. Check your connection and try again.' : null) ||
    error.message ||
    'Something went wrong.';

  const normalized = new Error(message);
  normalized.isNormalized = true;
  normalized.status = error.response?.status ?? 0;
  normalized.fields = data && typeof data === 'object' ? data : {};
  return normalized;
}

export default apiClient;
