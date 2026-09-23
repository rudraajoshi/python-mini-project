import apiClient from './apiClient.js';
import { USE_MOCKS } from './config.js';
import * as mock from './mock/searchMock.js';

/** POST /api/search/ — semantic search over the user's own chunks. */
export async function semanticSearch({ query, collectionId, limit = 20 }) {
  if (USE_MOCKS) return mock.search({ query, collectionId });
  const { data } = await apiClient.post('/search/', { query, collection: collectionId, limit });
  return data;
}

export async function getSearchHistory() {
  if (USE_MOCKS) return mock.listHistory();
  const { data } = await apiClient.get('/search/history/');
  return data;
}

export async function clearSearchHistory() {
  if (USE_MOCKS) return mock.clearHistory();
  await apiClient.delete('/search/history/');
  return { results: [] };
}
