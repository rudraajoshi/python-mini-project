import apiClient from './apiClient.js';
import { USE_MOCKS } from './config.js';
import * as mock from './mock/documentsMock.js';

/** GET /api/documents/ */
export async function listDocuments(params = {}) {
  if (USE_MOCKS) return mock.list(params);
  const { data } = await apiClient.get('/documents/', { params });
  return data;
}

/** GET /api/documents/{id}/ */
export async function getDocument(id) {
  if (USE_MOCKS) return mock.retrieve(id);
  const { data } = await apiClient.get(`/documents/${id}/`);
  return data;
}

/** GET /api/documents/{id}/status/ — polled while the backend extracts and embeds. */
export async function getDocumentStatus(id) {
  if (USE_MOCKS) return mock.status(id);
  const { data } = await apiClient.get(`/documents/${id}/status/`);
  return data;
}

/** POST /api/documents/ (multipart) */
export async function uploadDocument(file, { onProgress, collectionId } = {}) {
  if (USE_MOCKS) return mock.create(file, { onProgress });

  const form = new FormData();
  form.append('file', file);
  if (collectionId) form.append('collection', collectionId);

  const { data } = await apiClient.post('/documents/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (!event.total) return;
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    },
  });
  return data;
}

/** PATCH /api/documents/{id}/ */
export async function updateDocument(id, patch) {
  if (USE_MOCKS) return mock.update(id, patch);
  const { data } = await apiClient.patch(`/documents/${id}/`, patch);
  return data;
}

/** DELETE /api/documents/{id}/ */
export async function deleteDocument(id) {
  if (USE_MOCKS) return mock.remove(id);
  await apiClient.delete(`/documents/${id}/`);
  return { id };
}

/** POST /api/documents/{id}/summarize/ */
export async function summarizeDocument(id) {
  if (USE_MOCKS) return mock.summarize(id);
  const { data } = await apiClient.post(`/documents/${id}/summarize/`);
  return data;
}
