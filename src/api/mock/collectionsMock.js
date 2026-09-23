import { delay, fail } from './mockClient.js';
import { collections } from './data.js';
import { list as listDocuments } from './documentsMock.js';

let store = structuredClone(collections);

export async function list() {
  await delay(300);
  return { results: structuredClone(store), count: store.length };
}

export async function retrieve(id) {
  await delay(320);
  const collection = store.find((c) => c.id === id);
  if (!collection) throw fail('That collection no longer exists.', 404);
  const { results } = await listDocuments({ collectionId: id });
  return { ...collection, documents: results };
}

export async function create({ name, description }) {
  await delay(380);
  if (!name?.trim()) throw fail('Give the collection a name.', 400);
  const collection = {
    id: `c_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    description: description?.trim() ?? '',
    documentCount: 0,
    accent: '#4F6DF5',
    updatedAt: new Date().toISOString(),
  };
  store = [collection, ...store];
  return collection;
}

export async function update(id, patch) {
  await delay(280);
  store = store.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c));
  return store.find((c) => c.id === id);
}

export async function remove(id) {
  await delay(260);
  store = store.filter((c) => c.id !== id);
  return { id };
}
