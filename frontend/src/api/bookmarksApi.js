import apiClient from './apiClient.js';
import { USE_MOCKS } from './config.js';
import * as mock from './mock/bookmarksMock.js';

export async function listBookmarks() {
  if (USE_MOCKS) return mock.list();
  const { data } = await apiClient.get('/bookmarks/');
  return data;
}

export async function createBookmark(payload) {
  if (USE_MOCKS) return mock.create(payload);
  const { data } = await apiClient.post('/bookmarks/', payload);
  return data;
}

export async function deleteBookmark(id) {
  if (USE_MOCKS) return mock.remove(id);
  await apiClient.delete(`/bookmarks/${id}/`);
  return { id };
}
