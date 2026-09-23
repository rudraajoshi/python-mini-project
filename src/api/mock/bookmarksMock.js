import { delay } from './mockClient.js';
import { bookmarks } from './data.js';

let store = structuredClone(bookmarks);

export async function list() {
  await delay(300);
  return { results: structuredClone(store), count: store.length };
}

export async function create(payload) {
  await delay(240);
  const bookmark = { id: `b_${Date.now()}`, savedAt: new Date().toISOString(), note: '', ...payload };
  store = [bookmark, ...store];
  return bookmark;
}

export async function remove(id) {
  await delay(220);
  store = store.filter((b) => b.id !== id);
  return { id };
}
