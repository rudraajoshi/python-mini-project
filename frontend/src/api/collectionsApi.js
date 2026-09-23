import apiClient from './apiClient.js';
import { USE_MOCKS } from './config.js';
import * as mock from './mock/collectionsMock.js';

export async function listCollections() {
  if (USE_MOCKS) return mock.list();
  const { data } = await apiClient.get('/collections/');
  return data;
}

export async function getCollection(id) {
  if (USE_MOCKS) return mock.retrieve(id);
  const { data } = await apiClient.get(`/collections/${id}/`);
  return data;
}

export async function createCollection(payload) {
  if (USE_MOCKS) return mock.create(payload);
  const { data } = await apiClient.post('/collections/', payload);
  return data;
}

export async function updateCollection(id, patch) {
  if (USE_MOCKS) return mock.update(id, patch);
  const { data } = await apiClient.patch(`/collections/${id}/`, patch);
  return data;
}

export async function deleteCollection(id) {
  if (USE_MOCKS) return mock.remove(id);
  await apiClient.delete(`/collections/${id}/`);
  return { id };
}
