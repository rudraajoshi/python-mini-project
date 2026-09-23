import { respond, delay, fail } from './mockClient.js';
import { documents, documentPages, collections } from './data.js';

let store = structuredClone(documents);

const withCollection = (doc) => ({
  ...doc,
  collectionName: collections.find((c) => c.id === doc.collectionId)?.name ?? null,
});

export async function list(params = {}) {
  await delay(360);
  let items = store.map(withCollection);
  const { search, type, collectionId, tag, sort = 'recent' } = params;

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (d) => d.name.toLowerCase().includes(q) || d.excerpt.toLowerCase().includes(q)
    );
  }
  if (type && type !== 'all') items = items.filter((d) => d.type === type);
  if (collectionId) items = items.filter((d) => d.collectionId === collectionId);
  if (tag) items = items.filter((d) => d.tags.includes(tag));

  const sorters = {
    recent: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    opened: (a, b) => new Date(b.openedAt ?? 0) - new Date(a.openedAt ?? 0),
    name: (a, b) => a.name.localeCompare(b.name),
  };
  items.sort(sorters[sort] ?? sorters.recent);

  return { results: items, count: items.length };
}

export async function retrieve(id) {
  await delay(320);
  const doc = store.find((d) => d.id === id);
  if (!doc) throw fail('That document no longer exists.', 404);
  return { ...withCollection(doc), pageText: documentPages[id] ?? {} };
}

export async function status(id) {
  await delay(180);
  const doc = store.find((d) => d.id === id);
  return { id, status: doc?.status ?? 'ready', progress: doc?.progress ?? 100 };
}

export async function create(file, { onProgress } = {}) {
  for (let pct = 12; pct <= 100; pct += 22) {
    await delay(220);
    onProgress?.(Math.min(pct, 100));
  }
  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'txt';
  const type = ['png', 'jpg', 'jpeg'].includes(extension) ? 'image' : extension;
  const doc = {
    id: `d_${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    type,
    size: file.size,
    pages: 1,
    collectionId: null,
    tags: [],
    status: 'processing',
    progress: 0,
    excerpt: 'Text extraction in progress.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    openedAt: null,
    lastPage: 1,
    bookmarked: false,
  };
  store = [doc, ...store];
  return withCollection(doc);
}

export async function remove(id) {
  await delay(280);
  store = store.filter((d) => d.id !== id);
  return { id };
}

export async function update(id, patch) {
  await delay(240);
  store = store.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d));
  const doc = store.find((d) => d.id === id);
  return withCollection(doc);
}

export async function summarize(id) {
  await delay(1100);
  const doc = store.find((d) => d.id === id);
  return {
    summary: `${doc?.name ?? 'This document'} covers the material in ${doc?.pages ?? 1} pages. The strongest sections are the worked examples, which restate each definition and then apply it to a small relation you can reproduce in an exam answer.`,
    sources: Object.keys(documentPages[id] ?? { 1: '' })
      .slice(0, 2)
      .map((page) => ({
        documentId: id,
        documentName: doc?.name,
        documentType: doc?.type,
        page: Number(page),
        excerpt: documentPages[id]?.[page] ?? '',
      })),
  };
}
