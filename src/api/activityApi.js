import apiClient from './apiClient.js';
import { USE_MOCKS } from './config.js';
import * as mock from './mock/activityMock.js';

export async function listActivity() {
  if (USE_MOCKS) return mock.list();
  const { data } = await apiClient.get('/activity/');
  return data;
}
