import apiClient from './apiClient.js';
import { USE_MOCKS } from './config.js';
import * as mock from './mock/authMock.js';

/** POST /api/auth/register/ */
export async function register(payload) {
  if (USE_MOCKS) return mock.register(payload);
  const { data } = await apiClient.post('/auth/register/', payload);
  return data;
}

/** POST /api/auth/login/ */
export async function login(payload) {
  if (USE_MOCKS) return mock.login(payload);
  const { data } = await apiClient.post('/auth/login/', payload);
  return data;
}

/** GET /api/auth/me/ */
export async function getCurrentUser() {
  if (USE_MOCKS) return mock.me();
  const { data } = await apiClient.get('/auth/me/');
  return data;
}
