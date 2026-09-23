import apiClient from './apiClient.js';
import { USE_MOCKS } from './config.js';
import * as mock from './mock/chatMock.js';

/** POST /api/chat/ask/ — RAG answer plus the chunks it was grounded in. */
export async function ask({ question, chatId, scope }) {
  if (USE_MOCKS) return mock.ask({ question, chatId, scope });
  const { data } = await apiClient.post('/chat/ask/', {
    question,
    session: chatId,
    collection: scope?.type === 'collection' ? scope.id : undefined,
    documents: scope?.type === 'documents' ? scope.ids : undefined,
  });
  return data;
}

export async function listChats() {
  if (USE_MOCKS) return mock.listChats();
  const { data } = await apiClient.get('/chat/sessions/');
  return data;
}

export async function getChat(id) {
  if (USE_MOCKS) return mock.retrieveChat(id);
  const { data } = await apiClient.get(`/chat/sessions/${id}/`);
  return data;
}

export async function createChat(scope) {
  if (USE_MOCKS) return mock.createChat(scope);
  const { data } = await apiClient.post('/chat/sessions/', { scope });
  return data;
}

export async function renameChat(id, title) {
  if (USE_MOCKS) return mock.renameChat(id, title);
  const { data } = await apiClient.patch(`/chat/sessions/${id}/`, { title });
  return data;
}

export async function deleteChat(id) {
  if (USE_MOCKS) return mock.deleteChat(id);
  await apiClient.delete(`/chat/sessions/${id}/`);
  return { id };
}
